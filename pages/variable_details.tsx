import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Variable from "@/components/table/variables/Variable";
import "react-toastify/dist/ReactToastify.css";
import { GET_TERMS_BY_COMPANY, GET_VIEW_FOR_TERM } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";

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
  const [getTermsDetails, { data: termsData, refetch: refetchQuarter }] =
    useLazyQuery(GET_TERMS_BY_COMPANY, {
      variables: {
        companyId: "TESLA",
      },
    });

  useEffect(() => {
    getTermsDetails();
  }, []);

  return (
    <Layout title="Financial Summary" page={LayoutPages.variable_details}>
      <>
        <div className="flex flex-row items-center gap-[20px] mb-[20px]">
          <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
            KPIs Term:
          </label>
          <select
            id="quarter"
            name="company"
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
        {!!termId && <Variable termId={termId} />}
      </>
    </Layout>
  );
}
