import { Key, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import { useMutation } from "@apollo/client";
import { ADD_UPDATE_KPI_TERM, DELETE_KPI_BY_ID } from "@/utils/query";

export interface TableProps {
    data: any;
    company: any;
    setRefetch: any;
}

const TermsTable = (props: TableProps) => {
    const [isOpenAction, setIsOpenAction] = useState('');
    const [show, setShow] = useState(false);
    const [currentData, setCurrentData] = useState({});
    const [deletePopup, setDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [addOrUpdateKPIterm] = useMutation(ADD_UPDATE_KPI_TERM);
    const [deleteKPI] = useMutation(DELETE_KPI_BY_ID);

    const onAddUpdateKpiTerm = async (perameters: any) => {

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
    console.log({ currentData })
    return <>
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
                            <TH>Quarter Wise Table</TH>
                            <TH>Summary Only</TH>
                            <TH >Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    {tableData?.map((current: { id: ((prevState: string) => string) | Key | null | undefined; name: string | JSX.Element | undefined; company: string | JSX.Element | undefined; quarterWiseTable: any; summaryOnly: any; }) => {
                        return <TDR key={current?.id || Math.random().toString()}>
                            <>
                                <TD>{current?.name}</TD>
                                <TD>{current?.company}</TD>
                                <TD>{current?.quarterWiseTable? 'Enabled':'Disabled'}</TD>
                                <TD>{current?.summaryOnly ? 'Enabled' : 'Disabled'}</TD>
                                <TD style="text-center">
                                    <>
                                        <button
                                            className=" inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => toggleMenu(current?.id)}
                                        >
                                            <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>

                                        </button>
                                        {((isOpenAction === current?.id) && (
                                            <div ref={ref} className="z-auto absolute right-[85px] mt-2   rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    <a
                                                        onClick={() => { setShow(true); setCurrentData(current); }}
                                                        className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                    <a
                                                        onClick={() => { setDeletePopup(true); setDeleteId(current?.id || '') }}
                                                        className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                </TD>
                            </>
                        </TDR>
                    })}
                </tbody>
            </table>
        </div >
        {show && (<AddUpdateTerms data={currentData} onClose={() => { setShow(false) }} onSuccess={onAddUpdateKpiTerm}/>)}
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
    console.log({props})
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
                        <div className="flex gap-[10px]">
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
                        </div>
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
        >
            <>
                <div>Are you sure you want to delete?</div>
            </>
        </Modal>
    );
}
export default TermsTable;
