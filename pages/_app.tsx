import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { appConfig } from "@/config/app";
import { LoginService } from "@/utils/login";
import { UserContext } from "@/config/auth";
import { useEffect, useState } from "react";

/**
 * Login info
 */

/**
 * GraphQL Client
 */

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState(null);
  const [mounted] = useState(true);

  const [client, setClient] = useState<any>(
    new ApolloClient({
      uri: appConfig.serverGraph,
      cache: new InMemoryCache(),
    })
  );

  useEffect(() => {
    const user = LoginService.getUser();
    const token = LoginService.getToken();

    const client = new ApolloClient({
      uri: appConfig.serverGraph,
      cache: new InMemoryCache(),
      headers: {
        authorization: token ? `bearer ${token}` : "",
      },
    });

    setUser(user);
    setClient(client);
  }, [mounted]);

  return mounted && user ? (
    <ApolloProvider client={client}>
      <UserContext.Provider value={user}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </ApolloProvider>
  ) : (
    <ApolloProvider client={client}>
      <Component {...pageProps}></Component>
    </ApolloProvider>
  );
}
