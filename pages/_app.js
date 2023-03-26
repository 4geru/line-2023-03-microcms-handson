import "../styles/global.css";
import { useEffect, useState, createContext } from "react";

export const LiffContext = createContext({});

export default function App({ Component, pageProps }) {
  // [liffObject, profile]
  const [[liffObject, profile], setLiffState] = useState([null, null]);
  useEffect(() => {
    if (!pageProps.liffId) return;
    import("@line/liff").then((liff) => {
      liff
        .init({ liffId: pageProps.liffId })
        .then(() => {
          if (liff.isLoggedIn()) {
            // プロフィール情報の取得をする
            liff
              .getProfile()
              .then((profile) => {
                setLiffState([liff, profile])
              })
              .catch((err) => {
                console.warn({ err })
              })
          } else {
            setLiffState([liff, null]);
          }
        })
        .catch((err) => {
          console.warn({ err });
        });
    });
  }, []);
  return (
    <LiffContext.Provider
      value={{
        liffObject: liffObject,
        profile: profile,
        setLiffState: setLiffState,
      }}
    >
      <Component {...pageProps} />
    </LiffContext.Provider>
  );
}
