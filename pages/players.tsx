import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import AddUpdatePlayer from "@/components/players/add-update-player";
import AddPlayers from "@/components/players/add-players";
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

const PLAYERS = gql`
  query GetPlayers(
    $userId: String
  ) {
    getPlayers(
      userId: $userId
    ) {
      code
      success
      message
      data {
        _id
        firstName
        lastName
        role

        player {
          shirtNumber
          rank
          teamId
          leagueId

          league {
            _id
            name
          }

          team {
            _id
            name
          }
        }

        login {
          email
          password
        }

        active
      }
      playerMapings {
        playerId
        teamAndLeague {
          team {
            id
            name
          }
          league {
            id
            name
          }
        }
      }
    }
  }
`;

const TEAM_DROPDOWN = gql`
  query GetTeams(
    $userId: String
  ) {
    getTeams(
      userId: $userId
    ) {
      code
      success
      message
      data {
        _id
        name
        league {
          _id
          name
        }
      }
    }
  }
`;
const LEAGUE_DROPDOWN = gql`
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
      }
    }
  }
`;

const ADD_UPDATE_LEAGUE = gql`
  mutation CreateOrUpdatePlayer(
    $firstName: String!
    $lastName: String!
    $shirtNumber: Int!
    $rank: Int!
    $leagueId: String!
    $teamId: String!
    $active: Boolean!
    $email: String
    $ondelete: Boolean
    $id: String
  ) {
    createOrUpdatePlayer(
      firstName: $firstName
      lastName: $lastName
      shirtNumber: $shirtNumber
      rank: $rank
      leagueId: $leagueId
      teamId: $teamId
      active: $active
      email: $email
      ondelete: $ondelete
      id: $id
    ) {
      code
      data {
        _id
      }
    }
  }
`;

export default function PlayersPage() {


  const [isOpen, setIsOpen] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userID, setUserData] = useState('');
  const [getLeaguesData, { data: leaguesQuery }] = useLazyQuery(LEAGUE_DROPDOWN,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    });
  const [getTeamsData, { data: teamsQuery }] = useLazyQuery(TEAM_DROPDOWN, {
    variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
  });
  const [teamId, setTeamId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [addUpdatePlayer, setAddUpdatePlayer] = useState(false);
  const [addPlayers, setAddPlayers] = useState(false);
  const [updatePlayer, setUpdatePlayer] = useState(null);
  const [updatedPlayers, setUpdatedPlayers] = useState<any[]>([]);
  const [addUpdatePlayerMutation, { data: updatedData }] = useMutation(ADD_UPDATE_LEAGUE);
  const [rankUpdatePlayerMutation] = useMutation(ADD_UPDATE_LEAGUE);
  const router = useRouter();
  const [refetchAfterRankUpdate, setRefetchAfterRankUpdate] = useState(false);
  const [addInAnotherLeague, setAddInAnotherLeague] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const [getPlayersData, { data, error, loading, refetch }] = useLazyQuery(PLAYERS,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    }
  );

  const getDatafromLocalStorage = async () => {
    const localStorageData = await LoginService.getUser();
    setUserRole(localStorageData?.role);
    setUserData(localStorageData?._id);
  }

  useEffect(() => {
    getDatafromLocalStorage();
  }, []);

  useEffect(() => {
    getPlayersData();
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
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [isOpenAction])

  // useEffect(() => {
  //   refetch();
  // }, [router.asPath])

  useEffect(() => {
    if (refetchAfterRankUpdate) {
      refetch();
      setRefetchAfterRankUpdate(false);
    }
  }, [refetchAfterRankUpdate])

  useEffect(() => {
    if (data?.getPlayers?.data) {
      getUpdatedPlayers();
      setShowLoader(false);
    }

  }, [data, teamId, getPlayersData, refetch, leagueId])

  useEffect(() => {
    if (updatedData?.createOrUpdatePlayer?.code === 200) {
      refetch();
    }
  }, [updatedData])

  const filteredData = () => {
    let updatedPlayers = data?.getPlayers?.data;
    if (teamId && (teamId !== 'Select a team' && teamId?.length > 0)) {
      updatedPlayers = data?.getPlayers?.data?.filter((current: { player: { teamId: string; leagueId: string; }; }) => current?.player?.teamId === teamId && ((leagueId === 'Select a league' || leagueId?.length === 0) ? true : current?.player?.leagueId === leagueId));
    } else {
      if (leagueId && (leagueId !== 'Select a league' && leagueId?.length > 0)) {
        updatedPlayers = data?.getPlayers?.data?.filter((current: { player: { teamId: string; leagueId: string; }; }) => current?.player?.leagueId === leagueId && ((teamId === 'Select a team' || teamId?.length === 0) ? true : current?.player?.teamId === teamId));
      }
    }

    return updatedPlayers;
  }

  const getUpdatedPlayers = () => {
    let updatedPlayers = data?.getPlayers?.data;
    if (teamId && (teamId !== 'Select a team' && teamId?.length > 0)) {
      updatedPlayers = data?.getPlayers?.data?.filter((current: { player: { teamId: string; leagueId: string; }; }) => current?.player?.teamId === teamId && ((leagueId === 'Select a league' || leagueId?.length === 0) ? true : current?.player?.leagueId === leagueId));
    } else {
      if (leagueId && (leagueId !== 'Select a league' && leagueId?.length > 0)) {
        updatedPlayers = data?.getPlayers?.data?.filter((current: { player: { teamId: string; leagueId: string; }; }) => current?.player?.leagueId === leagueId && ((teamId === 'Select a team' || teamId?.length === 0) ? true : current?.player?.teamId === teamId));
      }
    }

    updatedPlayers = _.orderBy(updatedPlayers, (item: any) => item.player.rank, ["asc"]);
    setUpdatedPlayers(updatedPlayers)

  }

  const onAddUpdatePlayer = () => {
    setUpdatePlayer(null);
    setAddUpdatePlayer(false);
    setAddPlayers(false);
    setAddInAnotherLeague(false);
    refetch()
  };

  const onAddUpdatePlayerClose = () => {
    setUpdatePlayer(null);
    setAddUpdatePlayer(false);
  };

  const onKeyPress = (event: { key: string; }) => {
    if (event.key === "Enter") {
      if (searchKey?.trim()?.length === 0) {
        getUpdatedPlayers();
        return
      }
      const filterData = filteredData();
      // Convert the query to lowercase for case-insensitive matching
      let query = searchKey.toLowerCase().replace(/\s+/g, "");
      // Filter the array to include only objects that match the query
      const filteredArray = filterData.filter((obj: { firstName: any; lastName: any; }) =>
        (obj?.firstName + obj?.lastName).toString().toLowerCase().replace(/\s+/g, "").includes(query)

      );

      setUpdatedPlayers(filteredArray);
    }
  }

  const deletePlayerFunctionality = async (player: any) => {
    await addUpdatePlayerMutation({
      variables: {
        firstName: player?.firstName,
        lastName: player?.lastName,
        shirtNumber: player?.player?.shirtNumber,
        rank: player?.player?.rank,
        leagueId: player?.player?.league?._id || 'UnAssigned',
        teamId: player?.player?.team?._id || 'UnAssigned',
        active: player?.active,
        ondelete: true,
        id: player?._id,
      },
    })
  }

  const onDelete = (player: any) => {
    deletePlayerFunctionality(player);
  }

  const onSearch = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchKey(event.target.value)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    let newPlayers: any[] = [...updatedPlayers];
    const selectedIds: String[] = ['', 'Select a team', 'UnAssigned'];
    const [reorderedRow]: any[] = newPlayers.splice(result.source.index, 1);
    newPlayers.splice(result.destination.index, 0, reorderedRow);
    if (selectedIds.indexOf(teamId) === -1) {
      newPlayers = newPlayers?.map((current: any, index: number) => {
        return {
          ...current,
          player: {
            ...current?.player,
            rank: index + 1,
          }
        }
      });
      setUpdatedPlayers(newPlayers);
      updateRank(newPlayers);
    } else {
      setUpdatedPlayers(newPlayers);
    }
  }

  const updateRank = async (newPlayers: string | any[]) => {
    let updateNeeded = false;
    for (let i = 0; i < newPlayers?.length; i++) {
      updateNeeded = true;
      setShowLoader(true);
      await rankUpdatePlayerMutation({
        variables: {
          firstName: newPlayers[i]?.firstName,
          lastName: newPlayers[i]?.lastName,
          shirtNumber: newPlayers[i]?.player?.shirtNumber,
          rank: newPlayers[i]?.player?.rank,
          leagueId: newPlayers[i]?.player?.leagueId,
          teamId: newPlayers[i]?.player?.teamId,
          active: newPlayers[i]?.active,
          id: newPlayers[i]?._id,
        },
      })
    }
    if (updateNeeded) {
      setRefetchAfterRankUpdate(true);
    } else {
      setShowLoader(false);
    }
  }

  const selectedIds: String[] = ['', 'Select a team', 'UnAssigned'];

  const toggleMenu = (playerId: SetStateAction<string>) => {
    if (isOpenAction?.length > 0) {
      setIsOpenAction('');
    } else {
      setIsOpenAction(playerId);
    }
  };

  const displayPlayers = updatedPlayers?.filter(current => router?.query?.teamId ? current?.player?.teamId === router?.query?.teamId?.toString() : true);
  const updatedDisplayPlayers: any[] = [];
  const allMapping = data?.getPlayers?.playerMapings;
  displayPlayers?.map(currentPlayer => {
    const findmap = allMapping?.find((curmap: { playerId: any; }) => curmap?.playerId === currentPlayer?._id);
    if (findmap?.teamAndLeague?.length > 0) {
      const findPlayer = findmap?.teamAndLeague?.find((curPlayer: { league: { id: any; }; team: { id: any; }; }) => curPlayer?.league?.id === currentPlayer?.player?.leagueId && curPlayer?.team?.id === currentPlayer?.player?.teamId)
      const arrayData = findmap?.teamAndLeague ? [...findmap?.teamAndLeague] : [];
      if (!findPlayer) {
        arrayData.push({
          league: currentPlayer?.player?.league,
          team: currentPlayer?.player?.team,
        })
      }
      updatedDisplayPlayers.push({
        ...currentPlayer,
        mapPlayer: arrayData,
      })
    } else {
      updatedDisplayPlayers.push({
        ...currentPlayer,
        mapPlayer: [{
          league: currentPlayer?.player?.league,
          team: currentPlayer?.player?.team,
        }],
      })
    }
  });
  return (
    <Layout title="Players" page={LayoutPages.players}>
      <>
        <div className="w-[calc((w-screen)-(w-1/5)) overflow-hidden flex flex-row-reverse justify-between pb-4 pt-2">
          <div className="flex flex-row-reverse pl-4">
            {
              userRole == "admin" && (<button type="button" className="min-w-[188px] transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                onClick={() => setAddPlayers(true)}
              >
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mr-2" viewBox="0 0 512.000000 512.000000"
                  preserveAspectRatio="xMidYMid meet">
                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                    fill="#ffffff" stroke="none">
                    <path d="M2478 4905 c-61 -23 -106 -63 -133 -120 l-26 -53 -1 -1311 c0 -721
-3 -1311 -6 -1310 -4 0 -110 164 -237 365 -126 201 -245 383 -264 405 -49 58
-103 83 -181 84 -55 0 -74 -5 -120 -31 -97 -54 -145 -164 -117 -269 18 -69
940 -1522 1004 -1583 61 -57 131 -78 208 -62 101 21 117 41 373 440 128 201
312 490 410 642 97 153 210 329 249 390 104 162 117 207 88 306 -52 175 -292
227 -411 90 -16 -19 -135 -201 -264 -405 l-235 -370 -5 1311 c-3 763 -9 1319
-14 1331 -24 52 -71 107 -112 131 -55 32 -150 41 -206 19z"/>
                    <path d="M516 3504 c-179 -44 -328 -194 -371 -375 -22 -96 -22 -2442 0 -2538
44 -183 193 -332 376 -376 56 -13 312 -15 2039 -15 1727 0 1983 2 2039 15 183
43 333 193 376 376 22 96 22 2442 0 2538 -45 191 -206 344 -400 381 -40 7
-166 10 -371 8 -309 -3 -311 -3 -346 -27 -128 -88 -113 -269 27 -332 36 -17
71 -19 335 -19 275 0 297 -1 327 -20 67 -41 63 44 63 -1260 0 -1304 4 -1219
-63 -1260 -31 -20 -66 -20 -1985 -20 -2158 0 -1991 -5 -2032 63 -19 31 -20 59
-20 1217 0 1171 0 1185 20 1218 36 59 57 62 382 62 277 0 294 1 336 21 66 32
97 86 97 169 0 76 -22 119 -83 161 l-35 24 -326 2 c-256 1 -339 -1 -385 -13z"/>
                  </g>
                </svg>

                Import Players
              </button>)
            }
            <button type="button" className="min-w-[188px] transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
              onClick={() => setAddUpdatePlayer(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon w-7 h-7 mr-2" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176" /></svg>
              Add a Player
            </button>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <div className="flex relative m-2 w-full">
              <input
                type="text"
                className=" w-full block py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
                placeholder="Search"
                onChange={onSearch}
                value={searchKey}
                onKeyDown={onKeyPress}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex self-center">
            <div className="border border-gray-30"
              style={{
                borderRadius: '8px',
                height: '42px',
                color: 'grey',
              }}>
              <select
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
                {leaguesQuery?.getLeagues?.code === 200 &&
                  leaguesQuery?.getLeagues?.data?.map((league: any) => (
                    <option key={league?._id} value={league?._id}>
                      {league?.name}
                    </option>
                  ))}
              </select>
            </div>
            <div
              className="border border-gray-30 ml-4"

              style={{
                borderRadius: '8px',
                height: '42px',
                color: 'grey',
              }}>
              <select
                name="teamId"
                id="teamId"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                style={{
                  borderRadius: '8px',
                  padding: '8px',
                }}
              >
                <option>Select a team</option>
                <option>UnAssigned</option>
                {teamsQuery?.getTeams?.code === 200 &&
                  teamsQuery?.getTeams?.data?.map((team: any) => {
                    if (team?.league?._id === leagueId){
                    return (
                    <option key={team?._id} value={team?._id}>
                      {team?.name}
                    </option>
                  )
}
})}
              </select>
            </div>
          </div>
        </div>
        <div style={{
          maxHeight: 'calc(100vh - 270px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
          <table className="app-table w-full">
            <thead className="w-full sticky top-0 z-20">
              <THR>
                <>
                  <TH></TH>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Shirt Number</TH>
                  <TH>Rank</TH>
                  <TH>Team</TH>
                  <TH>League</TH>
                  <TH>Active</TH>
                  <TH>Actions</TH>
                </>
              </THR>
            </thead>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <tbody className="w-full" ref={provided.innerRef} {...provided.droppableProps}>
                    {updatedDisplayPlayers?.map((player: any, prevIndex: number) => (
                      player?.mapPlayer?.map((current: any, index: number) => (
                        <>
                          {index === 0 && (<Draggable
                            key={player._id}
                            draggableId={player._id}
                            index={prevIndex}
                            isDragDisabled={selectedIds.includes(teamId)}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'dragging w-full bg-white odd:bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-100' : 'w-full bg-white odd:bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-100'}
                              >
                                <>
                                  <TD>
                                    <>
                                      {player?.mapPlayer?.length > 1 ? (<button
                                        className="text-white px-4 py-2 rounded"
                                        onClick={() => setIsOpen(isOpen?.length > 0 ? '' : player._id)}
                                      >
                                        {isOpen === player._id ? <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z" /></svg> : <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" /></svg>}
                                      </button>) : <></>}
                                    </>
                                  </TD>
                                  <TD>
                                    <>
                                      {player?.firstName}&nbsp;{player?.lastName}
                                    </>
                                  </TD>
                                  <TD>{player?.login?.email}</TD>
                                  <TD>{player?.player?.shirtNumber}</TD>
                                  <TD>{player?.player?.rank}</TD>
                                  <TD>{current?.team?.name}</TD>
                                  <TD>{current?.league?.name}</TD>
                                  <TD>{player?.active ? "Yes" : "No"}</TD>
                                  <TD>
                                    <div className="flex item-center justify-center">
                                      <div className="relative">
                                        {/* <button
                                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                          onClick={() => toggleMenu(`${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`)}
                                        >
                                          <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                        </button>
                                        {(isOpenAction === `${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`) && (
                                          <div ref={ref} className="z-20 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                              <a onClick={() => {
                                                setUpdatePlayer({
                                                  ...player,
                                                  player: {
                                                    ...player?.player,
                                                    league: {
                                                      _id: current?.league?.id,
                                                      name: current?.league?.name,
                                                    },
                                                    team: {
                                                      _id: current?.team?.id,
                                                      name: current?.team?.name,
                                                    },
                                                  },

                                                });
                                                setAddUpdatePlayer(true);
                                                setIsOpenAction('');
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                              {userRole === 'admin' && (<><a onClick={() => {
                                                onDelete({
                                                  ...player,
                                                  player: {
                                                    ...player?.player,
                                                    league: {
                                                      _id: current?.league?.id,
                                                      name: current?.league?.name,
                                                    },
                                                    team: {
                                                      _id: current?.team?.id,
                                                      name: current?.team?.name,
                                                    },
                                                  },

                                                }, index);
                                                setIsOpenAction('');
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                                <a
                                                  onClick={() => {
                                                    setUpdatePlayer({
                                                      ...player,
                                                      player: {
                                                        ...player?.player,
                                                        league: {
                                                          _id: current?.league?.id,
                                                          name: current?.league?.name,
                                                        },
                                                        team: {
                                                          _id: current?.team?.id,
                                                          name: current?.team?.name,
                                                        },
                                                      },

                                                    });
                                                    setAddUpdatePlayer(true);
                                                    setIsOpenAction('');
                                                    setAddInAnotherLeague(true);
                                                  }}
                                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Add in Another League</a></>)}
                                            </div>
                                          </div>
                                        )} */}
                                        <>
                                          <Menu handler={() => setIsOpenAction(isOpenAction?.length > 0 ? '' : `${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`)}
                                            open={`${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}` === isOpenAction}>
                                            <MenuHandler>
                                              <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                            </MenuHandler>
                                            <MenuList>
                                              <MenuItem onClick={() => {
                                                setUpdatePlayer({
                                                  ...player,
                                                  player: {
                                                    ...player?.player,
                                                    league: {
                                                      _id: current?.league?.id,
                                                      name: current?.league?.name,
                                                    },
                                                    team: {
                                                      _id: current?.team?.id,
                                                      name: current?.team?.name,
                                                    },
                                                  },

                                                });
                                                setAddUpdatePlayer(true);
                                                setIsOpenAction('');
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Edit</MenuItem>
                                              {userRole === 'admin' && (<><MenuItem onClick={() => {
                                                onDelete({
                                                  ...player,
                                                  player: {
                                                    ...player?.player,
                                                    league: {
                                                      _id: current?.league?.id,
                                                      name: current?.league?.name,
                                                    },
                                                    team: {
                                                      _id: current?.team?.id,
                                                      name: current?.team?.name,
                                                    },
                                                  },

                                                });
                                                setIsOpenAction('');
                                              }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Delete</MenuItem></>)}
                                              <MenuItem onClick={() => {
                                                setUpdatePlayer({
                                                  ...player,
                                                  player: {
                                                    ...player?.player,
                                                    league: {
                                                      _id: current?.league?.id,
                                                      name: current?.league?.name,
                                                    },
                                                    team: {
                                                      _id: current?.team?.id,
                                                      name: current?.team?.name,
                                                    },
                                                  },

                                                });
                                                setAddUpdatePlayer(true);
                                                setIsOpenAction('');
                                                setAddInAnotherLeague(true);
                                              }}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Add In Other League</MenuItem>
                                            </MenuList>
                                          </Menu>
                                        </>
                                      </div>
                                    </div>

                                  </TD>
                                </>
                              </tr>
                            )}
                          </Draggable>)}
                          {isOpen === player._id && index > 0 && (
                            <tr>
                              <>
                                <TD><></></TD>
                                <TD>
                                  <>
                                  </>
                                </TD>
                                <TD>{player?.login?.email}</TD>
                                <TD>{player?.player?.shirtNumber}</TD>
                                <TD>{player?.player?.rank}</TD>
                                <TD>{current?.team?.name}</TD>
                                <TD>{current?.league?.name}</TD>
                                <TD>{player?.active ? "Yes" : "No"}</TD>
                                <TD>
                                  <div className="flex item-center justify-center">
                                    <div className="relative">
                                      {/* <button
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={() => toggleMenu(`${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`)}
                                      >
                                        <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                      </button>
                                      {(isOpenAction === `${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`) && (
                                        <div ref={ref} className="z-20 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                            <a onClick={() => {
                                              setUpdatePlayer({
                                                ...player,
                                                player: {
                                                  ...player?.player,
                                                  league: {
                                                    _id: current?.league?.id,
                                                    name: current?.league?.name,
                                                  },
                                                  team: {
                                                    _id: current?.team?.id,
                                                    name: current?.team?.name,
                                                  },
                                                },

                                              });
                                              setAddUpdatePlayer(true);
                                              setIsOpenAction('');
                                            }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                            {userRole === 'admin' && (<><a onClick={() => {
                                              onDelete({
                                                ...player,
                                                player: {
                                                  ...player?.player,
                                                  league: {
                                                    _id: current?.league?.id,
                                                    name: current?.league?.name,
                                                  },
                                                  team: {
                                                    _id: current?.team?.id,
                                                    name: current?.team?.name,
                                                  },
                                                },

                                              }, index);
                                              setIsOpenAction('');
                                            }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                              <a
                                                onClick={() => {
                                                  setUpdatePlayer({
                                                    ...player,
                                                    player: {
                                                      ...player?.player,
                                                      league: {
                                                        _id: current?.league?.id,
                                                        name: current?.league?.name,
                                                      },
                                                      team: {
                                                        _id: current?.team?.id,
                                                        name: current?.team?.name,
                                                      },
                                                    },

                                                  });
                                                  setAddUpdatePlayer(true);
                                                  setIsOpenAction('');
                                                  setAddInAnotherLeague(true);
                                                }}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Add in Another League</a>
                                            </>)}
                                          </div>
                                        </div>
                                      )} */}
                                      <Menu
                                        handler={() => setIsOpenAction(isOpenAction?.length > 0 ? '' : `${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}`)}
                                        open={`${player?._id}-${current?.team?.id}-${current?.league?.id}-${index}` === isOpenAction}
                                      >
                                        <MenuHandler>
                                          <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                        </MenuHandler>
                                        <MenuList>
                                          <MenuItem onClick={() => {
                                            setUpdatePlayer({
                                              ...player,
                                              player: {
                                                ...player?.player,
                                                league: {
                                                  _id: current?.league?.id,
                                                  name: current?.league?.name,
                                                },
                                                team: {
                                                  _id: current?.team?.id,
                                                  name: current?.team?.name,
                                                },
                                              },

                                            });
                                            setAddUpdatePlayer(true);
                                            setIsOpenAction('');
                                          }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Edit</MenuItem>
                                          {userRole === 'admin' && (<><MenuItem onClick={() => {
                                            onDelete({
                                              ...player,
                                              player: {
                                                ...player?.player,
                                                league: {
                                                  _id: current?.league?.id,
                                                  name: current?.league?.name,
                                                },
                                                team: {
                                                  _id: current?.team?.id,
                                                  name: current?.team?.name,
                                                },
                                              },

                                            });
                                            setIsOpenAction('');
                                          }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Delete</MenuItem></>)}
                                          <MenuItem onClick={() => {
                                            setUpdatePlayer({
                                              ...player,
                                              player: {
                                                ...player?.player,
                                                league: {
                                                  _id: current?.league?.id,
                                                  name: current?.league?.name,
                                                },
                                                team: {
                                                  _id: current?.team?.id,
                                                  name: current?.team?.name,
                                                },
                                              },

                                            });
                                            setAddUpdatePlayer(true);
                                            setIsOpenAction('');
                                            setAddInAnotherLeague(true);
                                          }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Add In Other League</MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </div>
                                  </div>
                                </TD>
                              </>
                            </tr>
                          )}
                        </>
                      ))))}
                    {provided.placeholder}
                  </tbody>
                )
                }
              </Droppable >
            </DragDropContext >

          </table >
        </div>
        {addUpdatePlayer && (
          <AddUpdatePlayer
            key={uuidv4()}
            onSuccess={onAddUpdatePlayer}
            player={updatePlayer}
            onClose={onAddUpdatePlayerClose}
            data={data?.getPlayers?.data}
            addInAnotherLeague={addInAnotherLeague}
            userRole={userRole}
            userID={userID}
          />
        )}

        {
          addPlayers && (
            <AddPlayers
              onSuccess={onAddUpdatePlayer}
              onClose={() => setAddPlayers(false)}
              data={data?.getPlayers?.data}
              userID={userID}
              userRole={userRole}
            />
          )
        }
{showLoader && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
        <div className="loader border-4 border-gray-300 border-t-red-500 rounded-full h-10 w-10 animate-spin"></div>
      </div>
      )}
      </>
    </Layout >
  );
}
