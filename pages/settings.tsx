import { useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import ParameterTable from "@/components/table/operational/ParameterTable";
import DynamicTable from "@/components/table/defaultTable/defaultTable";
import { TabButton } from "@/components/TabButton";
import * as XLSX from 'xlsx';


const dummySettings = [
    {
      Terms_name: 'Financial Summary',
      Title: "Revenue Segments",
      Category: "Total automotive revenues",
      Priority: "High",
      YoY: "2023",
      UpdatedAt : "01/02/23",
      id: 1,
    },
];

export default function FinancialPage() {
    const [showLoader, setShowLoader] = useState(false);
    const [val, setVal] = useState({
        settingsData: dummySettings,
      })
    const [activeTab, setActiveTab] = useState('Variables');
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0]; // Assuming you want the first sheet
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Include the first 4 rows

                // Use jsonData for further processing
                console.log(jsonData);
            };

            reader.readAsArrayBuffer(file);
        }
    };
    const headers = ["Terms_name", "Title", "Category", "Priority", "YoY", "UpdatedAt"];

    return (
        <Layout title="Financial Summary" page={LayoutPages.settings}>
            <>
                {showLoader && (<Loader />)}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImport}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                />
                <div className="flex mb-4">
                    <TabButton
                        label="Variables"
                        activeTab={activeTab}
                        onClick={() => handleTabClick('Variables')}
                    />
                    <TabButton
                        label="Tabs"
                        activeTab={activeTab}
                        onClick={() => handleTabClick('Tabs')}
                    />
                </div>
                {activeTab === 'Tabs' ? <ParameterTable data={val.settingsData} /> : <DynamicTable headers={headers} data={val.settingsData} />}
            </>
        </Layout >
    );
}