import { Button } from "@/components/ui/button";
import { useBinaryFileState } from "@/lib/file";
import { useRef } from "react";
import { read, utils } from "xlsx";
// @ts-ignore
import canvasDatagrid from "canvas-datagrid";

const ExcelSource = () => {
	const sheetElementRef = useRef<HTMLDivElement>(null);

	const [_, triggerExcelDialogOpen, excelFilesResetHandler] = useBinaryFileState({
		filters: [{ name: "Excel", extensions: ["xlsx"] }]
	});

	const fileSelectHandler = async () => {
		excelFilesResetHandler();
		excelFilesResetHandler();

		const files = await triggerExcelDialogOpen();

		if (sheetElementRef.current) {
			const wb = read(files[0]);
			const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

			sheetElementRef.current.innerHTML = "";

			const grid = canvasDatagrid({
				parentNode: sheetElementRef.current,
				data,
				allowSorting: false,
				editable: false
			});

			grid.addEventListener("click", function (e: any) {
				if (!e.cell) return;
				console.log("Clicked on " + e.cell.value);
			});
		}
	};

	return (
		<div className="container h-[calc(100%-2.5rem)] overflow-hidden mx-auto px-5 my-10">
			<Button className="mb-2" variant="outline" onClick={fileSelectHandler}>
				Select Excel File
			</Button>
			<div className="h-1/2 w-full overflow-hidden">
				<div className="h-full w-full overflow-auto" ref={sheetElementRef}></div>
			</div>
		</div>
	);
};

export default ExcelSource;
