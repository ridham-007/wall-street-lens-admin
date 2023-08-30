import { useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/vihicle/ParameterTable";
import dynamic from 'next/dynamic';
const DynamicEditor = dynamic(() => import('../components/ckeditor/ckeditor'), { ssr: false });

export default function Outlook() {

  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [title, setTitle] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Parameter');
  const [isOpenAction, setIsOpenAction] = useState('');

  const onAddUpdateParameter = () => {
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
    <Layout title="Outlook" page={LayoutPages.outlook}>
      <>
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
          {activeTab === 'Parameter' && <ParameterTable />}
        </div>
        {addUpdateQuarter && (
          <AddUpdateParaQuarter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
            title={title}
            setTitle={setTitle}
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
  setTitle?: React.Dispatch<React.SetStateAction<string[]>>;
  title?: string[]
}

const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const [val, setVal] = useState({
    title: "",
    company: "",
    summary: ""
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
    props.setTitle && props.setTitle(prevVal => [...prevVal, val.title])
  };
  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Add a outlook summary"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
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
              // value={year}
              // min={minYear}
              // max={currentYear}
              // onChange={handleYearChange}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
              Quarter
            </label>
            <select
              id="quarter"
              name="selectedQuarter"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              // value={val.selectedQuarter}
              // onChange={}
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
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
        </div>
        <div className="mt-4">
          <label htmlFor="summary" className="text-sm font-medium text-gray-700">
            Summary
          </label>
          <DynamicEditor
            editorLoaded={true}
            onChange={() => { }}
            name="ckeditor"
            value={''}
          />
        </div>
      </form>
    </Modal >
  );
}
