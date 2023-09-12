import { SetStateAction, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Variable from "@/components/table/variables/Variable";
import "react-toastify/dist/ReactToastify.css";
import { GET_TERMS_BY_COMPANY } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import YearDropdown from "@/components/year_dropdown/year_dropdown";


interface KpiTerm {
  id: string;
  name: string;
  quarterWiseTable: boolean;
  summaryOnly: boolean;
  updatedAt: Date;
  company: string;
  __typename: string;
}

export default function VariableDetails() {
  const [termId, setTermId] = useState("");
  const [company, setCompany] = useState('');
  const [quarter, setQuarter] = useState('1');
  const [year, setYear] = useState('2023');


  const [getTermsDetails, { data: termsData }] =
    useLazyQuery(GET_TERMS_BY_COMPANY, {
      variables: {
        companyId: company,
      },
    });
  const router = useRouter();
  useEffect(() => {
    setCompany(router.query.company)
  }, [router.query])

  useEffect(() => {
    if(company){
      getTermsDetails();
    }
  }, []);

  useEffect(() => {
    if (termsData?.getKpiTermsByCompanyId?.length){
      setTermId(termsData?.getKpiTermsByCompanyId[0].id);
    } else {
      setTermId('');
    }
  }, [termsData])

  useEffect(() => {
    getTermsDetails();
  }, [company])
  const selectedTerm = termsData?.getKpiTermsByCompanyId?.find((cur: { id: string; }) => cur.id === termId);
  return (
    <Layout title="Financial Summary" page={LayoutPages.variable_details}>
      <>
        <div className="flex gap-[20px]">
          <div className="flex flex-col mb-[20px]">
            <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
              KPIs Term:
            </label>
            <select
              id="quarter"
              name="term"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={termId}
              onChange={(event) => {
                setTermId(event.target?.value);
              }}
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
          {selectedTerm?.quarterWiseTable && (<><div className="flex flex-row items-center gap-[20px] mb-[20px]">
            <YearDropdown onChange={(event: { target: { value: SetStateAction<string>; }; }) => { setYear(event?.target.value)}} year={year}/>
          </div>
          <div className="flex flex-col mb-[20px]">
            <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
              Quarter:
            </label>
            <select
              id="quarter"
              name="quarter"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={quarter}
              onChange={(event) => {
                setQuarter(event.target?.value);
              }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">3</option>
            </select>
            </div></>)}
        </div>
        {!!termId && <Variable termId={termId} year={year} quarter={quarter} selectedTerm={selectedTerm}/>}
      </>
    </Layout>
  );
}
