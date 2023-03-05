import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import styles from '../../components/staffLayout.module.css';
import { LiffContext } from "../_app";
import { useContext } from 'react'
import { createReservation } from "../../lib/useReservations";

export default function Staff({ staff, serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const user = useContext(LiffContext);
  var weekJp = ["日", "月", "火", "水", "木", "金", "土"];
  const reserve = (date, staffId) => {
    createReservation(client, {
      userName: user.profile.displayName,
      lineId: user.profile.userId,
      staffId: staffId,
      course: 1,
      reservationAt: date,
      clientFreeForm: 'client',
      staffFreeForm: 'staff',
    })
  }
  return (
    <StaffLayout staff={staff}>
      <Head>
        <title>{staff.staffName}</title>
      </Head>
      <article>
        <div className={styles.gridContainer}>
          <div className={styles.row}>
            <div>
              時間
            </div>
            {[...Array(7)].map((_, weekday) => {
              return <div key={`week-${weekday}`}>
                {weekJp[weekday]}
              </div>
              
            })}
          </div>
          {[...Array(10)].map((_, hour) => {
            return (
              <div key={`staff-${hour}`} className={styles.row}>
                <div key={`hour-${hour}`} className={styles.column}>
                  {hour + 8}:00 - {hour + 9}:00
                </div>
                {[...Array(7)].map((_, weekday) => {
                  return <div key={`week-${weekday}-${hour}`} className={styles.column}>
                    <button onClick={() => { reserve(new Date().toISOString(), staff.id)}}>
                      btn
                    </button>
                  </div>
                })}
              </div>
            );
          })}
        </div>
      </article>
    </StaffLayout>
  )
}

export async function getStaticPaths() {
  const client = createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });
  const data = await client.get({ endpoint: "staffs" });
  const paths = data.contents.map((e) => ({ params: { id: e.id } }))
  return {
    paths: paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const client = createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });
  const data = await client.get({ endpoint: `staffs/${params.id}` });
  return {
    props: {
      staff: data,
      liffId: process.env.LIFF_ID,
      serviceDomain: process.env.SERVICE_DOMAIN,
      microcmsApiKey: process.env.MICROCMS_API_KEY
    }
  }
}
