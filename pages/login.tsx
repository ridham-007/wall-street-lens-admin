import { LoginService } from "@/utils/login";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Below change is temporary, will be updated with token once user module implemented
  const onLogin = () => {
    if (email === 'admin@test.com' && password === 'test') {
      LoginService.saveUser({ email, password });
      window.location.href = "/financial_summary";
    }

  };

  useEffect(() => {
    LoginService.deleteToken();
    LoginService.deleteUser();
  }, []);

  const onKeyPress = (event: any) => {
    if (event?.key === "Enter") {
      onLogin();
    }
  };
  return (
    <>
      <Head>
        <title>Login | Wall Street Lens</title>
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
        <div className="flex flex-col h-screen justify-center items-center">
          <div className="w-1/3 border rounded p-4 shadow-xl bg-[#F6F8FA]">
            <h1 className="text-3xl text-center font-bold p-2">Login</h1>
            <div className="p-4 w-full">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKeyPress}
              />
            </div>

            <div className="px-4 py-2 w-full">
              <input
                type="password"
                name="email"
                id="email"
                placeholder="Password"
                className="w-full p-2 border rounded"
                value={password}
                onKeyDown={onKeyPress}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className=" p-1 text-center">
              <button
                className="w-1/3 rounded p-2 bg-slate-500 hover:bg-slate-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 text-white mt-4 font-bold transform transition duration-300 hover:scale-110"
                onClick={() => onLogin()}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
