import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import styles from '../../components/staffLayout.module.css';
import { LiffContext } from "../_app";
import { useContext } from 'react'
import { createReservation } from "../../lib/useReservations";

const fetchThisWeeks = () => {
  const today = new Date(); // 今日の日付を取得
  const dates = [];
  const diff = today.getDay();
  for(var i = -diff ; i < 7-diff ; i ++) {
    dates.push(new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)))
  }
  return dates;
}

const isSameDate = (a, b) => {
  if(a.getFullYear() != b.getFullYear())return false;
  if(a.getMonth() != b.getMonth())return false;
  if(a.getDate() != b.getDate())return false;
  return true;
}

const isWorkTime = (startTime, targetTime) => {
  console.log([targetTime, startTime.getHours()])
  if(targetTime < startTime.getHours())return false;
  if(startTime.getHours() + 8 < targetTime)return false;
  return true;
}

const isIncludeWorkday = (workdays, workday, hour) => {
  const _isSameDate = workdays.some(v => isSameDate(v, workday))
  if(!_isSameDate) return false;
  const d = workdays.filter(v => isSameDate(v, workday))[0]
  const _isWorkTime = isWorkTime(d, hour)
  return _isWorkTime
}

export default function Staff({ staff, serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const user = useContext(LiffContext);
  const dates = fetchThisWeeks();
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
  const workdays = staff.workdays.map((e) => new Date(e.workday))

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
            {dates.map((workday) => {
              return <div key={`week-${workday.toISOString()}`}>
                {workday.getMonth()+1}/{workday.getDate()}({weekJp[workday.getDay()]})
              </div>
            })}
          </div>
          {[...Array(12)].map((_, hour) => {
            return (
              <div key={`staff-${hour}`} className={styles.row}>
                <div key={`hour-${hour}`} className={styles.column}>
                  {hour + 8}:00 - {hour + 9}:00
                </div>
                {dates.map((workday) => {
                  const isWorking = isIncludeWorkday(workdays, workday, hour + 8);
                  return isWorking ?
                    <div key={`week-${workday.toISOString()}-${hour}`} className={`${styles.column} ${styles.working}`}>
                      <button onClick={() => { reserve(new Date().toISOString(), staff.id)}}>
                        btn
                      </button>
                    </div> :
                    <div key={`week-${workday.toISOString()}-${hour}`} className={`${styles.column} ${styles.notWorking}`}>
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
