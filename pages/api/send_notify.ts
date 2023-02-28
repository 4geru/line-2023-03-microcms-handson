'use strcit';

const BASE_URL = 'https://notify-api.line.me';
const PATH =  '/api/notify';

const config = (params) => ({
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`
    },
    body: params.toString()
})

export default async (req, res) => {
  console.log(req.query.message)
  const params = new URLSearchParams({
    message: req.query.message
  });
  const _res = await fetch(BASE_URL + PATH, config(params));
  res.status(200).json({ text: 'Hello' })
}
