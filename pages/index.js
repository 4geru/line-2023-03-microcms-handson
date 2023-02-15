import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import { microcmsClient } from "../lib/microcmsClient";
import { createRandomUser } from "../lib/createDummyStaff"

export default function Home({ staffs }) {
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
            </li>
          ))}
        </ul>
      </div>
      <button onClick={() => {
        const users = createRandomUser();
      }}>mew</button>
    </Layout>
  )
}

// データをテンプレートに受け渡す部分の処理を記述します
export const getStaticProps = async () => {
  const data = await microcmsClient.get({ endpoint: "staffs" });

  return {
    props: {
      staffs: data.contents,
    },
  };
};