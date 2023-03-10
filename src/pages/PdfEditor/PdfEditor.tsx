import { BsArrowRightCircle, BsFillFileEarmarkPdfFill } from "react-icons/bs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FILE_NAME_TEMPLATE, useDirExplorerState } from "@/lib/file";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { showErrorNotification, showNotification } from "@/lib/utils";
import { FolderDownIcon } from "lucide-react";
import FilePicker from "@/components/FilePicker/FilePicker";
import { PdfFile } from "@/lib/pdfFile";

const PdfEditor = () => {
	const [selectedOutputDir, triggerOutputDirDialogOpen, saveFileHandler] = useDirExplorerState();
	const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
	const [fileNameTemplate, setFileNameTemplate] = useState(FILE_NAME_TEMPLATE);

	const handleFileNameTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFileNameTemplate(event.target.value);
	};

	const handlePdfProcessing = async () => {
		try {
			await Promise.all(
				selectedPdfFiles.map(async (f) => {
					const pdfFile = new PdfFile();
					await pdfFile.loadFile(f);
					await pdfFile.addHeader(
						fileNameTemplate.replace(FILE_NAME_TEMPLATE, f.name),
						0
					);
					const content = await pdfFile.getContent();

					await saveFileHandler(f.name, content);
				})
			);

			showNotification({ title: "Panager", body: "Processed files" });
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
					<p>/{selectedOutputDir}</p>
				</div>
			</div>
			<div className="w-full my-5">
				<FilePicker
					accept={{ "application/*": [".pdf", ".PDF"] }}
					onChange={setSelectedPdfFiles}>
					PDFs
				</FilePicker>
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
