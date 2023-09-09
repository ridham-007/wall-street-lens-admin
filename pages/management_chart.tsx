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
            
            title: data.title,
            
          },
          
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
    <Layout title="Management Chart" page={LayoutPages.management_chart}>
      <>
          <div className="flex justify-end pr-4 gap-4">
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
       
        

        {addUpdateParameter && (
          <AddUpdateParaMeter
            onSuccess={onAddUpdateParameter}
            onClose={closePopups}
            selectedCompany={selectedCompany}
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
}



function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    
    title: "",
   
  
  
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
            
            
          </div>

            
        </form>
        <ToastContainer />  
      </>
    </Modal>
  );
}


