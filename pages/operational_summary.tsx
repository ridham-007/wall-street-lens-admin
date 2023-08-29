import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import { v4 as uuidv4 } from 'uuid';
import { ITeam } from "@/types/team";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useRouter } from "next/router";
import { LoginService } from "@/utils/login";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import { financialInitData, oprationalInitData } from "@/utils/data";
import { TabButton } from "@/components/TabButton";
import ParameterTable from "@/components/table/operational/ParameterTable";
import QuarterTable from "@/components/table/operational/QuarterTable";


const TEAMS = gql`
  query GetTeams(
    $userId: String
  ) {
    getTeams(
      userId: $userId
    ) {
      code
      success
      data {
        _id
        name
        active
        coach {
          _id
          firstName
          lastName
          login {
            email
          }
        }
        league {
          _id
          name
        }
      }
      teamWithLeagues{
        teamId
        leagueIds
      }
    }
  }
`;

const LEAGUES = gql`
  query GetLeagues(
    $userId: String
  ) {
    getLeagues(
      userId: $userId
    ) {
      code
      success
      message
      data {
        _id
        name
        startDate
        endDate
        active
        playerLimit
      }
    }
  }
`;


export default function TeamsPage() {
  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)
  const [isOpen, setIsOpen] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [allTeamData, setAllTeamData] = useState<any[]>([]);
  const [updateTeam, setUpdateTeam] = useState<any>(null);
  // const { data, error, loading, refetch } = useQuery(TEAMS);
  const [activeTab, setActiveTab] = useState('Parameter');
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };
  const router = useRouter();
  const [userID, setUserID] = useState('');
  const [userRole, setUserRole] = useState('');

  const [getTeamsData, { data, error, loading, refetch }] = useLazyQuery(TEAMS,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    }
  );

  const [getLeaguesData, { data: leaguesData }] = useLazyQuery(LEAGUES,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    }
  );

  const getDatafromLocalStorage = async () => {
    const localStorageData = await LoginService.getUser();
    setUserRole(localStorageData?.role);
    setUserID(localStorageData?._id);
  }

  useEffect(() => {
    getDatafromLocalStorage();
  }, []);

  useEffect(() => {
    getTeamsData();
    getLeaguesData();
  }, [userID]);

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


  useEffect(() => {
    setAllTeamData(data?.getTeams?.data ?? []);
  }, [data]);

  useEffect(() => {
    setFilteredTeams(filteredData(searchKey))
  }, [allTeamData]);


  const onAddUpdateParameter = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };
  const onAddUpdateParameterClose = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };
  const filteredData = (key: string) => {
    const filteredTeam = allTeamData.filter((team: any) => {
      const teamName = `${team.name}`.toLocaleLowerCase();
      return teamName.includes(key.toLocaleLowerCase());
    });
    return filteredTeam;
  }

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value)
      setFilteredTeams(filteredData(event.target.value));
    }
  }

  const getTeamsForDisplay = () => {
    if (searchKey !== "") {
      return filteredTeams;
    } else {
      return allTeamData;
    }
  }


  const toggleMenu = (teamId: SetStateAction<string>) => {
    if (isOpenAction?.length > 0) {
      setIsOpenAction('');
    } else {
      setIsOpenAction(teamId);
    }
  };

  const toggleTeam = (teamId: SetStateAction<string>) => {
    []
    window.location.href = "/players?teamId=" + teamId;
  }

  const displayTeams = getTeamsForDisplay()?.filter(current => router?.query?.leagueId ? current?.league?._id === router?.query?.leagueId?.toString() : true)
  const teamsTableData: any[] = [];
  const mappingData = data?.getTeams?.teamWithLeagues;
  displayTeams?.forEach(current => {
    const teamLeagues = mappingData?.find((cur: { teamId: any; }) => cur?.teamId === current?._id)?.leagueIds;
    let teamLeaguesData = [];
    if (teamLeagues?.length > 0) {
      teamLeaguesData = teamLeagues?.map((teamCurrent: any) => {
        const findLeague = leaguesData?.getLeagues?.data?.find((leagueCurrent: { _id: any; }) => leagueCurrent?._id === teamCurrent);
        return findLeague;
      });
      const find = teamLeaguesData?.find((curleague: { _id: any; }) => curleague?._id === current?.league?._id);
      if (!find) {
        teamLeaguesData.push(current?.league);
      }
    } else {
      teamLeaguesData.push(current?.league);
    }
    teamsTableData.push({ ...current, teamLeaguesData })
  })

  const updatedTeamsTableData: any[] = [];
  teamsTableData?.forEach(cur => {
    const filterMapping = cur?.teamLeaguesData?.find((curdata: { _id: string; }) =>
      router?.query?.leagueId ? curdata?._id === router?.query?.leagueId?.toString() : leagueId?.length > 0 && leagueId !== "Select a league" ? curdata?._id === leagueId : true);

    if (filterMapping) {
      updatedTeamsTableData.push({
        ...cur,
      })
    }
  })

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
    console.log({ val });

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

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      setYear(Math.max(minYear, Math.min(currentYear, newValue)));
    }
  };
  const handleOnSave = () => {
    console.log({ val, year, selectedQuarter });
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