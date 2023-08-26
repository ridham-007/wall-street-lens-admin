import { SetStateAction, useEffect, useRef, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import { format } from "date-fns";
import { MatchLink } from "@/components/matches/link";
import { v4 as uuidv4 } from 'uuid';
import { IMatch } from "@/types/match";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useRouter } from "next/router";
import { LoginService } from "@/utils/login";

const MATCHES = gql`
  query GetMatches(
    $userId: String
  ) {
    getMatches(
      userId: $userId
    ) {
      code
      success
      message
      data {
        _id
        active
        teamAId
        teamBId
        leagueId
        teamA {
          _id
          name
          active
          coachId
          coach {
            _id
            firstName
            lastName
            role
            player {
              shirtNumber
              rank
              leagueId
              teamId
              team {
                _id
                name
                active
                coachId
                leagueId
              }
            }
            login {
              email
              password
            }
            active
          }
          leagueId
          players {
            _id
            firstName
            lastName
            role
            active
          }
        }
        teamB {
          _id
          name
          active
          coachId
          leagueId
        }
        league {
          _id
          name
          startDate
          endDate
          active
          playerLimit
        }
        date
        location
        numberOfNets
        numberOfRounds
        netRange
        pairLimit
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
        coachId
        leagueId
      }
    }
  }
`;

export default function MatchesPage() {
  const [addUpdateMatch, setAddUpdateMatch] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userID, setUserData] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [getLeaguesData, { data: leaguesQuery }] = useLazyQuery(LEAGUE_DROPDOWN,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    });
  const [updateMatch, setUpdateMatch] = useState<any>(null);
  const [searchKey, setSearchKey] = useState('');
  const [isOpenAction, setIsOpenAction] = useState('');
  const [filteredMatchs, setFilteredMatchs] = useState<any[]>([]);
  const [allMatchsData, setAllMatchsData] = useState<any[]>([]);
  const router = useRouter();


  const [getMatchesData, { data, error, loading, refetch }] = useLazyQuery(MATCHES,
    {
      variables: { userId: userRole !== 'admin' && userRole !== 'player' ? userID : null },
    }
  );

  const [getTeamsData, { data: teamsData }] = useLazyQuery(TEAMS,
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
    getTeamsData();
    getMatchesData();
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
  //   // refetch();
  // }, [router.asPath])

  useEffect(() => {
    setAllMatchsData(data?.getMatches?.data ?? []);
  }, [data]);

  const onAddUpdateMatch = () => {
    setUpdateMatch(null);
    setAddUpdateMatch(false);
    refetch();
  };

  const onAddUpdateMatchClose = () => {
    setUpdateMatch(null);
    setAddUpdateMatch(false);
  };

  const filteredData = (key: string) => {

    const filteredMatchs = allMatchsData.filter((match: any) => {
      const MatchName = `${match.league.name}`.toLocaleLowerCase();
      const teamNames = `${match.teamA?.name + match.teamB?.name}`.toLocaleLowerCase(); 
      return MatchName.includes(key.toLocaleLowerCase()) || teamNames.includes(key.toLocaleLowerCase());
    });
    return filteredMatchs;
  }

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value)
      setFilteredMatchs(filteredData(event.target.value));
    }
  }
  const getMatchsForDisplay = () => {
    if (searchKey !== "") {
      return filteredMatchs;
    } else {
      return allMatchsData;
    }
  }


  return (
    <Layout title="Matches" page={LayoutPages.matches}>
      <>
        <div className="w-[calc((w-screen)-(w-1/5)) overflow-y-hidden flex justify-between pb-4 pt-2">
          <div className="relative w-1/2">
            <div className="relative m-2">
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
          <div className="border border-gray-30"
            style={{
              borderRadius: '8px',
              height: '42px',
              color: 'grey',
              marginTop: '8px',
            }}>
            <select
              name="leagueId"
              id="leagueId"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              style={{
                borderRadius: '8px',
                padding: '8px',
                width: '250px'
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
          {
            userRole == 'admin' && (<div className="flex pl-4">
              <button type="button" className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                onClick={() => setAddUpdateMatch(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="ionicon w-7 h-7 mr-2" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176" /></svg>
                Add a Match
              </button>
            </div>)
          }


        </div>

        <div style={{
          maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5))] overflow-scroll">
          <table className="app-table w-full">
            <thead className="w-full sticky top-0 z-20">
              <THR>
                <>
                  <TH>League</TH>
                  <TH>Team A</TH>
                  <TH>Team B</TH>
                  <TH>Date</TH>
                  <TH>Nets</TH>
                  <TH>Rounds</TH>
                  <TH>Pair Limit</TH>
                  <TH>Net Range</TH>
                  <TH>Active</TH>
                  <TH>Match Links</TH>
                  <TH>Actions</TH>
                </>
              </THR>
            </thead>

            <tbody className="w-full">
              {getMatchsForDisplay().map((match: any) => {
                if(leagueId?.length > 0){
                  if(match?.leagueId === leagueId){
                return(
                <TDR key={match?._id}>
                  <>
                    <TD>{match?.league?.name}</TD>
                    <TD>{match?.teamA?.name}</TD>
                    <TD>{match?.teamB?.name}</TD>
                    <TD>{new Date(match?.date).toDateString()}</TD>
                    <TD>{match?.numberOfNets}</TD>
                    <TD>{match?.numberOfRounds}</TD>
                    <TD>{match?.pairLimit}</TD>
                    <TD>{match?.netRange}</TD>
                    <TD>{match?.active ? "Yes" : "No"}</TD>
                    <TD>
                      <div>
                        {teamsData?.getTeams?.data?.find((current: {
                          leagueId: any; _id: any;
                        }) => current?._id === match?.teamAId && current?.leagueId === match?.leagueId) && (<MatchLink
                          matchId={match?._id}
                          teamId={match?.teamAId}
                          title={match?.teamA?.name}
                          label="Team A: "
                          marginEnable={false}
                        ></MatchLink>)}
                        <br />
                        {teamsData?.getTeams?.data?.find((current: {
                          leagueId: any; _id: any;
                        }) => current?._id === match?.teamBId && current?.leagueId === match?.leagueId) && (<MatchLink
                          matchId={match?._id}
                          teamId={match?.teamBId}
                          title={match?.teamB?.name}
                          label="Team B: "
                          marginEnable={true}
                        ></MatchLink>)}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex justify-center">
                        <button
                          className="bg-blue-500 text-white font-bold rounded bg-transparent"
                          onClick={() => {
                            setUpdateMatch(match);
                            setAddUpdateMatch(true);
                          }}
                        >
                          <svg color="green" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                        </button>
                      </div>
                    </TD>
                  </>
                </TDR>
              )
                        }
            } else {
                  return (
                    <TDR key={match?._id}>
                      <>
                        <TD>{match?.league?.name}</TD>
                        <TD>{match?.teamA?.name}</TD>
                        <TD>{match?.teamB?.name}</TD>
                        <TD>{new Date(match?.date).toDateString()}</TD>
                        <TD>{match?.numberOfNets}</TD>
                        <TD>{match?.numberOfRounds}</TD>
                        <TD>{match?.pairLimit}</TD>
                        <TD>{match?.netRange}</TD>
                        <TD>{match?.active ? "Yes" : "No"}</TD>
                        <TD>
                          <div>
                            {teamsData?.getTeams?.data?.find((current: {
                              leagueId: any; _id: any;
                            }) => current?._id === match?.teamAId && current?.leagueId === match?.leagueId) && (<MatchLink
                              matchId={match?._id}
                              teamId={match?.teamAId}
                              title={match?.teamA?.name}
                              label="Team A: "
                              marginEnable={false}
                            ></MatchLink>)}
                            <br />
                            {teamsData?.getTeams?.data?.find((current: {
                              leagueId: any; _id: any;
                            }) => current?._id === match?.teamBId && current?.leagueId === match?.leagueId) && (<MatchLink
                              matchId={match?._id}
                              teamId={match?.teamBId}
                              title={match?.teamB?.name}
                              label="Team B: "
                              marginEnable={true}
                            ></MatchLink>)}
                          </div>
                        </TD>
                        <TD>
                          <div className="flex justify-center">
                            <button
                              className="bg-blue-500 text-white font-bold rounded bg-transparent"
                              onClick={() => {
                                setUpdateMatch(match);
                                setAddUpdateMatch(true);
                              }}
                            >
                              <svg color="green" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                            </button>
                          </div>
                        </TD>
                      </>
                    </TDR>
                  )
              }})}
            </tbody>
          </table>
        </div>

        {
          addUpdateMatch && (
            <AddUpdateMatch
              key={uuidv4()}
              onSuccess={onAddUpdateMatch}
              match={updateMatch}
              onClose={onAddUpdateMatchClose}
            ></AddUpdateMatch>
          )
        }
      </>
    </Layout >
  );
}

const LEAGUES = gql`
  query GetLeagues {
    getLeagues {
      code
      success
      message
      data {
        _id
        name
        startDate
        endDate
      }
    }
  }
`;

const ADD_UPDATE_MATCHE = gql`
  mutation ImportPlayers(
    $teamAId: String!
    $teamBId: String!
    $leagueId: String!
    $date: DateTime!
    $location: String!
    $numberOfNets: Int!
    $numberOfRounds: Int!
    $netRange: Int!
    $pairLimit: Int!
    $active: Boolean!
    $id: String
  ) {
    createOrUpdateMatch(
      teamAId: $teamAId
      teamBId: $teamBId
      leagueId: $leagueId
      date: $date
      location: $location
      numberOfNets: $numberOfNets
      numberOfRounds: $numberOfRounds
      netRange: $netRange
      pairLimit: $pairLimit
      active: $active
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

interface AddUpdateMatchOnSuccess {
  (id: string): void;
}

interface AddUpdateMatchOnClose {
  (): void;
}

interface AddUpdateMatchProps {
  match?: IMatch | undefined;
  onSuccess?: AddUpdateMatchOnSuccess;
  onClose?: AddUpdateMatchOnClose;
}

function AddUpdateMatch(props: AddUpdateMatchProps) {
  const { data: leagues } = useQuery(LEAGUES);
  const { data: teams } = useQuery(TEAMS, { variables: props?.match?.leagueId || "" });

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // add leading zero to single-digit months
  const day = now.getDate().toString().padStart(2, '0'); // add leading zero to single-digit days
  const uperLimit = new Date();
  const lowerLimit = new Date();
  uperLimit.setDate(now.getDate() + 60);
  lowerLimit.setDate(now.getDate() - 60);
  const [minDate, setMinDate] = useState(format(lowerLimit, "yyyy-MM-dd"));
  const [maxDate, setMaxDate] = useState(format(uperLimit, "yyyy-MM-dd"));
  const [teamAId, setTeamAId] = useState(props?.match?.teamAId || "");
  const [teamBId, setTeamBId] = useState(props?.match?.teamBId || "");
  const [numberOfNets, setNumberOfNets] = useState(props?.match?.numberOfNets ?? 3);
  const [numberOfRounds, setNumberOfRounds] = useState(props?.match?.numberOfRounds ?? 4);
  const [location, setLocation] = useState(props?.match?.location || "");
  const [netRange, setNetRange] = useState(props?.match?.netRange ?? 3);
  const [pairLimit, setPairLimit] = useState(props.match?.pairLimit ?? 2);
  const [active, setActive] = useState(props.match?.active.toString() ?? "true");
  const matchDate = props.match?.date.toString().slice(0, 10);
  const [date, setDate] = useState(matchDate ?? `${year}-${month}-${day}`);
  const [leagueId, setLeagueId] = useState(props?.match?.leagueId || "");
  const [addUpdateMatch, { data, error, loading }] = useMutation(
    ADD_UPDATE_MATCHE,
    {
      variables: {
        name,
        date,
        teamAId,
        teamBId,
        leagueId,
        numberOfNets,
        numberOfRounds,
        netRange,
        pairLimit,
        location,
        active: active === "true" ? true : false,
        id: props?.match?._id,
      },
    }
  );

  useEffect(() => {

    if (data?.createOrUpdateMatch?.code === 200) {
      props?.onSuccess && props.onSuccess(data?.createOrUpdateMatch?.data?._id);
    }
  }, [data, error]);

  function addOrUpdateMatch() {
    const allTeams: Array<any> = teams?.getTeams?.data ?? [];
    const isTeamACoachExist = allTeams.find((cur) => cur._id == teamAId && cur?.coachId?.trim()?.length > 0);
    const isTeamBCoachExist = allTeams.find((cur) => cur._id == teamBId && cur?.coachId?.trim()?.length > 0);
    const teamAName = allTeams.find((cur) => cur._id == teamAId).name;
    const teamBName = allTeams.find((cur) => cur._id == teamBId).name;

    if (!isTeamACoachExist) {
      toast(`Coach is not Assigned to ${teamAName}`, { toastId: 'coachNotExist', hideProgressBar: false, autoClose: 7000, type: 'error' });
    } else if (!isTeamBCoachExist) {
      toast(`Coach is not Assigned to ${teamBName}`, { toastId: 'coachNotExist', hideProgressBar: false, autoClose: 7000, type: 'error' });
    } else {
      addUpdateMatch();
    }
  }

  const updatedTeams = teams?.getTeams?.data?.filter((current: { leagueId: string; }) => current?.leagueId === leagueId)
  return (
    <>
      <Modal showModal={true} onClose={() => props.onClose && props.onClose()}>
        <form className="form w-100">
          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="leagueId" className="font-bold">
                League
              </label>

              <div>
                <select
                  name="leagueId"
                  id="leagueId"
                  value={leagueId}
                  onChange={(e) => {
                    setLeagueId(e.target.value);
                    const league = leagues?.getLeagues?.data?.find(
                      (i: any) => i._id == e?.target?.value
                    );

                    // league &&
                    //   setMinDate(
                    //     format(new Date(league?.startDate), "yyyy-MM-dd")
                    //   );
                    // league &&
                    //   setMaxDate(format(new Date(league?.endDate), "yyyy-MM-dd"));
                  }}
                >
                  <option>Select a league</option>
                  {leagues?.getLeagues?.code === 200 &&
                    leagues?.getLeagues?.data?.map((league: any) => (
                      <option key={league?._id} value={league?._id}>
                        {league?.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="teamAId" className="font-bold">
                Team A
              </label>

              <div>
                <select
                  name="teamAId"
                  id="teamAId"
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                >
                  <option>Select Team A</option>
                  {teams?.getTeams?.code === 200 &&
                    updatedTeams?.map((team: any) =>
                      team._id != teamBId ? (
                        <option key={team?._id} value={team?._id}>
                          {team?.name}
                        </option>
                      ) : (
                        <></>
                      )
                    )}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="teamBId" className="font-bold">
                Team B
              </label>

              <div>
                <select
                  name="teamBId"
                  id="teamBId"
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                >
                  <option>Select Team B</option>
                  {teams?.getTeams?.code === 200 &&
                    updatedTeams?.map((team: any) =>
                      team._id != teamAId ? (
                        <option key={team?._id} value={team?._id}>
                          {team?.name}
                        </option>
                      ) : (
                        <></>
                      )
                    )}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="startDate" className="font-bold">
                Start Date
              </label>

              <div>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  placeholder="Start Date"
                  value={date}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="nets" className="font-bold">
                Nets
              </label>

              <div>
                <input
                  type="number"
                  name="nets"
                  id="nets"
                  min={1}
                  placeholder="Number of Nets"
                  value={numberOfNets}
                  onChange={(e) => setNumberOfNets(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="rounds" className="font-bold">
                Rounds
              </label>

              <div>
                <input
                  type="number"
                  name="rounds"
                  id="rounds"
                  min={1}
                  placeholder="Number of Rounds"
                  value={numberOfRounds}
                  onChange={(e) => setNumberOfRounds(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="pairLimit" className="font-bold">
                Pair Limit
              </label>

              <div>
                <input
                  type="number"
                  name="pairLimit"
                  id="pairLimit"
                  min={1}
                  placeholder="Pair Limit"
                  value={pairLimit}
                  onChange={(e) => setPairLimit(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="netRange" className="font-bold">
                Net Range
              </label>

              <div>
                <input
                  type="number"
                  name="netRange"
                  id="netRange"
                  min={1}
                  placeholder="Number of Net Range"
                  value={netRange}
                  onChange={(e) => setNetRange(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="location" className="font-bold">
                Location
              </label>

              <div>
                <input
                  type="text"
                  name="location"
                  id="location"
                  maxLength={255}
                  placeholder="Location of the match"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {props?.match && (
              <div className="w-full md:w-1/2 lg:w-1/3 my-2">
                <label htmlFor="playerLimit" className="font-bold">
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
            {props?.match ? (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => addOrUpdateMatch()}
              >
                Update Match
              </button>
            ) : (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => addOrUpdateMatch()}
              >
                Add Match
              </button>
            )}

            <button onClick={() => props?.onClose && props.onClose()} className="transform hover:bg-red-600 transition duration-300 hover:scale-105 text-white bg-red-500 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center mr-2 mb-2">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
}
