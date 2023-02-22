import PdfEditor from "./pages/PdfEditor/PdfEditor";
import ExcelSource from "./pages/ExcelSource/ExcelSource";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import "./App.css";

const TABS = {
	pdfEditor: {
		name: "Pdf Editor",
		view: <PdfEditor />
	},
	excelSource: {
		name: "Excel Source",
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
	return (
		<Tabs orientation="vertical" defaultValue="excelSource" className="flex h-screen w-screen">
			<TabsList className="flex flex-col w-72 justify-start pt-52 px-2">
				{TABS_ITR.map(([k, v]) => (
					<TabsTrigger key={k} className="h-14 w-full" value={k}>
						<p className="w-full px-4 text-left">{v.name}</p>
					</TabsTrigger>
				))}
			</TabsList>
			{TABS_ITR.map(([k, v]) => (
				<TabsContent key={k} className="w-[calc(100%-19rem)] h-[calc(100%-1rem)]" value={k}>
					{v.view}
				</TabsContent>
			))}
		</Tabs>
	);
};

export default App;
