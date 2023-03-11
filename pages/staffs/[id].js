import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import { LiffContext } from "../_app";
import { useContext, useEffect, useState } from 'react'
import { createReservation, getReservations } from "../../lib/useReservations";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { red, grey } from '@mui/material/colors';
import { lineNotify } from "../../lib/lineNotify";

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
      clientFreeForm: '',
      staffFreeForm: `${user.profile.displayName}様 ご予約ありがとうございます。お待ちしております。`,
    }
    createReservation(client, reservation, staff, () => {
      const date = new Date(reservation.reservationAt).toLocaleString()
      const message = `${staff.staffName}さん：${reservation.userName}様の${date}から予約されました。`
      lineNotify(message)

      setLoad(true)
    })
  }

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
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>
                  時間
                </TableCell>
                {dates.map((workday) => {
                  return <TableCell key={`week-${workday.toISOString()}`}>
                    {workday.getMonth()+1}/{workday.getDate()}({weekJp[workday.getDay()]})
                  </TableCell>
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(12)].map((_, _hour) => {
                const hour = _hour + 8
                return (
                  <TableRow key={`staff-${hour}`}>
                    <TableCell key={`hour-${hour}`}>
                      {hour}:00 - {hour + 1}:00
                    </TableCell>
                    {dates.map((workday) => {
                      const _date = new Date(workday.getFullYear(), workday.getMonth(), workday.getDate(), hour);
                      const isWorking = isIncludeWorkday(workdays, workday, hour);
                      const reservation = getReservation(reservations, workday, hour);
                      return isWorking ?
                        reservation ?
                          <TableCell key={`week-${workday.toISOString()}-${hour}`} sx={{ bgcolor: red[500], color: grey[50] }} align='center' >
                            {/* {
                              // workshop: LINE のプロフィールの userId と microCMS で予約している lineId が同じ場合はリンクを表示する
                              user.profile?.userId == reservation.lineId ?
                                <Button href={`/reservations/${reservation.id}`}>予約確認</Button> :
                                '予約済み'
                            } */}
                            予約済み
                          </TableCell> :
                          <TableCell key={`week-${workday.toISOString()}-${hour}`} align='center'>
                              <Button
                                variant="text"
                                onClick={() => { reserve(_date, staff.id) }}
                              >
                                予約
                              </Button>
                          </TableCell> :
                        <TableCell key={`week-${workday.toISOString()}-${hour}`} sx={{ bgcolor: grey[500] }}>
                        </TableCell>
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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
