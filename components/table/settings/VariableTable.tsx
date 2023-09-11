import { Key, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import { ADD_UPDATE_TERM_VERIABLE, DELETE_VERIABLE_BY_ID } from "@/utils/query";
import { useMutation } from "@apollo/client";

export interface TableProps {
    data: any;
    setTerm: any;
    termsData: any;
    term: any;
}

interface KpiTerm {
    id: string;
    name: string;
    quarterWiseTable: boolean;
    summaryOnly: boolean;
    updatedAt: Date;
    company: string;
    __typename: string;
}

const VariableTable = (props: TableProps) => {
    const[show, setShow] = useState(false);
    const [uniqueId, setUniqueId] = useState('');
    const [currentData, setCurrentData] = useState({});
    const [deletePopup, setDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState('');

    const [addOrUpdateVeriable] = useMutation(ADD_UPDATE_TERM_VERIABLE);
    const [deleteVariable] = useMutation(DELETE_VERIABLE_BY_ID);


    const onAddUpdateQuarter = async (perameters: any) => {
        await addOrUpdateVeriable({
            variables: {
                variableInfo: {
                    id: perameters?.id,
                    title: perameters?.name,
                    category: perameters?.category,
                    priority: perameters?.priority,
                    yoy: perameters?.YoY,
                },
                termId: perameters?.term,
            }
        })
    }

    const onDeleteVeriable = async (id: any) => {
        await deleteVariable({
            variables: {
                variableId: id,
            }
        })
    }

    const [isOpenAction, setIsOpenAction] = useState('');
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
            if(id){
                setIsOpenAction(id?.toString());
            }
        }
    };

    const tableData = props?.data?.getVariablesByKpiTerm;
    return <>
        <div className="flex items-center gap-[20px] justify-between">
            <div 
                className="w-full flex justify-start mb-[20px]"
            >
                <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 my-[20px]transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span>Add a Variable</span>
                </button>
            </div>
            <div className="flex flex-col mb-[20px]">
                <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
                    KPIs Term:
                </label>
                <select
                    id="quarter"
                    name="company"
                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={props.term}
                    onChange={(event) => {
                        props?.setTerm(event.target?.value);
                    }}
                >
                    <option value="">Select a option</option>
                    {(props?.termsData?.getKpiTermsByCompanyId ?? []).map((cur: KpiTerm) => {
                        return (
                            <option key={cur.id} value={cur?.id}>
                                {cur?.name}
                            </option>
                        );
                    })}
                </select>
            </div>
        </div>
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH>Name</TH>
                            <TH>Terms name</TH>
                            <TH>Priority</TH>
                            <TH>Category</TH>
                            <TH>YoY</TH>
                            <TH >Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    {tableData?.map((current) => {
                        return <TDR key={current?.id}>
                        <>
                                <TD>{current?.title}</TD>
                                <TD>{current?.kpiTerm?.name}</TD>
                                <TD>{current?.priority || ''}</TD>
                                <TD>{current?.category}</TD>
                                <TD>{current?.yoy}</TD>
                            <TD style="text-center" key={uniqueId}>
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
                                                    onClick={() => {setShow(true); setUniqueId(Math.random.toString()); setCurrentData(current)}}
                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                <a
                                                        onClick={() => { setDeletePopup(true); setDeleteId(current?.id) }}
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
        {show && (<AddUpdateVariable termsData={props.termsData} data={currentData} onClose={() => { setShow(false); setCurrentData({}) }} onSuccess={onAddUpdateQuarter}/>)}
        {deletePopup && <DeleteVariable id={deleteId} onSuccess={onDeleteVeriable} onClose={() => {
            setDeleteId('');
            setDeletePopup(false);
        }}/>}
    </>
}

interface AddUpdateParameterProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
    termsData?: any;
}

function AddUpdateVariable(props: AddUpdateParameterProps) {
    const [val, setVal] = useState({
        id: props?.data?.id,
        name: props?.data?.title,
        term: props?.data?.kpiTerm?.id,
        category: props?.data?.category,
        priority: props?.data?.priority,
        YoY: props?.data?.yoy,
    })
    const handleOnSave = () => {
        if (!val.name || !val.term) {
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
            title="Add a Veriable"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="Name"
                                className="text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="Name"
                                name="Name"
                                value={val.name}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="Category"
                                className="text-sm font-medium text-gray-700"
                            >
                                Category
                            </label>
                            <input
                                type="text"
                                id="Category"
                                name="Category"
                                value={val.category}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col mb-[20px]">
                            <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
                                KPIs Term:
                            </label>
                            <select
                                id="quarter"
                                name="term"
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={val.term}
                                onChange={handleOnChange}
                            >
                                <option value="">Select a option</option>
                                {(props?.termsData?.getKpiTermsByCompanyId ?? []).map((cur: KpiTerm) => {
                                    return (
                                        <option key={cur.id} value={cur?.id}>
                                            {cur?.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="YoY"
                                className="text-sm font-medium text-gray-700"
                            >
                                YoY
                            </label>
                            <input
                                type="text"
                                id="YoY"
                                name="YoY"
                                value={val.YoY}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="priority"
                                className="text-sm font-medium text-gray-700"
                            >
                                Priority
                            </label>
                            <input
                                type="number"
                                id="priority"
                                name="priority"
                                value={val.priority}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </form>
            </>
        </Modal>
    );
}

interface DeleteVariableProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
}

function DeleteVariable(props: DeleteVariableProps) {
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
            title="Delete a Veriable"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <div>Are you sure you want to delete?</div>
            </>
        </Modal>
    );
}

export default VariableTable;
