const fetch = require('node-fetch')

const url = 'https://ecs-relay-12-relay-d2a8b4e3a283a5ef9801.stak.nodes.sphinx.chat' + '/'
const app = 'double-or-nothing'
const secret = process.env.SECRET

// /api?pubkey=xxx&amount=100

module.exports = async function (req, res) {
  // choose win or lose here
  // if win, send off the req to relay
  // if lose, respond to app, and app sends keysend via lib
  const { amount, pubkey } = req.query
  const amt = parseInt(amount) || 0
  try {
    const r = await fetch(url + 'extra', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        pubkey, amount:amt, 
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