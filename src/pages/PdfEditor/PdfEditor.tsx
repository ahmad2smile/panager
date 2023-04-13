import { BsArrowRightCircle, BsFillFileEarmarkPdfFill } from "react-icons/bs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	FILE_NAME_TEMPLATE,
	getFileName,
	joinPaths,
	saveFile,
	useDirState,
	useFilesState
} from "@/lib/file";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	createExcel,
	showErrorMessage,
	showErrorNotification,
	showNotification
} from "@/lib/utils";
import { FolderDownIcon } from "lucide-react";
import FilePicker from "@/components/FilePicker/FilePicker";
import { PdfFile } from "@/lib/pdfFile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Invoice } from "@/models/Invoice";
import { processInvoice } from "@/lib/processInvoice";

const PdfEditor = () => {
	const [extractsummary, setExtractSummary] = useState(true);
	const [selectedOutputDir, setSelectedOutputDir] = useDirState();
	const [selectedPdfFiles, setSelectedPdfFiles] = useFilesState([
		{ name: "Pdf files", extensions: ["pdf", "PDF"] }
	]);
	const [fileNameTemplate, setFileNameTemplate] = useState(FILE_NAME_TEMPLATE);

	const handleFileNameTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFileNameTemplate(event.target.value);
	};

	const handlePdfProcessing = async () => {
		if (!selectedOutputDir) {
			await showErrorMessage("Please select destination directory");
			return;
		}

		try {
			const invoices: Invoice[] = [];

			await Promise.all(
				selectedPdfFiles.map(async (f) => {
					if (extractsummary) {
						const invoice = await processInvoice(f);

						invoices.push(invoice);
					}

					const fileName = getFileName(f);
					const header = fileNameTemplate.replace(
						FILE_NAME_TEMPLATE,
						fileName.split(".").at(0) || f
					);

					const pdfFile = await PdfFile.create(f);
					await pdfFile.addHeader(header, 0);
					const content = await pdfFile.getData();

					const finalPath = await joinPaths(selectedOutputDir, fileName);

					await saveFile(finalPath, content);
				})
			);

			if (extractsummary) {
				await createExcel(invoices, await joinPaths(selectedOutputDir, "summary.xlsx"));
			}

			showNotification({ title: "Panager", body: "Processed files" });
		} catch (error) {
			console.log("==================================");
			console.log(JSON.stringify({ error }, undefined, 4));
			console.log("==================================");

			showErrorNotification({ body: "Unable to process files and save in given directory" });
		}
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
			<div
				className="my-5 bg-gray-50 pl-3 py-3 cursor-pointer"
				onClick={setSelectedOutputDir}>
				<div className="flex">
					<FolderDownIcon className="text-sky-500 mr-3" />
					<p>
						{selectedOutputDir
							? "/" + getFileName(selectedOutputDir)
							: "Please select output dir"}
					</p>
				</div>
			</div>
			<div className="w-full my-5">
				<FilePicker onClick={setSelectedPdfFiles}>PDFs</FilePicker>
			</div>
			<ScrollArea className="my-4 h-72 w-full rounded-md border border-slate-100 dark:border-slate-700">
				<div className="p-4">
					<h4 className="mb-4 text-sm font-medium leading-none">Files:</h4>
					{selectedPdfFiles.map((f, i) => (
						<React.Fragment key={f}>
							<div className="text-sm">
								<span className="flex items-center">
									<BsFillFileEarmarkPdfFill size={25} className="text-red-500" />
									<p className="ml-2 my-2">{getFileName(f)}</p>
								</span>
							</div>
							{i !== selectedPdfFiles.length - 1 && <Separator className="my-2" />}
						</React.Fragment>
					))}
				</div>
			</ScrollArea>
			<div>
				<div className="flex justify-end items-center bg-gray-50 rounded-sm h-20 sm:px-6">
					<div className="flex items-center space-x-2 pr-12 poin">
						<Label className="cursor-pointer" htmlFor="extract-summary">
							Extract Excel Summary
						</Label>
						<Switch
							checked={extractsummary}
							onCheckedChange={setExtractSummary}
							id="extract-summary"
						/>
					</div>
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
