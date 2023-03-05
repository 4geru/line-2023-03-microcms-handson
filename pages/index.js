import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { LiffContext } from "./_app";
import { createMicrocmsClient } from "../lib/microcmsClient";
import { createRandomUser, createUser } from "../lib/createDummyStaff"
import { deleteReservation } from "../lib/useReservations"
import { useState, useContext, useEffect } from 'react';
import { lineNotify } from '../lib/lineNotify'

export default function Home({ _staffs, serviceDomain, apiKey }) {
  const user = useContext(LiffContext);
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
      queries: { limit: 20, filters: `lineId[equals]${user.profile?.userId}` }
    }).then((data) => {
      setReservation(data.contents)
    })  
  }, [reservations])

  return (
    <Layout home user={user.profile}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div>
        <ul>
          {staffs.map((staff) => (
            <li key={staff.id}>
              <Link href={`/staffs/${staff.id}`}>{staff.staffName}</Link>
              <button
                onClick={() => {
                  if(!confirm("Do you delete this staff?"))return;
                  microcmsClient
                    .delete({
                      endpoint: 'staffs',
                      contentId: staff.id,
                    })
                    .catch((err) => console.error(err));
                  const newStaffs = staffs.filter((_staff) => _staff.id != staff.id)
                  setStaff(newStaffs)
                }}
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={() => {
        const user = createRandomUser()
        createUser(microcmsClient, (res) => {
          setStaff([{ id: res.id, ...user }, ...staffs])
        }, user);
      }}>create random user</button>

      <div>
        <ul>
        {reservations.map((reservation) => (
            <li key={reservation.id}>
              <Link href={`/reservations/${reservation.id}`}>
                {reservation.staff?.staffName}: {(new Date(reservation.reservationAt).toLocaleString())}
              </Link>
              <button onClick={() => {
                deleteReservation(microcmsClient, reservation, () => {
                  const date = new Date(reservation.reservationAt).toLocaleString()
                  const staffName = reservation.staff.staffName;
                  const message = `${staffName}さん：${reservation.userName}様の${date}からの予約削除がされました。`
                  lineNotify(message)  
                });
              }}>delete reservation</button>
            </li>
          ))}
        </ul>
      </div>
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