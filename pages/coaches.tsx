import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { gql, useQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import AddUpdateCoach from "@/components/coaches/add-update-coach";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";


const COACHES = gql`
  query GetCoaches {
    getCoaches {
      code
      success
      message
      data {
        _id
        firstName
        lastName
        role
        login {
          email
          password
        }
        active
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
        coach {
          team {
            name
            _id
            league {
              _id
              name
            }
          }
        }
      }
    }
  }
`;

const TEAMS = gql`
  query GetTeams {
    getTeams {
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
    }
  }
`;

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

export default function CoachesPage() {

  const leaguesQuery = useQuery(LEAGUE_DROPDOWN);

  const [isOpen, setIsOpen] = useState('');
  const [addUpdateCoach, setAddUpdateCoach] = useState(false);
  const [updateCoach, setUpdateCoach] = useState(null);
  const [searchKey, setSearchKey] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [filteredCoaches, setFilteredCoachs] = useState<any[]>([]);
  const [allCoachData, setAllCoachData] = useState<{ coach: { team: { name: any; _id: any; league: any; }; }; _id: any; firstName: any; lastName: any; }[]>([]);
  const { data, error, loading, refetch } = useQuery(COACHES);
  const { data: teamsData, error: teamError, loading: teamLoading, refetch: teamRefetch } = useQuery(TEAMS);
  const router = useRouter();
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

  useEffect(() => {
    refetch();
    teamRefetch();
  }, [router.asPath])
  useEffect(() => {
    const coachData = data?.getCoaches?.data;
    const teamsQueryData = teamsData?.getTeams?.data;
    if (coachData && teamsQueryData) {
      const coachesData: ((prevState: never[]) => never[]) | { coach: { team: { name: any; _id: any; league: any; }; }; _id: any; firstName: any; lastName: any; }[] = [];
      coachData?.forEach((current: {
        coach: { team: { name: any; _id: any; league: any; }; }; _id: any; firstName: any; lastName: any;
      }) => {
        let count = 0;
        teamsQueryData?.forEach((cur: {
          name: any;
          _id: any;
          league: any; coach: { _id: any; };
        }) => {
          if (cur?.coach?._id === current?._id) {
            count++;
            coachesData.push({
              ...current,
              coach: {
                team: {
                  name: cur?.name,
                  _id: cur?._id,
                  league: cur?.league,
                },
              }
            })
          }
        });
        if (count === 0) {
          coachesData.push({
            ...current,
          });
        }
      })
      setAllCoachData(coachesData)
    }
  }, [data, teamsData])

  const filteredData = (key: string) => {
    const filteredCoach = allCoachData.filter((coach: any) => {
      const coachName = (`${coach.firstName} ${coach.lastName}`).toLocaleLowerCase();
      return coachName.includes(key.toLocaleLowerCase());
    });
    return filteredCoach;
  }

  const onAddUpdateCoach = () => {
    setUpdateCoach(null);
    setAddUpdateCoach(false);
    window.location.href = "/coaches";
  };

  const onAddUpdateCoachClose = () => {
    setUpdateCoach(null);
    setAddUpdateCoach(false);
  };

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value)
      setFilteredCoachs(filteredData(event.target.value));
    }
  }

  const toggleMenu = (coachId: SetStateAction<string>) => {
    if (isOpenAction?.length > 0) {
      setIsOpenAction('');
    } else {
      setIsOpenAction(coachId);
    }
  };

  const getCoachesForDisplay = () => {
    if (searchKey !== "") {
      return filteredCoaches;
    } else {
      return allCoachData;
    }
  }

  const tabaleData = getCoachesForDisplay()?.filter(filt => leagueId?.length > 0 && leagueId !== 'Select a league' ? filt?.coach?.team?.league?._id === leagueId : true);

  const groupedData = Object.values(tabaleData?.reduce((acc, curr) => {
    if (!acc[curr._id]) {
      acc[curr._id] = { coachId: curr._id, mappedArray: [] };
    }
    acc[curr._id].mappedArray.push(curr);
    return acc;
  }, {}));

  return (
    <Layout title="Coaches" page={LayoutPages.coaches}>
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
                      {leaguesQuery?.data?.getLeagues?.code === 200 &&
                        leaguesQuery?.data?.getLeagues?.data?.map((league: any) => (
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
          <div className="flex pl-4">
            <button type="button" className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 dark:hover:shadow-black/30 text-white bg-slate-700 dark:divide-gray-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
              onClick={() => setAddUpdateCoach(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon w-7 h-7 mr-2" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176" /></svg>
              Add a Coach
            </button>
          </div>
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
                  <TH>Email</TH>
                  <TH>Team</TH>
                  <TH>League</TH>
                  <TH>Active</TH>
                  <TH>Actions</TH>
                </>
              </THR>
            </thead>

            <tbody className="w-full shadow-lg">
              {groupedData?.map((current: any) => (
                current?.mappedArray?.map((coach: any, index: number) => (
                  <>
                    {index === 0 && (<TDR
                      key={`${current?.coachId}`}
                    >
                      <>
                        <TD>
                          {current?.mappedArray?.length > 1 ? (<button
                            className="text-white px-4 py-2 rounded"
                            onClick={() => setIsOpen(isOpen?.length === 0 ? `${current?.coachId}` : '')}
                          >
                            {isOpen === `${current?.coachId}` ? <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z" /></svg> : <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" /></svg>}
                          </button>) : <></>}
                        </TD>
                        <TD>
                          <>
                            {coach?.firstName}&nbsp;{coach?.lastName}
                          </>
                        </TD>
                        <TD>{coach?.login?.email}</TD>
                        <TD>{coach?.coach?.team?.name}</TD>
                        <TD>{coach?.coach?.team?.league?.name}</TD>
                        <TD>{coach?.active ? "Yes" : "No"}</TD>
                        <TD>
                          <div className="flex item-center justify-center">
                            <div className="relative">
                              {/* <button
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => toggleMenu(`${coach?._id}-${coach?.coach?.team?.name}-${coach?.coach?.team?.league?.name}`)}
                              >
                                <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                              </button>
                              {(isOpenAction === `${coach?._id}-${coach?.coach?.team?.name}-${coach?.coach?.team?.league?.name}`) && (
                                <div ref={ref} className="z-20 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <a onClick={() => {
                                      setUpdateCoach(coach);
                                      setAddUpdateCoach(true);
                                      setIsOpenAction('');
                                    }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                  </div>
                                </div>
                              )} */}
                              <Menu>
                                <MenuHandler>
                                  <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                </MenuHandler>
                                <MenuList>
                                  <MenuItem onClick={() => {
                                    setUpdateCoach(coach);
                                    setAddUpdateCoach(true);
                                    setIsOpenAction('');
                                  }} className="block px-4 text-sm text-gray-700 cursor-pointer">Edit</MenuItem>
                                </MenuList>
                              </Menu>
                            </div>
                          </div>
                        </TD>
                      </>
                    </TDR>)}
                    {isOpen === `${current?.coachId}` && index > 0 && (
                      <>
                        <TDR
                          key={`${coach?._id}-${coach?.coach?.team?._id}-${coach?.coach?.team?.league?._id}`}
                        >
                          <>
                            <TD>
                              <></>
                            </TD>
                            <TD>
                              <>
                              </>
                            </TD>
                            <TD>{coach?.login?.email}</TD>
                            <TD>{coach?.coach?.team?.name}</TD>
                            <TD>{coach?.coach?.team?.league?.name}</TD>
                            <TD>{coach?.active ? "Yes" : "No"}</TD>
                            <TD>
                              <div className="flex item-center justify-center">
                                <div className="relative">
                                  {/* <button
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => toggleMenu(`${coach?._id}-${coach?.coach?.team?.name}-${coach?.coach?.team?.league?.name}`)}
                                  >
                                    <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                  </button>
                                  {(isOpenAction === `${coach?._id}-${coach?.coach?.team?.name}-${coach?.coach?.team?.league?.name}`) && (
                                    <div ref={ref} className="z-20 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <a onClick={() => {
                                          setUpdateCoach(coach);
                                          setAddUpdateCoach(true);
                                          setIsOpenAction('');
                                        }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                      </div>
                                    </div>
                                  )} */}
                                  <Menu>
                                    <MenuHandler>
                                      <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                    </MenuHandler>
                                    <MenuList>
                                      <MenuItem onClick={() => {
                                        setUpdateCoach(coach);
                                        setAddUpdateCoach(true);
                                        setIsOpenAction('');
                                      }} className="block px-4 text-sm text-gray-700 cursor-pointer">Edit</MenuItem>
                                    </MenuList>
                                  </Menu>
                                </div>
                              </div>
                            </TD>
                          </>
                        </TDR>
                      </>
                    )}
                  </>
                ))
              ))
              }

            </tbody>
          </table>
        </div>

        {
          addUpdateCoach && (
            <AddUpdateCoach
              data={data?.getCoaches?.data}
              onSuccess={onAddUpdateCoach}
              coach={updateCoach}
              key={uuidv4()}
              onClose={onAddUpdateCoachClose}
            ></AddUpdateCoach>
          )
        }
      </>
    </Layout >
  );
}
