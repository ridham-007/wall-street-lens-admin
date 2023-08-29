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
import { Modal } from "@/components/model";

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

  const [addUpdateParameter, setAddUpdateParameter] = useState(false);
  const [addUpdateQuarter, setAddUpdateQuarter] = useState(false)

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


  const onAddUpdateParameter = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };
  const onAddUpdateParameterClose = () => {
    setAddUpdateParameter(false);
    setAddUpdateQuarter(false)
  };

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
    <Layout title="Players" page={LayoutPages.vihicle_capacity}>
      <>

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
    region: "",
    modal: "",
    capacity: "",
    operationType: "",
    selectedQuarter: 'Q1'
  })
  const handleOnSave = () => {
    props.onClose && props.onClose()
    console.log(val);

  };

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
              id="unit"
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
    console.log(val);
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