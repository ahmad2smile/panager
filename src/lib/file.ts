import { basename, dirname, extname } from "@tauri-apps/api/path";
import { useEffect, useState } from "react";
import { ProcessingDir, ProcessingFile } from "../models/ProcessingFile";
import { open, OpenDialogOptions } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { appWindow } from "@tauri-apps/api/window";

export const FILE_NAME_TEMPLATE = "{{NAME}}";
export const DEFAULT_GENERATED_DIR = "generated";

export function parseFileName(file: ProcessingFile, template: string): string {
	return template.replaceAll(FILE_NAME_TEMPLATE, file.name) + `.${file.extension}`;
}

export function getFileDestinationPath(file: ProcessingFile, newPath?: ProcessingDir): string {
	return newPath?.path || `${file.path}/${DEFAULT_GENERATED_DIR}`;
}

export async function filterForFileType(osPaths: string[], extensions: string[]) {
	const files = await Promise.all(osPaths.map(processFile));

	return files.filter((f) => extensions.includes(f.extension));
}

export const processFile = async (osPath: string): Promise<ProcessingFile> => {
	try {
		const [name, path, extension] = await Promise.all([
			basename(osPath),
			dirname(osPath),
			extname(osPath)
		]);

		return {
			name: name.replaceAll(`.${extension}`, ""),
			fullName: name,
			path,
			src: `${path}/${name}`,
			extension
		};
	} catch (error) {
		throw new Error(`Error while processing file: ${osPath}, Err: ${error}`);
	}
};

export const processDir = async (osPath: string): Promise<ProcessingDir> => {
	return {
		name: await basename(osPath),
		path: osPath
	};
};

export const useDirExplorerState = (
	options?: Omit<OpenDialogOptions, "directory">
): [ProcessingDir | undefined, () => Promise<void>, () => void] => {
	const [selectedDir, setSelectedDir] = useState<ProcessingDir>();

	return [
		selectedDir,
		async () => {
			const selected = await open({
				multiple: true,
				defaultPath: await downloadDir(),
				...options,
				directory: true
			});

			if (Array.isArray(selected)) {
				// user selected multiple directories
				setSelectedDir(await processDir(selected[0]));
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				setSelectedDir(await processDir(selected));
				// user selected a single directory
			}
		},
		() => {
			setSelectedDir(selectedDir);
		}
	];
};

export const useFileExplorerState = (
	options?: OpenDialogOptions
): [ProcessingFile[], () => Promise<void>, () => void] => {
	const [selectedFiles, setSelectedFiles] = useState<ProcessingFile[]>([]);

	useEffect(() => {
		let unSubscribe: (() => void) | undefined = undefined;

		appWindow
			.onFileDropEvent((event) => {
				if (event.payload.type === "drop") {
					const selected = event.payload.paths;

					filterForFileType(
						selected,
						options?.filters?.flatMap((f) => f.extensions) || []
					).then(setSelectedFiles);
				}
			})
			.then((h) => {
				unSubscribe = h;
			});
		return () => {
			unSubscribe && unSubscribe();
		};
	}, []);

	return [
		selectedFiles,
		async () => {
			const selected = await open({
				multiple: true,
				defaultPath: await downloadDir(),
				...options
			});

			if (Array.isArray(selected)) {
				setSelectedFiles(await Promise.all(selected.map(processFile)));
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				setSelectedFiles([await processFile(selected)]);
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
