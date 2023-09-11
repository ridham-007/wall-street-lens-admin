import { use, useEffect, useState } from "react";
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
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM, GET_VIEW_FOR_TERM, PROCCESS_BULK_UPLOAD } from "@/utils/query";
import { useRouter } from "next/router";

export default function FinancialPage() {
    const [showLoader, setShowLoader] = useState(false);
    const [company, setCompany] = useState('');
    const [term, setTerm] = useState('');
    const [showImport, setShowImport] = useState(false)
    const [bulkUpload] = useMutation(PROCCESS_BULK_UPLOAD);
    const router = useRouter();

    useEffect(() => {
        setCompany(router.query.company)
    }, [router.query])

    const [getTermsDetails, { data: termsData, refetch: refetchTerms }] = useLazyQuery(
        GET_TERMS_BY_COMPANY,
        {
            variables: {
                companyId: company,
            },
        }
    );

    const [getVariables, { data: termsVaribles, refetch: refetchVeriables }] = useLazyQuery(
        GET_VARIBALES_KPI_TERM,
        {
            variables: {
                termId: term || '',
            },
        }
    );

    useEffect(() => {
        if (!!company) {
            getTermsDetails();
            getVariables();
        }
    }, [])

    useEffect(() => {
        getTermsDetails();
    }, [company])

    useEffect(() => {
        if (termsData?.getKpiTermsByCompanyId?.length) {
            setTerm(termsData?.getKpiTermsByCompanyId[0]?.id)
        } else {
            setTerm('');
        }
        getVariables();
    }, [termsData])


    const onAddUpdateParameter = async (data: any) => {
        setShowLoader(true);
        await bulkUpload({
            variables: {
                bulkUpload: {
                    ...data,
                }
            },
        })
        setShowLoader(false);
    };

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
                {activeTab === 'Variables' ? <VariableTable term={term} data={termsVaribles} setTerm={setTerm} termsData={termsData}/> : <TermsTable data={termsData} />}
                {showImport && (
                    <ImportData
                        onSuccess={onAddUpdateParameter}
                        onClose={() => { setShowImport(false)}}
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
        name: '',
        quarterWiseTable: '',
        summaryOnly: '',
        variables: []
    })

    const regex = new RegExp('Q[1-4]{1}-[0-9]{4}$');
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

    const convertDataToArrayOfObjects = (data: string | any[], table: Boolean) => {
        const attributes = data[0];
        const result = [];

        for (let i = 1; i < data?.length; i++) {
            const obj = {};
            const quarters = [];
            for (let j = 0; j < attributes?.length; j++) {
                if (!table) {
                    if (regex.test(attributes[j])) {
                        quarters.push({
                            quarter: attributes[j].charAt(1),
                            year: attributes[j].slice(-4),
                            value: data[i][j],
                        })
                    } else {
                        obj[attributes[j]] = data[i][j];
                    }
                } else {
                    obj[attributes[j]?.replace(/\s/g, '')] = data[i][j];
                }
            }
            if (!table) {
                obj['quarters'] = quarters;
            }
            result.push(obj);
        }

        return result;
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target?.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                let tableData: { tableName: string, header: string[], rows: any[][] }[] = [];
                let currentTable: any[][] | null = null;
                let header: string[] | null = null;
                let tableName = '';

                for (const row of parsedData) {
                    if (row[0] && row[0].toString().startsWith('Table')) {
                        if (currentTable) {
                            tableData.push({ tableName, header: header!, rows: currentTable });
                        }
                        currentTable = [];
                        header = row.slice(1);
                        tableName = row[0].toString();
                    } else if (currentTable) {
                        const sanitizedRow = row.map((cell: null | undefined) => {
                            return cell !== null && cell !== undefined ? cell : ' '
                        }
                        );
                        currentTable.push(sanitizedRow);
                    }
                }

                if (currentTable) {
                    tableData.push({ tableName, header: header!, rows: currentTable });
                }

                const filteredTableData = tableData.map(({ tableName, header, rows }) => ({
                    tableName,
                    header,
                    rows: rows.filter(row => row.some(cell => cell !== null && cell !== '')),
                }));
                let arrayOfObjects: {}[] = [];
                let basicDetails: {}[] = [];

                if (filteredTableData?.length > 1) {
                    arrayOfObjects = convertDataToArrayOfObjects(filteredTableData[1].rows, false);
                    basicDetails = convertDataToArrayOfObjects(filteredTableData[0].rows, true);
                }
                setVal({
                    company: basicDetails[0]?.Company,
                    name: basicDetails[0]?.TermsName,
                    quarterWiseTable: basicDetails[0]?.QuaterSpecificTable === 'Enable',
                    summaryOnly: basicDetails[0]?.SummaryOnly === 'Enable',
                    variables: arrayOfObjects?.map(current => {
                        return {
                            title: current?.Variables?.toString() || '',
                            category: current?.Category?.toString() || '',
                            priority: current?.Priority?.toString() || '0',
                            yoy: current?.YoY?.toString() || '0',
                            quarters: current?.quarters?.map((cur: { quarter: any; year: any; value: any; }) => {
                                return {
                                    quarter: Number(cur?.quarter),
                                    year: Number(cur?.year),
                                    value: cur?.value?.toString() || '',
                                }
                            })
                        }
                    })
                })

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
                                disabled
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
                                onChange={handleFileUpload}
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
