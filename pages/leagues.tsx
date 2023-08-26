import { SetStateAction, useEffect, useRef, useState, } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import { Modal } from "@/components/model";
import { gql, useMutation, useLazyQuery } from "@apollo/client";
import { TD, TDR, TH, THR } from "@/components/table";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { LoginService } from "@/utils/login"; import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";

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

export default function LeaguesPage() {
  const [addUpdateLeague, setAddUpdateLeague] = useState(false);
  const [updateLeague, setUpdateLeague] = useState(null);
  const [searchKey, setSearchKey] = useState('');
  const [filteredLeagues, setFilteredLeagues] = useState<any[]>([]);
  const [allLeaguesData, setAllLeaguesData] = useState<any[]>([]);
  const [isOpenAction, setIsOpenAction] = useState('');
  const [userID, setUserData] = useState('');
  const [userRole, setUserRole] = useState('');


  const [getLeaguesData, { data, error, loading, refetch }] = useLazyQuery(LEAGUES,
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
    getLeaguesData()
  }, [userID]);

  const router = useRouter();
  const onAddUpdateLeague = () => {
    setUpdateLeague(null);
    setAddUpdateLeague(false);
    refetch();
  };

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
    setAllLeaguesData(data?.getLeagues?.data ?? []);
  }, [data]);

  const onAddUpdateLeagueClose = () => {
    setUpdateLeague(null);
    setAddUpdateLeague(false);
  };


  const filteredData = (key: string) => {
    const filteredLeague = allLeaguesData.filter((league: any) => {
      const leagueName = `${league.name}`.toLocaleLowerCase();
      return leagueName.includes(key.toLocaleLowerCase());
    });
    return filteredLeague;
  }

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setSearchKey(event.target.value)
      setFilteredLeagues(filteredData(event.target.value));
    }
  }

  const toggleMenu = (teamId: SetStateAction<string>) => {
    if (isOpenAction?.length > 0) {
      setIsOpenAction('');
    } else {
      setIsOpenAction(teamId);
    }
  };

  const toggleMatch = (leagueId: SetStateAction<string>) => {
    window.location.href = "/teams?leagueId=" + leagueId;
  }

  const getLeaguesForDisplay = () => {
    if (searchKey !== "") {
      return filteredLeagues;
    } else {
      return allLeaguesData;
    }
  }

  return (
    <Layout title="Leagues" page={LayoutPages.leagues}>
      <>
        <div className="w-[calc((w-screen)-(w-1/5)) overflow-hidden flex justify-between pb-4 pt-2">
          <div className="relative w-1/2">
            <div className="relative  m-2">
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
          {
            userRole == "admin" && (<div className="flex flex-row-reverse pl-4">
              <button type="button" className="transform hover:bg-slate-800 transition duration-300 hover:scale-110 text-white bg-slate-700 dark:divide-gray-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-md px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                onClick={() => setAddUpdateLeague(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="ionicon w-7 h-7 mr-2" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 176v160M336 256H176" /></svg>
                Add a League
              </button>
            </div>)
          }
        </div>

        <div style={{
          maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
          <table className="app-table w-full">
            <thead className="w-full sticky top-0 z-20">
              <THR>
                <>
                  <TH>Name</TH>
                  <TH>Start Date</TH>
                  <TH>End Date</TH>
                  <TH>Player Limit</TH>
                  <TH>Active</TH>
                  <TH>Actions</TH>
                </>
              </THR>
            </thead>

            <tbody className="w-full">
              {getLeaguesForDisplay().map((league: any) => (
                <TDR key={league?._id}>
                  <>
                    <TD>{league?.name}</TD>
                    <TD>{new Date(league?.startDate).toDateString()}</TD>
                    <TD>{new Date(league?.endDate).toDateString()}</TD>
                    <TD>{league?.playerLimit}</TD>
                    <TD>{league?.active ? "Yes" : "No"}</TD>
                    <TD>
                      {
                        userRole === 'admin' ?
                          <div className="flex item-center justify-center">
                            <div className="relative">
                              <>
                                <Menu>
                                  <MenuHandler>
                                    <Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" variant="gradient"><svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg></Button>
                                  </MenuHandler>
                                  <MenuList>
                                    <MenuItem onClick={() => {
                                      setUpdateLeague(league);
                                      setAddUpdateLeague(true);
                                      setIsOpenAction('')
                                    }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">Edit</MenuItem>
                                    <MenuItem onClick={() =>
                                      toggleMatch(league?._id)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">View Teams</MenuItem>
                                  </MenuList>
                                </Menu>
                              </>
                            </div>
                          </div>
                          :
                          <div className="flex item-center justify-center">
                            <div className="relative">
                              <button
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => toggleMatch(league?._id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5" viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet">
                                  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    fill="#000000" stroke="none">
                                    <path d="M1635 4940 c-210 -70 -295 -264 -282 -640 8 -217 44 -365 135 -545
91 -183 186 -299 412 -500 98 -88 116 -110 159 -190 27 -49 76 -132 110 -183
l61 -92 -75 -187 c-41 -103 -75 -198 -75 -211 0 -12 11 -34 25 -47 l24 -25
431 0 431 0 24 25 c14 13 25 35 25 47 0 13 -34 108 -75 211 l-75 187 61 92
c34 51 83 134 110 184 43 79 61 101 153 182 222 198 327 324 419 507 92 184
137 378 137 590 0 213 -35 373 -100 464 -71 97 -207 158 -329 148 -81 -7 -135
-29 -243 -101 l-83 -56 -454 0 -455 0 -91 60 c-117 77 -154 91 -245 96 -57 3
-90 -1 -135 -16z m190 -154 c18 -8 67 -37 109 -65 59 -40 77 -58 84 -85 22
-78 45 -186 41 -189 -2 -2 -80 -34 -174 -71 -171 -67 -205 -89 -205 -131 0
-77 103 -522 165 -710 11 -34 -72 64 -136 159 -99 147 -155 285 -184 450 -30
172 -12 444 34 534 52 101 169 148 266 108z m1608 3 c47 -13 102 -60 127 -110
57 -111 66 -433 17 -620 -44 -169 -118 -314 -233 -457 -36 -46 -68 -82 -70
-80 -2 2 17 71 42 153 42 138 124 517 124 570 0 42 -34 64 -205 131 -93 37
-172 69 -174 71 -4 3 19 111 41 189 7 27 25 45 84 85 120 80 162 92 247 68z
m-515 -229 l-20 -80 -338 0 -338 0 -20 80 -20 80 378 0 378 0 -20 -80z m-284
-412 c86 -26 166 -136 166 -228 0 -124 -116 -240 -240 -240 -124 0 -240 116
-240 240 0 63 23 114 75 165 70 71 145 90 239 63z m166 -708 l0 -80 -240 0
-240 0 0 80 0 80 240 0 240 0 0 -80z m-11 -827 c24 -60 45 -114 48 -120 4 -10
-55 -13 -277 -13 -222 0 -281 3 -277 13 3 6 24 60 48 120 l42 107 187 0 187 0
42 -107z"/>
                                    <path d="M2505 3975 c-50 -49 -15 -135 55 -135 19 0 40 9 55 25 16 15 25 36
25 55 0 19 -9 40 -25 55 -15 16 -36 25 -55 25 -19 0 -40 -9 -55 -25z"/>
                                    <path d="M1305 2855 l-25 -24 0 -376 0 -375 -295 0 -296 0 -24 -25 c-25 -24
-25 -27 -25 -200 l0 -175 80 0 80 0 0 120 0 120 520 0 520 0 0 -120 0 -120 80
0 80 0 0 175 c0 173 0 176 -25 200 l-24 25 -256 0 -255 0 0 320 0 320 280 0
280 0 0 80 0 80 -335 0 -336 0 -24 -25z"/>
                                    <path d="M3120 2800 l0 -80 280 0 280 0 0 -320 0 -320 -255 0 -256 0 -24 -25
c-25 -24 -25 -27 -25 -200 l0 -175 80 0 80 0 0 120 0 120 520 0 520 0 0 -120
0 -120 80 0 80 0 0 175 c0 173 0 176 -25 200 l-24 25 -296 0 -295 0 0 375 0
376 -25 24 -24 25 -336 0 -335 0 0 -80z"/>
                                    <path d="M485 1434 c-116 -47 -217 -93 -226 -104 -25 -29 -53 -260 -46 -378
15 -256 108 -433 354 -675 159 -156 147 -156 310 6 146 143 208 222 262 332
84 170 107 342 76 566 -12 83 -24 137 -34 149 -18 22 -435 190 -466 189 -11 0
-114 -39 -230 -85z m405 -147 l155 -63 13 -74 c21 -119 11 -267 -26 -373 -43
-125 -83 -187 -204 -311 l-108 -111 -107 110 c-121 124 -171 201 -209 320 -32
99 -41 254 -22 365 l13 74 155 63 c85 34 162 62 170 62 8 0 85 -28 170 -62z"/>
                                    <path d="M1685 1434 c-115 -47 -217 -93 -226 -104 -10 -12 -22 -66 -34 -149
-37 -267 3 -466 132 -665 25 -39 108 -133 187 -213 183 -186 167 -185 328 -25
143 140 213 229 268 339 83 166 106 338 75 564 -12 83 -24 137 -34 149 -18 22
-435 190 -466 189 -11 0 -114 -39 -230 -85z m405 -147 l155 -63 13 -74 c19
-111 10 -266 -22 -365 -38 -119 -88 -196 -208 -320 l-108 -110 -107 110 c-121
124 -171 201 -209 320 -32 99 -41 254 -22 365 l13 74 155 63 c85 34 162 62
170 62 8 0 85 -28 170 -62z"/>
                                    <path d="M2965 1433 c-115 -46 -216 -91 -224 -99 -20 -18 -50 -216 -50 -329
-1 -171 51 -344 146 -489 26 -39 110 -135 188 -214 182 -185 166 -184 327 -24
248 243 340 418 355 674 7 118 -21 349 -46 378 -18 22 -435 190 -466 189 -11
0 -114 -39 -230 -86z m405 -146 l155 -63 13 -74 c21 -119 11 -267 -26 -373
-43 -125 -83 -187 -204 -311 l-108 -111 -107 110 c-121 124 -171 201 -209 320
-32 99 -41 254 -22 365 l13 74 155 63 c85 34 162 62 170 62 8 0 85 -28 170
-62z"/>
                                    <path d="M4165 1433 c-115 -46 -216 -91 -224 -99 -20 -18 -50 -216 -50 -329
-1 -171 51 -344 146 -489 26 -39 110 -135 187 -214 187 -188 166 -188 351 0
78 79 162 176 189 216 94 142 147 320 145 491 0 110 -31 307 -50 325 -19 19
-438 186 -464 185 -11 0 -114 -39 -230 -86z m405 -146 l155 -63 13 -74 c21
-117 10 -269 -26 -374 -43 -124 -83 -186 -204 -310 l-108 -111 -107 111 c-122
124 -162 186 -205 311 -37 106 -47 254 -26 373 l13 74 155 63 c85 34 162 62
170 62 8 0 85 -28 170 -62z"/>
                                  </g>
                                </svg>
                              </button>
                            </div>
                          </div>
                      }

                    </TD>
                  </>
                </TDR>
              ))}
            </tbody>
          </table>
        </div>

        {addUpdateLeague && (
          <AddUpdateLeague
            onSuccess={onAddUpdateLeague}
            league={updateLeague}
            onClose={onAddUpdateLeagueClose}
          ></AddUpdateLeague>
        )}
      </>
    </Layout>
  );
}

const ADD_UPDATE_LEAGUE = gql`
  mutation CreateOrUpdateLeague(
    $name: String!
    $startDate: DateTime!
    $endDate: DateTime!
    $playerLimit: Int!
    $active: Boolean!
    $id: String
  ) {
    createOrUpdateLeague(
      name: $name
      startDate: $startDate
      endDate: $endDate
      playerLimit: $playerLimit
      active: $active
      id: $id
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

interface AddUpdateLeagueOnSuccess {
  (id: string): void;
}

interface AddUpdateLeagueOnClose {
  (): void;
}

interface AddUpdateLeagueProps {
  league?: any;
  onSuccess?: AddUpdateLeagueOnSuccess;
  onClose?: AddUpdateLeagueOnClose;
}

function AddUpdateLeague(props: AddUpdateLeagueProps) {
  const date = format(new Date(), "yyy-MM-dd");
  const [name, setName] = useState(props?.league?.name || "");

  const [startDate, setStartDate] = useState(
    props?.league
      ? format(new Date(props?.league.startDate), "yyy-MM-dd")
      : date
  );

  const [endDate, setEndDate] = useState(
    props?.league ? format(new Date(props?.league.endDate), "yyy-MM-dd") : date
  );

  const [playerLimit, setPlayerLimit] = useState(
    props?.league ? props?.league?.playerLimit : 2
  );

  const [active, setActive] = useState(
    props?.league ? props?.league?.active + "" : "true"
  );

  const [addUpdateLeague, { data, error, loading }] = useMutation(
    ADD_UPDATE_LEAGUE,
    {
      variables: {
        name,
        startDate,
        endDate,
        playerLimit,
        active: active === "true" ? true : false,
        id: props?.league?._id,
      },
    }
  );

  useEffect(() => {

    if (data?.createOrUpdateLeague?.code === 200) {
      props?.onSuccess &&
        props.onSuccess(data?.createOrUpdateLeague?.data?._id);
    }
  }, [data, error]);

  return (
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
                placeholder="League Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3 my-2">
            <label htmlFor="endDate" className="font-bold">
              End Date
            </label>

            <div>
              <input
                type="date"
                name="endDate"
                id="endDate"
                placeholder="End Date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3 my-2">
            <label htmlFor="playerLimit" className="font-bold">
              Player Limit
            </label>

            <div>
              <input
                type="number"
                name="playerLimit"
                id="playerLimit"
                min={2}
                placeholder="Player Limit"
                value={playerLimit}
                onChange={(e) => setPlayerLimit(Number(e.target.value))}
              />
            </div>
          </div>

          {props?.league && (
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
          {props?.league ? (
            <button
              className="transform hover:bg-slate-800 transition duration-300 hover:scale-95 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
              type="button"
              onClick={() => addUpdateLeague()}
            >
              Update League
            </button>
          ) : (
            <button
              className="transform hover:bg-slate-800 transition duration-300 hover:scale-95 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
              type="button"
              onClick={() => addUpdateLeague()}
            >
              Add League
            </button>
          )}

          <button onClick={props.onClose} className="transform hover:bg-red-600 transition duration-300 hover:scale-95 text-white bg-red-500 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center mr-2 mb-2">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
