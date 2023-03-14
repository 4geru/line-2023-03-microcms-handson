import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { LiffContext } from "./_app";
import { createMicrocmsClient } from "../lib/microcmsClient";
import { createRandomUser, createUser } from "../lib/useStaff"
import { deleteReservation } from "../lib/useReservations"
import { useState, useContext, useEffect } from 'react';
import { List, ListItem, IconButton, Button, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { lineNotify } from "../lib/lineNotify";

export default function Home({ _staffs, serviceDomain, apiKey }) {
  const { liffObject: liff, profile, setLiffState } = useContext(LiffContext);
  const [staffs, setStaff] = useState(_staffs)
  const [reservations, setReservation] = useState([])
  const microcmsClient = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey
  })

  // reference: https://document.microcms.io/content-api/get-list-contents#hf768a2fd4d
  useEffect(() => {
    microcmsClient.get({
      endpoint: "reservations",
      queries: { limit: 20, filters: `lineId[equals]${profile?.userId}` }
    }).then((data) => {
      setReservation(data.contents)
    })  
  }, [reservations])

  return (
    <Layout home user={profile}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Container sx={{ marginBottom: 5 }}>
        <h2>スタッフ一覧</h2>
        <List>
          {staffs.map((staff) => (
            <ListItem
              key={staff.id}
              secondaryAction={
                <IconButton
                  onClick={() => {
                    if(!confirm("Do you delete this staff?"))return;
                    microcmsClient
                      .delete({
                        endpoint: 'staffs',
                        contentId: staff.id,
                      })
                      .then(() => {
                        const newStaffs = staffs.filter((_staff) => _staff.id != staff.id)
                        setStaff(newStaffs)
                      })
                      .catch((err) => console.error(err));
                  }}
                  aria-label=""
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Link href={`/staffs/${staff.id}`}>{staff.staffName}</Link>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          onClick={() => {
            const staff = createRandomUser()
            createUser(microcmsClient, (res) => {
              setStaff([{ id: res.id, ...staff }, ...staffs])
            }, staff);
          }}
        >
          スタッフの作成
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
                        const date = new Date(reservation.reservationAt).toLocaleString()
                        const staffName = reservation.staff.staffName;
                        const message = `${staffName}さん：${reservation.userName}様の${date}からの予約削除がされました。`
                        lineNotify(message);
                      });
                    }}
                    aria-label=""
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <Link href={`/reservations/${reservation.id}`}>
                  {reservation.staff?.staffName}: {(new Date(reservation.reservationAt).toLocaleString())}
                </Link>
              </ListItem>
            ))}
          </List>
        </Container>
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