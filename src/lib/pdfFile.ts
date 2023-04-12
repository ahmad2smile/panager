import { PDFDocument, rgb } from "pdf-lib";
import { readFile } from "./file";

export class PdfFile {
	private constructor(private _document: PDFDocument) {}

	static async create(path: string): Promise<PdfFile> {
		const buff = await readFile(path);
		const doc = await PDFDocument.load(buff);

		const pdfDoc = new PdfFile(doc);
		return pdfDoc;
	}

	/**
	 * Add Text on some page on specified location
	 * @param text Text Content to add
	 * @param x Left location from 0.1 to 1.0 as fraction of page width
	 * @param y Top location from 0.1 to 1.0 as fraction of page height
	 * @param pageIndex Number of page starting from 0
	 * @param fontSize Number for Font Size (Default: 14)
	 */
	async addText(text: string, x: number, y: number, pageIndex: number, fontSize = 14) {
		const pages = this._document.getPages();
		const page = pages.at(pageIndex);
		if (!page) {
			throw new Error(`Given page not found ${pageIndex}`);
		}
		const { width, height } = page.getSize();

		const top = height * (1 - y) - fontSize;
		const bottom = width * x;

		page.drawText(text, { color: rgb(0, 0, 1), size: fontSize, x: bottom, y: top });
	}

	/**
	 * Add Text on some page on specified location
	 * @param text Text Content to add
	 * @param pageIndex Number of page starting from 0
	 * @param fontSize Number for Font Size (Default: 14)
	 */
	async addHeader(text: string, pageIndex: number, fontSize = 14) {
		const pages = this._document.getPages();
		const page = pages.at(pageIndex);
		if (!page) {
			throw new Error(`Given page not found ${pageIndex}`);
		}
		const { height, width } = page.getSize();

		const headerMarginBottom = 5;
		const topOffset = fontSize + headerMarginBottom;

		page.translateContent(0, -topOffset);
		page.moveUp(height);
		page.drawRectangle({
			width: width,
			height: topOffset,
			color: rgb(1, 1, 1)
		});
		page.moveUp(5);
		page.drawText(text, { color: rgb(0, 0, 1), size: fontSize });
	}

	getData() {
		return this._document.save();
	}
}
