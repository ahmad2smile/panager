import { useRef } from "react";
import { read, utils } from "xlsx";
import FilePicker from "@/components/FilePicker/FilePicker";
// @ts-ignore
import canvasDatagrid from "canvas-datagrid";

const ExcelSource = () => {
	const sheetElementRef = useRef<HTMLDivElement>(null);

	const fileSelectHandler = async () => {
		const selectedFiles: File[] = [];

		if (sheetElementRef.current) {
			const wb = read(await selectedFiles[0].arrayBuffer());
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
				console.log("==================================");
				console.log(
					JSON.stringify(
						{
							cell: e.cell.columnIndex,
							row: e.cell.rowIndex,
							isRowHeader: e.cell.isRowHeader,
							isColumnHeader: e.cell.isColumnHeader
						},
						undefined,
						4
					)
				);
				console.log("==================================");
			});
		}
	};

	return (
		<div className="container h-[calc(100%-2.5rem)] overflow-hidden mx-auto px-5 my-10">
			<FilePicker onClick={fileSelectHandler}>Excel</FilePicker>
			<div className="h-1/2 w-full overflow-hidden">
				<div className="h-full w-full overflow-auto" ref={sheetElementRef}></div>
			</div>
		</div>
	);
};

export default ExcelSource;
