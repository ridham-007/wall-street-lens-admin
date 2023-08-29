import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";
import _, { constant } from 'lodash';
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { LoginService } from "@/utils/login";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import { Modal } from "@/components/model";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/financial/ParameterTable";
import QuarterTable from "@/components/table/financial/QuarterTable";

export default function PlayersPage() {

  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [title, setTitle] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Parameter');

  const [isOpen, setIsOpen] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userID, setUserData] = useState('');

  const [teamId, setTeamId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [addUpdatePlayer, setAddUpdatePlayer] = useState(false);
  const [addPlayers, setAddPlayers] = useState(false);
  const [updatePlayer, setUpdatePlayer] = useState(null);
  const [updatedPlayers, setUpdatedPlayers] = useState<any[]>([]);

  const router = useRouter();
  const [refetchAfterRankUpdate, setRefetchAfterRankUpdate] = useState(false);
  const [addInAnotherLeague, setAddInAnotherLeague] = useState(false);
  const [showLoader, setShowLoader] = useState(false);



  const getDatafromLocalStorage = async () => {
    const localStorageData = await LoginService.getUser();
    setUserRole(localStorageData?.role);
    setUserData(localStorageData?._id);
  }


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

  useEffect(() => {
    getDatafromLocalStorage();
  }, []);



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
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [isOpenAction])
  return (
    <Layout title="Players" page={LayoutPages.vihicle_capacity}>
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
          <div className="flex flex-row-reverse pr-4 gap-4">
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
              <span>Add a Quarter Summary</span>
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
            title={title}
            setTitle={setTitle}
          ></AddUpdateParaMeter>
        )}
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

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    company: "",
    region: "",
    modal: "",
    capacity: "",
    operationType: "",
    selectedQuarter: 'Q1',
    title: ""
  })
  const handleOnSave = () => {
    props.onClose && props.onClose()
    console.log(val);

  };
  console.log(props.title)


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
      title="Add Parameter"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="company" className="text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={val.company}
              onChange={handleOnChange}
              name="company"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 min-w-[280px] focus:border-blue-500 outline-none"
            />
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
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 min-w-[280px] focus:border-blue-500 outline-none"
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
              className="mt-1 p-2 border rounded-md min-w-[280px] focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="mt-1 p-2 border rounded-md min-w-[280px] focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="operationType" className="text-sm font-medium text-gray-700">
              Operation Type
            </label>
            <select
              id="operationType"
              name="operationType"
              className="mt-1 p-2 border rounded-md min-w-[280px] focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.operationType}
              onChange={handleOnChange}
            >
              <option value="" disabled>Select an option</option>
              <option value="production">Production</option>
              <option value="productionTooling">Production
                Tooling</option>
              <option value="pilotProduction">Pilot production</option>
              <option value="inDevelopment">In development</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="quarter" className="text-sm font-medium text-gray-700">
              Quarter
            </label>
            <select
              id="quarter"
              name="selectedQuarter"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.selectedQuarter}
              onChange={handleOnChange}
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <select
              id="title"
              name="title"
              className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={val.title}
              onChange={handleOnChange}
            >
              {props.title?.map((item: string, index: number) => {
                return <option value={item} key={index}>{item}</option>
              })}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
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
      title="Add Quarter Summary"
      onClose={() => props.onClose && props.onClose()}
    >
      <form className="form w-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <textarea
            id="summary"
            name="summary"
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
            value={val.summary}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </Modal >
  );
}