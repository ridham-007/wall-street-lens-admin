import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import Variable from "@/components/table/variables/Variable";
import { Modal } from "@/components/model";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GET_VARIBALES_KPI_TERM, GET_VIEW_FOR_TERM } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";


export default function VariableDetails() {

    const [getTermVaribles, { data: termVaribles }] = useLazyQuery(
        GET_VIEW_FOR_TERM,
        {
            variables: {
                termId: '3e52ddcb-381c-4868-bf74-07e424e9ee98',
            },
        }
    );

    useEffect(() => {
        getTermVaribles()
    }, [])

    const [showLoader, setShowLoader] = useState(false);
    const [showImport, setShowImport] = useState(false)

    const [activeTab, setActiveTab] = useState('Variables');
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    return (
        <Layout title="Financial Summary" page={LayoutPages.variable_details}>
            <>
                {showLoader && (<Loader />)}
                <div className="flex mb-5">
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
                        <span>Details</span>
                    </button>
                </div>
                {showImport && (
                    <ImportData
                        onSuccess={() => { }}
                        onClose={() => { }}
                    ></ImportData>
                )}

            </>
            <Variable data={termVaribles}/>
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
        title: '',
        data: {},
    })
    const handleOnSave = () => {
        if (!val.title) {
            toast('title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
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
    }

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Import Data"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="title"
                                className="text-sm font-medium text-gray-700"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={val.title}
                                onChange={handleOnChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-700 outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                                Quarter
                            </label>
                            <input
                                type="number"
                                name="quarter"
                                className="mt-1 p-2 border rounded-md focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>
                </form>
            </>
        </Modal>
    );
}

