import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import VariableTable from "@/components/table/variables/VariableTable";
import 'react-toastify/dist/ReactToastify.css';
import { useLazyQuery } from "@apollo/client";
import { GET_MAPPING_VIEW, GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM } from "@/utils/query";
import { useRouter } from "next/router";
import AccordionItem from "@/components/Accordian";

export default function FinancialPage() {
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

    const [getVariablesMapping, { data: masterVariables, refetch: refetchMasterVariables }] = useLazyQuery(
        GET_MAPPING_VIEW,
    );

    useEffect(() => {
        if (!!company?.length) {
            getTermsDetails();
            getVariables();
        }
        getVariablesMapping();
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

    const getContent = (data: any) => {
        return <VariableTable
            data={data}
        />
    }

    console.log({ masterVariables })

    return (
        <Layout title="Veriables" page={LayoutPages.variables}>
            <>
                {masterVariables?.getMappingView?.map((cur: { masterVariable: { title: string; }; mapping: any; }) => {
                    return <AccordionItem title={cur?.masterVariable?.title} content={getContent(cur?.mapping)}/>
                })}
            </>
        </Layout>
    );
}
