import { useBinaryFileState } from "@/lib/file";
import { read, utils } from "xlsx";
// @ts-ignore
import canvasDatagrid from "canvas-datagrid";
import { useRef } from "react";
import { Button } from "../ui/button";

interface IProps {
	onHeaderSelect(index: number, name: string): void;
}

const ExcelGrid = ({ onHeaderSelect: onHeaderSelect }: IProps) => {
	const sheetElementRef = useRef<HTMLDivElement>(null);

	const [_, triggerExcelDialogOpen, excelFilesResetHandler] = useBinaryFileState({
		filters: [{ name: "Excel", extensions: ["xlsx"] }]
	});

	const fileSelectHandler = async () => {
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
				if (!e.cell.isColumnHeader) return;

				onHeaderSelect(e.cell.columnIndex, e.cell.value);
			});
		}
	};

	return (
		<div className="h-full w-full overflow-hidden">
			<Button className="mb-2" variant="outline" onClick={fileSelectHandler}>
				Select Excel File
			</Button>
			<div className="max-h-36 w-full overflow-hidden">
				<div className="h-full w-full overflow-auto" ref={sheetElementRef}></div>
			</div>
		</div>
	);
};

export default ExcelGrid;
