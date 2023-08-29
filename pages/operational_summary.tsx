import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";

import { oprationalInitData } from "@/utils/data";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/operational/ParameterTable";
import QuarterTable from "@/components/table/operational/QuarterTable";


export default function OperationPage() {
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');

  const [activeTab, setActiveTab] = useState('Parameter');
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: { target: any; }) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (isOpenAction?.length > 0 && ref.current && !ref.current.contains(e.target)) {
        setIsOpenAction('')
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [isOpenAction])




  const onAddUpdateParameter = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };
  const onAddUpdateParameterClose = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value)
    }
  }



  return (
    <Layout title="Operational Summary" page={LayoutPages.operational_summary}>
      <>
        <div className="w-[calc((w-screen)-(w-1/5)) overflow-hidden flex justify-between pb-4 pt-2">
          <div className="relative w-1/2">
            <div className="flex relative m-2">
              <input
                type="text"
                className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
                placeholder="Search"
                onKeyDown={onKeyPress}
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
              <span>Add a Parameter</span>
            </button>

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
              <span>Add a Quarter Details</span>
            </button>
          </div>

        </div>
        <div className="flex mb-4">
          <TabButton
            label="Parameter"
            activeTab={activeTab}
            onClick={() => handleTabClick('Parameter')}
          />
          <TabButton
            label="Quarter"
            activeTab={activeTab}
            onClick={() => handleTabClick('Quarter')}
          />
        </div>
        <div>
          {activeTab === 'Parameter' && <ParameterTable />}
          {activeTab === 'Quarter' && <QuarterTable />}
        </div>
        {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
          ></AddUpdateParaMeter>
        )}
        {addUpdateQuarter && (
          <AddUpdateParaQuarter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
          ></AddUpdateParaQuarter>
        )}
      </>
    </Layout >
  );
}

interface AddUpdateParameterOnSuccess {
  (id: string): void;
}

interface AddUpdateParameterOnClose {
  (): void;
}

interface AddUpdateParameterProps {
  onSuccess?: AddUpdateParameterOnSuccess;
  onClose?: AddUpdateParameterOnClose;
}

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    company: "",
    title: "",
    unit: 0,
    subIndustry: "",
    industry: "",
  })
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };

  const handleOnSave = () => {
    props.onClose && props.onClose()
  };


  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Add Parameter"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            />
          </div>
          <div className="flex flex-col">
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
            <label htmlFor="unit" className="text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.unit}
              onChange={handleInputChange}
            >
              <option value="number">Number</option>
              <option value="%">%</option>
              <option value="KWH">KWH</option>
              <option value="m">million</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="subIndustry" className="text-sm font-medium text-gray-700">
              Sub-Industry
            </label>
            <input
              type="text"
              id="subIndustry"
              name="subIndustry"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.subIndustry}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="industry" className="text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.industry}
              onChange={handleInputChange}
            />
          </div>

        </div>
      </form>

    </Modal >
  );
}


const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const [val, setVal] = useState(oprationalInitData)

  const currentYear = new Date().getFullYear();
  const minYear = 1880;
  const [year, setYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  const handleQuarterChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedQuarter(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      setYear(Math.max(minYear, Math.min(currentYear, newValue)));
    }
  };
  const handleOnSave = () => {

  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    setVal(prevVal => (
      prevVal.map(val => val.id === id ? { ...val, value: e.target.value } : { ...val })
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
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2 mt-4">Parameter</h1>
        <form className="form w-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {val?.map(item => (
              <div key={item.id} className="flex flex-col">
                <label
                  htmlFor={`value-${item.id}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {item.title}
                </label>
                <input
                  type="text"
                  id={`value-${item.id}`}
                  name={`value-${item.id}`}
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 min-w-[280px] focus:border-blue-500 outline-none"
                  value={item.value}
                  onChange={(e) => handleOnChange(e, item.id)}
                />
              </div>
            ))}
          </div>

        </form>
      </>
    </Modal >
  );
}