import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { Modal } from "../model";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const ADD_UPDATE_COACH = gql`
  mutation SignupCoach(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $shirtNumber: Int
    $rank: Int
    $leagueId: String
    $teamId: String
    $role: String
    $id: String
  ) {
    signupCoach(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      shirtNumber: $shirtNumber
      rank: $rank
      leagueId: $leagueId
      teamId: $teamId
      role: $role
      id: $id
    ) {
      code
      data {
        _id
      }
    }
  }
`;

interface AddUpdateCoachOnSuccess {
  (id: string): void;
}

interface AddUpdateCoachOnClose {
  (): void;
}

interface AddUpdateCoachProps {
  coach?: any;
  onSuccess?: AddUpdateCoachOnSuccess;
  onClose?: AddUpdateCoachOnClose;
  data?: any;
}

export default function AddUpdateCoach(props: AddUpdateCoachProps) {

  const [email, setEmail] = useState(props?.coach?.login?.email || "");
  const [password, setPassword] = useState(props?.coach?.login?.password || "");
  const [firstName, setFirstName] = useState(props?.coach?.firstName || "");
  const [lastName, setLastName] = useState(props?.coach?.lastName || "");
  const [isPlayer, setIsPlayer] = useState(props?.coach?.role === 'playerAndCoach');

  const [active, setActive] = useState(
    props?.coach ? props?.coach?.active + "" : "true"
  );

  const [addUpdateCoach, { data, error, loading }] = useMutation(
    ADD_UPDATE_COACH,
    {
      variables: {
        firstName,
        lastName,
        email,
        password,
        leagueId: props?.coach?.coach?.team?.league?._id || '',
        teamId: props?.coach?.coach?.team?._id || '',
        role: isPlayer ? 'playerAndCoach' : 'coach',
        id: props?.coach?._id,
      },
    }
  );

  useEffect(() => {
    if (data?.signupCoach?.code === 200) {
      props?.onSuccess && props.onSuccess(data?.signupCoach?.data?._id);
    } else if (error) {
      console.log(JSON.parse(JSON.stringify(error)));
    }
  }, [props, data, error]);
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

            {props?.coach && (
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

            <div className="w-full md:w-1/2 lg:w-1/3 my-2">
              <input id="default-checkbox" type="checkbox" checked={isPlayer} onChange={() => setIsPlayer(!isPlayer)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
              <label htmlFor="default-checkbox" className="ml-2 font-bold text-black ">Mark as a Player</label>
            </div>
          </div>
          {/* {
            isPlayer && (
              <div className="flex flex-row flex-wrap">
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
              </div>
            )} */}
          <hr />

          <div className="my-2">
            {props?.coach ? (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => {
                  let isAlreadyAvailable = false;
                  if (email !== props?.coach?.login?.email) {
                    props?.data?.forEach((current: { login: { email: any; }; }) => {
                      if (!isAlreadyAvailable) {
                        isAlreadyAvailable = current?.login?.email === email;
                      }
                    })
                  }

                  if (isAlreadyAvailable) {
                    toast('Email is already registered.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else {
                    if (password?.length < 6) {
                      toast('Password can not be less than 6 characters.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                    } else {
                      addUpdateCoach();
                    }
                  }
                }}
              >
                Update Coach
              </button>
            ) : (
              <button
                className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                type="button"
                onClick={() => {
                  let isAlreadyAvailable = false;
                  props?.data?.forEach((current: { login: { email: any; }; }) => {
                    if (!isAlreadyAvailable) {
                      isAlreadyAvailable = current?.login?.email === email;
                    }
                  })

                  if (isAlreadyAvailable) {
                    toast('Email is already registered.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                  } else {
                    if (password?.length < 6) {
                      toast('Password can not be less than 6 characters.', { hideProgressBar: false, autoClose: 7000, type: 'error' });
                    } else {
                      addUpdateCoach();
                    }
                  }
                }}
              >
                Add Coach
              </button>
            )}

            <button onClick={props.onClose} className="transform hover:bg-red-600 transition duration-300 hover:scale-105 text-white bg-red-500 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center mr-2 mb-22">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
}
