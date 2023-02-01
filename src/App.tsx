import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { open } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification
} from "@tauri-apps/api/notification";
import { ProcessingFile } from "./models/ProcessingFile";
import { processFile } from "./utils/processFile";

function App() {
	const [selectedFiles, setSelectedFiles] = useState<ProcessingFile[]>([]);

	const handleFilesPick = async () => {
		// Open a selection dialog for directories
		const selected = await open({
			multiple: true,
			defaultPath: await desktopDir()
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
	};

	const handleProcessingFiles = async () => {
		let permissionGranted = await isPermissionGranted();
		if (!permissionGranted) {
			const permission = await requestPermission();
			permissionGranted = permission === "granted";
		}

		try {
			const results = await Promise.all(
				selectedFiles.map((f) => {
					invoke("add_pdf_header", {
						headerText: `Modified ${f.name}`,
						name: f.name,
						srcPath: f.path,
						destPath: `${f.path}/generated`
					});
				})
			);

			if (permissionGranted) {
				sendNotification({ title: "Panager", body: `Processed ${results.length} files` });
			}
		} catch (error) {
			console.log("==================================");
			console.log(JSON.stringify({ error }, undefined, 4));
			console.log("==================================");

			if (permissionGranted) {
				sendNotification({ title: "Panager", body: `Error processing files: ${error}` });
			}
		}
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
	};

	return (
		<div className="container">
			<h1>Panager - Programable Manager</h1>

			<div className="row">
				<div>
					<button type="button" onClick={handleFilesPick}>
						Select Files
					</button>
				</div>
			</div>
			<div className="container">
				{selectedFiles.length > 0 && <p>Total Selected files: {selectedFiles.length}</p>}
				{selectedFiles.length > 0 &&
					selectedFiles.map((f) => (
						<div className="row" key={f.name}>
							<p>{f.name}</p>
						</div>
					))}
				{selectedFiles.length == 0 && <p>No Files Selected</p>}
			</div>
			<div>
				<button type="button" onClick={handleProcessingFiles}>
					Process Files
				</button>
			</div>
		</div>
	);
}

export default App;
