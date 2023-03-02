import Layout from '../../components/Layout'
import Head from 'next/head'
import { createMicrocmsClient } from "../../lib/microcmsClient";
import styles from '../../components/staffLayout.module.css';
import { useContext } from 'react'
import { createReservation } from "../../lib/useReservations";
import { LiffContext } from "../_app";

export default function Staff({ reservation, serviceDomain, microcmsApiKey }) {
  const client = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: microcmsApiKey,
  });
  const user = useContext(LiffContext);

  console.log({reservation})
  return (
    <Layout>
      mewmew
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
