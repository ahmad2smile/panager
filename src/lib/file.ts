import { useState } from "react";
import { showNotification } from "./utils";

export const FILE_NAME_TEMPLATE = "{{NAME}}";
export const DEFAULT_GENERATED_DIR = "generated";

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
	const [selectedDir, setSelectedDir] = useState<string>(DEFAULT_GENERATED_DIR);

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
