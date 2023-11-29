import { Key, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import { Modal } from "@/components/model";
import { useMutation, useLazyQuery } from "@apollo/client";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import { AddMetaProps, LayoutProps, KpiTerm } from "@/utils/data"
import { GET_TERMS_BY_COMPANY, GET_CHART_BY_KPI_TERM } from "@/utils/query";
import SeoSettingsTable from "@/components/table/seo/SeoSettingsTable";

export default function FinancialPage(props: JSX.IntrinsicAttributes & LayoutProps) {
    const [showLoader, setShowLoader] = useState(false);
    const [showSeoModal, setShowSeoModal] = useState(false);
    const metadata = [
        { id: "Financial Summary", term: "Financial Summary", title: "Financial summary title", description: "This is finacial summary" },
        { id: "Outlook", term: "Outlook", title: "Outlook title", description: "This is Outlook" },
        { id: "Paypal Matrics", term: "Paypal Matrics", title: "Paypal Matrics title", description: "This is Paypal Matrics" }]



    return (
        <Layout title="seo_Settings" page={LayoutPages.seo_settings} {...props}>
            <>
                {showLoader && (<Loader />)}
                <div className="flex pr-4 gap-4">
                    <button
                        type="button"
                        className="bg-blue-500 ml-auto hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setShowSeoModal(true)}
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
                        <span>Add Meta</span>
                    </button>
                </div>
                <div className="mt-4">
                    <SeoSettingsTable metadata={metadata} />
                </div>
                {showSeoModal &&
                    <AddMeta
                        onSuccess={() => { }}
                        onClose={() => {
                            setShowSeoModal(false);
                        }}
                    />}
            </>
        </Layout >

    );
}
function AddMeta(props: AddMetaProps) {




    const [refetch, setRefetch] = useState(false);
    const [term, setTerm] = useState("");
    const [company, setCompany] = useState("");
    const router = useRouter();
    const [val, setVal] = useState({
        title: "",
        description: "",
        term: "",
    });

    const handleOnSave = () => {

        props.onSuccess && props.onSuccess();
        props.onClose && props.onClose();

        console.log(val, "vvvvvvvvv")


    };

    useEffect(() => {
        if (typeof router.query.company === 'string') {
            setCompany(router.query.company);
        }
    }, [router.query]);

    const [getTermsDetails, { data: termsData, refetch: refetchTerms }] =
        useLazyQuery(GET_TERMS_BY_COMPANY, {
            fetchPolicy: 'network-only',
            variables: {
                companyId: company,
            },
        });

    useEffect(() => {
        if (!!company && refetch) {
            refetchTerms();

        }
        setRefetch(false);

    }, [refetch]);

    useEffect(() => {
        if (!!company?.length) {
            getTermsDetails();
        }
    }, [company]);

    const handleOnChange = (event: any) => {

        const selectedTerm = event?.target?.value;
        setVal((prevVal) => ({
            ...prevVal,
            term: selectedTerm,
        }));
        console.log(selectedTerm, "sssssssssss");
    }

    const handleOnInputChange = (event: any) => {
        const { name, value } = event.target;
        setVal((prevVal) => ({
            ...prevVal,
            [name]: value,
        }));
    };

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Add Meta"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="quarter"
                                    className="text-sm  text-gray-700 mr-[20px]"
                                >
                                    Select Kpi term
                                </label>
                                <select
                                    id="quarter"
                                    name="term"
                                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={val.term}
                                    onChange={handleOnChange}
                                >
                                    <option value="">Select a option</option>
                                    {(termsData?.getKpiTermsByCompanyId ?? []).map((cur: KpiTerm) => {
                                        return (
                                            <option key={cur.id} value={cur?.id}>
                                                {cur?.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="flex flex-col mb-[20px]">
                                <label

                                    className="text-sm font-medium text-gray-700"
                                >
                                    title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={val.title}
                                    onChange={handleOnInputChange}
                                    required
                                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col mb-[20px]">
                                <label
                                    className="text-sm font-medium text-gray-700"
                                >
                                    description
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="description"
                                    value={val.description}
                                    onChange={handleOnInputChange}
                                    required
                                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />

                            </div>
                        </div>
                    </div>
                </form>
            </>
        </Modal>
    );
}


