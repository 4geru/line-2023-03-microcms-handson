import Layout from '../../components/layout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import { useContext, useEffect, useState } from 'react'
import { LiffContext } from "../_app";
import { updateReservation } from '../../lib/useReservations';
import { lineNotify } from '../../lib/lineNotify';
import { TextareaAutosize } from '@mui/base';
import { Button, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/router'

export default function Staff({ serviceDomain, microcmsApiKey }) {
  const { profile } = useContext(LiffContext);
  const [reservation, setReservation] = useState(undefined);
  const [freeForm, setFreeForm] = useState(undefined)
  const [snackMessage, setSnackMessage] = useState(undefined)

  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const router = useRouter()
  useEffect(() => {
    const { id } = router.query
    if(!id)return ;
    client.get({
      endpoint: `reservations/${id}`
    }).then((content) => {
      setFreeForm(content.clientFreeForm)
      setReservation(content)
    })
  }, [router])
  // Workshop: もし違うユーザーだったらリダイレクトする

  if(!reservation) {
    return <></>
  }

  return (
    <Layout>
      <Head>
        <title>予約</title>
      </Head>
      <h3>予約日時</h3><p>{reservation.reservationAt}</p>
      <h3>ユーザー名</h3><p>{reservation.userName}</p>
      <h3>担当者</h3><p>{reservation.staff.staffName}</p>
      <h3>店舗自由記入欄</h3>{reservation.staffFreeForm || '記述なし'}
      <h3>ユーザー自由記入欄</h3>
      <TextareaAutosize
        onChange={(e) => {setFreeForm(e.target.value)}}
        defaultValue={reservation.clientFreeForm}
        placeholder="ユーザー自由記入欄"
        minRows={5}
        style={{ width: 400 }}
      />
      <br />
      <Button
        variant="contained"
        onClick={() => {
          updateReservation(client, { id: reservation.id, clientFreeForm: freeForm}, () => {
            const date = new Date(reservation.reservationAt).toLocaleString()
            const message = `${reservation.staff.staffName}さん：${reservation.userName}様の${date}の予約にコメントが来ました\nコメント：「${freeForm}」`
            const userMessage = `${date}の予約にコメントをしました<br/>コメント：<br/>${freeForm}`
            lineNotify(message)
            setSnackMessage(userMessage.replaceAll('\n', '<br />'))
          })
        }}
      >
        ユーザー自由記入欄 の更新
      </Button>
      {
        <Snackbar
          open={!!snackMessage}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Alert onClose={()=>{setSnackMessage(undefined)}} severity="success">
            <div dangerouslySetInnerHTML={{ __html: snackMessage }}></div>
          </Alert>
        </Snackbar>
      }
    </Layout>
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
