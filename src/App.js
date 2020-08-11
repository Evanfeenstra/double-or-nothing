import React, {useState, useEffect} from 'react';
import './App.css';

function App() {
  
  const fullsize = Math.min(window.innerHeight,window.innerWidth)
  const [size,setSize] = useState(Math.round(fullsize/2))
  
  const teardropTop = size/2+10

  useEffect(()=>{
    window.addEventListener('resize',e=>{
      const fullsize = Math.min(e.target.innerHeight,e.target.innerWidth)
      setSize(Math.round(fullsize/2))
    })
  },[])
  
  return (
    <div className="App">

      <div className="page">
        <svg className="teardrop" width="847.372px" height="847.372px" viewBox="0 0 847.372 847.372"
          style={{transform: `scale(1, -1) translateY(${teardropTop}px)`}}>
          <path d="M406.269,10.052l-232.65,405.741c-48.889,85.779-52.665,194.85,0,286.697c79.169,138.07,255.277,185.82,393.348,106.65
            c138.071-79.169,185.821-255.276,106.651-393.348L440.968,10.052C433.283-3.351,413.953-3.351,406.269,10.052z"/>
        </svg>
      </div>

      <div className="page">
        <svg className="pie" viewBox="0 0 20 20"
          style={{width:size,height:size}}>
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
        <button className="btn">SPIN</button>
      </div>

    </div>
  );
}

export default App;
