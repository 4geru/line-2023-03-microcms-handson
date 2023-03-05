import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { LiffContext } from "./_app";
import { createMicrocmsClient } from "../lib/microcmsClient";
import { createRandomUser, createUser } from "../lib/createDummyStaff"
import { deleteReservation, getReservations } from "../lib/useReservations"
import { useState, useContext } from 'react';

export default function Home({ _staffs, serviceDomain, apiKey }) {
  const user = useContext(LiffContext);
  const [staffs, setStaff] = useState(_staffs)
  const [reservations, setReservation] = useState([])
  const microcmsClient = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey
  })

  // reference: https://document.microcms.io/content-api/get-list-contents#hf768a2fd4d
  microcmsClient.get({
    endpoint: "reservations",
    queries: { limit: 20, filters: `lineId[equals]${user.profile?.userId}` }
  }).then((data) => {
    setReservation(data.contents)
  })

  return (
    <Layout home>
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
      <button onClick={() => {
        const params = new URLSearchParams({
          message: 'こんばんわ。Node.js v18 Fetch APIでLINE Notify API を使ってみました。 from api',
        });
        fetch("/api/send_notify?" + params.toString())
        console.log('send message to line')
      }}>
        mew
      </button>

      <div>
        <ul>
        {reservations.map((reservation) => (
            <li key={reservation.id}>
              <Link href={`/reservations/${reservation.id}`}>
                {reservation.staffId?.staffName}: {reservation.reservationAt}: {reservation.lineId}
              </Link>
              <button onClick={() => {
                deleteReservation(microcmsClient, reservation);
              }}>create random user</button>
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