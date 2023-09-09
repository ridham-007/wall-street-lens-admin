import { ChangeEvent, JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal, SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { ADD_FINANCIAL_SUMMARY_PARAMETER, ADD_QUARTERS_DETAILS, FINANCIAL_REPORT_BY_COMPANY_NAME, GET_FINANCIAL_SUMMARY_PARAMETERS } from "@/utils/query";
import Loader from "@/components/loader";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/financial/ParameterTable";
import YearDropdown from "@/components/year_dropdown/year_dropdown";

const selectedCompany = [{
  id: 1,
  name: 'TESLA',
}]

export default function FinancialPage() {
  const [showLoader, setShowLoader] = useState(false);
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [perametersData, setPerametersData] = useState<any[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [isOpenAction, setIsOpenAction] = useState("");
  const [activeTab, setActiveTab] = useState('Descriptions');

  const [addParameter] = useMutation(ADD_FINANCIAL_SUMMARY_PARAMETER);
  const [addQuarters] = useMutation(ADD_QUARTERS_DETAILS);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const [getQuarterDetails, { data: quarterData, refetch: refetchQuarter }] = useLazyQuery(
    FINANCIAL_REPORT_BY_COMPANY_NAME,
    {
      variables: {
        companyName: selectedCompany[0]?.name,
      },
    }
  );

  useEffect(() => {
    getQuarterDetails();
  }, [])

  const closePopups = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false);
  }

  const onAddUpdateParameter = async (data: any) => {
    setShowLoader(true);
    await addParameter({
      variables: {
        financialQuarter:{
          financialSummary: {
            company: data.company,
            title: data.title,
            graphType: data.graph,
            yoy: Number(data.YoY),
            priority: Number(data.priority)
          },
          quarters: data.quarterData.map((current: any) => {
            return {
              ...current,
              value: Number(current?.value), 
              year: Number(data.year)
            }})
      }
      },
    })
    setShowLoader(false);
    refetchQuarter();
    closePopups();
  };

  const onAddUpdateQuarter = async(perameters: any) => {
    setShowLoader(true);
    const {
      year,
      selectedQuarter,
      val,
    } = perameters;

    const mutationData: { quarter: any; year: any; value: any; financialSummaryId: any; }[] = [];
    val.forEach((current: { value: any; id: any; }) => {
      mutationData.push({
        quarter: selectedQuarter,
        year,
        value: current?.value,
        financialSummaryId: current?.id, 
      })
    })

    await addQuarters({
      variables:{
        addQuarters: {
          quarters: mutationData
        },
      }
    })
    setShowLoader(false);
    closePopups();
    refetchQuarter();
  }

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


  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value);
    }
  };

  return (
    <Layout title="Financial Summary" page={LayoutPages.financial_summary}>
      <>
        {showLoader && (<Loader />)}
        <div className="w-[calc((w-screen)-(w-1/5)) overflow-hidden flex justify-between pb-4 pt-2">
          <div className="relative w-1/2">
            <div className="relative  m-2">
              <input
                type="text"
                className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
                placeholder="Search"
                onKeyDown={onKeyPress}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex pr-4 gap-4">
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
        </div>
        <div className="flex mb-4">
          <TabButton
            label="Descriptions"
            activeTab={activeTab}
            onClick={() => handleTabClick('Descriptions')}
          />
        </div>
        <div>
          {activeTab === 'Descriptions' && <ParameterTable data={quarterData} />}
        </div>

        {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={onAddUpdateParameter}
            onClose={closePopups}
            selectedCompany={selectedCompany}
          ></AddUpdateParaMeter>
        )}
        {addUpdateQuarter && (
          <AddUpdateQuarter
            onSuccess={onAddUpdateQuarter}
            onClose={closePopups}
            financialInitData={perametersData}
          ></AddUpdateQuarter>
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
}

const dummyQuarters = [
  {
    quarter: 1,
    value: "",
  },
  {
    quarter: 2,
    value: "",
},
  {
    quarter: 3,
    value: "",
},
  {
    quarter: 4,
    value: "",
}
];

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    company: props?.selectedCompany[0].name,
    title: "",
    graph: "",
    quarterData: dummyQuarters,
    priority: 0,
    YoY: "",
    year: "",
  })
  const handleOnSave = () => {
    if (!val.title){
      toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
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

  const handleQuarterUpdate = (event: ChangeEvent<HTMLInputElement>, id: number) => {
    const updatedQuarter = val.quarterData?.map(current => {
      if (current?.quarter === id){
        return {
          ...current,
          value: event?.target?.value
        }
      }
      return current;
    })
    setVal((prevVal) => ({
      ...prevVal,
      ['quarterData']: updatedQuarter
    }));
  }

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Financial Summary Descriptions"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <form className="form w-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                Company
              </label>
              <select
                id="quarter"
                name="company"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={val.company}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                <option value="TESLA">TESLA</option>
                <option value="APPLE">APPLE</option>
              </select>
            </div>
            
            <YearDropdown onChange={handleOnChange} year={val.year}/>

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
                htmlFor="YoY"
                className="text-sm font-medium text-gray-700"
              >
                YoY
              </label>
              <input
                type="number"
                id="YoY"
                name="YoY"
                value={val.YoY}
                onChange={handleOnChange}
                required
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="priority"
                className="text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <input
                type="number"
                id="priority"
                name="priority"
                value={val.priority}
                onChange={handleOnChange}
                required
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

            <div className="w-full">
              <h1 className="text-xl font-semibold mb-2 mt-4">Quarter Values</h1>
              <div className="flex gap-5 flex-wrap ">
              {
                val.quarterData?.map(current => {
                  return <div key={current?.quarter} className="flex flex-col">
                    <label
                      htmlFor={`quarter${current?.quarter}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Quarter {current?.quarter}
                    </label>
                    <input
                      type="number"
                      id={`quarter${current?.quarter}`}
                      name={`quarter${current?.quarter}`}
                      value={current.value}
                      onChange={(event) => handleQuarterUpdate(event, current?.quarter)}
                      required
                      className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                })
              }
              </div> 
            </div>
        </form>
        <ToastContainer />  
      </>
    </Modal>
  );
}


const AddUpdateQuarter = (props: AddUpdateParameterProps) => {
  const [val, setVal] = useState(props.financialInitData)
  const currentYear = new Date().getFullYear();
  const minYear = 1880;
  const [year, setYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  const handleQuarterChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedQuarter(Number(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      setYear(Math.max(minYear, Math.min(currentYear, newValue)));
    }
  };
  const handleOnSave = () => {
    const errorPresent = val?.find((current: { value: any; }) => !current?.value);
    if (errorPresent){
      toast('Please fill the required fields.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props.onSuccess && props.onSuccess({ val, year, selectedQuarter })
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, id: any) => {
    setVal((prevVal: any[]) => (
      prevVal.map((val: { id: any; }) => val.id === id ? { ...val, value: Number(e.target.value) } : { ...val })
    ))
  };

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Add Quarter Details"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <div>
          <h1 className="text-xl font-semibold mb-2">Basic details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="year" className="text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={year}
                min={minYear}
                max={currentYear}
                onChange={handleYearChange}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
                Quarter
              </label>
              <select
                id="quarter"
                name="quarter"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedQuarter}
                onChange={handleQuarterChange}
              >
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2 mt-4">Parameter</h1>
        <form className="form w-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {val?.map((item: { id: Key | null | undefined; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; value: string | number | readonly string[] | undefined; }) => (
              <div key={item.id} className="flex flex-col">
                <label
                  htmlFor={`value-${item.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {item.title}
                </label>
                <input
                  type="number"
                  id={`value-${item.id}`}
                  name={`value-${item.id}`}
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={item.value}
                  onChange={(e) => { item.id && handleOnChange(e, item.id)}}
                />
              </div>
            ))}
          </div>

        </form>
      </>
    </Modal >
  );
}