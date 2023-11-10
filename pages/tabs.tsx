import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import TermsTable from "@/components/table/settings/TermsTable";
import 'react-toastify/dist/ReactToastify.css';
import { useLazyQuery } from "@apollo/client";
import { GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM } from "@/utils/query";
import { useRouter } from "next/router";
import { LayoutProps } from "@/utils/data";
import Loader from "@/components/loader";


export default function Tabs(props: JSX.IntrinsicAttributes & LayoutProps) {
    const [showLoader, setShowLoader] = useState(false);
    const [refetch, setRefetch] = useState(false);
    const [company, setCompany] = useState('');
    const [term, setTerm] = useState('');
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
        setShowLoader(true)
    }, [company])

    useEffect(() => {
        if (termsData?.getKpiTermsByCompanyId?.length) {
            setTerm(termsData?.getKpiTermsByCompanyId[0]?.id)
        } else {
            setTerm('');
        }
        setShowLoader(false)
        getVariables();
    }, [termsData])

    return (
        <Layout title="Tabs" page={LayoutPages.tabs} {...props}>
            <>
                {showLoader && (<Loader />)}
                <TermsTable data={termsData} company={company} setRefetch={setRefetch} />
            </>
        </Layout >
    );
}
