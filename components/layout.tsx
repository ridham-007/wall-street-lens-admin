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
  "seo_settings" = "seo_settings",
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

  const [isOpenAction, setIsOpenAction] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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
    router.push(`${router.pathname}?company=${props.company}`);
  }, [props.company]);

  const handleOnChange = (event: {
    target: { value: SetStateAction<string>; name: string };
  }) => {
    switch (event.target.name) {
      case 'company':
        props.setCompany(event.target.value);
        break;
    }
  };

  let selectedSubIndustry;

  if (
    props.companies?.getCompanies?.length &&
    props.subIndustries?.getSubIndustries?.length
  ) {
    const selectedCompany = props.companies?.getCompanies?.find(
      (cur: { id: number }) => cur.id === props.company
    );
    const subId = selectedCompany?.attributes?.subIndustries[0]?.id;
    selectedSubIndustry = props.subIndustries?.getSubIndustries?.find(
      (cur: { id: any }) => cur.id === subId
    );
  }

  const industryName = selectedSubIndustry?.attributes?.industry?.name;
  const subIndustryName = selectedSubIndustry?.attributes?.name;

  return (
    <>
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
          {props?.page !== LayoutPages.variables && (<div className="mr-auto flex gap-[15px]">
            <div className="flex gap-[20px] mr-[10px] items-center">
              <select
                id="quarter"
                name="company"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={props.company}
                onChange={handleOnChange}
              >
                <option value="">Select a option</option>
                <option value="TESLA">TESLA</option>
                {
                  props.companies?.getCompanies.map((ele: { id: readonly string[] | Key | null | undefined; attributes: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }; }) => {
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
          </div>)}
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
          <div className="w-1/6  border-r border-gray-200 pb-5 min-w-[185px]" >
            <div className="flex-1 py-4 space-y-1  divide-y divide-gray-200 dark:divide-gray-700">
              <Link href={`/variables?company=${props.company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.variables
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    className="mr-4 w-6 min-w-[22px] h-6"
                    width="25.000000pt" height="25.000000pt" viewBox="0 0 64.000000 64.000000"
                    preserveAspectRatio="xMidYMid meet">

                    <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)"
                      fill="#000000" stroke="none">
                      <path d="M122 624 c-30 -20 -30 -68 0 -88 30 -21 54 -20 78 4 25 25 25 55 0 80 -24 24 -48 25 -78 4z m54 -35 c10 -17 -13 -36 -27 -22 -12 12 -4 33 11 33 5 0 12 -5 16 -11z" />
                      <path d="M264 627 c-3 -8 -4 -34 -2 -58 l3 -44 55 0 55 0 0 55 0 55 -53 3 c-38 2 -54 -1 -58 -11z m76 -47 c0 -13 -7 -20 -20 -20 -13 0 -20 7 -20 20 0 13 7 20 20 20 13 0 20 -7 20 -20z" />
                      <path d="M446 593 c-35 -62 -30 -73 39 -73 37 0 57 4 61 13 6 18 -44 107 -61 107 -7 0 -25 -21 -39 -47z" />
                      <path d="M147 503 c-13 -12 -7 -40 11 -56 13 -12 37 -17 80 -17 48 0 62 -3 62 -15 0 -9 -9 -15 -25 -15 -18 0 -25 -5 -25 -20 0 -11 5 -20 10 -20 6 0 10 -16 10 -35 0 -28 -5 -37 -30 -50 -35 -18 -70 -81 -70 -125 0 -50 35 -107 80 -130 50 -25 90 -25 140 0 45 23 80 80 80 130 0 43 -34 106 -70 127 -24 14 -30 24 -30 50 0 18 5 33 10 33 6 0 10 9 10 20 0 15 -7 20 -25 20 -16 0 -25 6 -25 15 0 12 14 15 63 15 68 0 102 20 95 56 -5 26 -28 29 -35 5 -5 -18 -13 -21 -63 -21 -49 0 -58 3 -63 20 -3 11 -10 20 -17 20 -7 0 -14 -9 -17 -20 -5 -17 -14 -20 -63 -20 -49 0 -58 3 -63 20 -5 20 -18 26 -30 13z m183 -188 c0 -41 3 -47 40 -70 51 -32 52 -49 3 -41 -21 3 -57 9 -80 12 -50 8 -54 18 -15 36 23 11 27 20 30 61 4 60 22 62 22 2z m53 -148 c38 -2 47 -5 47 -20 0 -50 -58 -107 -110 -107 -56 0 -110 57 -110 116 l0 26 63 -7 c34 -4 83 -8 110 -8z" />
                    </g>
                  </svg>
                  Variables
                </button>
              </Link>
              <Link href={`/tabs?company=${props.company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.tabs
                    ? "bg-blue-600 border-l-4 border-2-l border-emerald-500 text-white"
                    : "bg-slate-50 text-black"
                    }`}
                >
                  <svg version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 128.000000 128.000000"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-5 h-6 min-w-[22px] mr-4">

                    <g transform="translate(0.000000,128.000000) scale(0.100000,-0.100000)"
                      fill="#000000" stroke="currentColor">
                      <path d="M332 1190 c-54 -33 -73 -74 -70 -155 3 -64 5 -70 26 -73 18 -3 23 2 28 27 l7 31 448 0 449 0 0 -240 c0 -185 -3 -248 -14 -275 -15 -35 -42 -55 -74 -55 -29 0 -49 -27 -35 -48 26 -41 130 3 163 69 19 35 20 59 20 325 0 267 -1 291 -20 328 -11 23 -35 51 -53 64 -33 22 -35 22 -438 22 -385 0 -405 -1 -437 -20z m850 -70 l33 -29 -442 -1 c-266 0 -443 4 -443 9 0 5 12 19 26 30 26 20 37 21 410 21 l384 0 32 -30z" />
                      <path d="M73 869 c-17 -11 -41 -39 -52 -63 -20 -40 -21 -60 -21 -332 0 -281 1 -290 23 -328 12 -22 38 -49 57 -60 33 -20 52 -21 420 -24 384 -3 385 -3 430 20 25 13 55 38 67 57 23 33 23 39 23 340 0 288 -1 308 -20 339 -11 18 -34 41 -52 52 -32 19 -51 20 -438 20 -391 0 -406 -1 -437 -21z m851 -60 c14 -11 26 -25 26 -30 0 -5 -176 -9 -440 -9 -433 0 -440 0 -428 19 7 11 21 24 33 30 12 6 170 10 401 10 371 1 382 0 408 -20z m36 -365 l0 -256 -29 -29 -29 -29 -387 0 c-258 0 -393 4 -407 11 -42 22 -48 63 -48 319 l0 240 450 0 450 0 0 -256z" />
                    </g>
                  </svg>
                  Tabs
                </button>
              </Link>
              <Link href={`/variable_details?company=${props.company}`}>
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
                    className="w-6 h-6 min-w-[22px] mr-4"
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
              <Link href={`/management_chart?company=${props.company}`}>
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
                    className="w-6 h-6 min-w-[22px] mr-4"
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
              <Link href={`/settings?company=${props.company}`}>
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
                    className="mr-4 w-6 min-w-[22px] h-6"
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
              <Link href={`/seo_settings?company=${props.company}`}>
                <button
                  className={`text-lg flex items-center text-left px-4 py-4 hover:bg-blue-400 active:bg-blue-600  w-full font-medium ${props?.page === LayoutPages.seo_settings
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
                    className="mr-4 w-6 min-w-[22px] h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                    />
                  </svg>
                  SEO Settings
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
