import Head from 'next/head'
import Image from 'next/image'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { LiffContext } from "./_app";
import { createMicrocmsClient } from "../lib/microcmsClient";
import { createRandomStaff, createStaff } from "../lib/useStaff"
import { deleteReservation } from "../lib/useReservations"
import { useState, useContext, useEffect } from 'react';
import { List, ListItem, IconButton, Button, Container, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { lineNotify } from "../lib/lineNotify";
import styles from '../components/layout.module.css'
import utilStyles from '../styles/utils.module.css'
import { getPreviousReservations, dateToString } from "../lib/util";

export default function Home({ _staffs, serviceDomain, apiKey }) {
  const { liffObject: liff, profile, setLiffState } = useContext(LiffContext);

  const [staffs, setStaff] = useState(_staffs)
  const [reservations, setReservation] = useState([])
  const [snackMessage, setSnackMessage] = useState(undefined)

  const microcmsClient = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey
  })
  // reference: https://document.microcms.io/content-api/get-list-contents#hf768a2fd4d
  useEffect(() => {
    microcmsClient.get({
      endpoint: "reservations",
      queries: { limit: 20, filters: `lineId[equals]${profile?.userId}`, orders: '-reservationAt' },
    }).then((data) => {
      setReservation(data.contents)
    })
  }, [profile])

  const previousReservations = getPreviousReservations(reservations)

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      {profile && (
        <header className={styles.header}>
          <Image
            priority
            src={profile.pictureUrl}
            className={utilStyles.borderCircle}
            height={144}
            width={144}
            alt={profile.displayName}
          />
          <h1 className={utilStyles.headingMd}>{profile.displayName}</h1>
          <p className={utilStyles.lightText}>
            こんにちは、{profile.displayName}さん、しげサロンへようこそ！<br/>

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
        </header>
      )}
      <Container sx={{ marginBottom: 5 }}>
        <h2>スタッフ一覧</h2>
        <List>
          {staffs.map((staff) => (
            <ListItem
              key={staff.id}
              secondaryAction={
                <IconButton
                  onClick={() => {
                    // workshop: deleteStaff を追加しましょう
                    if(!confirm("スタッフを削除しますか？"))return;
                    microcmsClient
                      .delete({
                        endpoint: 'staffs',
                        contentId: staff.id,
                      })
                      .then(() => {
                        const newStaffs = staffs.filter((_staff) => _staff.id != staff.id)
                        setStaff(newStaffs)
                        setSnackMessage(`${staff.staffName}を削除しました`)
                      })
                      .catch((err) => console.error(err));
                  }}
                  aria-label=""
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Link href={`/staffs?id=${staff.id}`}>{staff.staffName}</Link>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          onClick={() => {
            const staff = createRandomStaff()
            createStaff(microcmsClient, (res) => {
              setStaff([{ id: res.id, ...staff }, ...staffs])
            }, staff);
            setSnackMessage(`${staff.staffName}を追加しました`)
          }}
        >
          ハンズオン用にmicroCMS上に新規スタッフ作成
        </Button>
      </Container>

      <Container>
        { profile ?
          <Button
            variant="contained"
            color='error'
            onClick={() => {
              liff.logout()
              setLiffState([liff, null])
            }}
          >ログアウト</Button> :
          <Button
            variant="contained"
            onClick={() => {
              liff.login({})
            }}
          >ログイン</Button>
        }
      </Container>

      { /* ログイン済み */
        profile && <Container>
          <h2>予約一覧</h2>
          <List>
            {reservations.map((reservation) => (
              <ListItem
                key={reservation.id}
                secondaryAction={
                  <IconButton
                    onClick={() => {
                      deleteReservation(microcmsClient, reservation, () => {
                        const date = dateToString(reservation.reservationAt)
                        const staffName = reservation.staff.staffName;
                        const message = `${staffName}さん：${reservation.userName}様の${date}からの予約削除がされました。`
                        const userMessage = `${date}からの予約削除がされました。`
                        lineNotify(message);
                        setSnackMessage(userMessage);
                        const _reservations = reservations.filter((e) => e !== reservation)
                        setReservation(_reservations)
                      });
                    }}
                    aria-label=""
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <Link href={`/reservations?id=${reservation.id}`}>
                  {reservation.staff?.staffName}: {dateToString(reservation.reservationAt)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Container>
      }

      {
        <Snackbar
          open={!!snackMessage}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Alert onClose={()=>{setSnackMessage(undefined)}} severity="success">
            {snackMessage}
          </Alert>
        </Snackbar>
      }
    </Layout>
  )
}

// データをテンプレートに受け渡す部分の処理を記述します
export const getStaticProps = async () => {
  const client = createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });
  const staffsData = await client.get({ endpoint: "staffs" });

  return {
    props: {
      _staffs: staffsData.contents,
      serviceDomain: process.env.SERVICE_DOMAIN,
      apiKey: process.env.MICROCMS_API_KEY,
      liffId: process.env.LIFF_ID
    },
  };
};