import { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
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
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_COMPANIES, GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM, PROCCESS_BULK_UPLOAD } from "@/utils/query";
import { useRouter } from "next/router";

export default function FinancialPage() {
    const [showLoader, setShowLoader] = useState(false);
    const [refetch, setRefetch] = useState(false);
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
            fetchPolicy: 'network-only',
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
        if (!!company && refetch) {
            refetchTerms();
            refetchVeriables();
        }
        setRefetch(false);
    }, [refetch])

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


    const onAddUpdateParameter = async (sheetsData: any) => {
        setShowLoader(true);
        for (let i = 0; i < sheetsData?.length; i++) {
            await bulkUpload({
                variables: {
                    bulkUpload: {
                        ...sheetsData[i],
                    }
                },
            })
        }
        setShowLoader(false);
        setRefetch(true);
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
                        label="KPI Terms"
                        activeTab={activeTab}
                        onClick={() => handleTabClick('KPI Terms')}
                    />
                </div>
                {activeTab === 'Variables' ? <VariableTable term={term} data={termsVaribles} setTerm={setTerm} setRefetch={setRefetch} termsData={termsData} /> : <TermsTable data={termsData} company={company} setRefetch={setRefetch} />}
                {showImport && (
                    <ImportData
                        onSuccess={onAddUpdateParameter}
                        onClose={() => { setShowImport(false) }}
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

export interface SheetValue {
    company: string;
    name: string;
    quarterWiseTable: boolean;
    summaryOnly: boolean;
    variables: Variable[];
    title: string;
    description: string;
}


export interface Variable {
    title: string;
    category: string;
    priority: string;
    yoy: string;
    quarters: Quarter[];
}

export interface Quarter {
    quarter: number;
    year: number;
    value: string;
}

function ImportData(props: ImportDataProps) {
    const companies = useQuery(GET_COMPANIES);
    const [sheetsData, setSheetsData] = useState<SheetValue[]>([]);
    const [company, setCompany] = useState('')
    const [selectedFileName, setSelectedFileName] = useState('');

    const regex = new RegExp('Q[1-4]{1}-[0-9]{4}$');
    const handleOnSave = () => {
        if (!sheetsData.length) {
            toast('Data is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
            return;
        }
        props.onSuccess && props.onSuccess(sheetsData)
        props.onClose && props.onClose()
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

    const getArrayofObject = (basicDetails: {}[], rows: any[][], quarterWiseTable: boolean, summaryOnly: boolean) => {
        const {
            Quarter,
            Year,
        } = basicDetails[0] || {};
        const keys = rows[0];
        if (quarterWiseTable && !summaryOnly){
            keys.push('VisibleToChart');
        }
        const arrays = keys?.map((current, index) => {
            let quarters = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i];

                const date = new Date(); // Replace with your date
                const formattedDate = formatDateAsYYYYMMDDHHMMSS(date);

                quarters.push({
                    quarter: Number(Quarter),
                    year: Number(Year),
                    value: current === "VisibleToChart" ? 'false' : values[index].toString(),
                    groupKey: `${formattedDate}-${i.toString()}`,
                })
            }

            return {
                title: current,
                quarters: quarters,
                category: '',
                yoy: '',
                priority: (index+1).toString(),
            }
        })

        return arrays;
    }

    function formatDateAsYYYYMMDDHHMMSS(date: Date): string {
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      const second = date.getSeconds().toString().padStart(2, "0");

      return `${year}${month}${day}${hour}${minute}${second}`;
    }
      

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target?.files?.[0];
        if (file) {
            setSelectedFileName(file.name);
          } else {
            setSelectedFileName('');
          }
        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const workbook = XLSX.read(arrayBuffer, { type: 'array', raw: false });
                const sheetsArray: SheetValue[] = [];
                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const parsedData: Array<any> = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
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

                    let arrayOfObjects: Array<any> = [];
                    let basicDetails: Array<any> = [];
                    let quarterWiseTable = false;
                    let summaryOnly = false;
                    if (filteredTableData?.length > 1) {
                        basicDetails = convertDataToArrayOfObjects(filteredTableData[0].rows, true);
                        quarterWiseTable = basicDetails[0]?.QuaterSpecificTable === 'Enable';
                         summaryOnly = basicDetails[0]?.SummaryOnly === 'Enable';
                        if (quarterWiseTable || summaryOnly) {
                            arrayOfObjects = getArrayofObject(basicDetails, filteredTableData[1].rows, quarterWiseTable, summaryOnly)
                        } else {
                            arrayOfObjects = convertDataToArrayOfObjects(filteredTableData[1].rows, false);
                        }
                    }
                    let prevPriority: any;
                    let prevCategory: any;
                    sheetsArray.push({
                        company: company?.toString(),
                        name: sheetName,
                        quarterWiseTable: quarterWiseTable || summaryOnly,
                        summaryOnly: summaryOnly,
                        title: basicDetails[0]?.Title || '',
                        description: basicDetails[0]?.Description,
                        variables: quarterWiseTable || summaryOnly ? arrayOfObjects : arrayOfObjects?.map(current => {
                            prevPriority = !current?.Priority?.toString() ? prevPriority : current?.Priority?.toString();
                            prevCategory = !current?.Category?.toString() ? prevCategory : current?.Category?.toString();
                            return {
                                title: current?.Variables?.toString() || '',
                                category: prevCategory || '',
                                priority: prevPriority || '0',
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
                }
                setSheetsData(sheetsArray);
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
          <form className="form">
            <div className="flex  gap-[20px]">
              <div className="flex items-start">
                <select
                  id="quarter"
                  name="company"
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value);
                  }}
                >
                  <option value="">Select a option</option>
                  {companies?.data?.getCompanies.map(
                    (ele: {
                      id: readonly string[] | Key | null | undefined;
                      attributes: {
                        slug: Key | null | undefined;
                        name: string
                      };
                    }) => {
                      return (
                        <option key={ele.attributes.slug} value={ele.id}>
                          {ele.attributes.name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
              <div className="flex items-center flex-col">
                
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  disabled={!company}
                  className=" text-white font-bold py-2 px-4 w-[150px] rounded-full"
                />
                <span> {selectedFileName}</span>
              </div>
            </div>
          </form>
          <ToastContainer />
        </>
      </Modal>
    );
}
