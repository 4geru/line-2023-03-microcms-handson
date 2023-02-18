import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import styles from '../../components/staffLayout.module.css';

export default function Staff({ staff }) {
  console.log(staff)
  const d = new Date(staff.createdAt)
  var weekJp = ["日", "月", "火", "水", "木", "金", "土"];
  const mew = (hour, weekday, staffId) => {
    console.log([hour, weekday, staffId])
  }
  return (
    <StaffLayout staff={staff}>
      <Head>
        <title>{staff.staffName}</title>
      </Head>
      <article>
        <h1>{staff.staffName}</h1>
        <div>
          {staff.createdAt} <br />
          {d.getFullYear()}
        </div>
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
                    <button onClick={() => { mew(hour, weekday, staff.id)}}>
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
  const data = await createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  }).get({ endpoint: "staffs" });
  const paths = data.contents.map((e) => ({ params: { id: e.id } }))
  return {
    paths: paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const data = await createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  }).get({ endpoint: `staffs/${params.id}` });
  return {
    props: {
      staff: data
    }
  }
}
