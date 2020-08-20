const fetch = require('node-fetch')

const url = 'https://auth.sphinx.chat' + '/'

module.exports = async function (req, res) {
  const { id, sig, pubkey } = req.query
  const route = `oauth_verify?id=${id}&sig=${sig}&pubkey=${pubkey}&mode=JSON`
  try {
    const r = await fetch(url + route)
    const json = await r.json()
    const ret = json||{}
    res.status(200).send({...ret,pubkey})
  } catch (e) {
    res.status(500).send('fail: ' + e.message)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}