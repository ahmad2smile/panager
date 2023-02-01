import { basename, dirname, extname } from "@tauri-apps/api/path";
import { ProcessingFile } from "../models/ProcessingFile";

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
