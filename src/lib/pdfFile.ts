import { PDFDocument, rgb } from "pdf-lib";

export class PdfFile {
	private _document: PDFDocument = null!;

	async loadFile(file: File) {
		const buff = await file.arrayBuffer();
		this._document = await PDFDocument.load(buff);
	}

	private assertDocumentLoaded() {
		if (!this._document) {
			throw new Error("Please load pdf file first, _document not found");
		}
	}

	/**
	 * Add Text on some page on specified location
	 * @param text Text Content to add
	 * @param x Left location from 0.1 to 1.0 as fraction of page width
	 * @param y Top location from 0.1 to 1.0 as fraction of page height
	 * @param pageIndex Number of page starting from 0
	 * @param fontSize Number for Font Size
	 */
	async addText(text: string, x: number, y: number, pageIndex: number, fontSize = 16) {
		this.assertDocumentLoaded();

		const pages = this._document.getPages();
		const page = pages.at(pageIndex);
		if (!page) {
			throw new Error(`Given page not found ${pageIndex}`);
		}
		const { width, height } = page.getSize();

		const top = height * (1 - y) - fontSize;
		const bottom = width * x;

		page.drawText(text, { color: rgb(0, 0, 1), size: 16, x: bottom, y: top });
	}

	getContent() {
		this.assertDocumentLoaded();

		return this._document.save();
	}
}
