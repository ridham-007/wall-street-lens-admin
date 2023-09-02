import { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/vihicle/ParameterTable";
import QuarterTable from "@/components/table/vihicle/QuarterTable";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_CAPACITY_OPERATIONAL_SUMMARY, CREATE_CAPASITY_SUMMARY, GET_CAPACITY_SUMMARY_PARAMETERS, GET_VEHICLE_CAPACITY_SUMMARY } from "@/utils/query";
import Loader from "@/components/loader";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Tablist from "@/components/tablist/tablist";
import YearDropdown from "@/components/year_dropdown/year_dropdown";
import CollapsibleForm from "@/components/collapsibleform/collapsibleform";

const selectedCompany = [{
  id: 1,
  name: 'TESLA',
}]

export default function Capacity() {

  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addParameter] = useMutation(CREATE_CAPACITY_OPERATIONAL_SUMMARY);
  const [addProducts] = useMutation(CREATE_CAPASITY_SUMMARY);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [activeTab, setActiveTab] = useState('Descriptions');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  const [getParametersData, { data, error, loading, refetch }] = useLazyQuery(
    GET_CAPACITY_SUMMARY_PARAMETERS,
    {
      variables: {
        companyName: selectedCompany[0]?.name,
      },
    }
  );

  const [getQuarterDetails, { data: quarterData, refetch: refetchQuarters }] = useLazyQuery(
    GET_VEHICLE_CAPACITY_SUMMARY,
    {
      variables: {
        companyName: selectedCompany[0]?.name,
      },
    }
  );

  useEffect(() => {
    getParametersData();
    getQuarterDetails();
  }, [])

  const onAddUpdateParameter = async (data: any) => {
    setShowLoader(true);
    await addParameter({
      variables: {
        summaryInfo: {
          company: data.company,
          title: data.title,
          summary: data.summary,
          year: Number(data.year),
          quarter: Number(data.selectedQuarter),
        }
      },
    })
    setShowLoader(false);
    refetch();
    closePopups()
  };


  const onAddUpdateProduct = async (data: any) => {
    setShowLoader(true);
    await addProducts({
      variables: {
        capacityInfo: {
          company: data.company,
          region: data.region,
          product: data.modal,
          status: data.operationType,
          capacity: data.capacity,
          capacitySummaryId: data.summary,
        }
      },
    })
    setShowLoader(false);
    closePopups()
  };

  const closePopups = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };
  const onAddUpdateParameterClose = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: { target: any; }) => {
      if (isOpenAction?.length > 0 && ref.current && !ref.current.contains(e.target)) {
        setIsOpenAction('')
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [isOpenAction])
  return (
    <Layout title="Capasity" page={LayoutPages.vihicle_capacity}>
      <>
        {showLoader && (<Loader />)}

        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <div className="flex relative m-2 w-full">
              <input
                type="text"
                className=" w-full block py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
                placeholder="Search"
              // onChange={onSearch}
              // value={searchKey}
              // onKeyDown={onKeyPress}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex pr-4 gap-4">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setAddUpdateQuarter(true)}
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
            {/* <button
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
              <span>Add a Capacity Details</span>
            </button> */}

          </div>
        </div>
        <div className="flex mb-4">
          <TabButton
            label="Descriptions"
            activeTab={activeTab}
            onClick={() => handleTabClick('Descriptions')}
          />
          {/* <TabButton
            label="Details"
            activeTab={activeTab}
            onClick={() => handleTabClick('Details')}
          /> */}
        </div>
        <div>
          {activeTab === 'Descriptions' && <ParameterTable data={data}/>}
          {activeTab === 'Details' && <QuarterTable />}
        </div>
        {/* {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={onAddUpdateProduct}
            onClose={onAddUpdateParameterClose}
            data={data}
          ></AddUpdateParaMeter>
        )} */}
        {addUpdateQuarter && (
          <AddUpdateParaQuarter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
          ></AddUpdateParaQuarter>
        )}
        <ToastContainer/>
      </>
    </Layout >
  );
}


interface AddUpdateParameterProps {
  onSuccess?: any;
  onClose?: any;
  data?: any;
}

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    company: selectedCompany[0]?.name,
    region: "",
    modal: "",
    capacity: "",
    operationType: "",
    summary: ""
  })
  const handleOnSave = () => {
    if (!val.region || !val.modal || !val.capacity || !val.operationType || !val.summary) {
      toast('Please fill the required data.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose()
  };


  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {

    const value = e.target.value;
    const name = e.target.name;

    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };
  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Add Descriptions"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="summary" className="text-sm font-medium text-gray-700">
              Quarter summary
            </label>
            <select
              id="summary"
              name="summary"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.summary}
              onChange={handleOnChange}
            >
              <option value="" key={Math.random().toString()}>Select an option</option>
              {props?.data?.getCapacityQuarterSummaryByCompany?.map((item: { id: string; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
                return <option value={item?.id} key={item?.id}>{item?.title}</option>
              })}
            </select>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="region"
              className="text-sm font-medium text-gray-700"
            >
              Region
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={val.region}
              onChange={handleOnChange}
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 min-w-[322px] focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="modal"
              className="text-sm font-medium text-gray-700"
            >
              Modal
            </label>
            <input
              type="text"
              id="modal"
              name="modal"
              value={val.modal}
              onChange={handleOnChange}
              className="mt-1 p-2 border rounded-md min-w-[322px] focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="capacity" className="text-sm font-medium text-gray-700">
              Capacity
            </label>
            <input
              type="text"
              id="capacity"
              value={val.capacity}
              onChange={handleOnChange}
              name="capacity"
              className="mt-1 p-2 border rounded-md min-w-[322px] focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="operationType" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="operationType"
              name="operationType"
              className="mt-1 p-2 border rounded-md min-w-[322px] focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.operationType}
              onChange={handleOnChange}
            >
              <option value="" disabled>Select an option</option>
              <option value="Production">Production</option>
              <option value="ProductionTooling">Production
                Tooling</option>
              <option value="PilotProduction">Pilot production</option>
              <option value="InDevelopment">In development</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}


const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const currentYear = new Date().getFullYear();
  const minYear = 1880;
  const [val, setVal] = useState({
    title: "",
    company: selectedCompany[0]?.name,
    summary: "",
    selectedQuarter: 1,
    year: currentYear
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };

  const handleOnSave = () => {
    return;
    if (!val.title || !val.summary) {
      toast('Title or Summary is missing', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose()
  };

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Vehical Capacity Descriptions"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
              Company
            </label>
            <select
              id="quarter"
              name="company"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            // value={selectedQuarter}
            // onChange={handleQuarterChange}
            >
              <option value="">Select a option</option>
              <option value="TESLA">TESLA</option>
              <option value="TATA">TATA</option>
              {/* <option value={3}>Q3</option> */}
              {/* <option value={4}>Q4</option> */}
            </select>
          </div>
          {/* <div className="flex flex-col">
            <label htmlFor="year" className="text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.year}
              min={minYear}
              max={currentYear}
              onChange={handleInputChange}
            />
          </div> */}
          <YearDropdown onChange={() => { } } year={""}/>
          {/* <div className="flex flex-col">
            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
              Quarter
            </label>
            <select
              id="quarter"
              name="selectedQuarter"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.selectedQuarter}
              onChange={handleInputChange}
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div> */}
          {/* <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="company" className="text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.company}
              onChange={handleInputChange}
              disabled
            />
          </div> */}
        </div>
        <div className="w-full max-w-[700px] mt-4">
          <Tablist 
            content={<>
            <div className="w-full flex flex-wrap gap-5 mt-5">
              <div className="w-full flex flex-col">
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full mt-1 p-2 border min-w-[322px] rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={val.title}
                  onChange={handleInputChange}
                />
              </div>

            </div>
              <div className="mt-5">
                <label htmlFor="summary" className="text-sm font-medium text-gray-700">
                  Summary
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                  value={val.summary}
                  onChange={handleInputChange}
                />
              </div>
              <CollapsibleForm />
              </>
          }
          />
        </div>
      </form>
    </Modal >
  );
}