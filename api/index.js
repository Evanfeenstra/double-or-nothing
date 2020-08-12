const fetch = require('node-fetch')

const url = '...'
const app = 'double-or-nothing'
const secret = process.env.KEY

module.exports = async function (req, res) {
  // choose win or lose here
  // if win, send off the req to relay
  // if lose, respond to app, and app sends keysend via lib
  const { amount, pubkey } = req.body
  try {
    const r = await fetch(url + '/extra', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        amount, pubkey,
        app, secret,
        action: 'keysend'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const json = await r.json()
    res.status(200).send(json)
  } catch (e) {
    res.status(500).send('fail: ' + e.message)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}