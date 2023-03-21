import Head from 'next/head'
import Image from 'next/image'
import Script from 'next/script'

import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import { Link } from '@mui/material';

export const siteTitle = 'Next.js Sample Website'
import { dateToString } from '../lib/util'

export default function Layout({ children, home, user, previousReservations }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
        onLoad={() =>
          console.log(`script loaded correctly, window.FB has been populated`)
        }
      />
      <header className={styles.header}>
        {home && user && (
          <>
            <Image
              priority
              src={user.pictureUrl}
              className={utilStyles.borderCircle}
              height={144}
              width={144}
              alt={user.displayName}
            />
            <h1 className={utilStyles.headingMd}>{user.displayName}</h1>
            <p className={utilStyles.lightText}>
              こんにちは、{user.displayName}さん、しげサロンへようこそ！<br/>

              {
                previousReservations.length != 0 ?
                <>
                  来店ポイント {previousReservations.length} pt です。
                  前回の来店は {dateToString(previousReservations[0].reservationAt)} です。
                </> :
                `はじめまして、お客様に合った最高のヘアスタイルをご提供できるよう、スタッフ一同心よりお待ちしております。`
              }
              <br/>
              <br />
            </p>
          </>
        )}
      </header>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
      <main>{children}</main>
    </div>
  )
}
