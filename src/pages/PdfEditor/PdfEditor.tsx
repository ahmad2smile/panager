import { invoke } from "@tauri-apps/api/tauri";
import { BsArrowRightCircle, BsFillFileEarmarkPdfFill } from "react-icons/bs";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification
} from "@tauri-apps/api/notification";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileExplorerState } from "@/lib/file";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const PdfEditor = () => {
	const [selectedPdfFiles, triggerPdfDialogOpen] = useFileExplorerState({
		filters: [{ name: "Pdf", extensions: ["pdf", "Pdf"] }]
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
	};

	return (
		<div className="container h-[calc(100%-2.5rem)] mx-auto px-5 my-10">
			<div className="my-10">
				<Button className="mb-2" variant="outline" onClick={triggerExcelDialogOpen}>
					Select Excel File
				</Button>
				<div className="row">
					<label htmlFor="excel-index-number">Excel Column</label>
					<Input
						placeholder="Enter Colum Number of File Names"
						id="excel-index-number"
						type="number"
						min={1}
						onChange={handleExcelColNumber}
					/>
				</div>
			</div>
			<div className="w-full my-5">
				<label className="block font-medium text-gray-700">Pdf Files:</label>
				<div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
					<div className="space-y-1 text-center">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
							aria-hidden="true">
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<div
							className="flex text-sm text-gray-600 cursor-pointer"
							onClick={triggerPdfDialogOpen}>
							<label
								htmlFor="file-upload"
								className="relative rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
								<span>Upload a file</span>
							</label>
							<p className="pl-1">or drag and drop</p>
						</div>
						<p className="text-xs text-gray-500">Pdf files</p>
					</div>
				</div>
			</div>
			<ScrollArea className="my-4 h-72 w-full rounded-md border border-slate-100 dark:border-slate-700">
				<div className="p-4">
					<h4 className="mb-4 text-sm font-medium leading-none">Files:</h4>
					{selectedPdfFiles.map((f, i) => (
						<React.Fragment key={f.name}>
							<div className="text-sm">
								<span className="flex items-center">
									<BsFillFileEarmarkPdfFill size={25} className="text-red-500" />
									<p className="ml-2 my-2">{f.name}</p>
								</span>
							</div>
							{i !== selectedPdfFiles.length - 1 && <Separator className="my-2" />}
						</React.Fragment>
					))}
				</div>
			</ScrollArea>
			<div>
				<div className="flex justify-end items-center bg-gray-50 rounded-sm h-20 sm:px-6">
					<Button
						className="inline-flex h-12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						variant="outline"
						onClick={handlePdfProcessing}>
						Process Files
						<BsArrowRightCircle className="ml-2" size={25} />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PdfEditor;
