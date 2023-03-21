import StaffLayout from '../../components/staffLayout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import { LiffContext } from "../_app";
import { useContext, useEffect, useState } from 'react'
import { createReservation, getReservations } from "../../lib/useReservations";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Snackbar, Alert } from '@mui/material';
import { red, grey } from '@mui/material/colors';
import { lineNotify } from "../../lib/lineNotify";
import { fetchThisWeeks, isIncludeWorkday, getReservation } from '../../lib/util'
import { useRouter } from 'next/router'

var weekJp = ["日", "月", "火", "水", "木", "金", "土"];

const createReservationData = (date, staffId, profile) => {
  return {
    userName: profile.displayName,
    lineId: profile.userId,
    staff: staffId,
    course: 1,
    reservationAt: date,
    clientFreeForm: '',
    staffFreeForm: `${profile.displayName}様 ご予約ありがとうございます。お待ちしております。`,
  }
}

export default function Staff({ serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const [staff, setStaff] = useState(undefined);
  const router = useRouter()
  useEffect(() => {
    const { id } = router.query
    if(!id)return ;
    client.get({
      endpoint: `staffs/${id}`
    }).then((content) => {
      setStaff(content)
      setReservations([])
    })
  }, [router])
  const { profile } = useContext(LiffContext);
  const [reservations, setReservations] = useState(undefined);
  const [snackMessage, setSnackMessage] = useState(undefined);
  const reserve = (date, staffId, profile) => {
    const reservation = createReservationData(date, staffId, profile)
    createReservation(client, reservation, staff, () => {
      const date = new Date(reservation.reservationAt).toLocaleString()
      const message = `${staff.staffName}さん：${reservation.userName}様の${date}から予約されました。`
      const userMessage = `${date}の予約をしました`
      lineNotify(message)
      setSnackMessage(userMessage)
    })
  }

  useEffect(() => {
    getReservations(client, `staff[equals]${staff?.id}`).then((_reservations) => {
      setReservations(_reservations)
    })
  }, [reservations])

  if(!staff) {
    return <></>
  }
  const workdays = staff.workdays.map((e) => new Date(e.workday));
  const dates = fetchThisWeeks();

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
                              profile?.userId == reservation.lineId ?
                                <Button href={`/reservations/${reservation.id}`}>予約確認</Button> :
                                '予約済み'
                            } */}
                            予約済み
                          </TableCell> :
                          <TableCell key={`week-${workday.toISOString()}-${hour}`} align='center'>
                              <Button
                                variant="text"
                                onClick={() => { reserve(_date, staff.id, profile) }}
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
      </article>
    </StaffLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      liffId: process.env.LIFF_ID,
      serviceDomain: process.env.SERVICE_DOMAIN,
      microcmsApiKey: process.env.MICROCMS_API_KEY
    }
  }
}
