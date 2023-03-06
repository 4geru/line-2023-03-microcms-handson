import Layout from '../../components/layout'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import { useContext, useState } from 'react'
import { LiffContext } from "../_app";
import { updateReservation } from '../../lib/useReservations';
import { lineNotify } from '../../lib/lineNotify';
import { TextareaAutosize } from '@mui/base';
import { Button } from '@mui/material';

export default function Staff({ reservation, serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const user = useContext(LiffContext);
  const [freeForm, setFreeForm] = useState(reservation.clientFreeForm)
  // Workshop: もし違うユーザーだったらリダイレクトする

  return (
    <Layout>
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
            lineNotify(message)
          })
        }}
      >
        ユーザー自由記入欄 の更新
      </Button>
    </Layout>
  )
}

export async function getStaticPaths() {
  const client = createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });
  const data = await client.get({ endpoint: "reservations" });
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
  const data = await client.get({
    endpoint: `reservations/${params.id}`
  });
  return {
    props: {
      reservation: data,
      liffId: process.env.LIFF_ID,
      serviceDomain: process.env.SERVICE_DOMAIN,
      microcmsApiKey: process.env.MICROCMS_API_KEY
    }
  }
}
