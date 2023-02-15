import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { createMicrocmsClient } from "../lib/microcmsClient";
import { createRandomUser,createUser } from "../lib/createDummyStaff"
import { useState } from 'react';

export default function Home({ _staffs, serviceDomain, apiKey }) {
  const [staffs, setStaff] = useState(_staffs)
  const microcmsClient = createMicrocmsClient({
    serviceDomain: serviceDomain,
    apiKey: apiKey
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
              <Link href={`/blog/${staff.id}`}>{staff.staffName}</Link>
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
          setStaff([...staffs, { id: res.id, ...user }])
        }, user);
      }}>create random user</button>
    </Layout>
  )
}

// データをテンプレートに受け渡す部分の処理を記述します
export const getStaticProps = async () => {
  const data = await createMicrocmsClient({
    serviceDomain: process.env.SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  }).get({ endpoint: "staffs" });

  return {
    props: {
      _staffs: data.contents,
      serviceDomain: process.env.SERVICE_DOMAIN,
      apiKey: process.env.MICROCMS_API_KEY,
    },
  };
};