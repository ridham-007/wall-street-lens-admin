import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import dynamic from 'next/dynamic';
import { CREATE_OUTLOOK_SUMMARY, GET_OUT_LOOK_SUMMARY } from "@/utils/query";
import { useLazyQuery, useMutation } from "@apollo/client";
import SummaryDetails from "@/components/table/outlook/SummaryDetails";
import Loader from "@/components/loader";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Tablist from "@/components/tablist/tablist";
import YearDropdown from "@/components/year_dropdown/year_dropdown";
import GrawthRate from '../components/collapsibleform/growthrate';

const selectedCompany = [{
  id: 1,
  name: 'TESLA',
}]

export default function Outlook() {
  const [addParameter, { data: parameterData }] = useMutation(CREATE_OUTLOOK_SUMMARY);
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [title, setTitle] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Parameter');
  const [showLoader, setShowLoader] = useState(false);
  const [isOpenAction, setIsOpenAction] = useState('');

  const [getParametersData, { data, error, loading, refetch }] = useLazyQuery(
    GET_OUT_LOOK_SUMMARY,
    {
      fetchPolicy: 'network-only',
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
        outLookInfo: {
          company: data.company,
          year: Number(data.year),
          quarters: data.quarters?.map((current: { quarter: any; volume: any; cash: any; profit: any; product: any; growthRate: any; production: any; }) => {
            return {
              quarter: current?.quarter,
              outLook: {
                volume: current?.volume,
                cash: current?.cash,
                profit: current?.profit,
                product: current?.product,
                growthRate: current?.growthRate,
                production: current?.production,
              }
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
        <ToastContainer />
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

const dummyQuarters = [
  {
    quarter: 1,
    volume: '',
    cash: '',
    profit: '',
    product: '',
    growthRate: ['', ''],
    production: ['', ''],
  },
  {
    quarter: 2,
    volume: '',
    cash: '',
    profit: '',
    product: '',
    growthRate: ['', ''],
    production: ['', ''],
  },
  {
    quarter: 3,
    volume: '',
    cash: '',
    profit: '',
    product: '',
    growthRate: ['', ''],
    production: ['', ''],
  },
  {
    quarter: 4,
    volume: '',
    cash: '',
    profit: '',
    product: '',
    growthRate: ['', ''],
    production: ['', ''],
  }
]

const AddUpdateParaQuarter = (props: AddUpdateParameterProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedTab, setSelectedTab] = useState(1);

  const [val, setVal] = useState({
    company: selectedCompany[0]?.name,
    year: currentYear,
    quarters: dummyQuarters,
  });

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
    if (!val) {
      toast('Summary is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props?.onSuccess && props?.onSuccess(val)
    props.onClose && props.onClose();
  };

  const handleOnChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  }

  const handleGrowthaOrProductionChange = (
    field: 'growthRate' | 'production',
    index: number,
    value: string
  ) => {
    const updatedQuarters = val.quarters?.map(current => {
      if (current?.quarter === selectedTab) {
        let newVal = [];
        if (field === 'growthRate') {
          newVal = current?.growthRate?.map((cur, ind) => ind === index ? value : cur);
        } else {
          newVal = current?.production?.map((cur, ind) => ind === index ? value : cur);
        }
        return {
          ...current,
          [field]: newVal
        }
      }
      return current;
    })
    setVal((prevVal) => ({
      ...prevVal,
      ['quarters']: updatedQuarters,
    }));
  };

  const selectedQuarter = val?.quarters?.find(cur => cur?.quarter === selectedTab);
  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Outlook Summary"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
          <YearDropdown onChange={handleOnChange} year={val.year.toString()} />

        </div>

        <Tablist
          onTabChange={onTabChange}
          selectedTab={selectedTab}
          content={<div className="mt-4">
            <div className="w-full flex flex-wrap gap-5 mt-5">
              <div className="w-full flex flex-col">
                <label htmlFor="volume" className="text-sm font-medium text-gray-700">
                  Volume
                </label>
                <textarea

                  id="volume"
                  name="volume"
                  className="w-full mt-1 p-2 h-[50px] border min-w-[322px] rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedQuarter?.volume}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            <div className="w-full flex flex-wrap gap-5 mt-5">
              <div className="w-full flex flex-col">
                <label htmlFor="cash" className="text-sm font-medium text-gray-700">
                  Cash
                </label>
                <textarea
                  id="cash"
                  name="cash"
                  className="w-full h-[50px] mt-1 p-2 border min-w-[322px] rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedQuarter?.cash}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            <div className="w-full flex flex-wrap gap-5 mt-5">
              <div className="w-full flex flex-col">
                <label htmlFor="profit" className="text-sm font-medium text-gray-700">
                  Profit
                </label>
                <textarea
                  id="profit"
                  name="profit"
                  className="w-full h-[50px] mt-1 p-2 border min-w-[322px] rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedQuarter?.profit}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            <div className="w-full flex flex-wrap gap-5 mt-5">
              <div className="w-full flex flex-col">
                <label htmlFor="product" className="text-sm font-medium text-gray-700">
                  Product
                </label>
                <textarea
                  id="product"
                  name="product"
                  className="w-full h-[50px] mt-1 p-2 border min-w-[322px] rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={selectedQuarter?.product}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            {/* <GrawthRate quarters={val.quarters} updateQuarters={updateQuarters} selectedTab={selectedTab}/> */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-5">Growth Rate </label>
                <div className="flex gap-5">
                  {selectedQuarter?.growthRate.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      value={value}
                      placeholder={`Value ${index + 1}`}
                      onChange={(e) => handleGrowthaOrProductionChange('growthRate', index, e.target.value)}
                      className="border rounded p-2 mt-2"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Production </label>
                <div className="flex gap-5">

                  {selectedQuarter?.production.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      value={value}
                      placeholder={`Value ${index + 1}`}
                      onChange={(e) => handleGrowthaOrProductionChange('production', index, e.target.value)}
                      className="border rounded p-2 mt-2"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          } />
      </form>
    </Modal >
  );
}
