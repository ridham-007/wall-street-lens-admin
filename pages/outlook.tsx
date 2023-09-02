import { useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import dynamic from 'next/dynamic';
import { CREATE_OUTLOOKL_SUMMARY, GET_OUT_LOOK_SUMMARY } from "@/utils/query";
import { useLazyQuery, useMutation } from "@apollo/client";
import SummaryDetails from "@/components/table/outlook/SummaryDetails";
import Loader from "@/components/loader";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Tablist from "@/components/tablist/tablist";
import YearDropdown from "@/components/year_dropdown/year_dropdown";

const DynamicEditor = dynamic(() => import('../components/ckeditor/ckeditor'), { ssr: false });

const selectedCompany = [{
  id: 1,
  name: 'TESLA',
}]

export default function Outlook() {
  const [addParameter, { data: parameterData }] = useMutation(CREATE_OUTLOOKL_SUMMARY);
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [title, setTitle] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Parameter');
  const [showLoader, setShowLoader] = useState(false);
  const [isOpenAction, setIsOpenAction] = useState('');

  const [getParametersData, { data, error, loading, refetch }] = useLazyQuery(
    GET_OUT_LOOK_SUMMARY,
    {
      variables: {
        companyName: selectedCompany[0]?.name,
      },
    }
  );

  useEffect(() => {
    getParametersData();
  }, []);

  const onAddUpdateParameter = async (data: any) => {
    setShowLoader(true);
    await addParameter({
      variables: {
        summaryInfo: {
          company: data.company,
          summary: data.summary,
          quarter: Number(data.selectedQuarter),
          year: Number(data.year),
        }
      },
    })
    setShowLoader(false);
    refetch();
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
    <Layout title="Outlook" page={LayoutPages.outlook}>
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
              <span>Add a Outlook Summary</span>
            </button>
          </div>
        </div>
        <div>
          {<SummaryDetails data={data} />}
        </div>
        {addUpdateQuarter && (
          <AddUpdateParaQuarter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
            title={title}
            setTitle={setTitle}
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
  setTitle?: React.Dispatch<React.SetStateAction<string[]>>;
  title?: string[]
}

const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const currentYear = new Date().getFullYear();
  const minYear = 1880;
  const [val, setVal] = useState({
    company: selectedCompany[0]?.name,
    summary: "",
    year: currentYear,
    selectedQuarter: 1,
  });

  const handleCkeditorChange = (value: any) => {
    setVal((prevVal) => ({
      ...prevVal,
      ['summary']: value
    }));
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      setVal((prevVal) => ({
        ...prevVal,
        ['year']: Math.max(minYear, Math.min(currentYear, newValue))
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };
  const handleOnSave = () => {
    return;
    if (!val.summary) {
      toast('Summary is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props?.onSuccess && props?.onSuccess(val)
    props.onClose && props.onClose();
  };
  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Outlook Summary"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              onChange={handleYearChange}
            />
          </div> */}
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
          <YearDropdown />

        </div>

        <Tablist content={<div className="mt-4">
          <div className="mb-2">
          <label htmlFor="summary" className="text-sm font-medium text-gray-700">
            Summary
          </label>
          </div>
          <DynamicEditor
            editorLoaded={true}
            onChange={() => {}}
            name="ckeditor"
            value={val.summary}
          />
        </div>}/>
      </form>
    </Modal >
  );
}
