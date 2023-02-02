import { basename, dirname, extname } from "@tauri-apps/api/path";
import { useState } from "react";
import { ProcessingFile } from "../models/ProcessingFile";
import { open, OpenDialogOptions } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";

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
			extension
		};
	} catch (error) {
		throw new Error(`Error while processing file: ${osPath}, Err: ${error}`);
	}
};

export const useFileExplorerState = (
	options?: OpenDialogOptions
): [ProcessingFile[], () => Promise<void>] => {
	const [selectedFiles, setSelectedFiles] = useState<ProcessingFile[]>([]);

	return [
		selectedFiles,
		async () => {
			const selected = await open({
				multiple: true,
				defaultPath: await desktopDir(),
				...options
			});
			if (Array.isArray(selected)) {
				// user selected multiple directories
				setSelectedFiles(await Promise.all(selected.map(processFile)));
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				setSelectedFiles([await processFile(selected)]);
				// user selected a single directory
			}
		}
	];
};
