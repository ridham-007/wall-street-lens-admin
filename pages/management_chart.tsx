import { ReactNode, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ParameterTable from "@/components/table/chart/ParameterTable";
import Multiselect from "multiselect-react-dropdown";
import {
  ADD_UPDATE_TERM_CHART_MUTATION,
  GET_CHART_BY_KPI_TERM,
} from "@/utils/query";

import { GET_TERMS_BY_COMPANY, GET_VARIBALES_KPI_TERM } from "@/utils/query";
import { useRouter } from "next/router";
const selectedCompany = [
  {
    id: 1,
    name: "TESLA",
  },
];

export default function FinancialPage() {
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [term, setTerm] = useState("");
  const [isOpenAction, setIsOpenAction] = useState("");
  const [company, setCompany] = useState("");
  const router = useRouter();

  useEffect(() => {
    setCompany(router.query.company);
  }, [router.query]);

  const [getTermsDetails, { data: termsData, refetch: refetchTerms }] =
    useLazyQuery(GET_TERMS_BY_COMPANY, {
      fetchPolicy: 'network-only',
      variables: {
        companyId: company,
      },
    });

  const [getChartDetails, { data: chartData, refetch: refetchCharts }] =
    useLazyQuery(GET_CHART_BY_KPI_TERM, {
      fetchPolicy: 'network-only',
      variables: {
        termId: term,
      },
    });

  useEffect(() => {
    if (!!company && refetch) {
      refetchTerms();
      refetchCharts();
    }
    setRefetch(false);
  }, [refetch]);

  useEffect(() => {
    getChartDetails();
  }, [term]);

  useEffect(() => {
    if (termsData?.getKpiTermsByCompanyId.length) {
      setTerm(termsData?.getKpiTermsByCompanyId[0]?.id);
    } else {
      setTerm("");
    }
  }, [termsData]);

  useEffect(() => {
    getTermsDetails();
  }, [company]);

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
        <div className="flex justify-between pr-4 gap-4 mb-4">
          <div className="flex items-center">
            <label
              htmlFor="quarter"
              className="text-sm  text-gray-700 mr-[20px]"
            >
              KPIs Term:
            </label>
            <select
              id="quarter"
              name="term"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={term}
              onChange={(event) => {
                setTerm(event?.target?.value);
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
            <span>Add a Chart</span>
          </button>
        </div>
        <div>
          {
            <ParameterTable
              company={company}
              data={chartData}
              refetch={setRefetch}
            />
          }
        </div>
        {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={() => { }}
            onClose={() => {
              setAddUpdateParameter(false);
            }}
            selectedCompany={selectedCompany}
            company={company}
            refetch={setRefetch}
            term={term}
          ></AddUpdateParaMeter>
        )}
      </>
    </Layout>
  );
}

interface AddUpdateParameterProps {
  onSuccess?: any;
  onClose?: any;
  selectedCompany?: any;
  financialInitData?: any;
  company: any;
  refetch: any;
  term:any;
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
  id: string;
}

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    title: "",
    graph: "",
    term: props.term,
    visible: false,
    xAxis: "",
    yAxis: "",
    group: "",
  });


  const [getTermsDetails, { data: termsData }] = useLazyQuery(
    GET_TERMS_BY_COMPANY,
    {
      fetchPolicy: 'network-only',
      variables: {
        companyId: props.company,
      },
    }
  );

  useEffect(() => {
    getTermsDetails();
  }, [props.company]);

  const [getVariables, { data: termsVaribles }] = useLazyQuery(
    GET_VARIBALES_KPI_TERM,
    {
      fetchPolicy: 'network-only',
      variables: {
        termId: val.term || "",
      },
    }
  );

  useEffect(() => {
    getVariables();
  }, [val.term]);


  const [addUpdateTermChart] = useMutation(ADD_UPDATE_TERM_CHART_MUTATION);

  const handleAddUpdateTermChart = async () => {
    if (!val.title || !val.term) {
      toast("Title or term missing", {
        hideProgressBar: false,
        autoClose: 7000,
        type: "error",
      });
      return;
    }
    try {
      await addUpdateTermChart({
        variables: {
          chartInfo: {
            title: val.title,
            type: val.graph,
            visible: val.visible,
            termId: val.term,
            variableIds: selectedVariablesArr?.map((current) => current?.id),
            xAxisId: val.xAxis,
            yAxisId: val.yAxis,
            groupById: val.group
          },
        },
      });
      props.refetch(true);
    } catch (error) {
      // Handle errors
      console.error("Mutation error:", error);
    }
  };

  const handleOnSave = () => {
    if (!val.title || !val.term) {
      toast("Title or term missing", {
        hideProgressBar: false,
        autoClose: 7000,
        type: "error",
      });
      return;
    }
    handleAddUpdateTermChart();
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const name = e.target.name;

    setVal((prevVal) => ({
      ...prevVal,
      [name]: value,
    }));
  };

  const [selectedVariablesArr, setselectedVariablesArr] = useState<any[]>([]);

  let updatedOptions: { cat: string; key: string }[] = [];

  if (termsVaribles?.getVariablesByKpiTerm) {
    const originalData = termsVaribles.getVariablesByKpiTerm;
    const groupedOptions: Record<
      string,
      { cat: string; key: string; id: string }[]
    > = {};

    // Iterate over the original data and group options by the "title" field
    originalData.forEach((item: VariablesArray) => {
      const { category, title, id } = item;

      if (title) {
        if (!groupedOptions[title]) {
          groupedOptions[title] = [];
        }

        groupedOptions[title].push({ cat: title, key: title, id });
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

  const OnRemoveChip = (selectedList: any[]) => {
    setselectedVariablesArr(selectedList);
  };

  const selectTerm = termsData?.getKpiTermsByCompanyId?.find((cur: any) => cur?.id === val.term)

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title={`Add a chart for ${selectTerm?.name}`}
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
              <label
                htmlFor="quarter"
                className="text-sm font-medium text-gray-700"
              >
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
                {!(selectTerm?.quarterWiseTable ?? false) && <option value="Bar">Bar Chart</option>}
                {!(selectTerm?.quarterWiseTable ?? false) && <option value="Linear"> Linear Chart</option>}
                {(selectTerm?.quarterWiseTable ?? true) && <option value="StackedBar"> StackedBar Chart</option>}
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="quarter"
                className="text-sm font-medium  text-gray-700"
              >
                Visibility
              </label>
              <label className="toggle-switch mt-2">
                <input
                  type="checkbox"
                  checked={val.visible}
                  name="visible"
                  onChange={handleOnChange}
                />
                <span className="switch" />
              </label>
            </div>

            {selectTerm?.quarterWiseTable && val.graph !== "Linear" && (

              <div className="flex flex-col">
                <label
                  htmlFor="quarter"
                  className="text-sm font-medium text-gray-700"
                >
                  X-axis
                </label>
                <select
                  id="quarter"
                  name="xAxis"
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none max-w-[250px]"
                  value={val.xAxis}
                  onChange={handleOnChange}
                >
                  <option value="">Select a option</option>
                  {(termsVaribles?.getVariablesByKpiTerm ?? []).map(
                    (cur: VariablesArray) => {
                      return (
                        <option key={cur.id} value={cur?.id}>
                          {cur?.title}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            )}
            {selectTerm?.quarterWiseTable && (<div className="flex flex-col">
              <label
                htmlFor="quarter"
                className="text-sm font-medium text-gray-700"
              >
                Y-axis
              </label>
              <select
                id="quarter"
                name="yAxis"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none max-w-[250px]"
                value={val.yAxis}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                {(termsVaribles?.getVariablesByKpiTerm ?? []).map(
                  (cur: VariablesArray) => {
                    return (
                      <option key={cur.id} value={cur?.id}>
                        {cur?.title}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
            )}
            {selectTerm?.quarterWiseTable && (<div className="flex flex-col">
              <label
                htmlFor="quarter"
                className="text-sm font-medium text-gray-700"
              >
                Group By
              </label>
              <select
                id="quarter"
                name="group"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none max-w-[250px]"
                value={val.group}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                {(termsVaribles?.getVariablesByKpiTerm ?? []).map(
                  (cur: VariablesArray) => {
                    return (
                      <option key={cur.id} value={cur?.id}>
                        {cur?.title}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            )}

          </div>
          {!selectTerm?.quarterWiseTable && (
            <div className="flex flex-col mt-5">
              <label
                htmlFor="variables_array"
                className="text-sm font-medium text-gray-700"
              >
                Variables Array
              </label>
              <Multiselect
                id="variables_array"
                displayValue="key"
                placeholder="Select options"
                onKeyPressFn={function noRefCheck() { }}
                onRemove={OnRemoveChip}
                onSearch={function noRefCheck() { }}
                onSelect={handleSelect}
                options={updatedOptions}
                selectedValues={selectedVariablesArr}
                showCheckbox
                className="mt-1 max-w-[350px]"
              />
            </div>
          )}
        </form>
        <ToastContainer />
      </>
    </Modal>
  );
}
