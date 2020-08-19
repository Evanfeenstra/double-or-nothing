import React, { useState, useEffect } from 'react';
import './App.css';
import * as sphinx from 'sphinx-bridge'

function App() {

  const fullsize = Math.min(window.innerHeight, window.innerWidth)
  const [size, setSize] = useState(Math.round(fullsize / 2))
  const [winLose, setWinLose] = useState('')
  const [tokens, setTokens] = useState(0)
  const [bet, setBet] = useState('0')
  const [spinning, setSpinning] = useState(false)
  const [pubkey,setPubkey] = useState('')
  const [clicked,setClicked] = useState(false)
  const [initialBudget,setInitialBudget] = useState(0)

  const teardropTop = size/2+10

  useEffect(() => {
    window.addEventListener('resize', e => {
      const fullsize = Math.min(e.target.innerHeight, e.target.innerWidth)
      setSize(Math.round(fullsize / 2))
    })
  }, [])

  useEffect(()=>{
    (async () => {
      await sleep(1)
      const r = await sphinx.enable(true)
      if(r&&r.budget) {
        setInitialBudget(r.budget)
        setTokens(r.budget)
        setPubkey(r.pubkey)
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
    if(!x) { 
      await keysend(housePubkey) // payout if i lost
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
          const r = await sphinx.topup(true) // reload budget
          if(r&&r.budget) {
            const newBudget = tokens + r.budget
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

    </div>
  );
}

export default App;

export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}