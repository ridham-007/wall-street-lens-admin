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
                {/* <div className="flex mb-5">
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
                </div> */}
            </>
            <Variable data={termVaribles}/>
        </Layout >
    );
}
