import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import VariableTable from "@/components/table/variables/VariableTable";
import 'react-toastify/dist/ReactToastify.css';
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM } from "@/utils/query";
import { useRouter } from "next/router";

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

    return (
        <Layout title="Veriables" page={LayoutPages.variables}>
            <>
                <VariableTable
                    term={term}
                    data={termsVaribles}
                    setTerm={setTerm}
                    setRefetch={setRefetch}
                    termsData={termsData}
                />
            </>
        </Layout>
    );
}