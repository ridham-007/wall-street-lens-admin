import { useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ParameterTable from "@/components/table/chart/ParameterTable";
import Multiselect from 'multiselect-react-dropdown';
import { ADD_UPDATE_TERM_CHART_MUTATION } from "@/utils/query";

import { GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM } from "@/utils/query";
import { useRouter } from "next/router";
const selectedCompany = [{
  id: 1,
  name: 'TESLA',
}]

export default function FinancialPage() {
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [isOpenAction, setIsOpenAction] = useState("");
  const [company, setCompany] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCompany(router.query.company)
  }, [router.query])

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: { target: any }) => {
      if (
        isOpenAction?.length > 0 &&
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setIsOpenAction("");
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);


    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [isOpenAction]);

  return (
    <Layout title="Management Chart" page={LayoutPages.management_chart}>
      <>
        <div className="flex justify-end pr-4 gap-4 mb-4">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setAddUpdateParameter(true)}
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
            <span>Add a Description</span>
          </button>
        </div>
        <div>
          {<ParameterTable data={{}} />}
        </div>
        {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={() => { }}
            onClose={() => { setAddUpdateParameter(false) }}
            selectedCompany={selectedCompany}
            company={company}
          ></AddUpdateParaMeter>
        )}

      </>
    </Layout >
  );
}

interface AddUpdateParameterProps {
  onSuccess?: any;
  onClose?: any;
  selectedCompany?: any;
  financialInitData?: any;
  company: any;
}

interface KpiTerm {
  title: ReactNode;
  id: string;
  name: string;
  quarterWiseTable: boolean;
  summaryOnly: boolean;
  updatedAt: Date;
  company: string;
  __typename: string;
}

interface VariablesArray {
  category: string;
  title: string;
}




function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [company, setCompany] = useState('');
  const [val, setVal] = useState({
    title: "",
    graph: "",
    term: "",
  })

  const [isToggled, setIsToggled] = useState(false);
  const onToggle = () => setIsToggled(!isToggled);

  const [getTermsDetails, { data: termsData }] =
    useLazyQuery(GET_TERMS_BY_COMPANY, {
      variables: {
        companyId: props.company,
      },
    });

  const router = useRouter();

  useEffect(() => {
    setCompany(router.query.company)
  }, [router.query])

  useEffect(() => {
    getTermsDetails();
  }, [company]);

  const [getVariables, { data: termsVaribles }] = useLazyQuery(
    GET_VARIBALES_KPI_TERM,
    {
      variables: {
        termId: val.term || '',
      },
    }
  );

  useEffect(() => {
    getVariables();
  }, [val.term])

  const [addUpdateTermChart] = useMutation(ADD_UPDATE_TERM_CHART_MUTATION);

  const handleAddUpdateTermChart = async () => {
    try {
      const result = await addUpdateTermChart({
        variables: {
          chartInfo: {
            id: 'String',
            title: val.title,
            // type: String
            visible: true
          },
          keysInfo: {
            termId: val.term,
          variableIds: selectedVariablesArr,
          },
        },
      });

      // Handle the result (e.g., update your UI)
      console.log('Mutation result:', result);
    } catch (error) {
      // Handle errors
      console.error('Mutation error:', error);
    }
  };


  const handleOnSave = () => {
    if (val.title) {
      handleAddUpdateTermChart();
      return;
    }
    props.onSuccess && props.onSuccess(val)
    props.onClose && props.onClose()
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const name = e.target.name;

    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };

  const [selectedVariablesArr, setselectedVariablesArr] = useState<any[]>([]);

  let updatedOptions: { cat: string; key: string }[] = [];

  if (termsVaribles?.getVariablesByKpiTerm) {
    const originalData = termsVaribles.getVariablesByKpiTerm;
    const groupedOptions: Record<string, { cat: string; key: string }[]> = {};

    // Iterate over the original data and group options by the "title" field
    originalData.forEach((item: VariablesArray) => {
      const { category, title } = item;

      if (title) {
        if (!groupedOptions[title]) {
          groupedOptions[title] = [];
        }

        groupedOptions[title].push({ cat: title, key: title });
      }
    });

    // Flatten the grouped options into a single array
    updatedOptions = Object.values(groupedOptions).reduce(
      (accumulator, categoryOptions) => [...accumulator, ...categoryOptions],
      []
    );
  }

  // Handler function to update selectedVariablesArr
  const handleSelect = (selectedList: any[]) => {
    setselectedVariablesArr(selectedList);
  };

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Management Chart Descriptions"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <form className="form w-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={val.title}
                onChange={handleOnChange}
                required
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                Graph Type
              </label>
              <select
                id="graphType"
                name="graph"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={val.graph}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                <option value="Bar">Bar Chart</option>
                <option value="Linear">Linear Graph</option>
              </select>
            </div>
            <div className="flex flex-col mb-[20px]">
              <label htmlFor="quarter" className="text-sm  text-gray-700">
                KPIs Term:
              </label>
              <select
                id="quarter"
                name="term"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={val.term}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                {
                  (termsData?.getKpiTermsByCompanyId ?? []).map((cur: KpiTerm) => {
                    return (
                      <option key={cur.id} value={cur?.id}>
                        {cur?.name}
                      </option>
                    );
                  }
                  )
                }
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="variables_array" className="text-sm  text-gray-700">
                Variables Array
              </label>
              <Multiselect
                id="variables_array"
                displayValue="key"
                placeholder="Select options"
                onKeyPressFn={function noRefCheck() { }}
                onRemove={function noRefCheck() { }}
                onSearch={function noRefCheck() { }}
                onSelect={handleSelect}
                options={updatedOptions}
                selectedValues={selectedVariablesArr}
                showCheckbox
              />
            </div>

            <div className="flex flex-row">
              <label htmlFor="quarter" className="text-sm font-medium  text-gray-700">
                Visibility
              </label>
              <label className="toggle-switch">
                <input type="checkbox" checked={isToggled} onChange={onToggle} />
                <span className="switch" />
              </label>
            </div>
          </div>
        </form>
        <ToastContainer />
      </>
    </Modal>
  );
}
