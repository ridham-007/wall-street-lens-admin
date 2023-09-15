import { SetStateAction, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Variable from "@/components/table/variables/Variable";
import "react-toastify/dist/ReactToastify.css";
import { GET_TERMS_BY_COMPANY } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import YearDropdown from "@/components/year_dropdown/year_dropdown";
import { Modal } from "@/components/model";


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
  const [showQuarter, setShowQuarter] = useState(false);


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
              <option value="4">4</option>
            </select>
            </div></>)}

          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto h-[50px]"
            onClick={() => setShowQuarter(true)}
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
            <span>Add a Quarter</span>
          </button>
        </div>
        {!!termId && <Variable termId={termId} year={year} quarter={quarter} selectedTerm={selectedTerm}/>}
        {showQuarter && (<QuarterData/>)}
      </>
    </Layout>
  );
}


interface QuarterDataProps {
  onSuccess?: any;
  onClose?: any;
  data?: any;
}

function QuarterData(props: QuarterDataProps) {
  const [val, setVal] = useState({
    quarter: "1",
    year: "2023",
  });

  const handleOnSave = () => {
    if (!val.quarter || !val.year) {
      props.onSuccess && props.onSuccess(val);
      props.onClose && props.onClose();
    };
  }

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Quarter Data"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <form className="form w-100">
          <div className="grid gap-4">
            <div className="flex flex-row gap-5">
              <div className="flex flex-row items-center gap-[20px] mb-[20px]">
                <YearDropdown onChange={(event: { target: { value: SetStateAction<string> }; }) => { setYear(event?.target.value); }} year={year} />
              </div>
              <div className="flex flex-col mb-[20px]">
                <label
                  htmlFor="quarter"
                  className="text-sm font-bold text-gray-700"
                >
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
              </div>
            </div>
          </div>
        </form>
      </>
    </Modal>
  );
}