import { basename, dirname, extname } from "@tauri-apps/api/path";
import { useState } from "react";
import { ProcessingFile } from "../models/ProcessingFile";
import { open, OpenDialogOptions } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { readBinaryFile } from "@tauri-apps/api/fs";

export const processFile = async (osPath: string): Promise<ProcessingFile> => {
	try {
		const [name, path, extension] = await Promise.all([
			basename(osPath),
			dirname(osPath),
			extname(osPath)
		]);

		return {
			name,
			path,
			src: `${path}/${name}`,
			extension
		};
	} catch (error) {
		throw new Error(`Error while processing file: ${osPath}, Err: ${error}`);
	}
};

export const useFileExplorerState = (
	options?: OpenDialogOptions
): [ProcessingFile[], () => Promise<void>, () => void] => {
	const [selectedFiles, setSelectedFiles] = useState<ProcessingFile[]>([]);

	return [
		selectedFiles,
		async () => {
			const selected = await open({
				multiple: true,
				defaultPath: await downloadDir(),
				...options
			});

			if (Array.isArray(selected)) {
				// user selected multiple directories
				setSelectedFiles([
					...selectedFiles,
					...(await Promise.all(selected.map(processFile)))
				]);
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				setSelectedFiles([...selectedFiles, await processFile(selected)]);
				// user selected a single directory
			}
		},
		() => {
			setSelectedFiles([]);
		}
	];
};

export const useBinaryFileState = (
	options?: OpenDialogOptions
): [Uint8Array[], () => Promise<Array<Uint8Array>>, () => void] => {
	const [selectedFiles, setSelectedFiles] = useState<Uint8Array[]>([]);

	return [
		selectedFiles,
		async () => {
			const selected = await open({
				multiple: true,
				defaultPath: await downloadDir(),
				...options
			});

			let files: Uint8Array[] = [];

			if (Array.isArray(selected)) {
				// user selected multiple directories
				files = [
					...selectedFiles,
					...(await Promise.all(selected.map((f) => readBinaryFile(f))))
				];
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				files = [...selectedFiles, await readBinaryFile(selected)];
				// user selected a single directory
			}

			setSelectedFiles(files);

			return files;
		},
		() => {
			setSelectedFiles([]);
		}
	];
};
