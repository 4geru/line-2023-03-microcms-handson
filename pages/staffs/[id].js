import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import styles from '../../components/staffLayout.module.css';
import { LiffContext } from "../_app";
import { useContext, useEffect, useState } from 'react'
import { createReservation, getReservations } from "../../lib/useReservations";
import { lineNotify } from '../../lib/linenotify';

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

const getReservation = (reservations, workday, hour) => {
  const reservation = reservations.find((_reservation) => {
    const reservationAt = new Date(_reservation.reservationAt);
    if(!isSameDate(workday, reservationAt)) return false;
    if(reservationAt.getHours() !== hour)return false;
    return true;
  })
  return reservation
}

export default function Staff({ staff, serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const user = useContext(LiffContext);
  const dates = fetchThisWeeks();
  const [load, setLoad] = useState(false);
  const [reservations, setReservations] = useState([]);
  var weekJp = ["日", "月", "火", "水", "木", "金", "土"];
  const reserve = (date, staffId) => {
    const reservation = {
      userName: user.profile.displayName,
      lineId: user.profile.userId,
      staff: staffId,
      course: 1,
      reservationAt: date,
      clientFreeForm: 'client',
      staffFreeForm: 'staff',
    }
    createReservation(client, reservation, () => {
      const date = new Date(reservation.reservationAt).toLocaleString()
      const message = `${staff.staffName}さん：${reservation.userName}様の${date}から予約されました。`
      lineNotify(message)
      setLoad(true)
    })
  }
  console.log(staff)

  const workdays = staff.workdays.map((e) => new Date(e.workday));
  useEffect(() => {
    getReservations(client, `staff[equals]${staff.id}`).then((_reservations) => {
      setReservations(_reservations)
    })
    setLoad(false)
  }, [load])

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
          {[...Array(12)].map((_, _hour) => {
            const hour = _hour + 8
            return (
              <div key={`staff-${hour}`} className={styles.row}>
                <div key={`hour-${hour}`} className={styles.column}>
                  {hour}:00 - {hour + 1}:00
                </div>
                {dates.map((workday) => {
                  const _date = new Date(workday.getFullYear(), workday.getMonth(), workday.getDate(), hour);
                  const isWorking = isIncludeWorkday(workdays, workday, hour);
                  const reservation = getReservation(reservations, workday, hour);
                  return isWorking ?
                    reservation ?
                      <div key={`week-${workday.toISOString()}-${hour}`} className={`${styles.column} ${styles.reserved}`}>
                      </div> :
                      <div key={`week-${workday.toISOString()}-${hour}`} className={`${styles.column} ${styles.working}`}>
                          <button onClick={() => { reserve(_date, staff.id) }}>
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
