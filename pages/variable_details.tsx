import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import Variable from "@/components/table/variables/Variable";
import "react-toastify/dist/ReactToastify.css";
import { GET_TERMS_BY_COMPANY, GET_VIEW_FOR_TERM } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";

export default function VariableDetails() {
  const [val, setVal] = useState("");

  const [getTermVaribles, { data: termVaribles }] = useLazyQuery(
    GET_VIEW_FOR_TERM,
    {
      variables: {
        termId: val,
      },
    }
  );

  const [getTermsDetails, { data: termsData, refetch: refetchQuarter }] =
    useLazyQuery(GET_TERMS_BY_COMPANY, {
      variables: {
        companyId: "Tesla",
      },
    });

  useEffect(() => {
    getTermVaribles();
    getTermsDetails();
  }, []);

  const [showLoader, setShowLoader] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [activeTab, setActiveTab] = useState("Variables");
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <Layout title="Financial Summary" page={LayoutPages.variable_details}>
      <>
        {showLoader && <Loader />}
        <div className="flex flex-row items-center gap-[20px] mb-[20px]">
          <label htmlFor="quarter" className="text-sm font-bold text-gray-700">
            KPIs Term:
          </label>
          <select
            id="quarter"
            name="company"
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={val}
            onChange={(event) => {
              setVal(event.target?.value);
            }}
          >
            <option value="">Select a option</option>
            {termsData?.getKpiTermsByCompanyId?.map((cur) => {
              return (
                <option key={cur.id} value={cur?.id}>
                  {cur?.name}
                </option>
              );
            })}
          </select>
        </div>
        <Variable />
      </>
    </Layout>
  );
}
