import { useState } from "react";
import { DialogFilter, open } from "@tauri-apps/api/dialog";
import { BaseDirectory, downloadDir, join, sep } from "@tauri-apps/api/path";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { showNotification } from "./utils";

export const FILE_NAME_TEMPLATE = "{{NAME}}";

export const joinPaths = async (...paths: string[]): Promise<string> => {
	return await join(...paths);
	// const joinedPaths = paths.join(sep);
	// return basePath[basePath.length - 1] === sep
	// 	? basePath + joinedPaths
	// 	: `${basePath}/${joinedPaths}`;
};

export const getFileName = (path: string): string => {
	return path.split(sep).pop() || "No name";
};

export const readFile = async (path: string): Promise<Uint8Array> => {
	return await readBinaryFile(path);
};

const allowedPaths = [
	"Desktop",
	"Document",
	"Download",
	"Home",
	"Picture",
	"Public",
	"Video",
	"App"
];

const getBasePath = (path: string): BaseDirectory => {
	const dir =
		(path.includes("Desktop") && BaseDirectory.Desktop) ||
		(path.includes("Document") && BaseDirectory.Document) ||
		(path.includes("Download") && BaseDirectory.Download) ||
		(path.includes("Home") && BaseDirectory.Home) ||
		(path.includes("Picture") && BaseDirectory.Picture) ||
		(path.includes("Public") && BaseDirectory.Public) ||
		(path.includes("Video") && BaseDirectory.Video) ||
		(path.includes("App") && BaseDirectory.App);

	if (!dir) {
		throw new Error(
			"Please save files only under following directories: " + allowedPaths.join(",")
		);
	}

	return dir;
};

export const saveFile = async (path: string, data: Uint8Array) => {
	await writeBinaryFile(path, data);
};

export const downloadFilesWithStorageApi = async (files: { name: string; data: Blob }[]) => {
	try {
		// @ts-ignore
		const handle = (await window.showDirectoryPicker()) as FileSystemDirectoryHandle;

		await Promise.all(
			files.map(async ({ name, data }) => {
				const draft = await handle.getFileHandle(name, { create: true });
				// @ts-ignore
				const stream = await draft.createWritable();
				await stream.write(data);
				await stream.close();
			})
		);
	} catch (error) {
		showNotification({ body: error as string }, true);
	}
};

export const useDirExplorerState = () => {
	const [directoryHandler, setDirectoryHandler] = useState<FileSystemDirectoryHandle>();
	const [selectedDir, setSelectedDir] = useState<string>("");

	return [
		selectedDir,
		async () => {
			// @ts-ignore
			const handle = (await window.showDirectoryPicker()) as FileSystemDirectoryHandle;
			setDirectoryHandler(handle);
			setSelectedDir(handle.name);
		},
		async (name: string, data: Uint8Array) => {
			if (!directoryHandler) {
				return;
			}

			const draft = await directoryHandler.getFileHandle(name, { create: true });
			// @ts-ignore
			const stream = await draft.createWritable();
			await stream.write(data);
			await stream.close();
		}
	] as const;
};

export const useDirState = () => {
	const [selectedDir, setSelectedDir] = useState<string>();

	return [
		selectedDir,
		async () => {
			const selected = await open({
				directory: true,
				multiple: false,
				defaultPath: await downloadDir()
			});

			if (Array.isArray(selected)) {
				// user selected multiple files
				setSelectedDir(selected.pop());
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				// user selected a single file
				setSelectedDir(selected);
			}
		}
	] as const;
};

export const useFilesState = (filters: DialogFilter[], allowMultiple = true) => {
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

	return [
		selectedFiles,
		async () => {
			const selected = await open({
				multiple: allowMultiple,
				filters
			});

			if (Array.isArray(selected)) {
				// user selected multiple files
				setSelectedFiles(selected);
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				// user selected a single file
				setSelectedFiles([selected]);
			}
		}
	] as const;
};
