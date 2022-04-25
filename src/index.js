import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/* TODO:
 * [x]add other planets
 * [x]fine-grained orbits (ideally seconds)
 * [x]dynamic(?) scaling or 1080 screen size
 * [x]add date selector, improve slider
 * [x]add to/from dropdown boxes
 * [ ]add to:anywhere box
 * [x]add transfer info box
 * [x]seed the planets with real data
 * [x]add planet clipart
 */

//initial theta is from J2000
const planets = [
    {displayName: 'Mercury',  initialTheta: (Math.PI/180)*252.251, distance: 0.38709893, period: '87.96926'},
    {displayName: 'Venus',  initialTheta: (Math.PI/180)*181.980, distance: 0.72333199, period: '224.7008'},
    {displayName: 'Earth', initialTheta: (Math.PI/180)*100.464, distance: 1.00000011, period: '365.25636'},
    {displayName: 'Mars', initialTheta: (Math.PI/180)*355.453, distance: 1.52366231, period: '686.97959'},
    {displayName: 'Jupiter', initialTheta: (Math.PI/180)*34.404, distance: 5.20336301	, period: '4332.8201'},
    {displayName: 'Saturn', initialTheta: (Math.PI/180)*49.944, distance: 9.53707032, period: '10755.699'},
    {displayName: 'Uranus', initialTheta: (Math.PI/180)*313.232, distance: 19.19126393, period: '30687.153'},
    {displayName: 'Neptune', initialTheta: (Math.PI/180)*304.880, distance: 30.06896348	, period: '60190.03'} ]

function planetAngle(initialTheta, period, day){
  return initialTheta + 2*Math.PI*day/period;
}

function transferAngle(radius1, radius2) {
  return Math.PI*(1-(Math.sqrt(Math.pow(((radius1/radius2) + 1),3))/(2*Math.SQRT2)));
}

function Planet(props) {
  const height = Math.max(25, 50*props.scale);
  const xpos = props.distance*Math.cos(planetAngle(props.initialTheta, props.period, props.day));
  const ypos = props.distance*Math.sin(planetAngle(props.initialTheta, props.period, props.day));
  return (
      <img style={{position:`fixed`, top: props.ymid-ypos-(height/2) + 'px', left: +props.xmid+xpos-(height/2) + 'px'}} draggable="false" height={height} src={`./`+props.displayName.toLowerCase()+`.png`} alt={props.displayName} title={props.displayName} />

  )
}

function OrbitLine(props) {
  return (
    <div className="orbitLine" style={{top: props.ymid-props.distance + 'px', left: props.xmid-props.distance +'px', width: 2*props.distance, height: 2*props.distance}} />
  )
}

function PlanetContainer(props) {
  return(
    <>
      <Planet {...props} />
      <OrbitLine {...props} />
    </>
  )
}

function Universe(props) {
  
  const [scale, setscale] = useState(200);
  const [xmid, setxmid] = useState(window.innerWidth/2);
  const [ymid, setymid] = useState(window.innerHeight/2-50);

  const [mouseLastX, setMouseLastX] = useState(0);
  const [mouseLastY, setMouseLastY] = useState(0);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="universe"
    onWheel={e => e.deltaY>0?setscale(Math.min(300,scale+10)):setscale(Math.max(10,scale-10))}
    onPointerDown={e => {
      setDragging(true);
      setMouseLastX(e.pageX);
      setMouseLastY(e.pageY);
    }}
    onPointerMove={e => {if (dragging===true) {
        setxmid(xmid + e.pageX-mouseLastX);
        setymid(ymid + e.pageY-mouseLastY);
        setMouseLastX(e.pageX);
        setMouseLastY(e.pageY);
    }}}
    onPointerUp={e => setDragging(false)}
    onPointerLeave={e => setDragging(false)}
    >
    <Planet displayName='Sun' xmid={xmid} ymid={ymid} initialTheta='0' scale={1.2*scale/200.0} distance='0' period='1' day='0' planetSelector={props.planetSelector}/>
    {planets.map(p => <PlanetContainer key={p.displayName} displayName={p.displayName} xmid={xmid} ymid={ymid}  initialTheta={p.initialTheta} scale={scale/200.0} distance={scale*p.distance} period={p.period} day={props.day} planetSelector={props.planetSelector} />)}
    </div>
  )
}

function OverlayBars(props) {
  let [fromPlanet, setFromPlanet] = useState(planets[2]);
  let [toPlanet, setToPlanet] = useState(planets[3]);

  console.log(props.windowWidth);

  return (<><div className="topBar"> 
      <DateSelector style={{display:'flex', alignItems: 'center'}} dateChanger={props.dateChanger} date={props.date}/>
      {props.windowWidth > 550 && <div style={{display:'flex', alignItems: 'center'}}>Transfer Planner</div>}
      <ToFromSelector style={{display:'flex'}} fromPlanet={fromPlanet} setFromPlanet={setFromPlanet} toPlanet={toPlanet} setToPlanet={setToPlanet} />
      </div>
      <div className="bottomBar">
      <InfoPanel fromPlanet={fromPlanet} toPlanet={toPlanet} date={props.date} day={props.day} infoPanelDivClassName='infoPanel' />
      </div></> );
}

function DateSelector(props) {
  return (
    <form style={props.style}><input type="number" name="yr" min='0' max ='4000' defaultValue={props.date.getFullYear()} onChange={y => {props.dateChanger(new Date(Math.max(Math.min(y.target.value, 4000), 0), props.date.getMonth(), props.date.getDate()))}} />
      / <input type="number" min='1' max ='12' defaultValue={props.date.getMonth()+1} onChange={m => {props.dateChanger(new Date(props.date.getFullYear(), Math.max(Math.min(m.target.value-1, 11),0), props.date.getDate()))}} />
      / <input type="number" min='1' max ='31' defaultValue={props.date.getDate()} onChange={d => {props.dateChanger(new Date(props.date.getFullYear(), props.date.getMonth(), Math.max(Math.min(d.target.value,31),1)))}} />
    </form>
  )
}

function ToFromSelector(props) {
  return (
    <div style={props.style}>
      <select value={props.fromPlanet.displayName} onChange={e => {props.setFromPlanet(planets.find(a => a.displayName===e.target.value))}}>
        {planets.map((p) => (<option key={p.displayName} value={p.displayName}>{p.displayName}</option>))}
      </select>
      <button type="button" onClick={() => {let tmp = props.toPlanet; props.setToPlanet(props.fromPlanet); props.setFromPlanet(tmp);}}>⇄</button>
      <select value={props.toPlanet.displayName} onChange={e => {props.setToPlanet(planets.find(a => a.displayName===e.target.value))}}>
        {planets.map((p) => (<option key={p.displayName} value={p.displayName}>{p.displayName}</option>))}
      </select>
    </div>
  )
}

function TransferDetails(props) {
  const arriveDate = new Date(+props.transferDate + props.transferTravelTime*24*60*60*1000);
  const stayUntilDate = new Date(+arriveDate + props.timeUntilReturn*24*60*60*1000);
  const returnDate = new Date(+stayUntilDate + props.transferTravelTime*24*60*60*1000);
  return (
    <tr>{props.transferDays <= -1.5 && <td>{Math.abs(props.transferDays).toFixed(0)} days past</td>}
    {props.transferDays > -1.5 && props.transferDays <= -0.5  && <td>Yesterday!</td>}
    {props.transferDays > -0.5 && props.transferDays <= 0.5  && <td>Today!</td>}
    {props.transferDays > 0.5 && props.transferDays <= 1.5  && <td>Tomorrow!</td>}
        {props.transferDays > 1.5 && <td>{Math.abs(props.transferDays).toFixed(0)} days from now</td>}
        <td>{props.transferDate.getFullYear()}/{props.transferDate.getMonth()+1}/{props.transferDate.getDate()}</td>
        <td>{arriveDate.getFullYear()}/{arriveDate.getMonth()+1}/{arriveDate.getDate()}</td>
        <td>{stayUntilDate.getFullYear()}/{stayUntilDate.getMonth()+1}/{stayUntilDate.getDate()}</td>
        <td>{returnDate.getFullYear()}/{returnDate.getMonth()+1}/{returnDate.getDate()}</td></tr>
  )
}

function InfoPanel(props) {
  const fromAngle = 180*((planetAngle(props.fromPlanet.initialTheta, props.fromPlanet.period, props.day))%(2*Math.PI))/Math.PI;
  const toAngle = 180*((planetAngle(props.toPlanet.initialTheta, props.toPlanet.period, props.day))%(2*Math.PI))/Math.PI;
  const currentAngular = toAngle>=fromAngle?toAngle-fromAngle:360+toAngle-fromAngle;
  let wantedAngular = 180*transferAngle(props.fromPlanet.distance, props.toPlanet.distance)/Math.PI;
  while(wantedAngular<0){
    wantedAngular = 360 + wantedAngular;
  }
  const angularDelta = (360/props.toPlanet.period) - (360/props.fromPlanet.period);
  const transferFreq = Math.abs(360/angularDelta);

  //number of days ago last transfer was
  let prevTransfer;
  if(angularDelta>0 && currentAngular<wantedAngular){
    prevTransfer = (360+currentAngular-wantedAngular)/angularDelta;
  } else if(angularDelta<0 && currentAngular>wantedAngular){
    prevTransfer = (currentAngular-wantedAngular-360)/angularDelta;
  } else {
    prevTransfer = (currentAngular-wantedAngular)/angularDelta;
  }
  
  //for the return flight
  let wantedReturnAngular = 180*transferAngle(props.toPlanet.distance, props.fromPlanet.distance)/Math.PI;
  while(wantedReturnAngular<0){
    wantedReturnAngular = 360 + wantedReturnAngular;
  }
  //we cheat on checking travel time, looking only at the angle the larger orbit sweeps
  const transferTravelTime = Math.max((180-wantedAngular)*(props.toPlanet.period)/360, (180-wantedReturnAngular)*(props.fromPlanet.period)/360);

  let arrivingAngular = ((360-wantedAngular)-(transferTravelTime*angularDelta))%360
  while(arrivingAngular <= 0){
    arrivingAngular += 360
  }

  let timeUntilReturn;
  if((-angularDelta)>0 && wantedReturnAngular<arrivingAngular){
    timeUntilReturn = (360+wantedReturnAngular-arrivingAngular)/(-angularDelta);
  } else if((-angularDelta)<0 && wantedReturnAngular>arrivingAngular){
    timeUntilReturn = (wantedReturnAngular-arrivingAngular-360)/(-angularDelta);
  } else {
    timeUntilReturn = (wantedReturnAngular-arrivingAngular)/(-angularDelta);
  }
  
  const prevTransferDate = new Date(props.date - (prevTransfer*24*60*60*1000));

  return (
    <div className={props.infoPanelDivClassName}>
      Current θ: {currentAngular.toFixed(2)}°
      &emsp;θ wanted: {wantedAngular.toFixed(2)}°
      &emsp;θ change: {angularDelta.toFixed(3)}°/day
      <br />Travel time ~{transferTravelTime.toFixed(0)} days
      &emsp; Return window ~{timeUntilReturn.toFixed(0)} days after arrival
      &emsp; Round trip ~{(2*transferTravelTime+timeUntilReturn).toFixed(0)} days

      <br />Transfer window every {transferFreq.toFixed(1)} days
      <br />
      <table style={{width:'98%', boxSizing: 'border-box'}}><tbody>
        <tr><th></th><th>Departure</th><th>Arrival</th><th>Stay Until</th><th>Return</th></tr>
        <TransferDetails transferDate={new Date(props.date - (prevTransfer*24*60*60*1000))} transferDays={-prevTransfer} transferTravelTime={transferTravelTime} timeUntilReturn={timeUntilReturn} />
        <TransferDetails transferDate={new Date(+prevTransferDate + (Math.trunc(transferFreq)*24*60*60*1000))} transferDays={transferFreq-prevTransfer} transferTravelTime={transferTravelTime} timeUntilReturn={timeUntilReturn} />
        <TransferDetails transferDate={new Date(+prevTransferDate + (Math.trunc(2*transferFreq)*24*60*60*1000))} transferDays={2*transferFreq-prevTransfer} transferTravelTime={transferTravelTime} timeUntilReturn={timeUntilReturn} />
      </tbody></table>
    </div>
  )
}

function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect( () => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  const [date, setDate] = useState(new Date());
  const epoch = new Date(2000,0,1);
  const daysSinceEpoch=(date-epoch)/86400000;
  return (
    <>
    <Universe day={daysSinceEpoch} />
    <OverlayBars date={date} day={daysSinceEpoch} dateChanger={setDate} windowWidth={windowWidth} />
    </>
  )
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
