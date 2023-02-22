import { invoke } from "@tauri-apps/api/tauri";
import { BsArrowRightCircle, BsFillFileEarmarkPdfFill } from "react-icons/bs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DEFAULT_GENERATED_DIR,
	FILE_NAME_TEMPLATE,
	getFileDestinationPath,
	parseFileName,
	useDirExplorerState,
	useFileExplorerState
} from "@/lib/file";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { showErrorNotification, showNotification } from "@/lib/utils";
import { FolderDownIcon } from "lucide-react";

const PdfEditor = () => {
	const [selectedOutputDir, triggerOutputDirDialogOpen] = useDirExplorerState();
	const [selectedPdfFiles, triggerPdfDialogOpen] = useFileExplorerState({
		filters: [{ name: "Pdf", extensions: ["pdf", "Pdf"] }]
	});
	const [fileNameTemplate, setFileNameTemplate] = useState(FILE_NAME_TEMPLATE);

	const handleFileNameTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFileNameTemplate(event.target.value);
	};

	const handlePdfProcessing = async () => {
		try {
			const results = await Promise.all(selectedPdfFiles).then((files) =>
				files.map(async (f) => {
					const newName = parseFileName(f, fileNameTemplate);
					const newPath = await getFileDestinationPath(f, selectedOutputDir);

					invoke("add_pdf_header", {
						headerText: newName.replaceAll(`.${f.extension}`, ""),
						file: f.src,
						destName: newName,
						destPath: newPath
					});
				})
			);

			showNotification({ title: "Panager", body: `Processed ${results.length} files` });
		} catch (error) {
			showErrorNotification({ body: (error as Error).message });
		}
	};

	const handleSelectDir = async () => {
		await triggerOutputDirDialogOpen();
	};

	return (
		<div className="container h-[calc(100%-2.5rem)] mx-auto px-5 my-10">
			<div className="my-5">
				<div className="row">
					<label htmlFor="file-name-input">File name:</label>
					<Input
						placeholder="Setup template for pdf file names"
						id="file-name-input"
						value={fileNameTemplate}
						onChange={handleFileNameTemplate}
					/>
				</div>
			</div>
			<div>
				<p>Output Folder:</p>
			</div>
			<div className="my-5 bg-gray-50 pl-3 py-3 cursor-pointer" onClick={handleSelectDir}>
				<div className="flex">
					<FolderDownIcon className="text-sky-500 mr-3" />
					<p>/{selectedOutputDir?.name || DEFAULT_GENERATED_DIR}</p>
				</div>
			</div>
			<div className="w-full my-5">
				<label className="block font-medium text-gray-700">Pdf Files:</label>
				<div
					className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 cursor-pointer"
					onClick={triggerPdfDialogOpen}>
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
						<div className="flex text-sm text-gray-600">
							<label className="relative rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
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
									<p className="ml-2 my-2">{f.fullName}</p>
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
