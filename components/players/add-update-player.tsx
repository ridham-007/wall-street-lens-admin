import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { Modal } from "../model";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

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
        leagueId
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
    $role: String
    $password: String
    $onLeagueOrTeamChange: Boolean
    $removedTeam: String
    $removedLeague: String
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
      role: $role
      password: $password
      onLeagueOrTeamChange: $onLeagueOrTeamChange
      removedTeam: $removedTeam
      removedLeague: $removedLeague
      id: $id
    ) {
      code
      data {
        _id
      }
    }
  }
`;

interface AddUpdatePlayerOnSuccess {
  (id: string): void;
}

interface AddUpdatePlayerOnClose {
  (): void;
}

interface AddUpdatePlayerProps {
  player?: any;
  onSuccess?: AddUpdatePlayerOnSuccess;
  onClose?: AddUpdatePlayerOnClose;
  data?: any,
  addInAnotherLeague?: Boolean;
  userRole?: any,
  userID?: any,
}

export default function AddUpdatePlayer(props: AddUpdatePlayerProps) {
  const leaguesQuery = useQuery(LEAGUE_DROPDOWN, {
    variables: { userId: props.userRole !== 'admin' && props.userRole !== 'player' ? props.userID : null },
  });
  const teamsQuery = useQuery(TEAM_DROPDOWN, {
    variables: { userId: props.userRole !== 'admin' && props.userRole !== 'player' ? props.userID : null },
  });

  const [email, setEmail] = useState(props?.player?.login?.email || "");
  const [firstName, setFirstName] = useState(props?.player?.firstName || "");
  const [lastName, setLastName] = useState(props?.player?.lastName || "");
  const [teamId, setTeamId] = useState(props?.player?.player?.team?._id || "UnAssigned");
  const [rank, setRank] = useState(props?.player?.player?.rank || 1);
  const [isCoach, setIsCoach] = useState(props?.player?.role === 'playerAndCoach');
  const [password, setPassword] = useState(props?.player?.login?.email || '');

  const [shirtNumber, setShirtNumber] = useState(
    props?.player?.player.shirtNumber || 1
  );

  const [leagueId, setLeagueId] = useState(
    props?.player?.player?.league?._id || 'UnAssigned'
  );

  const [active, setActive] = useState(
    props?.player ? props?.player?.active + "" : "true"
  );

  const [addUpdatePlayer, { data, error, loading }] = useMutation(
    ADD_UPDATE_LEAGUE,
    {
      variables: {
        firstName,
        lastName,
        shirtNumber,
        rank,
        leagueId,
        teamId: teamId === 'Select a team' ? 'UnAssigned' : teamId,
        active: active === "true" ? true : false,
        email,
        role: isCoach ? 'playerAndCoach' : 'player',
        password,
        onLeagueOrTeamChange: props?.player?.player?.league?._id !== leagueId || props?.player?.player?.team?._id !== teamId,
        removedTeam: props?.addInAnotherLeague ? '' : props?.player?.player?.team?._id,
        removedLeague: props?.addInAnotherLeague ? '' : props?.player?.player?.league?._id,
        id: props?.player?._id,
      },
    }
  );

  const handleAddPlayer = () => {
    let isPresent = false;
    let alreadyPresentInTheLeague = false;
    props?.data?.forEach((current: {
      _id: any;
      player: any; login: { email: any; };
    }) => {
      if (current?.login?.email === email) {
        isPresent = true
      }
      if (props?.player?._id !== current?._id && props?.player?.player?.league?.leagueId === current?.player?.leagueId) {
        alreadyPresentInTheLeague = current?.player?.teamId === teamId;
      }
    })

    if (isPresent && props?.player?.login?.email !== email) {
      toast('Email id is already registered.', { toastId: 'blockuser', hideProgressBar: false, autoClose: 7000, type: 'error' });
    } else if (alreadyPresentInTheLeague) {
      toast('Player is already present in the league in another team.', { toastId: 'blockuser', hideProgressBar: false, autoClose: 7000, type: 'error' });
    } else {
      addUpdatePlayer();
    }
  }

  useEffect(() => {
    if (data?.createOrUpdatePlayer?.code === 200) {
      props?.onSuccess &&
        props.onSuccess(data?.createOrUpdatePlayer?.data?._id);
    } else if (error) {
      console.log(JSON.parse(JSON.stringify(error)));
    }
  }, [data, error]);

  const updatedTeams = teamsQuery?.data?.getTeams?.data?.filter((current: { leagueId: any; }) => (current?.leagueId === leagueId))

  return (
    <>
      <Modal showModal={true} onClose={() => props.onClose && props.onClose()}>
        <form className="form w-100">
          <div className="flex flex-row flex-wrap">
            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="firstName" className="font-bold">
                First Name
              </label>

              <div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="lastName" className="font-bold">
                Last Name
              </label>

              <div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="email" className="font-bold">
                Email
              </label>

              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="shirtNumber" className="font-bold">
                Shirt Number
              </label>

              <div>
                <input
                  type="number"
                  name="shirtNumber"
                  id="shirtNumber"
                  placeholder="Shirt Number"
                  value={shirtNumber}
                  min="1"
                  onChange={(e) => setShirtNumber(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="rank" className="font-bold">
                Rank
              </label>

              <div>
                <input
                  type="number"
                  name="rank"
                  id="rank"
                  placeholder="Rank"
                  value={rank}
                  min="1"
                  onChange={(e) => setRank(Number(e.target.value))}
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
                  {leaguesQuery?.data?.getLeagues?.code === 200 &&
                    leaguesQuery?.data?.getLeagues?.data?.map((league: any) => (
                      <option key={league?._id} value={league?._id}>
                        {league?.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <label htmlFor="teamId" className="font-bold">
                Team
              </label>

              <div>
                <select
                  name="teamId"
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  <option>Select a team</option>
                  {
                    updatedTeams?.map((team: any) => (
                      <option key={team?._id} value={team?._id}>
                        {team?.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {props?.player && (
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

            {
              props.userRole === 'admin' && (<div className="fw-full md:w-1/2 lg:w-1/3 my-2">
                <input id="default-checkbox" type="checkbox" checked={isCoach} onChange={() => setIsCoach(!isCoach)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="default-checkbox" className="ml-2 font-bold text-black ">is Coach</label>
              </div>)
            }
            {
              isCoach && (
                <div className="w-full md:w-1/2 lg:w-1/3 my-2">
                  <label htmlFor="password" className="font-bold">
                    Password
                  </label>

                  <div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Password"
                      value={password}
                      minLength={6}
                      maxLength={16}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
          </div>

          <hr />

          <div className="my-2">
            {props?.player ? (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => handleAddPlayer()}
              >
                Update Player
              </button>
            ) : (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-22"
                type="button"
                onClick={() => handleAddPlayer()}
              >
                Add Player
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
