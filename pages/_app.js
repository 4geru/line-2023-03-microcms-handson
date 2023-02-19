import '../styles/global.css'
import { useEffect, useState, createContext } from 'react'

export const LiffContext = createContext([null, null]);

export default function App({ Component, pageProps }) {
  // [liffObject, profile]
  const [[liffObject, profile], setLiffState] = useState([null, null]);
  useEffect(() => {
    if(!pageProps.liffId)return;
    import('@line/liff').then((liff) => {
      liff
        .init({ liffId: pageProps.liffId })
        .then(() => {
          if (!liff.isLoggedIn()) {
            liff.login({})
          } else {
            liff
              .getProfile()
              .then((profile) => {
                setLiffState([liff, profile])
              })
              .catch((err) => {
                console.error({ err })
              })
          }
        })
        .catch((err) => {
          console.error({ err })
        })
    })
  }, [])
  return <LiffContext.Provider value={{liffObject: liffObject, profile: profile}}>
    <Component {...pageProps} />
  </LiffContext.Provider>
}
