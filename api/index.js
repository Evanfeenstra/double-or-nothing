const fetch = require('node-fetch')

const url = 'https://ecs-relay-12-relay-d2a8b4e3a283a5ef9801.stak.nodes.sphinx.chat' + '/'
const app = 'double-or-nothing'
const secret = process.env.SECRET
const housePubkey = '02290714deafd0cb33d2be3b634fc977a98a9c9fa1dd6c53cf17d99b350c08c67b'

module.exports = async function (req, res) {

  let win = (Math.floor(Math.random() * 2) === 0);
  if(!win) {
    return res.status(200).send({win:false,pubkey:housePubkey})
  }
  const { amount, pubkey } = req.query
  const amt = parseInt(amount) || 0
  try {
    const r = await fetch(url + 'action', {
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
    // const json = await r.json()
    res.status(200).send({win:true,pubkey:housePubkey})
  } catch (e) {
    res.status(500).send('fail: ' + e.message)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}