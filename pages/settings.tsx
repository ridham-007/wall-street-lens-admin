import { Key, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import VariableTable from "@/components/table/settings/VariableTable";
import { Modal } from "@/components/model";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_COMPANIES, GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM, PROCCESS_BULK_UPLOAD } from "@/utils/query";
import { useRouter } from "next/router";
import { ImportDataProps, LayoutProps } from "@/utils/data"
import { SheetValue } from "@/utils/data"
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,} from '@mui/material';

export default function FinancialPage(props: JSX.IntrinsicAttributes & LayoutProps) {
    const [showLoader, setShowLoader] = useState(false);
    const [refetch, setRefetch] = useState(false);
    const [company, setCompany] = useState('');
    const [term, setTerm] = useState('');
    const [showImport, setShowImport] = useState(false)
    const [bulkUpload] = useMutation(PROCCESS_BULK_UPLOAD);
    const router = useRouter();

    useEffect(() => {
        if (typeof router.query.company === 'string') {
            setCompany(router.query.company);
        }
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
        if (!!company?.length) {
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
        if (!!company?.length) {
            getTermsDetails();
        }
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

    return (
        <Layout title="Settings" page={LayoutPages.settings} {...props}>
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
                <VariableTable term={term} data={termsVaribles} setTerm={setTerm} setRefetch={setRefetch} termsData={termsData} />
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


function ImportData(props: ImportDataProps) {
    const companies = useQuery(GET_COMPANIES);
    const [sheetsData, setSheetsData] = useState<SheetValue[]>([]);
    const [company, setCompany] = useState('')
    const [selectedFileName, setSelectedFileName] = useState('');
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const [listOfError, setListOfError] = useState([]);


    const regex = new RegExp('Q([1-4]{1})-([0-9]{4})\\s*(.*)$');

      const handleClose = () => {
        setOpen(false);
      };

    const handleOnSave = () => {

        if (!sheetsData.length) {
            toast('Data is required', { hideProgressBar: false, autoClose: false, type: 'error' });
            return;
        }else{
            toast('Data Sent', { hideProgressBar: false, autoClose: 7000, type: 'success' });            
        }
        props.onSuccess && props.onSuccess(sheetsData)
        props.onClose && props.onClose()
    };

    const getDataForSingleTableForAllQuarters = (data: string | any[], table: Boolean) => {
        const attributes = data[0];
        const result = [];

        for (let i = 1; i < data?.length; i++) {
            const obj: { [key: string]: any } = {}
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

    const getRowsDataforQuarterSpecificTable = async (basicDetails: { [key: string]: any }[], rows: any[][], quarterWiseTable: boolean, summaryOnly: boolean) => {
        const {
            Quarter,
            Year,
        } = basicDetails[0] || {};
        const keys = rows[0];
        const timeStamp: Array<string> = [];
        for (let i = 0; i < rows.length; i++) {
            const date = new Date();
            await new Promise((resolve, reject) => setTimeout(resolve, 10));
            timeStamp.push(date.getTime().toString());
        }

        const arrays = keys?.map((current, index) => {
            let quarters = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i];

                const date = new Date();

                quarters.push({
                    quarter: Number(Quarter),
                    year: Number(Year),
                    value: values[index].toString(),
                    groupKey: timeStamp[i],
                })
            }

            return {
                title: current,
                quarters: quarters,
                category: '',
                yoy: '',
                priority: (index + 1).toString(),
            }
        })

        return arrays;
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
                let errors:any = [];  
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
                        rows: rows.filter(row => row.some(cell => cell !== null && cell !== '',
                        )),
                    }));     
                                                 
                    if(filteredTableData[0]?.rows[1][0] === "Disable" || filteredTableData[0]?.rows[1][0].length > 0){
                        const array = ["Category","Priority","Variables","YoY"];
                        {
                            filteredTableData[1]?.rows.map((value:any, index) => {
                                if(index === 0){                                    
                                    value.map((item:any) => {
                                        
                                        if (!(array.includes(item) || regex.test(item))) {
                                            errors.push({ sheetName, item,error:''});
                                        }
                                    })
                                }else{
                                    if(value[2] === undefined){
                                        value.map((item:any) => {
                                            if(item.length > 0){
                                                errors.push({ sheetName, item,  error:`${item}` });
                                                return;
                                            }
                                        })
                                    }
                                }
                            })
                        }              
                    }
                
                    let arrayOfObjects: Array<any> = [];
                    let basicDetails: Array<any> = [];
                    let quarterWiseTable = false;
                    let summaryOnly = false;
                    let tables = [];
                    if (filteredTableData?.length > 1) {
                        basicDetails = getDataForSingleTableForAllQuarters(filteredTableData[0].rows, true);
                        quarterWiseTable = basicDetails[0]?.QuaterSpecificTable === 'Enable';
                        summaryOnly = basicDetails[0]?.SummaryOnly === 'Enable';
                        if (quarterWiseTable || summaryOnly) {
                            let i = 0;
                            while (i < filteredTableData.length) {
                                basicDetails = getDataForSingleTableForAllQuarters(filteredTableData[i].rows, true);
                                arrayOfObjects = await getRowsDataforQuarterSpecificTable(basicDetails, filteredTableData[i+1].rows, quarterWiseTable, summaryOnly);
                                const {
                                    Quarter,
                                    Year,
                                } = basicDetails[0] || {};
                                tables.push({
                                    basicDetails,
                                    arrayOfObjects,
                                    summaryOnly,
                                    quarterWiseTable,
                                    quarter: Quarter,
                                    year: Year,
                                })
                                i = i + 2;
                            }
                        } else {
                            arrayOfObjects = getDataForSingleTableForAllQuarters(filteredTableData[1].rows, false);
                            tables.push({
                                arrayOfObjects,
                                summaryOnly,
                                quarterWiseTable,
                                basicDetails,
                            })
                        }
                    }
                    tables.map(current => {
                        let prevPriority: any;
                        let prevCategory: any;
                        sheetsArray.push({
                            company: company?.toString(),
                            name: sheetName,
                            quarterWiseTable: current?.quarterWiseTable || current?.summaryOnly,
                            summaryOnly: current?.summaryOnly,
                            title: current?.basicDetails[0]?.Title || '',
                            description: current?.basicDetails[0]?.Description,
                            quarter: Number(current?.quarter),
                            year: Number(current?.year),
                            variables: current?.quarterWiseTable || current?.summaryOnly ? current?.arrayOfObjects : current?.arrayOfObjects?.map(cell => {
                                prevPriority = !cell?.Priority?.toString() ? prevPriority : cell?.Priority?.toString();
                                prevCategory = !cell?.Category?.toString() ? prevCategory : cell?.Category?.toString();
                                return {
                                    title: cell?.Variables?.toString() || '',
                                    category: prevCategory || '',
                                    priority: prevPriority || '0',
                                    yoy: cell?.YoY?.toString() || '0',
                                    quarters: cell?.quarters?.map((cur: { quarter: any; year: any; value: any; }) => {
                                        return {
                                            quarter: Number(cur?.quarter),
                                            year: Number(cur?.year),
                                            value: cur?.value?.toString() || '',
                                        }
                                    })
                                }
                            })
                        })
                    })
                }
                setSheetsData(sheetsArray);
                if(errors.length > 0){                    
                    setListOfError(errors);
                    setOpen(true);
                }                
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const errorMessage = (item:any) => {
        const regex = /[a-pR-Z]/i;

        if(item?.error.length > 0){
            return (
                <div>
                    <b style={{color:'red'}}>Error : </b>{`For cell value `}
                    <b>{item?.error}, </b>{'Variable name is missing.'}
                </div>
            )
        }else{
            if(regex.test(item?.item)){
                return (
                    <div>
                        <b style={{color:'red'}}>Error : </b>{`In Data Table's header, `}
                        <b>{item?.item} </b>{"Spelling mistake."}
                    </div>
                )
            }else{
                return (
                    <div>
                        <b style={{color:'red'}}>Error : </b>{`In Data Table's header- `}
                        <b>{item?.item}</b>{`, It should be 'Q[1-4]-YEAR.'`}
                    </div>
                )
            }
        }   
    }
    return (
        <>
            <Modal
                showModal={true}
                handleOnSave={handleOnSave}
                title="Import Data from Excel sheet"
                onClose={() => props.onClose && props.onClose()}
                disabled={error}
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
                                                name: string;
                                            };
                                        }) => {
                                            return (
                                                <option
                                                    key={ele.attributes.slug}
                                                    value={ele?.id?.toString()}
                                                >
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
                        <div style={{color:'red', textAlign:'center', marginTop:'1rem'}}>{error ? "Upload valid sheet" : ''}</div>
                    </form>
                    <Dialog
                        open={open}
                        onClose={() => {handleClose(); props.onClose()}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            "& .MuiDialog-container": {
                              "& .MuiPaper-root": {
                                width: {xs: '90vw', sm:"50rem"}, 
                                maxHeight:'30rem'
                              },
                            },
                          }}
                        >
                        <div style={{ height:'30%'}}>
                                <DialogTitle id="alert-dialog-title" sx={{ fontSize:'1.875rem',fontWeight:400, marginBottom:'-1rem'}}>{"Errors"}</DialogTitle>
                                <DialogContent sx={{borderBottom:'2px solid #e2e8f0'}}>
                                    <DialogContentText id="alert-dialog-description">
                                    {listOfError.map((item: any, index) => (
                                        <div
                                        key={index}
                                        style={{
                                            padding: '1rem',
                                            border: '1px solid black',
                                            borderRadius: '0.7rem',
                                            marginTop:'1rem',
                                            fontWeight: 'bold',
                                        }}
                                        >
                                        <div><b style={{color:'#1d1e22'}}>Sheet Name :</b> {item?.sheetName}</div>
                                        {errorMessage(item)}
                                        </div>
                                    ))}
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions sx={{marginRight:'1rem'}}>
                                    <Button onClick={() => {handleClose(); props.onClose();}} sx={{ width:'7rem',display:'flex', justifyContent:'center', alignItems:'centre', color:'red', border:'1px solid black'}}><b>Close</b></Button>
                                </DialogActions>
                        </div>
                    </Dialog>
                </>
               
            </Modal>
        </>
    );
}
