import { useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import VariableTable from "@/components/table/settings/VariableTable";
import TermsTable from "@/components/table/settings/TermsTable";
import { TabButton } from "@/components/TabButton";
import { Modal } from "@/components/model";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


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

const dummySettingsForTerms = [
    {
        Name: "Revenue Segments",
        Type: "row",
        Company: "",
        UpdatedAt: "01/02/23",
        id: 1,
    },
];

export default function FinancialPage() {
    const [showLoader, setShowLoader] = useState(false);
    const [showImport, setShowImport] = useState(false)

    const [val, setVal] = useState({
        settingsData: dummySettings,
      })
    const [activeTab, setActiveTab] = useState('Variables');
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    return (
        <Layout title="Financial Summary" page={LayoutPages.settings}>
            <>
                {showLoader && (<Loader />)}
                <div className="flex pr-4 gap-4">
                    <button
                        type="button"
                        className="bg-blue-500 ml-auto hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setShowImport(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ionicon w-7 h-7"
                            viewBox="0 0 512 512"
                        >
                            <path
                                d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="32"
                            />
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M256 176v160M336 256H176"
                            />
                        </svg>
                        <span>Import Data</span>
                    </button>
                </div>
                <div className="flex mb-4 mt-4">
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
                {activeTab === 'Variables' ? <VariableTable data={val.settingsData} /> : <TermsTable data={dummySettingsForTerms} />}
                {showImport && (
                    <ImportData
                        onSuccess={() => {}}
                        onClose={() => {}}
                    ></ImportData>
                )}
            
            </>
        </Layout >
    );
}

interface ImportDataProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
}

function ImportData(props: ImportDataProps) {
    const [val, setVal] = useState({
        company: '',
        data:{},
    })
    const handleOnSave = () => {
        if (!val.company) {
            toast('Company is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
            return;
        }
        props.onSuccess && props.onSuccess(val)
        props.onClose && props.onClose()
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const name = e.target.name;

        setVal((prevVal) => ({
            ...prevVal,
            [name]: value
        }));
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

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Import Data from Excel sheet"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <select
                                id="quarter"
                                name="company"
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={val.company}
                                onChange={handleOnChange}
                            >
                                <option value="">Select a option</option>
                                <option value="TESLA">TESLA</option>
                                <option value="APPLE">APPLE</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                                Select Excel Sheet
                            </label>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleImport}
                                className=" text-white font-bold py-2 px-4 rounded-full"
                            />
                        </div>
                    </div>
                </form>
                <ToastContainer />
            </>
        </Modal>
    );
}
