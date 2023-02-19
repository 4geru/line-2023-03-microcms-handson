// reference
// https://nextjs.org/docs/authentication
// https://github.com/vercel/next.js/blob/70c087e4cf6188d5290b1fe32975b22e17b03b69/examples/with-iron-session/lib/useUser.ts

import { useEffect, useState } from 'react'
import Router from 'next/router'

export function useUser({
  liffId='',
  redirectTo = '',
  redirectIfFound = false,
} = {}) {
  const [liffObject, setLiffObject] = useState(null);
  const [profileName, setProfileName] = useState<string>('')
  const [pictureUrl, setPictureUrl] = useState<string>('')
  useEffect(() => {
    if(!liffId)return;
    import('@line/liff').then((liff: any) => {
      liff
        .init({ liffId: liffId })
        .then(() => {
          debugger
          if (!liff.isLoggedIn()) {
            liff.login({})
          } else {
            liff
              .getProfile()
              .then((profile: any) => {
                setProfileName(profile.displayName)
                setPictureUrl(profile.pictureUrl)
              })
              .catch((err: any) => {
                console.error({ err })
              })
          }
          setLiffObject(liff)
         
        })
        .catch((err) => {
          console.error({ err })
        })
    })
  }, [])

  const user = null;
  return { user, liffObject }
}
