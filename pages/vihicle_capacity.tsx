import { JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal, SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/vihicle/ParameterTable";
import QuarterTable from "@/components/table/vihicle/QuarterTable";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_CAPACITY_OPERATIONAL_SUMMARY, GET_VEHICLE_CAPACITY_SUMMARY } from "@/utils/query";
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
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [activeTab, setActiveTab] = useState('Descriptions');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  const [getParametersData, { data, error, loading, refetch }] = useLazyQuery(
    GET_VEHICLE_CAPACITY_SUMMARY,
    {
      fetchPolicy: 'network-only',
      variables: {
        companyName: selectedCompany[0]?.name,
      },
    }
  );

  useEffect(() => {
    getParametersData();
  }, [])

  const onAddUpdateParameter = async (data: any) => {
    setShowLoader(true);
    await addParameter({
      variables: {
        summaryInfo: {
          company: data.company,
          year: Number(data.year),
          quarters: data.quarters?.map((current: { title: any; summary: any; quarter: any; rows: { region: any; modal: any; status: any; capacity: any; }[]; }) => {
            return {
              title: current?.title,
              description: current?.summary,
              quarter: current?.quarter,
              capacities: current?.rows?.map((cur: { region: any; modal: any; status: any; capacity: any; }) => {
                return {
                  region: cur?.region,
                  product: cur?.modal,
                  status: cur?.status,
                  capacity: cur?.capacity
                }
              })
            }
          }),
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
          {activeTab === 'Descriptions' && <ParameterTable data={data} />}
          {activeTab === 'Details' && <QuarterTable />}
        </div>
        {addUpdateQuarter && (
          <AddUpdateParaQuarter
            onSuccess={onAddUpdateParameter}
            onClose={onAddUpdateParameterClose}
          ></AddUpdateParaQuarter>
        )}
        <ToastContainer />
      </>
    </Layout >
  );
}


interface AddUpdateParameterProps {
  onSuccess?: any;
  onClose?: any;
  data?: any;
}

const dummyQuarters = [
  {
    quarter: 1,
    title: '',
    summary: '',
    rows: [
      {
        index: 1,
        region: '',
        modal: '',
        capacity: '',
        status: '',
      }
    ]
  },
  {
    quarter: 2,
    title: '',
    summary: '',
    rows: [
      {
        index: 1,
        region: '',
        modal: '',
        capacity: '',
        status: '',
      }
    ]
  },
  {
    quarter: 3,
    title: '',
    summary: '',
    rows: [
      {
        index: 1,
        region: '',
        modal: '',
        capacity: '',
        status: '',
      }
    ]
  },
  {
    quarter: 4,
    title: '',
    summary: '',
    rows: [
      {
        index: 1,
        region: '',
        modal: '',
        capacity: '',
        status: '',
      }
    ]
  }
]


const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const currentYear = new Date().getFullYear();
  const [val, setVal] = useState({
    company: selectedCompany[0]?.name,
    year: Number(currentYear),
    quarters: dummyQuarters,
  })
  const [selectedTab, setSelectedTab] = useState(1);

  const handleOnChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    const updatedQuarters = val.quarters?.map(current => {
      if (current?.quarter === selectedTab) {
        return {
          ...current,
          [name]: value
        }
      }
      return current;
    })
    setVal((prevVal) => ({
      ...prevVal,
      ['quarters']: updatedQuarters
    }));
  };

  const onTabChange = (tab: SetStateAction<number>) => {
    setSelectedTab(tab);
  }

  const handleOnSave = () => {
    if (!val.company || !val.year) {
      toast('Company or Year is missing', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose()
  };

  const updateQuarters = (updatedQuartes: any) => {
    setVal((prevVal) => ({
      ...prevVal,
      ['quarters']: updatedQuartes
    }));
  }

  const selectedQuarter = val?.quarters?.find(cur => cur?.quarter === selectedTab);

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
              value={val.company}
              onChange={handleOnChange}
            >
              <option value="">Select a option</option>
              <option value="TESLA">TESLA</option>
              <option value="APPLE">APPLE</option>
            </select>
          </div>
          <YearDropdown onChange={handleOnChange} year={val.year?.toString()} />
        </div>
        <div className="w-full max-w-[700px] mt-4">
          <Tablist
            onTabChange={onTabChange}
            selectedTab={selectedTab}
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
                    value={selectedQuarter?.title}
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
                  value={selectedQuarter?.summary}
                  onChange={handleInputChange}
                />
              </div>
              <CollapsibleForm updateQuarters={updateQuarters} quarters={val.quarters} selectedTab={selectedTab} />
            </>
            }
          />
        </div>
      </form>
    </Modal >
  );
}