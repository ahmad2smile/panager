import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification
} from "@tauri-apps/api/notification";
import { useFileExplorerState } from "./utils/file";
import React, { useState } from "react";

function App() {
	const [selectedPdfFiles, triggerPdfDialogOpen] = useFileExplorerState({
		filters: [{ name: "Pdf", extensions: ["pdf"] }]
	});
	const [selectedExcelFiles, triggerExcelDialogOpen] = useFileExplorerState({
		filters: [{ name: "Excel", extensions: ["xlsx"] }]
	});
	const [excelColIndex, setExcelColIndex] = useState<number>(0);

	const handleExcelColNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
		// -1 Humanizer
		setExcelColIndex(event.target.valueAsNumber - 1);
	};

	const handlePdfProcessing = async () => {
		let permissionGranted = await isPermissionGranted();
		if (!permissionGranted) {
			const permission = await requestPermission();
			permissionGranted = permission === "granted";
		}

		try {
			const excelFile = selectedExcelFiles[0];
			const cols = await invoke<string[]>("read_excel_columns", {
				colIndex: excelColIndex,
				sheet: "Files Sheet",
				fileName: excelFile.name,
				filePath: excelFile.path
			});
			const prefixCols = await invoke<string[]>("read_excel_columns", {
				colIndex: excelColIndex + 1,
				sheet: "Files Sheet",
				fileName: excelFile.name,
				filePath: excelFile.path
			});

			const results = await Promise.all(selectedPdfFiles).then((files) =>
				files.map((f) => {
					const rowVal = cols.find((c) => f.name.replace(`.${f.extension}`, "") === c);
					const col = cols.indexOf(rowVal ?? "");
					const prefixValue = prefixCols[col];
					const prefixHeader = prefixValue ? `${prefixValue} ` : "";
					const prefixName = prefixValue ? `${prefixValue}_` : "";

					invoke("add_pdf_header", {
						headerText: prefixHeader + f.name,
						file: `${f.path}/${f.name}`,
						destName: prefixName + f.name,
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
					<button type="button" onClick={triggerPdfDialogOpen}>
						Select Pdf Files
					</button>
				</div>
			</div>
			<div className="container">
				<div className="row">
					<label htmlFor="excel-index-number">Excel Column</label>
					<input
						placeholder="Enter Colum Number of File Names"
						id="excel-index-number"
						type="number"
						min={1}
						onChange={handleExcelColNumber}
					/>
				</div>
				<div className="row">
					<button type="button" onClick={triggerExcelDialogOpen}>
						Select Excel File
					</button>
				</div>
			</div>
			<div className="container">
				{selectedPdfFiles.length > 0 && <p>Pdf files: {selectedPdfFiles.length}</p>}
				{selectedPdfFiles.length > 0 &&
					selectedPdfFiles.map((f) => (
						<div className="row" key={f.name}>
							<p>{f.name}</p>
						</div>
					))}
				{selectedPdfFiles.length == 0 && <p>No Pdf Files Selected</p>}
			</div>
			<div className="container">
				{selectedExcelFiles.length > 0 && <p>Excel files: {selectedExcelFiles.length}</p>}
				{selectedExcelFiles.length > 0 &&
					selectedExcelFiles.map((f) => (
						<div className="row" key={f.name}>
							<p>{f.name}</p>
						</div>
					))}
				{selectedExcelFiles.length == 0 && <p>No Excel File Selected</p>}
			</div>
			<div>
				<button type="button" onClick={handlePdfProcessing}>
					Process Files
				</button>
			</div>
		</div>
	);
}

export default App;
