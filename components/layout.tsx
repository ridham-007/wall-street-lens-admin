import Head from "next/head";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import {
  useContext,
  useEffect,
  useState,
  useRef,
  use,
  SetStateAction,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from "react";
import { UserContext } from "@/config/auth";
import Link from "next/link";
import { LoginService } from "@/utils/login";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import { GET_COMPANIES, GET_SUB_INDUSTRIES } from "@/utils/query";
import { LayoutProps } from "@/utils/data";
import Loader from "./loader";

export enum LayoutPages {
  "financial_summary" = "financial_summary",
  "operational_summary" = "operational_summary",
  "vihicle_capacity" = "vihicle_capacity",
  "outlook" = "outlook",
  "settings" = "settings",
  "variable_details" = "variable_details",
  "management_chart" = "management_chart",
  "variables" = "variables",
  "tabs" = "tabs",
}

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($password: String!) {
    updatePasswordByUserId(password: $password)
  }
`;

export default function Layout(props: LayoutProps) {
  let user: any = useContext(UserContext);
  const [showLoader, setShowLoader] = useState(false);

  const [getCompanies, { data: companies }] = useLazyQuery(GET_COMPANIES, {
    fetchPolicy: "network-only",
  });

  const [getSubIndustries, { data: subIndustries }] = useLazyQuery(
    GET_SUB_INDUSTRIES,
    {
      fetchPolicy: "network-only",
    }
  );

  const [isOpenAction, setIsOpenAction] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const [company, setCompany] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setShowLoader(true);
    getCompanies();
    getSubIndustries();
  }, []);

  const [updatePassword, { data }] = useMutation(CHANGE_PASSWORD, {
    variables: {
      password: newPassword,
    },
  });

  useEffect(() => {
    if (!!data) {
      toast("Password updated successfully!", {
        hideProgressBar: false,
        autoClose: 2000,
        type: "success",
      });
      setIsChangePassword(false);
    }
  }, [data]);

  useEffect(() => {
    const checkIfClickedOutside = (e: { target: any }) => {
      if (
        isOpenAction === true &&
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setIsOpenAction(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [isOpenAction]);

  useEffect(() => {
    try {
      user = LoginService.getUser();
      if (!user) {
        window.location.href = "/login";
      }
    } catch (err) {
      if (!user) window.location.href = "/login";
    }
  });

  useEffect(() => {
    setShowLoader(false);
    setCompany(companies?.getCompanies[0]?.id);
  }, [companies]);

  const logout = () => {
    LoginService.deleteToken();
    LoginService.deleteUser();
    window.location.href = "/login";
  };

  const handleOpen = () => {
    setIsOpenAction(true);
  };

  const onSubmit = () => {
    if (newPassword?.length < 6) {
      toast("Password length should not be less than 6", {
        hideProgressBar: false,
        autoClose: 7000,
        type: "error",
      });
    } else if (newPassword !== reEnterPassword) {
      toast("Re entered password is not same", {
        hideProgressBar: false,
        autoClose: 7000,
        type: "error",
      });
    } else {
      updatePassword();
    }
  };

  useEffect(() => {
    router.push(`${router.pathname}?company=${company}`);
  }, [company]);

  const handleOnChange = (event: {
    target: { value: SetStateAction<string>; name: string };
  }) => {
    switch (event.target.name) {
      case 'company':
        setCompany(Number(event.target.value));
        break;
    }
  };

  let selectedSubIndustry;

  if (
    companies?.getCompanies?.length &&
    subIndustries?.getSubIndustries?.length
  ) {
    const selectedCompany = companies?.getCompanies?.find(
      (cur: { id: number }) => cur.id === company
    );
    const subId = selectedCompany?.attributes?.subIndustries[0]?.id;
    selectedSubIndustry = subIndustries?.getSubIndustries?.find(
      (cur: { id: any }) => cur.id === subId
    );
  }

  const industryName = selectedSubIndustry?.attributes?.industry?.name;
  const subIndustryName = selectedSubIndustry?.attributes?.name;

  return (
    <>
      {showLoader && <Loader />}
      <Head>
        {props.title ? (
          <title>{`${props.title} | Admin | Wall Street Lens`}</title>
        ) : (
          <title>Admin | Wall Street Lens</title>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          className="flex items-center flex-row shadow-md overflow-hidden bg-white border-b border-gray-200 px-6 py-2 items-center justify-between"
          style={{ height: "10%" }}
        >
          <h1 className="text-3xl text-center font-normal p-2">
            Greetings | Wall Street Lens
          </h1>
          <div className="mr-auto flex gap-[15px]">
            <div className="flex gap-[20px] mr-[10px] items-center">
              <select
                id="quarter"
                name="company"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={company}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                {
                  companies?.getCompanies.map((ele: { id: readonly string[] | Key | null | undefined; attributes: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }; }) => {
                    return <option key={ele?.id?.toString()} value={ele?.id?.toString()}>{ele.attributes.name}</option>;
                  })
                }
              </select>
            </div>
            {industryName && (
              <div className="flex items-center mr-auto">
                <label
                  htmlFor="title"
                  className="text-sm mr-[10px] font-bold text-gray-700"
                >
                  Industry:
                </label>
                <div className="text-sm">{industryName}</div>
              </div>
            )}
            {subIndustryName && (
              <div className="flex items-center mr-auto">
                <label
                  htmlFor="title"
                  className="text-sm mr-[10px] font-bold text-gray-700"
                >
                  SubIndustry:
                </label>
                <div className="text-sm">{subIndustryName}</div>
              </div>
            )}
          </div>
          <div className="flex align-right items-center">
            <button onClick={handleOpen}>
              <svg
                enableBackground="new 0 0 64 64"
                className="h-9 w-9"
                version="1.1"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Layer_1">
                  <g>
                    <circle cx="32" cy="32" fill="#4F5D73" r="32" />
                  </g>
                  <g opacity="0.2">
                    <g>
                      <path
                        d="M43.905,47.543c-3.821-1.66-5.217-4.242-5.643-6.469c2.752-2.215,4.943-5.756,6.148-9.573     c1.239-1.579,1.96-3.226,1.96-4.62c0-0.955-0.347-1.646-0.955-2.158c-0.203-8.106-5.942-14.613-13.039-14.714     C32.322,10.009,32.268,10,32.213,10c-0.022,0-0.043,0.004-0.065,0.004c-7.052,0.039-12.783,6.41-13.125,14.409     c-0.884,0.528-1.394,1.305-1.394,2.469c0,1.641,0.992,3.63,2.663,5.448c1.187,3.327,3.118,6.38,5.5,8.438     c-0.354,2.292-1.699,5.039-5.697,6.776c-2.159,0.938-6.105,1.781-7.808,2.649c4.362,4.769,12.624,7.769,19.589,7.805l0.099,0.003     C31.983,57.999,31.992,58,32,58c7.014,0,15.325-3.01,19.713-7.808C50.01,49.324,46.063,48.481,43.905,47.543z"
                        fill="#231F20"
                      />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path
                        d="M43.905,45.543c-3.821-1.66-5.217-4.242-5.643-6.469c2.752-2.215,4.943-5.756,6.148-9.573     c1.239-1.579,1.96-3.226,1.96-4.62c0-0.955-0.347-1.646-0.955-2.158C45.213,14.618,39.474,8.11,32.378,8.01     C32.322,8.009,32.268,8,32.213,8c-0.022,0-0.043,0.004-0.065,0.004c-7.052,0.039-12.783,6.41-13.125,14.409     c-0.884,0.528-1.394,1.305-1.394,2.469c0,1.641,0.992,3.63,2.663,5.448c1.187,3.327,3.118,6.38,5.5,8.438     c-0.354,2.292-1.699,5.039-5.697,6.776c-2.159,0.938-6.105,1.781-7.808,2.649c4.362,4.769,12.624,7.769,19.589,7.805l0.099,0.003     C31.983,55.999,31.992,56,32,56c7.014,0,15.325-3.01,19.713-7.808C50.01,47.324,46.063,46.481,43.905,45.543z"
                        fill="#FFFFFF"
                      />
                    </g>
                  </g>
                </g>
                <g id="Layer_2" />
              </svg>
            </button>
            {isOpenAction && (
              <div
                ref={ref}
                className="w-full z-40 absolute right-5 top-[50px] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <div
                    onClick={() => {
                      setIsChangePassword(true);
                      setIsOpenAction(false);
                    }}
                    className="flex h-[60px] px-4 py-2 items-center text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  >
                    Change Password
                  </div>
                  <a
                    onClick={() => {
                      logout();
                    }}
                    className="flex h-[60px] px-4 py-2 items-center text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    role="menuitem"
                  >
                    <svg
                      className="svg-icon ml-1 mr-4"
                      style={{
                        width: "20px",
                        height: "20px",
                        verticalAlign: "middle",
                        fill: "red",
                        overflow: "hidden",
                      }}
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M768 106V184c97.2 76 160 194.8 160 328 0 229.6-186.4 416-416 416S96 741.6 96 512c0-133.2 62.8-251.6 160-328V106C121.6 190.8 32 341.2 32 512c0 265.2 214.8 480 480 480s480-214.8 480-480c0-170.8-89.6-321.2-224-406z"
                        fill=""
                      />
                      <path
                        d="M512 32c-17.6 0-32 14.4-32 32v448c0 17.6 14.4 32 32 32s32-14.4 32-32V64c0-17.6-14.4-32-32-32z"
                        fill=""
                      />
                    </svg>
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row overflow-auto" style={{ height: "90%" }}>
          <div className="w-1/6  border-r border-gray-200 pb-5">
            <div className="flex-1 py-4 space-y-1  divide-y divide-gray-200 dark:divide-gray-700">
              <Link href={`/variables?company=${company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.variables
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mr-4 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                    />
                  </svg>
                  Variables
                </button>
              </Link>
              <Link href={`/tabs?company=${company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.tabs
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mr-4 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                    />
                  </svg>
                  Tabs
                </button>
              </Link>
              <Link href={`/variable_details?company=${company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.variable_details
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 mr-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tab Quarters
                </button>
              </Link>
              <Link href={`/management_chart?company=${company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.management_chart
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 mr-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                    />
                  </svg>
                  Charts
                </button>
              </Link>
              <Link href={`/settings?company=${company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.settings
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mr-4 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                    />
                  </svg>
                  Settings
                </button>
              </Link>
            </div>
          </div>

          <div className="w-5/6">
            <div
              className="w-full pt-4 pb-6 pl-4 pr-4 overflow-auto shadow-lg"
              style={{ height: "100%" }}
            >
              {props.children}
            </div>
          </div>
        </div>
      </main>

      {isChangePassword ? (
        <>
          <div className="flex justify-center items-center bg-[#00000080] overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex  justify-between p-5 border-b border-solid border-gray-300 rounded-t items-center">
                  <h5 className="text-3xl font=semibold">Change Password</h5>
                  <button
                    className="bg-transparent border-0 text-black float-right"
                    onClick={() => setIsChangePassword(false)}
                  >
                    <span className="text-black opacity-7 h-6 w-6 text-xl">
                      <svg
                        className="w-6 h-6"
                        fill="#000000"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M16.707,8.707,13.414,12l3.293,3.293a1,1,0,1,1-1.414,1.414L12,13.414,8.707,16.707a1,1,0,1,1-1.414-1.414L10.586,12,7.293,8.707A1,1,0,1,1,8.707,7.293L12,10.586l3.293-3.293a1,1,0,1,1,1.414,1.414Z" />
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="relative p-6 flex flex-col">
                  <input
                    type="password"
                    placeholder="Enter New Password"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-[450px] p-2.5 mt-2.5 mb-2.5"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Re-Enter Password"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-[450px] p-2.5 mt-2.5 mb-2.5"
                    value={reEnterPassword}
                    onChange={(e) => setReEnterPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setIsChangePassword(false)}
                  >
                    Close
                  </button>
                  <button
                    className="transform hover:bg-slate-800 transition duration-300 hover:scale-105 text-white bg-slate-700 dark:divide-gray-70 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-6 py-3.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
                    type="button"
                    onClick={onSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <ToastContainer />
      <a
        style={{
          position: "fixed",
          left: 10,
          bottom: 7,
          color: "white",
        }}
        href="https://www.npmcode.com/"
        target="_blank"
        rel="noreferrer"
      >
        Powered By: NPMCODE LLC
      </a>
    </>
  );
}
