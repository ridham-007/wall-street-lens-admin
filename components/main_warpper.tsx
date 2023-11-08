import { GET_COMPANIES, GET_SUB_INDUSTRIES } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";


export default function MainWrapper({Component, pageProps}: AppProps) {

    const [company, setCompany] = useState(0);

    const [getCompanies, { data: companies }] = useLazyQuery(GET_COMPANIES, {
        fetchPolicy: "network-only",
    });

    const [getSubIndustries, { data: subIndustries }] = useLazyQuery(
        GET_SUB_INDUSTRIES,
        {
            fetchPolicy: "network-only",
        }
    );

    useEffect(() => {
        getCompanies();
        getSubIndustries();
    }, []);

    useEffect(() => {
        setCompany(companies?.getCompanies[0]?.id);
    }, [companies]);

    return (
        <Component 
        {...pageProps} 
        company={company} 
        setCompany={setCompany}
        companies={companies}
        subIndustries={subIndustries}
        />
    );
}
