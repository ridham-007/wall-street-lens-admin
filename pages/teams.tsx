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

  const [isOpen, setIsOpen] = useState('');
  const [addUpdateTeam, setAddUpdateTeam] = useState(false);
  const [addInOtherLeague, setAddInOtherLeague] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [allTeamData, setAllTeamData] = useState<any[]>([]);
  const [updateTeam, setUpdateTeam] = useState<any>(null);
  // const { data, error, loading, refetch } = useQuery(TEAMS);
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

  const onAddUpdateTeam = () => {
    setUpdateTeam(null);
    setAddUpdateTeam(false);
    setAddInOtherLeague(false);
    refetch();
  };

  const onAddUpdateTeamClose = () => {
    setUpdateTeam(null);
    setAddUpdateTeam(false);
    setAddInOtherLeague(false);
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
    <Layout title="Teams" page={LayoutPages.teams}>
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
              <div className="ml-4">
                <div className="flex align-self-right">
                  <div
                    className="border border-gray-30 w-[160px]"

                    style={{
                      borderRadius: '8px',
                      height: '42px',
                      color: 'grey',
                    }}>
                    <select
                      className="w-[158px]"
                      name="leagueId"
                      id="leagueId"
                      value={leagueId}
                      onChange={(e) => setLeagueId(e.target.value)}
                      style={{
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    >
                      <option>Select a league</option>
                      <option>UnAssigned</option>
                      {leaguesData?.getLeagues?.code === 200 &&
                        leaguesData?.getLeagues?.data?.map((league: any) => (
                          <option key={league?._id} value={league?._id}>
                            {league?.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            userRole == 'admin' && (<button type="button" className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
              onClick={() => setAddUpdateTeam(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon w-7 h-7 mr-2" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176" /></svg>
              Add a Team
            </button>)
          }

        </div>

        <div style={{
          maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
          <table className="app-table w-full">
            <thead className="w-full sticky top-0 z-20">
              <THR>
                <>
                  <TH></TH>
                  <TH>Name</TH>
                  <TH>League</TH>
                  <TH>Coach</TH>
                  <TH>Active</TH>
                  <TH>Actions</TH>
                </>
              </THR>
            </thead>

            <tbody className="w-full">
              {updatedTeamsTableData.map((team: any, index: number) => (
                <>
                  <TDR key={`${team?._id}-${team?.teamLeaguesData && team?.teamLeaguesData[0]?._id}-${index}-${index}`}>
                    <>
                      <TD>
                        {team?.teamLeaguesData?.length > 1 ? (<button
                          className="text-white px-4 py-2 rounded"
                          onClick={() => setIsOpen(isOpen?.length ? '' : `collapsible-${team?._id}-${team?.teamLeaguesData && team?.teamLeaguesData[0]?._id}-${index}`)}
                        >
                          {isOpen === `collapsible-${team?._id}-${team?.teamLeaguesData && team?.teamLeaguesData[0]?._id}-${index}` ? <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z" /></svg> : <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" /></svg>}

                        </button>) : <></>}

                      </TD>
                      <TD>{team?.name}</TD>
                      <TD>
                        {team?.teamLeaguesData && team?.teamLeaguesData[0]?.name}
                      </TD>
                      <TD>
                        <>
                          {team?.coach?.firstName}&nbsp;{team?.coach?.lastName}
                        </>
                      </TD>
                      <TD>{team?.active ? "Yes" : "No"}</TD>
                      <TD>
                        {
                          userRole === 'admin' ?
                            <div className="flex item-center justify-center">
                              <div className="relative">
                                <Menu>
                                  <MenuHandler>
                                    <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                  </MenuHandler>
                                  <MenuList>
                                    <MenuItem onClick={() => {
                                      setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[0] });
                                      setAddUpdateTeam(true);
                                      setIsOpenAction('');
                                    }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Edit</MenuItem>
                                    <MenuItem onClick={() => {
                                      setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[0] });
                                      setAddUpdateTeam(true);
                                      setIsOpenAction('');
                                      setAddInOtherLeague(true);
                                    }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Add in other league</MenuItem>
                                    <MenuItem onClick={() => {
                                      toggleTeam(team?._id)
                                    }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">View Players</MenuItem>
                                  </MenuList>
                                </Menu>
                              </div>
                            </div>
                            :
                            <div className="flex item-center justify-center">
                              <div className="relative">
                                <button
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  onClick={() => toggleTeam(team?._id)}
                                >
                                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                    className="w-7 h-7" viewBox="0 0 512.000000 512.000000"
                                    preserveAspectRatio="xMidYMid meet">
                                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                      fill="#000000" stroke="none">
                                      <path d="M2645 4665 c-73 -13 -215 -51 -257 -70 -15 -6 -18 -2 -18 18 0 14 -7
28 -17 31 -47 18 -258 -166 -348 -304 -62 -96 -145 -269 -186 -390 -18 -52
-40 -104 -50 -115 -10 -11 -23 -41 -29 -67 -9 -36 -17 -48 -31 -48 -22 0 -59
-34 -59 -54 0 -8 11 -28 25 -44 14 -17 23 -36 20 -44 -3 -7 -13 -64 -24 -126
-18 -104 -18 -117 -4 -175 12 -47 17 -150 22 -427 l6 -365 53 -95 c29 -52 79
-132 112 -178 33 -46 60 -85 60 -88 0 -2 -11 -4 -25 -4 -16 0 -45 -18 -80 -50
-60 -55 -131 -94 -245 -134 -61 -22 -85 -26 -130 -21 -30 3 -70 1 -88 -4 -29
-9 -39 -6 -78 19 -25 16 -79 41 -120 56 -68 24 -83 26 -162 20 -88 -6 -235
-34 -307 -58 -41 -13 -52 -32 -36 -57 8 -12 26 -10 118 12 59 14 147 31 195
38 76 9 94 9 140 -6 60 -20 140 -58 180 -87 24 -16 33 -17 65 -8 21 7 53 10
72 8 32 -3 36 -8 121 -175 120 -233 219 -403 365 -624 109 -165 135 -197 232
-287 169 -157 367 -323 382 -320 8 2 19 11 25 21 12 20 27 6 -175 179 -68 59
-147 129 -176 155 l-52 48 84 155 c46 85 86 159 88 164 2 6 48 -27 103 -71
179 -147 410 -285 613 -367 83 -33 117 -33 172 3 58 38 195 180 249 260 47 70
111 202 131 269 7 23 16 41 20 40 4 -2 82 -66 173 -143 131 -111 165 -145 165
-165 2 -52 -63 -254 -136 -423 -44 -104 -42 -138 5 -123 27 9 139 290 183 458
20 77 20 92 10 215 -19 217 -75 403 -173 566 -62 104 -200 266 -240 281 -34
12 -32 25 8 48 51 30 144 48 247 48 153 0 316 -40 512 -126 86 -38 101 -42
114 -30 7 8 11 22 7 31 -15 40 -322 153 -488 180 -110 18 -183 19 -262 4 -32
-6 -60 -8 -63 -6 -2 3 8 25 23 49 108 170 204 492 204 682 0 46 9 141 20 212
11 70 22 179 26 242 l7 113 34 26 c18 14 36 36 39 50 8 30 -20 63 -53 63 -21
0 -23 5 -23 44 0 30 -7 52 -22 72 -16 20 -28 59 -40 132 -36 209 -118 405
-234 550 -75 95 -136 146 -166 139 -13 -4 -32 2 -49 14 -59 42 -241 121 -336
145 -124 32 -327 41 -448 19z m162 -422 c-4 -202 -10 -370 -15 -375 -4 -4 -31
11 -60 33 l-53 41 7 66 c5 37 8 187 8 335 l-1 267 60 0 60 0 -6 -367z m229
351 c20 -5 21 -14 28 -181 7 -177 -2 -581 -13 -587 -3 -2 -53 1 -110 7 l-104
10 6 141 c4 78 7 251 7 385 l0 244 83 -6 c45 -4 91 -9 103 -13z m-388 -240 c4
-290 -2 -364 -27 -357 -16 4 -53 -34 -148 -148 -7 -9 -17 -72 -23 -159 -6 -80
-12 -146 -14 -147 -3 -3 -117 24 -149 36 l-28 11 36 64 35 63 20 398 c10 219
23 401 27 405 19 17 236 81 258 76 6 -2 11 -93 13 -242z m559 -120 c2 -231 0
-315 -10 -332 -6 -13 -30 -34 -52 -47 l-40 -23 0 372 0 373 50 -17 50 -17 2
-309z m-903 289 c-2 -16 -11 -199 -20 -407 l-17 -380 -31 -53 c-16 -29 -33
-53 -36 -53 -4 0 -12 23 -19 51 -15 59 -58 112 -112 140 -29 14 -59 19 -122
19 -46 0 -86 3 -90 6 -8 8 53 174 103 281 45 97 127 225 191 297 43 48 134
126 148 126 4 0 6 -12 5 -27z m1027 -40 c42 -23 69 -44 69 -53 0 -9 16 -37 35
-62 19 -24 47 -73 61 -109 32 -75 32 -101 9 -479 -8 -135 -15 -257 -15 -272 0
-28 -1 -28 -64 -28 l-64 0 5 144 6 145 -43 72 c-23 39 -51 74 -61 76 -18 5
-19 20 -19 304 0 165 3 299 6 299 4 0 38 -17 75 -37z m252 -161 c70 -87 110
-155 152 -257 33 -80 76 -240 89 -331 6 -42 6 -42 -32 -49 -109 -19 -109 -19
-152 -110 -35 -73 -44 -85 -65 -85 -23 0 -25 3 -20 38 2 20 12 173 21 339 16
300 16 303 -5 370 -11 38 -36 94 -55 125 -31 52 -32 56 -10 42 13 -9 47 -46
77 -82z m-915 -453 c81 -71 120 -85 286 -102 l148 -16 69 45 c38 24 73 44 77
44 4 0 20 -21 35 -47 28 -46 29 -48 22 -162 -8 -147 -9 -151 -46 -151 l-29 0
0 93 c0 107 -13 137 -61 137 -54 0 -69 -28 -69 -132 l0 -91 -165 7 c-91 4
-172 9 -180 13 -9 3 -13 14 -11 27 3 11 8 56 11 99 6 73 4 78 -19 102 -31 31
-48 31 -80 3 -23 -20 -26 -33 -32 -116 -4 -51 -11 -95 -16 -98 -5 -3 -29 -3
-54 1 l-44 6 0 63 c0 35 3 98 7 140 6 74 8 80 50 127 25 27 47 49 50 49 3 0
26 -18 51 -41z m-648 -144 c33 -17 45 -36 64 -98 8 -23 16 -49 20 -57 8 -19
-59 -62 -145 -93 l-64 -23 -18 -74 c-11 -45 -19 -120 -20 -187 -1 -62 -6 -113
-10 -113 -12 0 -43 78 -65 168 -20 78 -20 85 -5 181 l15 101 28 -20 c51 -37
100 -21 100 31 0 20 -11 36 -42 60 -24 18 -47 36 -51 39 -4 4 -3 28 4 54 l11
46 75 0 c46 0 85 -6 103 -15z m1810 -205 c0 -59 -1 -60 -40 -86 -58 -39 -67
-94 -18 -113 14 -5 31 -5 42 1 18 10 18 6 12 -68 -11 -113 -35 -273 -48 -313
-19 -59 -49 -101 -87 -120 -56 -29 -301 -108 -301 -97 0 2 6 22 14 44 25 69
57 249 64 355 l7 102 40 -3 c49 -4 85 -35 85 -73 0 -16 7 -29 16 -33 43 -16
59 55 25 110 -26 43 -72 61 -176 69 -116 8 -125 11 -125 40 0 14 8 28 18 33 9
5 76 10 147 11 l130 1 36 40 c20 22 47 64 60 94 24 55 33 63 77 65 20 1 22 -3
22 -59z m-1565 -44 c39 -14 96 -30 128 -36 67 -13 77 -35 20 -46 -20 -4 -98
-4 -172 -1 -121 6 -141 4 -178 -12 -77 -36 -103 -129 -85 -311 5 -52 8 -96 6
-98 -5 -7 -44 23 -50 38 -22 55 -11 349 14 386 4 6 28 18 53 27 25 10 70 33
100 51 60 38 64 38 164 2z m306 -62 c31 -5 38 -11 43 -35 10 -50 92 -53 115
-3 11 24 15 26 54 20 23 -3 102 -8 175 -12 129 -7 132 -8 138 -31 7 -27 32
-43 67 -43 24 0 49 21 60 53 4 10 17 17 33 17 25 0 26 -2 21 -41 -3 -22 -7
-42 -9 -45 -2 -2 -58 -8 -123 -14 -182 -16 -382 6 -567 61 -64 19 -68 22 -68
49 0 32 4 33 61 24z m-319 -101 c-23 -9 -32 -19 -30 -31 5 -22 37 -21 154 6
90 21 93 21 145 3 167 -57 383 -86 578 -78 127 5 138 4 200 -20 85 -32 105
-34 109 -8 2 15 -6 26 -30 37 l-33 17 30 0 c54 1 59 -8 52 -106 -8 -111 -30
-235 -59 -338 l-23 -80 -59 -12 c-33 -6 -101 -14 -151 -18 l-91 -7 -17 61
c-10 34 -24 64 -33 68 -23 9 -26 -1 -9 -40 8 -20 15 -48 15 -63 l0 -26 -82 6
c-188 15 -268 28 -268 43 0 8 12 37 27 63 28 50 27 74 -3 50 -8 -8 -27 -37
-41 -64 -14 -28 -27 -52 -28 -54 -10 -12 -290 71 -396 116 l-47 20 -17 94
c-16 88 -25 354 -12 375 3 4 38 6 79 4 73 -4 73 -4 40 -18z m-166 -146 c0 -83
6 -179 12 -211 7 -33 10 -61 8 -63 -2 -3 -13 1 -25 9 -27 17 -36 71 -36 239 0
121 2 139 19 158 11 12 20 21 20 21 1 0 1 -69 2 -153z m-246 -235 c0 -7 12
-35 26 -63 25 -50 68 -198 60 -207 -3 -2 -32 15 -65 37 l-61 42 0 114 c0 113
0 115 20 103 11 -7 20 -19 20 -26z m147 -98 c21 -14 64 -39 96 -55 l57 -29 0
-100 c0 -117 -2 -119 -90 -66 l-55 32 -7 68 c-5 36 -16 91 -26 121 -11 30 -18
55 -16 55 2 0 20 -12 41 -26z m1772 -187 c-13 -61 -36 -97 -64 -97 -12 0 -13
5 -7 18 5 9 17 46 26 82 18 67 48 107 55 74 1 -9 -3 -44 -10 -77z m-1502 57
l43 -17 0 -108 c0 -60 -3 -109 -6 -109 -3 0 -27 10 -54 21 -43 19 -48 24 -39
40 6 12 7 52 3 104 -4 47 -3 85 2 85 4 0 28 -7 51 -16z m1401 -26 c-3 -7 -17
-50 -33 -95 -27 -79 -30 -82 -74 -102 -25 -11 -47 -18 -49 -17 -1 2 14 46 35
99 34 87 41 98 73 111 45 18 53 19 48 4z m-1188 -38 c165 -46 504 -75 689 -60
68 6 126 9 127 7 5 -4 -42 -196 -49 -203 -14 -15 -200 -34 -329 -34 -154 0
-325 23 -429 57 l-54 18 -3 113 c-1 61 1 112 5 112 4 0 24 -4 43 -10z m1017
-22 c-60 -161 -72 -188 -89 -194 -11 -3 -21 -4 -22 -2 -2 1 7 45 18 97 17 72
27 96 42 102 30 12 57 10 51 -3z m-1557 -122 l0 -31 -25 40 c-31 51 -31 59 0
39 18 -12 25 -25 25 -48z m-47 -78 c31 -53 61 -99 66 -102 23 -14 39 8 46 60
l7 54 45 -44 45 -45 -17 -79 c-23 -105 -28 -112 -55 -81 -79 92 -220 319 -220
353 0 20 0 20 13 1 8 -11 39 -64 70 -117z m206 23 c7 -5 12 -14 9 -21 -2 -7
-10 -4 -22 9 -19 21 -12 28 13 12z m1580 -73 c-41 -106 -155 -284 -221 -346
l-25 -23 -67 25 c-37 13 -70 27 -74 30 -10 11 28 140 46 154 8 6 24 12 34 12
14 0 18 -8 18 -39 0 -41 18 -65 42 -56 18 7 111 129 159 208 31 52 67 82 101
86 4 1 -1 -23 -13 -51z m-1427 5 c56 -22 68 -30 68 -49 0 -21 -3 -22 -27 -13
-64 23 -118 55 -121 72 -4 22 0 22 80 -10z m1238 -77 c-17 -25 -33 -46 -35
-46 -3 0 -5 16 -5 35 0 31 5 38 33 50 17 7 34 12 35 10 2 -2 -10 -24 -28 -49z
m-1166 -76 c8 -43 18 -290 11 -290 -13 0 -112 68 -172 118 l-61 52 18 48 c10
26 23 72 30 103 l12 55 79 -30 c64 -26 79 -35 83 -56z m376 34 c89 -13 153
-15 280 -10 91 4 182 9 203 12 31 5 36 4 31 -9 -12 -33 -413 -35 -629 -2 -139
21 -145 23 -145 44 0 19 2 19 73 0 39 -10 124 -26 187 -35z m690 41 c0 -2 -9
-9 -20 -15 -16 -9 -20 -8 -20 5 0 8 9 15 20 15 11 0 20 -2 20 -5z m-835 -100
c136 -23 376 -35 510 -26 66 5 122 6 124 4 46 -39 -561 -28 -726 14 -24 5 -32
23 -10 23 6 0 53 -7 102 -15z m21 -92 c77 -11 180 -16 351 -17 134 -1 243 -1
243 -1 0 0 -10 -29 -23 -64 -20 -59 -25 -65 -61 -78 -55 -18 -440 -10 -511 12
-28 8 -62 15 -77 15 -15 0 -29 4 -33 10 -11 18 -18 140 -8 140 5 0 59 -7 119
-17z m-618 -49 c22 -6 22 -7 6 -25 -17 -18 -16 -22 6 -77 68 -167 189 -379
301 -529 178 -236 429 -396 772 -488 l129 -35 36 29 c111 89 205 212 272 353
67 143 67 150 27 326 -29 126 -40 157 -61 177 -29 27 -34 60 -10 69 28 11 98
-164 129 -326 14 -73 13 -79 -11 -167 -35 -128 -83 -237 -147 -334 -60 -89
-221 -253 -259 -262 -44 -11 -287 105 -471 225 -383 249 -658 579 -786 942
l-30 87 26 21 c28 22 36 23 71 14z m136 -88 c49 -41 168 -121 235 -158 24 -13
31 -24 31 -48 0 -35 30 -70 60 -70 12 0 31 11 44 25 l23 25 94 -24 c117 -30
290 -47 389 -38 65 6 79 5 102 -12 23 -16 32 -17 53 -8 14 7 30 23 37 37 6 14
16 25 22 25 6 0 35 11 63 25 29 13 55 20 58 15 3 -6 13 -61 23 -124 15 -109
15 -117 -2 -173 -46 -148 -157 -294 -297 -389 l-70 -48 -52 18 c-92 32 -213
94 -309 158 -133 89 -237 197 -343 357 -133 202 -254 451 -219 451 4 0 30 -20
58 -44z m-229 -143 c51 -124 113 -231 202 -354 32 -44 62 -85 66 -92 6 -8 -21
-63 -76 -156 l-85 -144 -56 85 c-124 194 -376 652 -376 686 0 4 26 16 58 26
31 10 91 35 132 56 66 34 76 36 82 22 4 -10 28 -68 53 -129z m1393 45 c-41
-36 -46 -15 -17 59 l11 28 13 -35 c12 -32 11 -37 -7 -52z m375 -21 c80 -85
136 -166 189 -272 43 -84 98 -238 98 -270 0 -8 -65 39 -144 105 -127 106 -145
124 -151 157 -13 69 -57 197 -92 266 -18 37 -31 72 -28 77 3 5 20 7 38 4 22
-4 49 -24 90 -67z m-1097 48 c79 -25 484 -39 546 -20 17 6 20 4 14 -10 -3 -9
-9 -28 -12 -41 -8 -31 -48 -39 -199 -38 -121 1 -229 18 -351 55 -51 16 -63 23
-66 44 -6 30 1 31 68 10z m1258 -584 c134 -112 144 -122 150 -162 4 -23 5 -43
3 -45 -1 -2 -74 57 -160 132 -118 101 -157 140 -157 158 0 21 7 36 17 36 2 0
68 -54 147 -119z m-1555 -45 l42 -43 -89 -168 -90 -167 -43 62 c-24 34 -43 67
-41 72 5 18 167 288 172 288 3 0 25 -20 49 -44z"/>
                                      <path d="M2412 3212 c-24 -8 -64 -60 -56 -74 5 -8 78 -48 89 -48 15 0 2 20
-17 26 -13 4 -31 12 -41 19 -17 12 -17 14 -2 29 9 9 27 16 40 16 19 0 24 -6
27 -32 6 -67 102 -71 115 -6 5 27 7 28 29 13 29 -19 44 -19 44 0 0 38 -160 78
-228 57z"/>
                                      <path d="M2907 3173 c-9 -16 -28 -213 -30 -318 -2 -92 0 -110 13 -110 12 0 16
27 22 160 4 88 11 182 16 210 6 27 8 53 6 57 -6 10 -22 10 -27 1z"/>
                                      <path d="M3023 3145 c-44 -19 -44 -39 1 -31 31 6 34 4 39 -24 13 -64 103 -66
122 -2 11 37 24 40 50 12 22 -25 13 -50 -20 -50 -14 0 -25 -4 -25 -10 0 -13
23 -13 55 2 25 11 34 41 14 53 -5 4 -14 17 -19 30 -5 14 -20 24 -40 29 -54 10
-143 6 -177 -9z"/>
                                      <path d="M2296 2988 c-38 -54 -2 -93 128 -138 52 -17 61 -18 86 -5 28 15 40
33 40 64 0 14 -16 22 -64 35 -35 10 -87 28 -116 42 -28 13 -54 24 -55 24 -2 0
-11 -10 -19 -22z"/>
                                      <path d="M3235 2920 c-16 -4 -59 -8 -94 -9 l-63 -1 6 -32 c10 -54 40 -71 111
-63 105 12 115 15 115 41 0 31 -20 74 -34 73 -6 -1 -24 -5 -41 -9z"/>
                                      <path d="M2534 2515 c-4 -10 -1 -21 7 -26 30 -18 199 -51 290 -56 123 -7 189
2 189 26 0 16 -13 17 -132 17 -127 0 -179 8 -325 50 -16 4 -25 1 -29 -11z"/>
                                      <path d="M2730 2406 c0 -8 16 -16 38 -20 60 -10 220 -7 227 4 9 15 -8 18 -142
24 -100 5 -123 3 -123 -8z"/>
                                      <path d="M2497 2083 c-14 -14 -6 -34 17 -43 14 -5 30 -18 36 -30 15 -28 40
-26 40 3 0 37 -73 91 -93 70z"/>
                                      <path d="M2720 2041 c0 -11 9 -22 19 -26 11 -3 27 -17 36 -31 13 -20 19 -23
30 -14 11 9 12 17 4 34 -25 49 -89 75 -89 37z"/>
                                      <path d="M2950 2028 c0 -16 75 -79 84 -71 14 14 4 43 -20 62 -30 23 -64 28
-64 9z"/>
                                    </g>
                                  </svg>
                                </button>
                              </div>
                            </div>
                        }

                      </TD>
                    </>
                  </TDR>
                  {isOpen === `collapsible-${team?._id}-${team?.teamLeaguesData && team?.teamLeaguesData[0]?._id}-${index}` && team?.teamLeaguesData?.length > 1 && (
                    <>
                      {team?.teamLeaguesData?.map((current: any, index: number) => (
                        index > 0 && (
                          <TDR key={`${team?._id}-${current?._id}`}>
                            <>
                              <TD>
                                <></>
                              </TD>
                              <TD></TD>
                              <TD>
                                {current?.name}
                              </TD>
                              <TD>
                                <>
                                  {team?.coach?.firstName}&nbsp;{team?.coach?.lastName}
                                </>
                              </TD>
                              <TD>{team?.active ? "Yes" : "No"}</TD>
                              <TD>
                                {
                                  userRole === 'admin' ?
                                    <div className="flex item-center justify-center">
                                      <div className="relative">
                                        {/* <button
                                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                          onClick={() => toggleMenu(`${team?._id}-${current?._id}`)}
                                        >
                                          <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                        </button>
                                        {(isOpenAction === `${team?._id}-${current?._id}`) && (
                                          <div ref={ref} className="z-20 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                              <a onClick={() => {
                                                setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[index] });
                                                setAddUpdateTeam(true);
                                                setIsOpenAction('');
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                              <a onClick={() => {
                                                setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[index] });
                                                setAddUpdateTeam(true);
                                                setIsOpenAction('');
                                                setAddInOtherLeague(true);
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Add in other league</a>
                                            </div>
                                          </div>
                                        )} */}
                                        <Menu>
                                          <MenuHandler>
                                            <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                          </MenuHandler>
                                          <MenuList>
                                            <MenuItem onClick={() => {
                                              setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[0] });
                                              setAddUpdateTeam(true);
                                              setIsOpenAction('');
                                            }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Edit</MenuItem>
                                            <MenuItem onClick={() => {
                                              setUpdateTeam({ ...team, league: team?.teamLeaguesData && team?.teamLeaguesData[0] });
                                              setAddUpdateTeam(true);
                                              setIsOpenAction('');
                                              setAddInOtherLeague(true);
                                            }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Add in other league</MenuItem>
                                            <MenuItem onClick={() => {
                                              toggleTeam(team?._id)
                                            }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">View Players</MenuItem>
                                          </MenuList>
                                        </Menu>
                                      </div>
                                    </div>
                                    :
                                    <div className="flex item-center justify-center">
                                      <div className="relative">
                                        <button
                                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                          onClick={() => toggleTeam(team?._id)}
                                        >
                                          <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                            className="w-7 h-7" viewBox="0 0 512.000000 512.000000"
                                            preserveAspectRatio="xMidYMid meet">
                                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                              fill="#000000" stroke="none">
                                              <path d="M2645 4665 c-73 -13 -215 -51 -257 -70 -15 -6 -18 -2 -18 18 0 14 -7
28 -17 31 -47 18 -258 -166 -348 -304 -62 -96 -145 -269 -186 -390 -18 -52
-40 -104 -50 -115 -10 -11 -23 -41 -29 -67 -9 -36 -17 -48 -31 -48 -22 0 -59
-34 -59 -54 0 -8 11 -28 25 -44 14 -17 23 -36 20 -44 -3 -7 -13 -64 -24 -126
-18 -104 -18 -117 -4 -175 12 -47 17 -150 22 -427 l6 -365 53 -95 c29 -52 79
-132 112 -178 33 -46 60 -85 60 -88 0 -2 -11 -4 -25 -4 -16 0 -45 -18 -80 -50
-60 -55 -131 -94 -245 -134 -61 -22 -85 -26 -130 -21 -30 3 -70 1 -88 -4 -29
-9 -39 -6 -78 19 -25 16 -79 41 -120 56 -68 24 -83 26 -162 20 -88 -6 -235
-34 -307 -58 -41 -13 -52 -32 -36 -57 8 -12 26 -10 118 12 59 14 147 31 195
38 76 9 94 9 140 -6 60 -20 140 -58 180 -87 24 -16 33 -17 65 -8 21 7 53 10
72 8 32 -3 36 -8 121 -175 120 -233 219 -403 365 -624 109 -165 135 -197 232
-287 169 -157 367 -323 382 -320 8 2 19 11 25 21 12 20 27 6 -175 179 -68 59
-147 129 -176 155 l-52 48 84 155 c46 85 86 159 88 164 2 6 48 -27 103 -71
179 -147 410 -285 613 -367 83 -33 117 -33 172 3 58 38 195 180 249 260 47 70
111 202 131 269 7 23 16 41 20 40 4 -2 82 -66 173 -143 131 -111 165 -145 165
-165 2 -52 -63 -254 -136 -423 -44 -104 -42 -138 5 -123 27 9 139 290 183 458
20 77 20 92 10 215 -19 217 -75 403 -173 566 -62 104 -200 266 -240 281 -34
12 -32 25 8 48 51 30 144 48 247 48 153 0 316 -40 512 -126 86 -38 101 -42
114 -30 7 8 11 22 7 31 -15 40 -322 153 -488 180 -110 18 -183 19 -262 4 -32
-6 -60 -8 -63 -6 -2 3 8 25 23 49 108 170 204 492 204 682 0 46 9 141 20 212
11 70 22 179 26 242 l7 113 34 26 c18 14 36 36 39 50 8 30 -20 63 -53 63 -21
0 -23 5 -23 44 0 30 -7 52 -22 72 -16 20 -28 59 -40 132 -36 209 -118 405
-234 550 -75 95 -136 146 -166 139 -13 -4 -32 2 -49 14 -59 42 -241 121 -336
145 -124 32 -327 41 -448 19z m162 -422 c-4 -202 -10 -370 -15 -375 -4 -4 -31
11 -60 33 l-53 41 7 66 c5 37 8 187 8 335 l-1 267 60 0 60 0 -6 -367z m229
351 c20 -5 21 -14 28 -181 7 -177 -2 -581 -13 -587 -3 -2 -53 1 -110 7 l-104
10 6 141 c4 78 7 251 7 385 l0 244 83 -6 c45 -4 91 -9 103 -13z m-388 -240 c4
-290 -2 -364 -27 -357 -16 4 -53 -34 -148 -148 -7 -9 -17 -72 -23 -159 -6 -80
-12 -146 -14 -147 -3 -3 -117 24 -149 36 l-28 11 36 64 35 63 20 398 c10 219
23 401 27 405 19 17 236 81 258 76 6 -2 11 -93 13 -242z m559 -120 c2 -231 0
-315 -10 -332 -6 -13 -30 -34 -52 -47 l-40 -23 0 372 0 373 50 -17 50 -17 2
-309z m-903 289 c-2 -16 -11 -199 -20 -407 l-17 -380 -31 -53 c-16 -29 -33
-53 -36 -53 -4 0 -12 23 -19 51 -15 59 -58 112 -112 140 -29 14 -59 19 -122
19 -46 0 -86 3 -90 6 -8 8 53 174 103 281 45 97 127 225 191 297 43 48 134
126 148 126 4 0 6 -12 5 -27z m1027 -40 c42 -23 69 -44 69 -53 0 -9 16 -37 35
-62 19 -24 47 -73 61 -109 32 -75 32 -101 9 -479 -8 -135 -15 -257 -15 -272 0
-28 -1 -28 -64 -28 l-64 0 5 144 6 145 -43 72 c-23 39 -51 74 -61 76 -18 5
-19 20 -19 304 0 165 3 299 6 299 4 0 38 -17 75 -37z m252 -161 c70 -87 110
-155 152 -257 33 -80 76 -240 89 -331 6 -42 6 -42 -32 -49 -109 -19 -109 -19
-152 -110 -35 -73 -44 -85 -65 -85 -23 0 -25 3 -20 38 2 20 12 173 21 339 16
300 16 303 -5 370 -11 38 -36 94 -55 125 -31 52 -32 56 -10 42 13 -9 47 -46
77 -82z m-915 -453 c81 -71 120 -85 286 -102 l148 -16 69 45 c38 24 73 44 77
44 4 0 20 -21 35 -47 28 -46 29 -48 22 -162 -8 -147 -9 -151 -46 -151 l-29 0
0 93 c0 107 -13 137 -61 137 -54 0 -69 -28 -69 -132 l0 -91 -165 7 c-91 4
-172 9 -180 13 -9 3 -13 14 -11 27 3 11 8 56 11 99 6 73 4 78 -19 102 -31 31
-48 31 -80 3 -23 -20 -26 -33 -32 -116 -4 -51 -11 -95 -16 -98 -5 -3 -29 -3
-54 1 l-44 6 0 63 c0 35 3 98 7 140 6 74 8 80 50 127 25 27 47 49 50 49 3 0
26 -18 51 -41z m-648 -144 c33 -17 45 -36 64 -98 8 -23 16 -49 20 -57 8 -19
-59 -62 -145 -93 l-64 -23 -18 -74 c-11 -45 -19 -120 -20 -187 -1 -62 -6 -113
-10 -113 -12 0 -43 78 -65 168 -20 78 -20 85 -5 181 l15 101 28 -20 c51 -37
100 -21 100 31 0 20 -11 36 -42 60 -24 18 -47 36 -51 39 -4 4 -3 28 4 54 l11
46 75 0 c46 0 85 -6 103 -15z m1810 -205 c0 -59 -1 -60 -40 -86 -58 -39 -67
-94 -18 -113 14 -5 31 -5 42 1 18 10 18 6 12 -68 -11 -113 -35 -273 -48 -313
-19 -59 -49 -101 -87 -120 -56 -29 -301 -108 -301 -97 0 2 6 22 14 44 25 69
57 249 64 355 l7 102 40 -3 c49 -4 85 -35 85 -73 0 -16 7 -29 16 -33 43 -16
59 55 25 110 -26 43 -72 61 -176 69 -116 8 -125 11 -125 40 0 14 8 28 18 33 9
5 76 10 147 11 l130 1 36 40 c20 22 47 64 60 94 24 55 33 63 77 65 20 1 22 -3
22 -59z m-1565 -44 c39 -14 96 -30 128 -36 67 -13 77 -35 20 -46 -20 -4 -98
-4 -172 -1 -121 6 -141 4 -178 -12 -77 -36 -103 -129 -85 -311 5 -52 8 -96 6
-98 -5 -7 -44 23 -50 38 -22 55 -11 349 14 386 4 6 28 18 53 27 25 10 70 33
100 51 60 38 64 38 164 2z m306 -62 c31 -5 38 -11 43 -35 10 -50 92 -53 115
-3 11 24 15 26 54 20 23 -3 102 -8 175 -12 129 -7 132 -8 138 -31 7 -27 32
-43 67 -43 24 0 49 21 60 53 4 10 17 17 33 17 25 0 26 -2 21 -41 -3 -22 -7
-42 -9 -45 -2 -2 -58 -8 -123 -14 -182 -16 -382 6 -567 61 -64 19 -68 22 -68
49 0 32 4 33 61 24z m-319 -101 c-23 -9 -32 -19 -30 -31 5 -22 37 -21 154 6
90 21 93 21 145 3 167 -57 383 -86 578 -78 127 5 138 4 200 -20 85 -32 105
-34 109 -8 2 15 -6 26 -30 37 l-33 17 30 0 c54 1 59 -8 52 -106 -8 -111 -30
-235 -59 -338 l-23 -80 -59 -12 c-33 -6 -101 -14 -151 -18 l-91 -7 -17 61
c-10 34 -24 64 -33 68 -23 9 -26 -1 -9 -40 8 -20 15 -48 15 -63 l0 -26 -82 6
c-188 15 -268 28 -268 43 0 8 12 37 27 63 28 50 27 74 -3 50 -8 -8 -27 -37
-41 -64 -14 -28 -27 -52 -28 -54 -10 -12 -290 71 -396 116 l-47 20 -17 94
c-16 88 -25 354 -12 375 3 4 38 6 79 4 73 -4 73 -4 40 -18z m-166 -146 c0 -83
6 -179 12 -211 7 -33 10 -61 8 -63 -2 -3 -13 1 -25 9 -27 17 -36 71 -36 239 0
121 2 139 19 158 11 12 20 21 20 21 1 0 1 -69 2 -153z m-246 -235 c0 -7 12
-35 26 -63 25 -50 68 -198 60 -207 -3 -2 -32 15 -65 37 l-61 42 0 114 c0 113
0 115 20 103 11 -7 20 -19 20 -26z m147 -98 c21 -14 64 -39 96 -55 l57 -29 0
-100 c0 -117 -2 -119 -90 -66 l-55 32 -7 68 c-5 36 -16 91 -26 121 -11 30 -18
55 -16 55 2 0 20 -12 41 -26z m1772 -187 c-13 -61 -36 -97 -64 -97 -12 0 -13
5 -7 18 5 9 17 46 26 82 18 67 48 107 55 74 1 -9 -3 -44 -10 -77z m-1502 57
l43 -17 0 -108 c0 -60 -3 -109 -6 -109 -3 0 -27 10 -54 21 -43 19 -48 24 -39
40 6 12 7 52 3 104 -4 47 -3 85 2 85 4 0 28 -7 51 -16z m1401 -26 c-3 -7 -17
-50 -33 -95 -27 -79 -30 -82 -74 -102 -25 -11 -47 -18 -49 -17 -1 2 14 46 35
99 34 87 41 98 73 111 45 18 53 19 48 4z m-1188 -38 c165 -46 504 -75 689 -60
68 6 126 9 127 7 5 -4 -42 -196 -49 -203 -14 -15 -200 -34 -329 -34 -154 0
-325 23 -429 57 l-54 18 -3 113 c-1 61 1 112 5 112 4 0 24 -4 43 -10z m1017
-22 c-60 -161 -72 -188 -89 -194 -11 -3 -21 -4 -22 -2 -2 1 7 45 18 97 17 72
27 96 42 102 30 12 57 10 51 -3z m-1557 -122 l0 -31 -25 40 c-31 51 -31 59 0
39 18 -12 25 -25 25 -48z m-47 -78 c31 -53 61 -99 66 -102 23 -14 39 8 46 60
l7 54 45 -44 45 -45 -17 -79 c-23 -105 -28 -112 -55 -81 -79 92 -220 319 -220
353 0 20 0 20 13 1 8 -11 39 -64 70 -117z m206 23 c7 -5 12 -14 9 -21 -2 -7
-10 -4 -22 9 -19 21 -12 28 13 12z m1580 -73 c-41 -106 -155 -284 -221 -346
l-25 -23 -67 25 c-37 13 -70 27 -74 30 -10 11 28 140 46 154 8 6 24 12 34 12
14 0 18 -8 18 -39 0 -41 18 -65 42 -56 18 7 111 129 159 208 31 52 67 82 101
86 4 1 -1 -23 -13 -51z m-1427 5 c56 -22 68 -30 68 -49 0 -21 -3 -22 -27 -13
-64 23 -118 55 -121 72 -4 22 0 22 80 -10z m1238 -77 c-17 -25 -33 -46 -35
-46 -3 0 -5 16 -5 35 0 31 5 38 33 50 17 7 34 12 35 10 2 -2 -10 -24 -28 -49z
m-1166 -76 c8 -43 18 -290 11 -290 -13 0 -112 68 -172 118 l-61 52 18 48 c10
26 23 72 30 103 l12 55 79 -30 c64 -26 79 -35 83 -56z m376 34 c89 -13 153
-15 280 -10 91 4 182 9 203 12 31 5 36 4 31 -9 -12 -33 -413 -35 -629 -2 -139
21 -145 23 -145 44 0 19 2 19 73 0 39 -10 124 -26 187 -35z m690 41 c0 -2 -9
-9 -20 -15 -16 -9 -20 -8 -20 5 0 8 9 15 20 15 11 0 20 -2 20 -5z m-835 -100
c136 -23 376 -35 510 -26 66 5 122 6 124 4 46 -39 -561 -28 -726 14 -24 5 -32
23 -10 23 6 0 53 -7 102 -15z m21 -92 c77 -11 180 -16 351 -17 134 -1 243 -1
243 -1 0 0 -10 -29 -23 -64 -20 -59 -25 -65 -61 -78 -55 -18 -440 -10 -511 12
-28 8 -62 15 -77 15 -15 0 -29 4 -33 10 -11 18 -18 140 -8 140 5 0 59 -7 119
-17z m-618 -49 c22 -6 22 -7 6 -25 -17 -18 -16 -22 6 -77 68 -167 189 -379
301 -529 178 -236 429 -396 772 -488 l129 -35 36 29 c111 89 205 212 272 353
67 143 67 150 27 326 -29 126 -40 157 -61 177 -29 27 -34 60 -10 69 28 11 98
-164 129 -326 14 -73 13 -79 -11 -167 -35 -128 -83 -237 -147 -334 -60 -89
-221 -253 -259 -262 -44 -11 -287 105 -471 225 -383 249 -658 579 -786 942
l-30 87 26 21 c28 22 36 23 71 14z m136 -88 c49 -41 168 -121 235 -158 24 -13
31 -24 31 -48 0 -35 30 -70 60 -70 12 0 31 11 44 25 l23 25 94 -24 c117 -30
290 -47 389 -38 65 6 79 5 102 -12 23 -16 32 -17 53 -8 14 7 30 23 37 37 6 14
16 25 22 25 6 0 35 11 63 25 29 13 55 20 58 15 3 -6 13 -61 23 -124 15 -109
15 -117 -2 -173 -46 -148 -157 -294 -297 -389 l-70 -48 -52 18 c-92 32 -213
94 -309 158 -133 89 -237 197 -343 357 -133 202 -254 451 -219 451 4 0 30 -20
58 -44z m-229 -143 c51 -124 113 -231 202 -354 32 -44 62 -85 66 -92 6 -8 -21
-63 -76 -156 l-85 -144 -56 85 c-124 194 -376 652 -376 686 0 4 26 16 58 26
31 10 91 35 132 56 66 34 76 36 82 22 4 -10 28 -68 53 -129z m1393 45 c-41
-36 -46 -15 -17 59 l11 28 13 -35 c12 -32 11 -37 -7 -52z m375 -21 c80 -85
136 -166 189 -272 43 -84 98 -238 98 -270 0 -8 -65 39 -144 105 -127 106 -145
124 -151 157 -13 69 -57 197 -92 266 -18 37 -31 72 -28 77 3 5 20 7 38 4 22
-4 49 -24 90 -67z m-1097 48 c79 -25 484 -39 546 -20 17 6 20 4 14 -10 -3 -9
-9 -28 -12 -41 -8 -31 -48 -39 -199 -38 -121 1 -229 18 -351 55 -51 16 -63 23
-66 44 -6 30 1 31 68 10z m1258 -584 c134 -112 144 -122 150 -162 4 -23 5 -43
3 -45 -1 -2 -74 57 -160 132 -118 101 -157 140 -157 158 0 21 7 36 17 36 2 0
68 -54 147 -119z m-1555 -45 l42 -43 -89 -168 -90 -167 -43 62 c-24 34 -43 67
-41 72 5 18 167 288 172 288 3 0 25 -20 49 -44z"/>
                                              <path d="M2412 3212 c-24 -8 -64 -60 -56 -74 5 -8 78 -48 89 -48 15 0 2 20
-17 26 -13 4 -31 12 -41 19 -17 12 -17 14 -2 29 9 9 27 16 40 16 19 0 24 -6
27 -32 6 -67 102 -71 115 -6 5 27 7 28 29 13 29 -19 44 -19 44 0 0 38 -160 78
-228 57z"/>
                                              <path d="M2907 3173 c-9 -16 -28 -213 -30 -318 -2 -92 0 -110 13 -110 12 0 16
27 22 160 4 88 11 182 16 210 6 27 8 53 6 57 -6 10 -22 10 -27 1z"/>
                                              <path d="M3023 3145 c-44 -19 -44 -39 1 -31 31 6 34 4 39 -24 13 -64 103 -66
122 -2 11 37 24 40 50 12 22 -25 13 -50 -20 -50 -14 0 -25 -4 -25 -10 0 -13
23 -13 55 2 25 11 34 41 14 53 -5 4 -14 17 -19 30 -5 14 -20 24 -40 29 -54 10
-143 6 -177 -9z"/>
                                              <path d="M2296 2988 c-38 -54 -2 -93 128 -138 52 -17 61 -18 86 -5 28 15 40
33 40 64 0 14 -16 22 -64 35 -35 10 -87 28 -116 42 -28 13 -54 24 -55 24 -2 0
-11 -10 -19 -22z"/>
                                              <path d="M3235 2920 c-16 -4 -59 -8 -94 -9 l-63 -1 6 -32 c10 -54 40 -71 111
-63 105 12 115 15 115 41 0 31 -20 74 -34 73 -6 -1 -24 -5 -41 -9z"/>
                                              <path d="M2534 2515 c-4 -10 -1 -21 7 -26 30 -18 199 -51 290 -56 123 -7 189
2 189 26 0 16 -13 17 -132 17 -127 0 -179 8 -325 50 -16 4 -25 1 -29 -11z"/>
                                              <path d="M2730 2406 c0 -8 16 -16 38 -20 60 -10 220 -7 227 4 9 15 -8 18 -142
24 -100 5 -123 3 -123 -8z"/>
                                              <path d="M2497 2083 c-14 -14 -6 -34 17 -43 14 -5 30 -18 36 -30 15 -28 40
-26 40 3 0 37 -73 91 -93 70z"/>
                                              <path d="M2720 2041 c0 -11 9 -22 19 -26 11 -3 27 -17 36 -31 13 -20 19 -23
30 -14 11 9 12 17 4 34 -25 49 -89 75 -89 37z"/>
                                              <path d="M2950 2028 c0 -16 75 -79 84 -71 14 14 4 43 -20 62 -30 23 -64 28
-64 9z"/>
                                            </g>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                }

                              </TD>
                            </>
                          </TDR>)
                      ))}

                    </>)}
                </>
              ))}

            </tbody>
          </table>
        </div>

        {
          addUpdateTeam && (
            <AddUpdateTeam
              key={uuidv4()}
              onClose={onAddUpdateTeamClose}
              onSuccess={onAddUpdateTeam}
              team={updateTeam}
              data={data?.getTeams?.data}
              addInOtherLeague={addInOtherLeague}
            ></AddUpdateTeam>
          )
        }
      </>
    </Layout >
  );
}

const LEAGUE_DROPDOWN = gql`
  query GetLeagues {
                          getLeagues {
                          code
      success
                        message
                        data {
                          _id
        name
      }
    }
  }
                        `;

const COACH_DROPDOWN = gql`
  query GetCoaches {
    getCoaches {
    code
    success
    message
    data {
      _id
      firstName
      lastName
    }
  }
}`;

const ADD_UPDATE_LEAGUE = gql`
                        mutation CreateOrUpdateTeam(
                        $name: String!
                        $active: Boolean!
                        $coachId: String!
                        $leagueId: String!
                        $reamoveLeagueId: String
                        $changeLeague: Boolean
                        $reamoveCoachId: String
                        $id: String
                        ) {
                          createOrUpdateTeam(
                            name: $name
                        active: $active
                        coachId: $coachId
                        leagueId: $leagueId
                        reamoveLeagueId: $reamoveLeagueId
                        changeLeague: $changeLeague
                        reamoveCoachId: $reamoveCoachId
                        id: $id
                        ) {
                          code
      success
                        message
                        data {
                          _id
                        }
    }
  }
                        `;

interface AddUpdateTeamOnSuccess {
  (id: string): void;
}

interface AddUpdateTeamOnClose {
  (): void;
}

interface AddUpdateTeamProps {
  team?: ITeam;
  onSuccess?: AddUpdateTeamOnSuccess;
  onClose?: AddUpdateTeamOnClose;
  data?: any;
  addInOtherLeague?: Boolean;
}

function AddUpdateTeam(props: AddUpdateTeamProps) {
  const leaguesQuery = useQuery(LEAGUE_DROPDOWN);
  const coachesQuery = useQuery(COACH_DROPDOWN);
  const [name, setName] = useState(props.team?.name || "");
  const [leagueId, setLeagueId] = useState(props.team?.league?._id || "");
  const [coachId, setCoachId] = useState(props.team?.coach?._id || "");
  const [active, setActive] = useState(
    props?.team ? props?.team?.active + "" : "true"
  );

  const [addUpdateTeam, { data, error, loading }] = useMutation(
    ADD_UPDATE_LEAGUE,
    {
      variables: {
        name,
        leagueId,
        coachId,
        active: active === "true" ? true : false,
        changeLeague: props.addInOtherLeague ? false : props?.team?.league?._id !== leagueId || props?.team?.coach?._id !== coachId,
        reamoveCoachId: props?.team?.coach?._id !== coachId ? props?.team?.coach?._id : '',
        reamoveLeagueId: props?.team?.league?._id !== leagueId ? props?.team?.league?._id : '',
        id: props?.team?._id,
      },
    }
  );

  useEffect(() => {

    if (data?.createOrUpdateTeam?.code === 200) {
      props?.onSuccess && props.onSuccess(data?.createOrUpdateTeam?.data?._id);
    }
  }, [data, error]);

  let updatedLeagues: { _id: any; }[] = [];
  if (props?.addInOtherLeague) {
    leaguesQuery?.data?.getLeagues?.data?.map((current: { _id: any; }) => {
      const find = props?.team?.teamLeaguesData?.find((curTeam: { _id: any; }) => curTeam?._id === current?._id);
      if (!find) {
        updatedLeagues.push(current);
      }
    })
  } else {
    updatedLeagues = leaguesQuery?.data?.getLeagues?.data;
  }


  return (
    <>
      <Modal showModal={true} onClose={() => props.onClose && props.onClose()}>
        <form className="form w-100">
          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="name" className="font-bold">
                Name
              </label>

              <div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Team Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="leagueId" className="font-bold">
                League
              </label>

              <div>
                <select
                  name="leagueId"
                  id="leagueId"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                >
                  <option>Select a league</option>
                  {updatedLeagues?.map((league: any) => (
                    <option key={league?._id} value={league?._id}>
                      {league?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="coachId" className="font-bold">
                Coach
              </label>

              <div>
                <select
                  name="coachId"
                  id="coachId"
                  value={coachId}
                  onChange={(e) => setCoachId(e.target.value)}
                >
                  <option>Select a coach</option>
                  {coachesQuery?.data?.getCoaches?.code === 200 &&
                    coachesQuery?.data?.getCoaches?.data?.map((coach: any) => (
                      <option key={coach?._id} value={coach?._id}>
                        <>
                          {coach?.firstName}&nbsp;{coach?.lastName}
                        </>
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {props?.team && (
              <div className="w-full md:w-1/2 lg:w-1/3 my-2">
                <label htmlFor="active" className="font-bold">
                  Active
                </label>

                <div>
                  <select
                    name="active"
                    id="active"
                    value={active}
                    onChange={(e) => setActive(e.target.value)}
                  >
                    <option value={"true"}>Yes</option>
                    <option value={"false"}>No</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <hr />

          <div className="my-2">
            {props?.team ? (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => {
                  let isNameError = false;
                  let isSameCoachError = false;
                  let alreadyRegister = false;
                  props?.data?.forEach((current: {
                    league: any; name: string; coach: { _id: string; };
                  }) => {
                    if (props?.addInOtherLeague) {
                      if (!alreadyRegister && current?.league?._id === leagueId && current?.name === props?.team?.name) {
                        alreadyRegister = true;
                      }
                    }
                    if (current?.league?._id === leagueId) {
                      if (name !== props?.team?.name && current?.name === name && !isNameError) {
                        isNameError = true;
                      }
                      if (coachId !== props?.team?.coach?._id && !isSameCoachError && current?.coach?._id === coachId) {
                        isSameCoachError = true
                      }
                    }
                  });

                  if (isNameError) {
                    toast('Team name is already registred in the league.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else if (isSameCoachError) {
                    toast('This coach is already assign to another team in the league.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else {
                    if (props?.addInOtherLeague) {
                      if (alreadyRegister) {
                        toast('This team already register for same league.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                      } else {
                        addUpdateTeam();
                      }
                    } else if(coachId?.length === 0){
                      toast('Please select the league & coach.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                    }
                    else {
                      addUpdateTeam();
                    }
                  }
                }}
              >
                {props?.addInOtherLeague ? "Add In Another League" : "Update Team"}
              </button>
            ) : (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => {
                  let isNameError = false;
                  let isSameCoachError = false;
                  props?.data?.forEach((current: {
                    _id: string; league: any; name: string; coach: { _id: string; };
                  }) => {
                    if (current?.league?._id === leagueId) {

                      if (current?.name === name && !isNameError) {
                        isNameError = true;
                      }
                      if (!isSameCoachError && current?.coach?._id === coachId) {
                        isSameCoachError = true
                      }
                    }
                  })
                  if (isNameError) {
                    toast('Team name is already registred in the league.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else if (isSameCoachError) {
                    toast('This coach is already assign to another team in the league.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else if (coachId?.length === 0) {
                    toast('Please select the league & coach.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  }
                  else {
                    addUpdateTeam();
                  }
                }}
              >
                Add Team
              </button>
            )}

            <button onClick={props.onClose} className="transform hover:bg-red-600 transition duration-300 hover:scale-105 text-white bg-red-500 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center mr-2 mb-2">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
}
