import { Key, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import Loader from "@/components/loader";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_UPDATE_KPI_TERM, DELETE_KPI_BY_ID, GET_SUB_INDUSTRIES } from "@/utils/query";
import { GET_COMPANIES } from "@/utils/query";

export interface TableProps {
    data: any;
    company: any;
    setRefetch: any;
}

const TermsTable = (props: TableProps) => {
    const companies = useQuery(GET_COMPANIES);
    const subIndustries = useQuery(GET_SUB_INDUSTRIES);
    const [isOpenAction, setIsOpenAction] = useState('');
    const [show, setShow] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [currentData, setCurrentData] = useState({});
    const [deletePopup, setDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [addOrUpdateKPIterm] = useMutation(ADD_UPDATE_KPI_TERM);
    const [deleteKPI] = useMutation(DELETE_KPI_BY_ID);

    const onAddUpdateKpiTerm = async (perameters: any) => {
        setShowLoader(true);
        await addOrUpdateKPIterm({
            variables: {
                kpiInfo: {
                    id: perameters?.id,
                    name: perameters?.name,
                    company: props?.company,
                    quarterWiseTable: perameters?.quarterWise,
                    summaryOnly: perameters?.summaryOnly,
                },
            }
        })
        setShowLoader(false);
        props.setRefetch(true);
    }

    const onDeleteKPI = async (id: any) => {
        await deleteKPI({
            variables: {
                termId: id,
            }
        })
        props.setRefetch(true);
    }
    const ref = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        const checkIfClickedOutside = (e: { target: any; }) => {
            if (isOpenAction && ref.current && !ref.current.contains(e.target)) {
                setIsOpenAction('')
            }
        }

        document.addEventListener("mousedown", checkIfClickedOutside)

        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside)
        }
    }, [isOpenAction])
    const toggleMenu = (id: string | number | ((prevState: string) => string) | null | undefined) => {
        if (isOpenAction) {
            setIsOpenAction('');
        } else {
            if (id) {
                setIsOpenAction(id?.toString());
            }
        }
    };

    const tableData = props?.data?.getKpiTermsByCompanyId;

    let selectedSubIndustry = {};
    let companyName = '';
    if (companies?.data?.getCompanies?.length && subIndustries?.data?.getSubIndustries?.length) {
        const selectedCompany = companies?.data?.getCompanies?.find((cur: { id: number; }) => cur.id === Number(props.company));
        companyName = selectedCompany?.attributes?.name;
        const subId = selectedCompany?.attributes?.subIndustries[0]?.id;
        selectedSubIndustry = subIndustries?.data?.getSubIndustries?.find((cur: { id: any; }) => cur.id === subId)
    }

    const industryName = selectedSubIndustry?.attributes?.industry?.name;
    const subIndustryName = selectedSubIndustry?.attributes?.name;

    return <>
        {showLoader && (<Loader />)}
        <div
            className="w-full flex justify-start mb-[20px]"
        >
            <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShow(true)}
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
                <span>Add a Term</span>
            </button>
        </div>
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH>Name</TH>
                            <TH>Company</TH>
                            <TH>Industry</TH>
                            <TH>Sub Industry</TH>
                            <TH >Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    {tableData?.map((current: { id: ((prevState: string) => string) | Key | null | undefined; name: string | JSX.Element | undefined; company: string | JSX.Element | undefined; quarterWiseTable: any; summaryOnly: any; }) => {
                        return <TDR key={current?.id || Math.random().toString()}>
                            <>
                                <TD>{current?.name}</TD>
                                <TD>{companyName || '-'}</TD>
                                {/* <TD>{current?.quarterWiseTable? 'Enabled':'Disabled'}</TD>
                                <TD>{current?.summaryOnly ? 'Enabled' : 'Disabled'}</TD> */}
                                <TD>{industryName || '-'}</TD>
                                <TD>{subIndustryName || '-'}</TD>
                                <TD style="text-center">
                                    <>
                                        <div
                                            className="flex justify-center gap-[10px] items-center"
                                        >
                                            <button
                                                className=" inline-flex items-center text-sm font-medium text-gray-700 border-none bg-transparent hover:bg-white"
                                                onClick={() => { setShow(true); setCurrentData(current); }}

                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#c94f60" d="M42.583,9.067l-3.651-3.65c-0.555-0.556-1.459-0.556-2.015,0l-1.718,1.72l5.664,5.664l1.72-1.718	C43.139,10.526,43.139,9.625,42.583,9.067" /><path fill="#f0f0f0" d="M6.905,35.43L5,43l7.571-1.906l0.794-6.567L6.905,35.43z" /><path fill="#edbe00" d="M36.032,17.632l-23.46,23.461l-5.665-5.665l23.46-23.461L36.032,17.632z" /><linearGradient id="YoPixpDbHWOyk~b005eF1a" x1="35.612" x2="35.612" y1="7.494" y2="17.921" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#dedede" /><stop offset="1" stop-color="#d6d6d6" /></linearGradient><path fill="url(#YoPixpDbHWOyk~b005eF1a)" d="M30.363,11.968l4.832-4.834l5.668,5.664l-4.832,4.834L30.363,11.968z" /><path fill="#787878" d="M5.965,39.172L5,43l3.827-0.965L5.965,39.172z" /></svg>

                                            </button>
                                            <button
                                                className=" inline-flex items-center text-sm font-medium text-gray-700 order-none bg-transparent hover:bg-white"
                                                onClick={() => { setDeletePopup(true); setDeleteId(current?.id || '') }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24px" height="24px"><path d="M37.297,94.938c-4.641,0-8.578-3.319-9.363-7.894l-8.278-48.311C16.967,37.937,15,35.443,15,32.5 C15,23.402,22.402,16,31.5,16h2.234c2.005-4.158,6.256-7,11.146-7h14.238c4.891,0,9.142,2.842,11.146,7H72.5 C81.598,16,89,23.402,89,32.5c0,2.707-1.664,5.033-4.022,6.009l-8.316,48.533c-0.781,4.573-4.719,7.896-9.362,7.896H37.297z" opacity=".35" /><path fill="#f2f2f2" d="M35.297,92.938c-4.641,0-8.578-3.319-9.363-7.894l-8.278-48.311C14.967,35.937,13,33.443,13,30.5 C13,21.402,20.402,14,29.5,14h2.234c2.005-4.158,6.256-7,11.146-7h14.238c4.891,0,9.142,2.842,11.146,7H70.5 C79.598,14,87,21.402,87,30.5c0,2.707-1.664,5.033-4.022,6.009l-8.316,48.533c-0.781,4.573-4.719,7.896-9.362,7.896H35.297z" /><path fill="#40396e" d="M63,25H37c-0.828,0-1.5-0.672-1.5-1.5v-4.119c0-4.069,3.312-7.381,7.381-7.381h14.238 c4.069,0,7.381,3.312,7.381,7.381V23.5C64.5,24.328,63.828,25,63,25z M38.5,22h23v-2.619c0-2.416-1.965-4.381-4.381-4.381H42.881 c-2.416,0-4.381,1.965-4.381,4.381V22z" /><polygon fill="#9aa2e6" points="22.806,28.303 32.767,86.438 67.828,86.438 77.79,28.303" /><path fill="#707cc0" d="M80.5,28.957h-61v0c0-4.671,3.787-8.457,8.457-8.457h44.085C76.713,20.5,80.5,24.287,80.5,28.957 L80.5,28.957z" /><path fill="#40396e" d="M65.299,87.938H35.297c-2.198,0-4.063-1.572-4.436-3.739L21.917,32H19.5c-0.828,0-1.5-0.672-1.5-1.5 C18,24.159,23.159,19,29.5,19h41C76.841,19,82,24.159,82,30.5c0,0.828-0.672,1.5-1.5,1.5h-1.822l-8.944,52.197 C69.363,86.364,67.498,87.938,65.299,87.938z M21.133,29h2.049c0.73,0,1.355,0.526,1.479,1.247l9.158,53.444 c0.124,0.722,0.746,1.246,1.479,1.246h30.002c0.732,0,1.354-0.524,1.478-1.246l9.158-53.444C76.058,29.526,76.683,29,77.413,29 h1.454c-0.71-3.974-4.192-7-8.367-7h-41C25.325,22,21.843,25.026,21.133,29z" /><path fill="#40396e" d="M38.647,76.944c-0.759,0-1.41-0.574-1.49-1.346l-3.86-37.445c-0.085-0.824,0.515-1.562,1.338-1.646 c0.82-0.08,1.561,0.514,1.646,1.338l3.86,37.445c0.085,0.824-0.515,1.562-1.338,1.646C38.751,76.941,38.699,76.944,38.647,76.944z" /><path fill="#40396e" d="M46.414,76.942c-0.805,0-1.47-0.638-1.498-1.448l-1.298-37.406 c-0.028-0.828,0.619-1.522,1.447-1.551c0.83-0.034,1.521,0.619,1.551,1.447l1.298,37.406c0.028,0.828-0.619,1.522-1.447,1.551 C46.449,76.942,46.432,76.942,46.414,76.942z" /><path fill="#40396e" d="M54.183,76.941c-0.018,0-0.034,0-0.052-0.001c-0.828-0.028-1.477-0.722-1.448-1.55l1.265-37.368 c0.027-0.828,0.746-1.492,1.55-1.448c0.828,0.028,1.477,0.722,1.448,1.55l-1.265,37.368C55.653,76.303,54.987,76.941,54.183,76.941 z" /><path fill="#40396e" d="M61.949,76.939c-0.052,0-0.103-0.003-0.155-0.008c-0.824-0.085-1.424-0.821-1.339-1.646 l3.827-37.328c0.085-0.824,0.818-1.412,1.646-1.339c0.824,0.085,1.424,0.821,1.339,1.646l-3.827,37.328 C63.36,76.364,62.709,76.939,61.949,76.939z" /></svg>

                                            </button>
                                        </div>
                                    </>
                                </TD>
                            </>
                        </TDR>
                    })}
                </tbody>
            </table>
        </div >
        {show && (<AddUpdateTerms data={currentData} onClose={() => { setShow(false); setCurrentData({}) }} onSuccess={onAddUpdateKpiTerm} />)}
        {deletePopup && <DeleteTerm id={deleteId} onSuccess={onDeleteKPI} onClose={() => {
            setDeleteId('');
            setDeletePopup(false);
        }} />}
    </>
}

interface AddUpdateTermProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
}

function AddUpdateTerms(props: AddUpdateTermProps) {
    const [val, setVal] = useState({
        id: props?.data?.id,
        name: props?.data?.name,
        summaryOnly: props?.data?.summaryOnly,
        quarterWise: props?.data?.quarterWiseTable
    })
    const handleOnSave = () => {
        if (!val.name) {
            // toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
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

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title={`Add a Term: ${props?.data?.kpiTerm?.company || ''}`}
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex col-span-2 flex-col mb-[20px]">
                            <label
                                htmlFor="Name"
                                className="text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="Name"
                                name="name"
                                value={val.name}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        {!props.data?.id && (<><div className="flex gap-[10px]">
                            <label
                                htmlFor="quarterwise"
                                className="text-sm font-medium text-gray-700"
                            >
                                Quarter wise table
                            </label>
                            <input
                                name='quarterWise'
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 rounded border-gray-300"
                                checked={val.quarterWise}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="flex gap-[10px]">
                            <label
                                htmlFor="SummaryOnly"
                                className="text-sm font-medium text-gray-700"
                            >
                                Summary Only
                            </label>
                            <input
                                name='summaryOnly'
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 rounded border-gray-300"
                                checked={val.summaryOnly}
                                onChange={handleOnChange}
                            />
                            </div></>)}
                    </div>
                </form>
            </>
        </Modal>
    );
}

interface DeleteTermProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
}

function DeleteTerm(props: DeleteTermProps) {
    const handleOnSave = () => {
        if (!props?.id) {
            // toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
            return;
        }
        props.onSuccess && props.onSuccess(props?.id)
        props.onClose && props.onClose()
    };

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Delete a Term"
            onClose={() => props.onClose && props.onClose()}
            confirmButton="Delete"
        >
            <>
                <div>Are you sure you want to delete?</div>
            </>
        </Modal>
    );
}
export default TermsTable;
