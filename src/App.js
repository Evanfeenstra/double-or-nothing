import React, { useState, useEffect } from 'react';
import './App.css';
import * as sphinx from 'sphinx-bridge'

function App() {

  function getSize(win) {
    const fullsize = Math.min(win.innerHeight, win.innerWidth)
    let div = 2
    if(fullsize<768) div=1.7
    if(fullsize<400) div=1.2
    return Math.round(fullsize / div)
  }

  const [size, setSize] = useState(getSize(window))
  const [winLose, setWinLose] = useState('')
  const [tokens, setTokens] = useState(0)
  const [bet, setBet] = useState('0')
  const [spinning, setSpinning] = useState(false)
  const [pubkey,setPubkey] = useState('')
  const [clicked,setClicked] = useState(false)
  const [initialBudget,setInitialBudget] = useState(0)
  const [validPubkey,setValidPubkey] = useState('')
  const [txs, setTxs] = useState([])
  const [showTx,setShowTx] = useState(false)

  const teardropTop = size/2+10

  useEffect(() => {
    window.addEventListener('resize', e => {
      setSize(getSize(e.target))
    })
  }, [])

  async function getOauthChallenge(){
    const client_id='1234567890'
    const q = `client_id=${client_id}&response_type=code&scope=all&mode=JSON`
    const url = 'https://auth.sphinx.chat/oauth?'+q
    try {
      const r1 = await fetch(url)
      const j = await r1.json()
      return j || {}
    } catch(e) {
      console.log(e)
      return {}
    }
  }

  function addTx(wl,amt){     
    const time = new Date().toLocaleTimeString()
    setTxs(current=> {
      const theTxs=[...current]
      theTxs.unshift({
        time, amount:amt, text:wl
      })
      return theTxs
    })
  } 
  // hi 
  useEffect(()=>{
    (async () => {
      const {challenge,id} = await getOauthChallenge()
      const r = await sphinx.authorize(challenge, true)
      console.log("AUTHORIZE RES",r)
      if(r&&r.budget) {
        setInitialBudget(r.budget)
        setTokens(r.budget)
        setPubkey(r.pubkey)
      }
      if(r&&r.pubkey&&r.signature) {
        const r2 = await fetch(`/api/verify?id=${id}&sig=${r.signature}&pubkey=${r.pubkey}`)
        const j = await r2.json()
        console.log("VERIFY?",j)
        if(j&&j.valid) {
          setValidPubkey(j.pubkey)
        }
      }
    })()
  },[])

  async function spin(){
    setClicked(true)
    const r = await fetch(`/api?pubkey=${pubkey}&amount=${bet}`)
    const j = await r.json()
    const x = j.win
    const housePubkey = j.pubkey

    setWinLose('')
    await sleep(1) // for css transition

    setSpinning(true)
    if(x){
      setWinLose('Win!') // money paid out by /api
    } else {
      setWinLose('Lose!') // pay over bridge
    }

    await sleep(2000)
    if(x) {
      setTokens(tokens+bet)
      addTx('WIN',bet)
    } else { 
      await keysend(housePubkey) // payout if i lost
      addTx('LOSE',bet)
    }
    setSpinning(false)
    setClicked(false)
    setBet(0)
    await sleep(2000)
    sphinx.updated()
  }

  async function keysend(housePubkey){
    try {
      const r = await sphinx.keysend(housePubkey,bet)
      if(r&&r.success) {
        setTokens(r.budget)
        if(r.budget<=10 || r.budget<=(initialBudget*0.05)) {
          await sleep(2000)
          const r = await sphinx.topup(true) // reload budget
          if(r&&r.budget) {
            const newBudget = r.budget
            setInitialBudget(newBudget)
            setTokens(newBudget)
            setPubkey(r.pubkey)
          }
        }
      }
    } catch(e) {
      console.log(e)
    }
  }

  let className = 'pie'
  if(winLose === 'Win!') className='pie pie-spin-win'
  if(winLose === 'Lose!') className='pie pie-spin-lose'

  const MAX_BET = 1000
  return (
    <div className="App">
      <div className="tokens">
        <div className="budget">Budget: {tokens} sats</div>
        <div className="bet">
          <label htmlFor="betamount">Your Bet:</label>
          <input id='betamount' type='number' value={bet} onChange={e=> {
            const val = e.target.value
            if(val==='') {
              setBet('') // allow empty 
            } else { // only allow if have funds
              const theBet = parseInt(val)
              if(theBet>0 && theBet<=tokens && theBet<=MAX_BET) setBet(theBet) 
            }
          }} onFocus={()=>{
            if (bet==='0') setBet('')
          }}/>
        </div>
        <div className="winLose">
          {spinning ? 'Take a Chance' : (winLose || 'Take a Chance')}
        </div>
        <svg className="burg" viewBox="0 0 32 32" onClick={()=>setShowTx(!showTx)}>
          <path d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"/>
        </svg>
      </div>
      
      <div className="page">
        <svg className="teardrop" width="847.372px" height="847.372px" viewBox="0 0 847.372 847.372"
          style={{ transform: `scale(1, -1) translateY(${teardropTop}px)` }}>
          <path d="M406.269,10.052l-232.65,405.741c-48.889,85.779-52.665,194.85,0,286.697c79.169,138.07,255.277,185.82,393.348,106.65
            c138.071-79.169,185.821-255.276,106.651-393.348L440.968,10.052C433.283-3.351,413.953-3.351,406.269,10.052z"/>
        </svg>
      </div>

      <div className="page">
        <svg className={className} viewBox="0 0 20 20"
          style={{ width: size, height: size }}>
          <circle r="10" cx="10" cy="10" fill="tomato" />
          <circle r="5" cx="10" cy="10" fill="tomato"
            stroke="#2cbd77"
            strokeWidth="10"
            strokeDasharray="3.33 3"
          />
          <circle r="8" cx="10" cy="10" fill="#282c34" />
        </svg>
      </div>

      <div className="page">
        <button disabled={clicked||spinning||!bet||bet==='0'} className="btn" onClick={spin}>
          Spin
        </button>
      </div>

      {showTx && <div className="page" style={{zIndex:102}}>
        <div className="show-txs">
          <h5>History</h5>
          <div className="txs">
            {txs.map((t,i)=>{
              const amtColor = t.text==='WIN' ? '#2cbd77' : 'tomato'
              return <div className="tx" key={i}>
                <b style={{width:45,textAlign:'left'}}>{t.text}</b>
                <b style={{color:amtColor}}>{t.amount}</b>
                <span>{t.time}</span>
              </div>
            })}
          </div>
          <svg viewBox="0 0 1024 1024" className="closer" onClick={()=>setShowTx(false)}>
            <path d="M563.8,512l262.5-312.9c4.4-5.2,0.7-13.1-6.1-13.1h-79.8c-4.7,0-9.2,2.1-12.3,5.7L511.6,449.8L295.1,191.7
              c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8,0-10.5,7.9-6.1,13.1L459.4,512L196.9,824.9c-4.4,5.2-0.7,13.1,6.1,13.1h79.8
              c4.7,0,9.2-2.1,12.3-5.7l216.5-258.1l216.5,258.1c3,3.6,7.5,5.7,12.3,5.7h79.8c6.8,0,10.5-7.9,6.1-13.1L563.8,512z"/>
          </svg>
        </div>
      </div>}

      {validPubkey && <pre className="pubkey-pre">{validPubkey}</pre>}

    </div>
  );
}

export default App;

export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}