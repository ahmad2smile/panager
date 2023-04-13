import { franc } from "franc-min";
import { extractPdfText } from "./utils";
// @ts-ignore
import nlpd from "de-compromise";
import nlp from "compromise/three";
// @ts-ignore
import plg from "compromise-dates";
import { Invoice } from "@/models/Invoice";
import { getFileName } from "./file";

export async function processInvoice(path: string): Promise<Invoice> {
	const content = await extractPdfText(path);

	nlp.plugin(plg);

	const isGermanLang = franc(content) === "deu";
	const doc = isGermanLang ? nlpd(content) : nlp(content);

	const totalStr = doc.money().last().text();

	let total = 0;

	if (isGermanLang) {
		const placeholder = totalStr.replace(",", "#");

		total = Number(placeholder.replaceAll(".", "").replaceAll("#", ".") || 0);
	} else {
		total = Number(totalStr || 0);
	}

	return {
		invoice_number: doc.match("/^[0-9]{12,18}$/").last().text(),
		name: doc.matchOne("#Person").text(),
		// @ts-ignore
		date: doc.dates().format("{year}-{month-pad}-{date-pad}").last().text(),
		// phoneNumber: doc.matchOne("#PhoneNumber").text(),
		// location: doc.matchOne("#City").text(),
		company: doc.matchOne("#Company").text(),
		// website: doc.matchOne("#Url").text(),
		// email: doc.matchOne("#Email").text(),
		total,
		currency: doc.matchOne("#Currency").text(),
		file: getFileName(path)
	} as Invoice;
}
