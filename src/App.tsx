import PdfEditor from "./pages/PdfEditor/PdfEditor";
import ExcelSource from "./pages/ExcelSource/ExcelSource";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";

import "./App.css";
import { useState } from "react";

const TABS = {
	pdfEditor: {
		name: "Pdf Editor",
		view: <PdfEditor />
	},
	excelSource: {
		name: "Excel Source (WIP)",
		view: <ExcelSource />
	},
	about: {
		name: "About",
		view: (
			<div>
				<p>Author:</p>
				<p>ahmad2smile@protonmail.com</p>
			</div>
		)
	}
} as const;

const TABS_ITR = Object.entries(TABS) as Array<
	[keyof typeof TABS, (typeof TABS)[keyof typeof TABS]]
>;

const App = () => {
	const [tab, setTab] = useState<keyof typeof TABS>("pdfEditor");

	const handleTab = (t: typeof tab) => () => {
		setTab(t);
	};

	return (
		<Tabs orientation="vertical" defaultValue={tab} className="flex h-screen w-screen">
			<TabsList className="flex flex-col w-72 justify-start pt-52 px-2">
				{TABS_ITR.map(([k, v]) => (
					<TabsTrigger key={k} className="h-14 w-full" value={k} onClick={handleTab(k)}>
						<p className="w-full px-4 text-left">{v.name}</p>
					</TabsTrigger>
				))}
			</TabsList>
			<div
				style={{ display: tab === "excelSource" ? "block" : "none" }}
				className="w-[calc(100%-19rem)] h-[calc(100%-1rem)]">
				<ExcelSource />
			</div>
			<div
				style={{ display: tab === "pdfEditor" ? "block" : "none" }}
				className="w-[calc(100%-19rem)] h-[calc(100%-1rem)]">
				<PdfEditor />
			</div>
			<div
				style={{ display: tab === "about" ? "block" : "none" }}
				className="w-[calc(100%-19rem)] h-[calc(100%-1rem)]">
				<div className="container h-[calc(100%-2.5rem)] mx-auto px-5 my-10">
					<p>Author:</p>
					<p>ahmad2smile@protonmail.com</p>
				</div>
			</div>
		</Tabs>
	);
};

export default App;
