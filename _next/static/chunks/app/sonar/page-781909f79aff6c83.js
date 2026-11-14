(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[410],{4443:(e,t,a)=>{Promise.resolve().then(a.bind(a,5931))},5931:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>B});var s=a(5155),r=a(2115);let n=[{id:"word-gather",symbol:"●●●●↑",meaning:"集まれ",soundPattern:"加速する4連打（カ・カ・カカッ！）"},{id:"word-alert",symbol:"⚠⚠",meaning:"周囲を警戒せよ",soundPattern:"重低音の警告パルス（ドォン…ドォン…）"},{id:"word-enemy",symbol:"⚡⚡⚡",meaning:"敵がいる",soundPattern:"高音連打から低音振動（タタ・タズズズ）"},{id:"word-flee",symbol:"\uD83D\uDCA8\uD83D\uDCA8",meaning:"逃げろ",soundPattern:"急迫する5連パルス（タタ・タト・トン）"},{id:"word-child-feed",symbol:"\uD83C\uDF7C",meaning:"（子ども）餌をくれ",soundPattern:"高音スイープ音（チューン）"},{id:"word-child-here",symbol:"\uD83D\uDCCD\uD83D\uDC76",meaning:"（子ども）自分の場所はここだ",soundPattern:"高音5連パルス（ロポ・ポポポ）"},{id:"word-adult-here",symbol:"\uD83D\uDCCD\uD83D\uDC0B",meaning:"（大人）自分の場所はここだ",soundPattern:"中低音5連パルス（ゴポ・ポポポ）"},{id:"word-human",symbol:"▲▲",meaning:"人間",soundPattern:"均等2連打（カッカッ）"},{id:"word-whale",symbol:"▼━",meaning:"我ら・自分（クジラ）",soundPattern:"重厚な低音長打（ド・ドーン）"},{id:"word-you",symbol:"▼▼▲▲▲",meaning:"あなたたち・あなた",soundPattern:"低音2打＋高音3打（ドド・ツツツ）"},{id:"word-promise",symbol:"◆◆◆",meaning:"約束",soundPattern:"高低交差3連打（チ・トン・チ）"},{id:"word-go-east",symbol:"→→",meaning:"東",soundPattern:"急上昇の2点打（ツ・ピィッ！）"},{id:"word-go-west",symbol:"←←",meaning:"西",soundPattern:"階段状下降の3点打（ピ・ポ・ポン）"},{id:"word-go-north",symbol:"↑↑",meaning:"北",soundPattern:"上昇テンポ・高音パルス（ピ・ピピッ）"},{id:"word-greet",symbol:"\uD83D\uDC4B",meaning:"挨拶／こんにちは",soundPattern:"共鳴4連コーダ（ズジーズ・ズ）"},{id:"word-subsea-volcano",symbol:"▲\uD83C\uDF0B▲",meaning:"海の下の火山",soundPattern:"重低音の連続地鳴りパルス（ゴゴゴゴ…）"},{id:"word-calf",symbol:"\uD83D\uDC0B\uD83D\uDC76",meaning:"クジラの子ども",soundPattern:"中音2連長打（ト・トーン）"},{id:"word-giant-prey",symbol:"●●●●●●●",meaning:"大きい・たくさんの餌",soundPattern:"高音超高速ロングバースト（チチチチチチッ！）"},{id:"word-normal-prey",symbol:"●●●●",meaning:"普通の餌",soundPattern:"高音4連クリック（チチチ・チ）"},{id:"word-attack",symbol:"⚔️",meaning:"攻撃せよ",soundPattern:"激しい6連打パルス（ババババババッ！）"},{id:"word-search",symbol:"◎◎",meaning:"探せ",soundPattern:"等間隔の探査パルス（タン・タン・タン）"},{id:"word-ack",symbol:"●",meaning:"了解した",soundPattern:"単発クリック（カッ）"},{id:"word-human-whale",symbol:"▼━▲▲",meaning:"人間とクジラ",soundPattern:"低音長打＋均等2連打（ド・ドーッカッカッ）"}];function i(e){return`/murder-mystery-scenerio-editer/scenarios/project-deep-sea/${e.split("/").map(encodeURIComponent).join("/")}`}function l(e){return{pulses:e.map(e=>({delayMs:e.delayMs,freqHz:e.freq,durationMs:(e.duration??.018)*1e3,amplitude:e.volume??.85})),durationMs:Math.max(0,...e.map(e=>e.delayMs))+350}}function o(e,t){return{pulses:e.map(e=>({delayMs:e,freqHz:t,durationMs:18,amplitude:.85})),durationMs:Math.max(0,...e)+300}}function d(e){switch(e){case"word-gather":return l([{delayMs:0,freq:2800,duration:.018,volume:.85},{delayMs:260,freq:2850,duration:.018,volume:.88},{delayMs:440,freq:2920,duration:.015,volume:.92},{delayMs:530,freq:3050,duration:.016,volume:.98}]);case"word-alert":return l([{delayMs:0,freq:1300,duration:.038,volume:.95},{delayMs:520,freq:1200,duration:.042,volume:.92}]);case"word-enemy":return l([{delayMs:0,freq:2600,duration:.016,volume:.88},{delayMs:90,freq:2600,duration:.016,volume:.88},{delayMs:260,freq:2550,duration:.016,volume:.9},{delayMs:360,freq:1550,duration:.028,volume:.92},{delayMs:460,freq:1450,duration:.028,volume:.92},{delayMs:560,freq:1350,duration:.032,volume:.95}]);case"word-flee":return l([{delayMs:0,freq:2700,duration:.015,volume:.88},{delayMs:90,freq:2700,duration:.015,volume:.88},{delayMs:250,freq:2650,duration:.015,volume:.88},{delayMs:340,freq:2050,duration:.02,volume:.9},{delayMs:510,freq:1700,duration:.028,volume:.95}]);case"word-child-feed":return l([{delayMs:0,freq:3450,duration:.028,volume:.9},{delayMs:140,freq:2950,duration:.032,volume:.88},{delayMs:280,freq:2450,duration:.038,volume:.85}]);case"word-child-here":return l([{delayMs:0,freq:2550,duration:.018,volume:.85},{delayMs:110,freq:2800,duration:.016,volume:.88},{delayMs:290,freq:2800,duration:.016,volume:.88},{delayMs:400,freq:2800,duration:.016,volume:.9},{delayMs:510,freq:2850,duration:.018,volume:.92}]);case"word-adult-here":return l([{delayMs:0,freq:1400,duration:.028,volume:.9},{delayMs:120,freq:1850,duration:.02,volume:.88},{delayMs:300,freq:1850,duration:.02,volume:.88},{delayMs:420,freq:1850,duration:.02,volume:.9},{delayMs:540,freq:1900,duration:.022,volume:.92}]);case"word-human":return l([{delayMs:0,freq:2350,duration:.016,volume:.88},{delayMs:190,freq:2350,duration:.016,volume:.9}]);case"word-whale":return l([{delayMs:0,freq:1650,duration:.025,volume:.85},{delayMs:380,freq:1350,duration:.042,volume:.95}]);case"word-you":return l([{delayMs:0,freq:1550,duration:.024,volume:.88},{delayMs:110,freq:1550,duration:.024,volume:.88},{delayMs:290,freq:3050,duration:.015,volume:.9},{delayMs:390,freq:3050,duration:.015,volume:.9},{delayMs:490,freq:3100,duration:.015,volume:.92}]);case"word-promise":return l([{delayMs:0,freq:2950,duration:.016,volume:.85},{delayMs:190,freq:1750,duration:.024,volume:.9},{delayMs:380,freq:2950,duration:.016,volume:.85}]);case"word-go-east":return l([{delayMs:0,freq:1800,duration:.02,volume:.82},{delayMs:240,freq:3250,duration:.015,volume:.92}]);case"word-go-west":return l([{delayMs:0,freq:3200,duration:.015,volume:.88},{delayMs:200,freq:2250,duration:.018,volume:.85},{delayMs:330,freq:1550,duration:.025,volume:.9}]);case"word-go-north":return l([{delayMs:0,freq:2400,duration:.016,volume:.82},{delayMs:180,freq:2850,duration:.015,volume:.88},{delayMs:290,freq:3300,duration:.015,volume:.94}]);case"word-greet":return l([{delayMs:0,freq:1700,duration:.026,volume:.88},{delayMs:120,freq:2150,duration:.032,volume:.92},{delayMs:280,freq:1750,duration:.024,volume:.88},{delayMs:450,freq:1650,duration:.028,volume:.9}]);case"word-subsea-volcano":return l([{delayMs:0,freq:1250,duration:.032,volume:.9},{delayMs:180,freq:1200,duration:.032,volume:.9},{delayMs:360,freq:1180,duration:.035,volume:.92},{delayMs:540,freq:1150,duration:.038,volume:.95}]);case"word-calf":return l([{delayMs:0,freq:2450,duration:.018,volume:.85},{delayMs:320,freq:2150,duration:.034,volume:.92}]);case"word-giant-prey":return o([0,60,120,180,240,300,360],3550);case"word-normal-prey":return l([{delayMs:0,freq:3300,duration:.015,volume:.85},{delayMs:90,freq:3300,duration:.015,volume:.85},{delayMs:180,freq:3300,duration:.015,volume:.85},{delayMs:360,freq:3350,duration:.016,volume:.9}]);case"word-attack":return l([0,65,130,195,260,325].map((e,t)=>({delayMs:e,freq:1950+t%2*200,duration:.022,volume:.95})));case"word-search":return o([0,250,500],2400);case"word-ack":case"word-yes":return{pulses:[{delayMs:0,freqHz:2950,durationMs:18,amplitude:.95}],durationMs:260};case"word-human-whale":return l([{delayMs:0,freq:1650,duration:.024,volume:.88},{delayMs:170,freq:1350,duration:.045,volume:.95},{delayMs:250,freq:2350,duration:.016,volume:.9},{delayMs:330,freq:2350,duration:.016,volume:.94}]);default:return o([0,200,400],2400)}}class c{initContext(){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;this.ctx=new e,this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=256,this.analyser.connect(this.ctx.destination)}"suspended"===this.ctx.state&&this.ctx.resume()}getAnalyser(){return this.initContext(),this.analyser}toggleAmbient(e){if(this.initContext(),!this.ctx||!this.analyser)return!1;let t=void 0!==e?e:!this.isAmbientPlaying;if(t&&!this.isAmbientPlaying){let e=2*this.ctx.sampleRate,t=this.ctx.createBuffer(1,e,this.ctx.sampleRate),a=t.getChannelData(0),s=0,r=0,n=0,i=0,l=0,o=0,d=0;for(let t=0;t<e;t++){let e=2*Math.random()-1;s=.99886*s+.0555179*e,r=.99332*r+.0750759*e,n=.969*n+.153852*e,i=.8665*i+.3104856*e,l=.55*l+.5329522*e,o=-.7616*o-.016898*e,a[t]=(s+r+n+i+l+o+d+.5362*e)*.04,d=.115926*e}let c=this.ctx.createBufferSource();c.buffer=t,c.loop=!0;let m=this.ctx.createBiquadFilter();return m.type="lowpass",m.frequency.setValueAtTime(140,this.ctx.currentTime),m.Q.setValueAtTime(3,this.ctx.currentTime),this.ambientGain=this.ctx.createGain(),this.ambientGain.gain.setValueAtTime(.3,this.ctx.currentTime),c.connect(m),m.connect(this.ambientGain),this.ambientGain.connect(this.analyser),c.start(),this.isAmbientPlaying=!0,!0}return!t&&this.isAmbientPlaying?(this.ambientGain&&this.ctx&&this.ambientGain.gain.setTargetAtTime(0,this.ctx.currentTime,.1),this.isAmbientPlaying=!1,!1):this.isAmbientPlaying}playSingleClick(e=2800,t=.015,a=.8,s){if(this.initContext(),!this.ctx||!this.analyser)return;let r=this.ctx.createOscillator(),n=this.ctx.createGain(),i=this.ctx.createBiquadFilter(),l=s??this.ctx.currentTime;return r.type="sine",r.frequency.setValueAtTime(e,l),r.frequency.exponentialRampToValueAtTime(120,l+t),i.type="bandpass",i.frequency.setValueAtTime(.8*e,l),i.Q.setValueAtTime(4,this.ctx.currentTime),n.gain.setValueAtTime(a,l),n.gain.exponentialRampToValueAtTime(1e-4,l+t),r.connect(i),i.connect(n),n.connect(this.analyser),r.onended=()=>{r.disconnect(),i.disconnect(),n.disconnect()},r.start(l),r.stop(l+t+.01),r}async startTimeline(e,t){let a;this.initContext();let s=this.ctx;if(!s)throw Error("音声を開始できない");if("suspended"===s.state&&await s.resume(),t?.aborted)throw new DOMException("再生中止","AbortError");let r=s.currentTime,n=[];for(let t of e.segments)for(let e of t.pulses){let a=this.playSingleClick(e.freqHz,e.durationMs/1e3,e.amplitude,r+(t.startOffsetMs+e.delayMs)/1e3);a&&n.push(a)}let i=()=>{let e=s.getOutputTimestamp?.();return Math.max(0,((e&&(e.performanceTime??0)>0?e.contextTime??s.currentTime:s.currentTime-(s.baseLatency||0)-(s.outputLatency||0))-r)*1e3)},l=()=>{},o=!1,d=()=>{o||(o=!0,a&&clearTimeout(a),t?.removeEventListener("abort",c),l())},c=()=>{n.forEach(e=>{try{e.stop()}catch{}}),d()},m=new Promise(t=>{l=t;let r=()=>{i()>=e.totalDurationMs||"closed"===s.state?d():a=setTimeout(r,25)};a=setTimeout(r,25)});return t?.addEventListener("abort",c,{once:!0}),{elapsedMs:i,finished:m,cancel:c}}playSuccessFanfare(){if(this.initContext(),!this.ctx||!this.analyser)return Promise.resolve();let e=this.ctx,t=(t,a,s,r="sine",n=.25)=>{let i=e.createOscillator(),l=e.createGain();i.type=r;let o=e.currentTime+a;i.frequency.setValueAtTime(t,o),l.gain.setValueAtTime(1e-4,o),l.gain.linearRampToValueAtTime(n,o+.02),l.gain.exponentialRampToValueAtTime(1e-4,o+s),i.connect(l),l.connect(this.analyser),i.start(o),i.stop(o+s+.02)};return t(220,0,1.3,"sine",.32),t(440,0,1.2,"triangle",.18),t(659.25,.18,1.1,"sine",.22),t(880,.34,1.1,"sine",.25),t(1108.73,.5,1.2,"sine",.26),t(1760,.65,1.1,"sine",.15),new Promise(e=>setTimeout(e,900))}playAbyssBraamTriple(){if(this.initContext(),!this.ctx||!this.analyser)return Promise.resolve();let e=this.ctx,t=e.currentTime+.02,a=(t,a,s,r,n,i,l)=>{let o=e.createOscillator(),d=e.createOscillator(),c=e.createOscillator(),m=e.createBiquadFilter(),u=e.createGain();o.type="sawtooth",d.type="triangle",c.type="sine",o.frequency.setValueAtTime(t,r),o.frequency.exponentialRampToValueAtTime(a,r+.35*n),o.frequency.exponentialRampToValueAtTime(s,r+n),d.frequency.setValueAtTime(1.015*t,r),d.frequency.exponentialRampToValueAtTime(.99*a,r+.35*n),d.frequency.exponentialRampToValueAtTime(1.01*s,r+n),c.frequency.setValueAtTime(.5*t,r),c.frequency.exponentialRampToValueAtTime(.5*a,r+.35*n),c.frequency.exponentialRampToValueAtTime(.5*s,r+n),m.type="lowpass",m.Q.setValueAtTime(3.5,r),m.frequency.setValueAtTime(.5*l,r),m.frequency.exponentialRampToValueAtTime(l,r+.35*n),m.frequency.exponentialRampToValueAtTime(.35*l,r+n),u.gain.setValueAtTime(1e-4,r),u.gain.linearRampToValueAtTime(i,r+.25*n),u.gain.setValueAtTime(.9*i,r+.55*n),u.gain.exponentialRampToValueAtTime(1e-4,r+n),o.connect(m),d.connect(m),c.connect(m),m.connect(u),u.connect(this.analyser),o.start(r),d.start(r),c.start(r),o.stop(r+n+.05),d.stop(r+n+.05),c.stop(r+n+.05)},s=(t,a,s)=>{let r=Math.floor(e.sampleRate*a),n=e.createBuffer(1,r,e.sampleRate),i=n.getChannelData(0);for(let e=0;e<r;e++)i[e]=2*Math.random()-1;let l=e.createBufferSource();l.buffer=n;let o=e.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(140,t),o.frequency.exponentialRampToValueAtTime(220,t+.4*a),o.frequency.exponentialRampToValueAtTime(90,t+a);let d=e.createGain();d.gain.setValueAtTime(1e-4,t),d.gain.linearRampToValueAtTime(s,t+.3*a),d.gain.exponentialRampToValueAtTime(1e-4,t+a),l.connect(o),o.connect(d),d.connect(this.analyser),l.start(t),l.stop(t+a+.05)};return[0,2.2,4.4].forEach(e=>{let r=t+e;s(r,2.1,.18),a(65.4,65.4,58.2,r,2,.24,320),a(98,95,87.3,r+.04,1.9,.14,350),a(130.8,128,116.5,r+.08,1.8,.1,400)}),new Promise(e=>setTimeout(e,6600))}playClickPattern(e,t=2600,a=1){return new Promise(s=>{e.forEach((r,n)=>{setTimeout(()=>{this.playSingleClick(t,.018,.85),n===e.length-1&&setTimeout(s,300/a)},r/a)})})}playMelodicPattern(e,t=1){return new Promise(a=>{e.forEach((s,r)=>{setTimeout(()=>{this.playSingleClick(s.freq,s.duration||.018,s.volume||.85),r===e.length-1&&setTimeout(a,350/t)},s.delayMs/t)})})}async playWordSound(e,t=1){let a=d(e),s={segments:[{wordId:e,startOffsetMs:0,durationMs:a.durationMs/t,pulses:a.pulses.map(e=>({...e,delayMs:e.delayMs/t,durationMs:e.durationMs/t}))}],totalDurationMs:a.durationMs/t},r=await this.startTimeline(s);await r.finished}async playMessageSequence(e,t=1){for(let a of e)await this.playWordSound(a,t),await new Promise(e=>setTimeout(e,400/t))}playTongueClickSound(e=2400){if(this.initContext(),!this.ctx||!this.analyser)return;let t=this.ctx.createOscillator(),a=this.ctx.createGain(),s=this.ctx.createBiquadFilter();t.type="triangle",t.frequency.setValueAtTime(e,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(160,this.ctx.currentTime+.025),s.type="bandpass",s.frequency.setValueAtTime(.9*e,this.ctx.currentTime),s.Q.setValueAtTime(5,this.ctx.currentTime);let r=this.ctx.currentTime;a.gain.setValueAtTime(.9,r),a.gain.exponentialRampToValueAtTime(1e-4,r+.025),t.connect(s),s.connect(a),a.connect(this.analyser),t.start(r),t.stop(r+.03)}async playSeaTubeAcousticDemo(){if(this.initContext(),!this.ctx||!this.analyser)return;let e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(450,this.ctx.currentTime),t.gain.setValueAtTime(.35,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.8),e.connect(t),t.connect(this.analyser),e.start(),e.stop(this.ctx.currentTime+.85),await this.playClickPattern([0,180,360],2200,1)}async playKibitsuOralClickDemo(){if(this.initContext(),!this.ctx||!this.analyser)return;let e=e=>new Promise(t=>setTimeout(t,e));await this.playWordSound("word-human-whale",1),await e(450),await this.playWordSound("word-promise",1),await e(500),await this.playWordSound("word-giant-prey",1),await e(450),await this.playWordSound("word-gather",1)}playSpatialClick(e=2800,t=.015,a=.8,s=0,r=4500,n=0){if(this.initContext(),!this.ctx||!this.analyser)return;let i=this.ctx.createOscillator(),l=this.ctx.createGain(),o=this.ctx.createBiquadFilter(),d=this.ctx.currentTime+n;i.type="sine",i.frequency.setValueAtTime(e,d),i.frequency.exponentialRampToValueAtTime(140,d+t),o.type="lowpass",o.frequency.setValueAtTime(r,d),o.Q.setValueAtTime(2,d),l.gain.setValueAtTime(a,d),l.gain.exponentialRampToValueAtTime(1e-4,d+t);let c=l;if(this.ctx.createStereoPanner){let e=this.ctx.createStereoPanner();e.pan.setValueAtTime(Math.max(-1,Math.min(1,s)),d),l.connect(e),c=e}i.connect(o),o.connect(l),c.connect(this.analyser),i.start(d),i.stop(d+t+.01)}async playSpatialClickPattern(e,t=2600,a=.8,s=0,r=4500,n=1){return new Promise(i=>{e.forEach((l,o)=>{setTimeout(()=>{this.playSpatialClick(t,.018,a,s,r),o===e.length-1&&setTimeout(i,300/n)},l/n)})})}async playSonarBroadcastAndWhaleResponse(){await this.playWhaleMessageRelayChorus()}async playWhaleMessageRelayChorus(e){if(this.initContext(),!this.ctx||!this.analyser)return;let t=["word-human-whale","word-promise","word-subsea-volcano","word-search","word-go-north","word-gather","word-giant-prey","word-attack"];e?.("\uD83D\uDCE1 海自大出力ソナー網より『8語の新言語メッセージ』を放流中……",1);let a=this.ctx.createOscillator(),s=this.ctx.createGain();for(let e of(a.type="sine",a.frequency.setValueAtTime(1800,this.ctx.currentTime),s.gain.setValueAtTime(.55,this.ctx.currentTime),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.9),a.connect(s),s.connect(this.analyser),a.start(),a.stop(this.ctx.currentTime+.95),await new Promise(e=>setTimeout(e,900)),t))await this.playWordSound(e,1.25),await new Promise(e=>setTimeout(e,260));e?.("\uD83C\uDF0A パルスが深海音響層（SOFAR）へ浸透……深海からの応答を待機中",2),await new Promise(e=>setTimeout(e,1200)),e?.("\uD83D\uDC0B 至近海域の第1クジラが【了解】（YESコーダ）を返信！",3),await this.playSpatialClickPattern([0,150],2900,.9,-.15,6e3,1),await new Promise(e=>setTimeout(e,900)),e?.("\uD83C\uDFB6 第1クジラがメッセージを自ら歌い始め、北へ遊泳開始！",4),(async()=>{for(let e of t)await this.playWordSound(e,.95),await new Promise(e=>setTimeout(e,380))})(),await new Promise(e=>setTimeout(e,2400)),e?.("\uD83D\uDCE1 沖合数十kmの第2クジラが【了解】を返答し、歌をリレー継承！",5),await this.playSpatialClickPattern([0,160],2700,.6,.45,3200,1.05),await new Promise(e=>setTimeout(e,600)),(async()=>{for(let e of t.slice(3))await this.playWordSound(e,1.1),await new Promise(e=>setTimeout(e,320))})(),await new Promise(e=>setTimeout(e,1800)),e?.("\uD83C\uDF10 太平洋全域へリレーが到達！ 無数の了解と歌が海中に響き渡る！",6),this.playSpatialClickPattern([0,170],2500,.4,-.6,2200,1.1),await new Promise(e=>setTimeout(e,350)),this.playSpatialClickPattern([0,160],2600,.35,.7,2e3,1.15),await new Promise(e=>setTimeout(e,450)),this.playSpatialClickPattern([0,150],2800,.25,-.3,1800,1.2),await new Promise(e=>setTimeout(e,300)),this.playSpatialClickPattern([0,140],2900,.3,.2,1900,1.25),await new Promise(e=>setTimeout(e,600)),await this.playSpatialClickPattern([0,60,120,180,240,300],3200,.3,.5,2400,1.2),await new Promise(e=>setTimeout(e,300)),await this.playSpatialClickPattern([0,180,320,420],2400,.35,-.5,2200,1.1),e?.("✅ メッセージリレー完了：太平洋マッコウクジラ群が歌いながら駿河湾へ集結中！",7)}constructor(){this.ctx=null,this.ambientGain=null,this.isAmbientPlaying=!1,this.analyser=null}}let m=new c;function u(e="both"){let t="both"===e||"back"===e,a=`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>マッコウクジラ音響言語解析システム - プレイヤー提示資料</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
    }
    .a4-page {
      width: 100%;
      max-width: 184mm;
      margin: 0 auto;
      background: #ffffff;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .page-break {
      page-break-after: always !important;
      break-after: page !important;
    }
    .outer-frame-front {
      width: 100%;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 5mm 6mm;
      display: flex;
      flex-direction: column;
      gap: 4mm;
      background: #ffffff;
    }
    .outer-frame-back {
      width: 100%;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 4mm 5.5mm;
      display: flex;
      flex-direction: column;
      gap: 2.4mm;
      background: #ffffff;
    }
    .header-banner {
      background: #f0f9ff;
      color: #0f172a;
      border-radius: 7px;
      padding: 3mm 5mm;
      text-align: center;
      border: 1.5px solid #0284c7;
      border-bottom: 3px solid #0284c7;
    }
    .header-sub {
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #0369a1;
      margin-bottom: 0.8mm;
    }
    .header-title {
      font-size: 17pt;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 1mm 0;
    }
    .qr-card {
      border: 2.5px solid #0f172a;
      border-radius: 10px;
      padding: 4mm 5.5mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .qr-card img {
      width: 60mm;
      height: 60mm;
      object-fit: contain;
      display: block;
    }
    .qr-caption {
      margin-top: 1.8mm;
      font-size: 9pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.04em;
    }
    .pw-box {
      border: 2px solid #0891b2;
      background: #ecfeff;
      border-radius: 9px;
      padding: 3.2mm 5mm;
      text-align: center;
    }
    .pw-label {
      font-size: 9pt;
      font-weight: 800;
      color: #0e7490;
      letter-spacing: 0.08em;
      margin-bottom: 1.2mm;
    }
    .pw-value {
      font-family: "Courier New", Consolas, monospace;
      font-size: 23pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #0f172a;
      background: #ffffff;
      border: 2px solid #06b6d4;
      border-radius: 6px;
      padding: 1.2mm 5.5mm;
      display: inline-block;
      line-height: 1.1;
    }
    .pw-note {
      margin-top: 1.2mm;
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
    }
    .steps-box {
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 3mm 4.5mm;
    }
    .steps-title {
      font-size: 9pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1.8mm;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 0.8mm;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 2.2mm;
      font-size: 9pt;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.38;
      margin-bottom: 1.4mm;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-badge {
      width: 5mm;
      height: 5mm;
      border-radius: 999px;
      background: #0f172a;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.2pt;
      font-weight: 700;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 1.2mm;
    }

    /* 裏面（2ページ目：操作ガイド＆画面サンプル・1ページ完全収容） */
    .guide-lead-box {
      border: 1.5px solid #0891b2;
      background: #f0fdff;
      border-radius: 7px;
      padding: 2.2mm 3.5mm;
    }
    .guide-lead-title {
      font-size: 9pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1mm;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .guide-bullet {
      display: flex;
      align-items: flex-start;
      gap: 1.8mm;
      font-size: 8.3pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.32;
      margin-bottom: 0.8mm;
    }
    .guide-bullet:last-child {
      margin-bottom: 0;
    }
    .guide-dot {
      color: #0891b2;
      font-weight: 900;
      flex-shrink: 0;
    }

    /* スマホ画面サンプル枠（トナー節約・コンパクト1ページ収容） */
    .mock-phone-frame {
      background: #f8fafc;
      color: #0f172a;
      border: 1.5px solid #475569;
      border-radius: 9px;
      padding: 2.2mm 3mm;
      display: flex;
      flex-direction: column;
      gap: 1.8mm;
    }
    .mock-phone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1mm;
    }
    .mock-phone-header-title {
      font-size: 8pt;
      font-weight: 900;
      color: #0369a1;
      letter-spacing: 0.03em;
    }
    .mock-phone-header-badge {
      font-size: 6.8pt;
      font-weight: 700;
      color: #334155;
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
    }
    .sample-block {
      position: relative;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #ffffff;
      padding: 1.6mm 2.4mm;
    }
    .callout-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1mm;
    }
    .callout-tag {
      display: inline-flex;
      align-items: center;
      gap: 1mm;
      background: #e0f2fe;
      border: 1px solid #0284c7;
      color: #0369a1;
      font-size: 7.4pt;
      font-weight: 900;
      padding: 0.2mm 1.8mm;
      border-radius: 999px;
    }
    .callout-desc {
      font-size: 7pt;
      font-weight: 700;
      color: #334155;
    }

    /* ① 波形ログサンプル */
    .waveform-box {
      border: 1px solid #0284c7;
      background: #f8fafc;
      border-radius: 5px;
      overflow: hidden;
    }
    .waveform-header {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 0.8mm 2mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.2pt;
      font-weight: 800;
      color: #0369a1;
    }
    .waveform-replay {
      font-size: 6.5pt;
      background: #ffffff;
      border: 1px solid #0284c7;
      color: #0369a1;
      border-radius: 3px;
      padding: 0.2mm 1.4mm;
      font-weight: 800;
    }

    /* ② クジラの行動観測モニターサンプル */
    .monitor-box {
      border: 1px solid #94a3b8;
      background: #f8fafc;
      border-radius: 5px;
      padding: 1.4mm 2.5mm;
      text-align: center;
    }
    .monitor-title {
      font-size: 7.8pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 0.4mm;
    }
    .monitor-sub {
      font-size: 7pt;
      font-weight: 600;
      color: #334155;
      line-height: 1.3;
    }

    /* ③ 海中にクリック音を流す（発信）サンプル */
    .seq-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.8mm;
    }
    .seq-bar-label {
      font-size: 7.4pt;
      font-weight: 900;
      color: #0369a1;
    }
    .seq-ctrl-btns {
      display: flex;
      gap: 1mm;
    }
    .seq-ctrl-btn {
      background: #f8fafc;
      border: 1px solid #64748b;
      color: #1e293b;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
      font-size: 6.8pt;
      font-weight: 800;
    }
    .seq-slot-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 1mm 1.8mm;
      display: flex;
      align-items: center;
      gap: 1.2mm;
      margin-bottom: 1mm;
    }
    .seq-chip {
      background: #eef2ff;
      border: 1px solid #4f46e5;
      color: #1e1b4b;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
      font-size: 7.2pt;
      font-weight: 800;
    }
    .transmit-btn {
      width: 100%;
      background: #e0f2fe;
      border: 1.5px solid #0284c7;
      color: #0f172a;
      border-radius: 5px;
      padding: 1.1mm 2.5mm;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 900;
      letter-spacing: 0.03em;
    }

    /* ④ クリック音ボタンサンプル（音 #01 ＆ 音 #03） */
    .sample-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2mm;
    }
    .sound-card {
      background: #f8fafc;
      border-radius: 6px;
      padding: 1.4mm 2mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sound-card-locked {
      border: 1.5px solid #d97706;
    }
    .sound-card-unsolved {
      border: 1.5px solid #64748b;
    }
    .sound-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sound-code {
      background: #ffffff;
      border: 1px solid #64748b;
      color: #0369a1;
      font-family: monospace;
      font-size: 7.2pt;
      font-weight: 900;
      padding: 0.2mm 1.4mm;
      border-radius: 3px;
    }
    .sound-preview-btn {
      background: #e0f2fe;
      border: 1px solid #0284c7;
      color: #0369a1;
      font-size: 6.8pt;
      font-weight: 800;
      padding: 0.2mm 1.4mm;
      border-radius: 3px;
    }
    .sound-onomatopoeia {
      margin-top: 0.8mm;
      font-size: 8.2pt;
      font-weight: 900;
      color: #92400e;
    }
    .sound-meaning-locked {
      margin-top: 0.6mm;
      display: inline-block;
      background: #fef3c7;
      border: 1px solid #d97706;
      color: #92400e;
      font-size: 7.5pt;
      font-weight: 900;
      padding: 0.3mm 1.5mm;
      border-radius: 3px;
    }
    .sound-meaning-unsolved {
      margin-top: 0.6mm;
      font-size: 7.5pt;
      font-weight: 800;
      color: #475569;
    }
    .sound-card-footer {
      margin-top: 1mm;
      padding-top: 0.8mm;
      border-top: 1px solid #cbd5e1;
    }
    .sound-locked-note {
      font-size: 6.8pt;
      font-weight: 800;
      color: #b45309;
    }
    .sound-assign-btn {
      width: 100%;
      background: #eef2ff;
      border: 1px solid #4f46e5;
      color: #312e81;
      border-radius: 3px;
      padding: 0.5mm 1.2mm;
      text-align: center;
      font-size: 7.2pt;
      font-weight: 900;
    }
  </style>
</head>
<body>
  ${"both"===e||"front"===e?`\x3c!-- =========================================================================
       1ページ目（表面）：QRコード ＆ アクセスパスワード提示シート（A4・1ページ完全収容）
       ========================================================================= --\x3e
  <div class="a4-page ${t?"page-break":""}">
    <div class="outer-frame-front">
      <div class="header-banner">
        <div class="header-sub">MARINE MAMMAL ACOUSTIC ANALYSIS TERMINAL</div>
        <h1 class="header-title">『マッコウクジラ音響言語解析システム』</h1>
      </div>

      <div class="qr-section">
        <div class="qr-card">
          <img src="${i("releases/images/sonar_qr.png")}" alt="マッコウクジラ音響言語解析システム QRコード" />
          <div class="qr-caption">📱 スマートフォンのカメラで読み取ってください</div>
        </div>
      </div>

      <div class="pw-box">
        <div class="pw-label">🔑 アクセスパスワード（半角英数字・ハイフンあり）</div>
        <div>
          <span class="pw-value">whale-study</span>
        </div>
        <div class="pw-note">※上記のパスワードを入力して「ロック解除」を押すとシステムが起動します</div>
      </div>

      <div class="steps-box">
        <div class="steps-title">【システムへの接続手順と使い方】</div>
        <div class="step-item">
          <span class="step-badge">1</span>
          <span>スマートフォンのカメラで上のQRコードを読み取り、専用画面を開いてください。</span>
        </div>
        <div class="step-item">
          <span class="step-badge">2</span>
          <span>パスワード欄に <strong>whale-study</strong> と入力してロックを解除してください。</span>
        </div>
        <div class="step-item">
          <span class="step-badge">3</span>
          <span>詳しい画面の見方と操作方法は、<strong>裏面</strong>をご覧ください。</span>
        </div>
      </div>

      <div class="footer-bar">
        <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（表面）</span>
        <span>${"both"===e?"1 / 2":"1 / 1"}</span>
      </div>
    </div>
  </div>`:""}

  ${t?`\x3c!-- =========================================================================
       2ページ目（裏面）：画面サンプル ＆ 操作説明シート（A4・1ページ完全収容）
       ========================================================================= --\x3e
  <div class="a4-page">
    <div class="outer-frame-back">
      <div class="header-banner" style="padding: 2mm 4mm;">
        <div class="header-sub" style="font-size: 7pt; margin-bottom: 0.4mm;">SYSTEM OPERATION GUIDE &amp; SCREEN SAMPLES</div>
        <h1 class="header-title" style="font-size: 13.5pt;">『マッコウクジラ音響言語解析システム』画面説明</h1>
      </div>

      \x3c!-- プレイヤー向け操作説明（ご指定の3項目） --\x3e
      <div class="guide-lead-box">
        <div class="guide-lead-title">💡 システムの操作方法</div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>クリック音ボタンを押して海中にクリック音を鳴らすと、それに対するクジラの行動が観察できます。</span>
        </div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>別の内容を流すときは、一度流したクリック音をクリアすることをお勧めします。</span>
        </div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>言語について想定できたら、日本語を当てはめるボタンを押すことでクリック音を解析していくことができます。</span>
        </div>
      </div>

      \x3c!-- スマートフォン画面サンプル（4つの主要パーツ） --\x3e
      <div class="mock-phone-frame">
        <div class="mock-phone-header">
          <span class="mock-phone-header-title">📱 スマートフォン画面サンプル（主要4パート）</span>
          <span class="mock-phone-header-badge">実際の操作画面イメージ</span>
        </div>

        \x3c!-- ① 時間変化・音響波形ログ --\x3e
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">① 時間変化・音響波形ログ</span>
            <span class="callout-desc">鳴らしたクリック音の波形が時間変化で記録され、再生後も形が残ります</span>
          </div>
          <div class="waveform-box">
            <div class="waveform-header">
              <span>📈 時間変化・音響波形ログ（再生後も形が残ります）</span>
              <span class="waveform-replay">▶ もう一度再生</span>
            </div>
            <svg viewBox="0 0 600 64" width="100%" height="36" style="display:block; background:#ffffff;">
              \x3c!-- グリッド線 --\x3e
              <line x1="0" y1="16" x2="600" y2="16" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="34" x2="600" y2="34" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="0" y1="52" x2="600" y2="52" stroke="#e2e8f0" stroke-width="1" />
              <line x1="300" y1="0" x2="300" y2="64" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
              \x3c!-- ラベル --\x3e
              <text x="12" y="12" fill="#0369a1" font-size="9" font-family="monospace" font-weight="bold">1. 音 #01『ゴゴゴゴ…』(海の下の火山)</text>
              <text x="312" y="12" fill="#0369a1" font-size="9" font-family="monospace" font-weight="bold">2. 音 #03『カ・カ・カカッ！』</text>
              \x3c!-- 波形1（低周波の連続振動：ゴゴゴゴ…） --\x3e
              <path d="M 15 34 Q 25 16, 35 34 T 55 34 T 75 34 T 95 34 T 115 34 T 135 34 T 155 34 T 175 34 T 195 34 T 215 34 T 235 34 T 255 34 L 285 34" fill="none" stroke="#d97706" stroke-width="2" />
              \x3c!-- 波形2（鋭いパルス：カ・カ・カカッ！） --\x3e
              <path d="M 315 34 L 335 34 L 340 13 L 345 56 L 350 34 L 385 34 L 390 13 L 395 56 L 400 34 L 435 34 L 440 11 L 445 58 L 450 16 L 455 52 L 460 34 L 580 34" fill="none" stroke="#0284c7" stroke-width="2" />
            </svg>
          </div>
        </div>

        \x3c!-- ② クジラの行動観測モニター --\x3e
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">② クジラの行動観測モニター</span>
            <span class="callout-desc">海中にクリック音を流した結果、クジラがどう動いたかが文字で表示されます</span>
          </div>
          <div class="monitor-box">
            <div class="monitor-title">【クジラの行動観測モニター】</div>
            <div class="monitor-sub">
              クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、ここにクジラの行動が文字で表示されます。
            </div>
          </div>
        </div>

        \x3c!-- ③ 海中にクリック音を流す（発信）のボタン ＆ クリアボタン --\x3e
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">③ 発信ボタン ＆ クリア操作</span>
            <span class="callout-desc">選んだ音を海中に流します（別の内容を流す時は「クリア」を押します）</span>
          </div>
          <div class="seq-bar-header">
            <span class="seq-bar-label">発信するクリック音パターン（2語ごと判定）</span>
            <div class="seq-ctrl-btns">
              <span class="seq-ctrl-btn">⌫ 1つ戻す</span>
              <span class="seq-ctrl-btn" style="border-color:#d97706; background:#fef3c7; color:#92400e;">↺ クリア</span>
            </div>
          </div>
          <div class="seq-slot-box">
            <span class="seq-chip"><span style="color:#0369a1; font-family:monospace;">1.</span> 海の下の火山</span>
            <span style="color:#64748b; font-weight:bold; font-size:7.5pt;">＋</span>
            <span class="seq-chip"><span style="color:#0369a1; font-family:monospace;">2.</span> 音 #03（カ・カ・カカッ！）</span>
          </div>
          <div class="transmit-btn">
            🔊 海中にクリック音を流す（発信）
          </div>
        </div>

        \x3c!-- ④ クリック音ボタンのサンプル（音 #01 と 音 #03） --\x3e
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">④ クリック音ボタンのサンプル</span>
            <span class="callout-desc">左：最初から意味が判明している音 ／ 右：未解明の音（日本語をあてはめ可能）</span>
          </div>
          <div class="sample-cards-grid">
            \x3c!-- サンプル1：音 #01（ゴゴゴゴ… ＝ 海の下の火山） --\x3e
            <div class="sound-card sound-card-locked">
              <div>
                <div class="sound-card-top">
                  <span class="sound-code">音 #01</span>
                  <span class="sound-preview-btn">🔊 試聴</span>
                </div>
                <div class="sound-onomatopoeia">『ゴゴゴゴ…』</div>
                <div>
                  <span class="sound-meaning-locked">🔒 海の下の火山</span>
                </div>
              </div>
              <div class="sound-card-footer">
                <div class="sound-locked-note">✔ 朝倉教授記録により確定</div>
              </div>
            </div>

            \x3c!-- サンプル2：音 #03（カ・カ・カカッ！ ＝ 未解明） --\x3e
            <div class="sound-card sound-card-unsolved">
              <div>
                <div class="sound-card-top">
                  <span class="sound-code">音 #03</span>
                  <span class="sound-preview-btn">🔊 試聴</span>
                </div>
                <div class="sound-onomatopoeia">『カ・カ・カカッ！』</div>
                <div class="sound-meaning-unsolved">【未解明：？？？】</div>
              </div>
              <div class="sound-card-footer">
                <div class="sound-assign-btn">🏷️ 日本語をあてはめる</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（裏面：画面サンプル＆操作案内）</span>
        <span>${"both"===e?"2 / 2":"1 / 1"}</span>
      </div>
    </div>
  </div>`:""}
</body>
</html>`,s=document.createElement("iframe");s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="0",document.body.appendChild(s);let r=s.contentWindow?.document;r&&(r.open(),r.write(a),r.close(),setTimeout(()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(()=>{document.body.contains(s)&&document.body.removeChild(s)},3e3)},450))}var p=a(5e3),x=a(3565),h=a(1275),f=a(4026),b=a(4614),g=a(8980),y=a(9585),w=a(6145),v=a(5736),T=a(4577),j=a(6338),k=a(6619),N=a(4962),q=a(9344),M=a(744),A=a(2298),S=a(5182),P=a(6272),C=a(1663);let R=[{id:"rule-01-volcano-alert",name:"海の下の火山 ＋ 周囲を警戒せよ",sequence:["word-subsea-volcano","word-alert"],responseSoundType:"yes_ack",behaviorTitle:"クジラは海底火山を警戒し始めた",behaviorText:"クジラは海底火山を警戒し始めた",directionBadge:"\uD83C\uDF0B 海底火山を警戒",category:"action"},{id:"rule-02-enemy-alert",name:"敵がいる ＋ 周囲を警戒せよ",sequence:["word-enemy","word-alert"],responseSoundType:"yes_ack",behaviorTitle:"クジラは周囲の動く大きな生き物への警戒をし始めた",behaviorText:"クジラは周囲の動く大きな生き物への警戒をし始めた",directionBadge:"⚠️ 外敵への警戒開始",category:"action"},{id:"rule-03-enemy-flee",name:"敵がいる ＋ 逃げろ",sequence:["word-enemy","word-flee"],responseSoundType:"yes_ack",behaviorTitle:"クジラは周囲の動く大きな生き物から逃げ始めた",behaviorText:"クジラは周囲の動く大きな生き物から逃げ始めた",directionBadge:"\uD83D\uDCA8 外敵から退避",category:"action"},{id:"rule-04-enemy-attack",name:"敵がいる ＋ 攻撃せよ",sequence:["word-enemy","word-attack"],responseSoundType:"yes_ack",behaviorTitle:"クジラは周囲の動く大きな生き物を攻撃し始めた",behaviorText:"クジラは周囲の動く大きな生き物を攻撃し始めた",directionBadge:"⚔️ 外敵を攻撃開始",category:"action"},{id:"rule-05-volcano-search",name:"海の下の火山 ＋ 探せ",sequence:["word-subsea-volcano","word-search"],responseSoundType:"yes_ack",behaviorTitle:"クジラは海底火山を探し始めた",behaviorText:"クジラは海底火山を探し始めた",directionBadge:"\uD83C\uDF0B 海底火山を索敵",category:"action"},{id:"rule-06-volcano-flee",name:"海の下の火山 ＋ 逃げろ",sequence:["word-subsea-volcano","word-flee"],responseSoundType:"yes_ack",behaviorTitle:"クジラは海底火山から逃げ始めた",behaviorText:"クジラは海底火山から逃げ始めた",directionBadge:"\uD83D\uDCA8 海底火山から退避",category:"action"},{id:"rule-07-normal-prey-gather",name:"普通の餌 ＋ 集まれ",sequence:["word-normal-prey","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"クジラはイカなどの餌に集まり始めた",behaviorText:"クジラはイカなどの餌に集まり始めた",directionBadge:"\uD83E\uDD91 普通の餌に集合",category:"action"},{id:"rule-08-giant-prey-gather",name:"大きい・たくさんの餌 ＋ 集まれ",sequence:["word-giant-prey","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"クジラが大量の餌に集まり始めた",behaviorText:"クジラが大量の餌に集まり始めた",directionBadge:"\uD83E\uDD91 大量の餌に集合",category:"action"},{id:"rule-09-whale-child-feed",name:"我ら・自分（クジラ） ＋ （子ども）餌をくれ",sequence:["word-whale","word-child-feed"],responseSoundType:"yes_ack",behaviorTitle:"親クジラが子クジラに母乳を与え始めた",behaviorText:"親クジラが子クジラに母乳を与え始めた",directionBadge:"\uD83D\uDC0B 子クジラへ授乳",category:"action"},{id:"rule-10-child-here-gather",name:"（子ども）自分の場所はここだ ＋ 集まれ",sequence:["word-child-here","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"親クジラが子クジラを探し始め、側に寄り添った",behaviorText:"親クジラが子クジラを探し始め、側に寄り添った",directionBadge:"\uD83D\uDC0B 子クジラに寄り添う",category:"action"},{id:"rule-11-child-here-feed",name:"（子ども）自分の場所はここだ ＋ （子ども）餌をくれ",sequence:["word-child-here","word-child-feed"],responseSoundType:"yes_ack",behaviorTitle:"親クジラが子クジラを探し始め、母乳を与え始めた",behaviorText:"親クジラが子クジラを探し始め、母乳を与え始めた",directionBadge:"\uD83D\uDC0B 子クジラ発見・授乳",category:"action"},{id:"rule-12-calf-gather",name:"クジラの子ども ＋ 集まれ",sequence:["word-calf","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"子クジラが集まり始めた",behaviorText:"子クジラが集まり始めた",directionBadge:"\uD83D\uDC0B 子クジラが集合",category:"action"},{id:"rule-13-calf-search",name:"クジラの子ども ＋ 探せ",sequence:["word-calf","word-search"],responseSoundType:"yes_ack",behaviorTitle:"クジラが子クジラを探し始めた",behaviorText:"クジラが子クジラを探し始めた",directionBadge:"\uD83D\uDC0B 子クジラを捜索",category:"action"},{id:"rule-14-greet-you",name:"挨拶／こんにちは ＋ あなたたち・あなた",sequence:["word-greet","word-you"],responseSoundType:"greet_you_echo",behaviorTitle:"同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた",behaviorText:"同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた",directionBadge:"\uD83D\uDCE1 コーダ応答受信",category:"ritual"},{id:"rule-15-east-gather",name:"東 ＋ 集まれ",sequence:["word-go-east","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して東に集まり始めた",behaviorText:"付近のクジラが発声地点に対して東に集まり始めた",directionBadge:"➡️ 東に集まり始めた",category:"movement"},{id:"rule-16-west-gather",name:"西 ＋ 集まれ",sequence:["word-go-west","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して西に集まり始めた",behaviorText:"付近のクジラが発声地点に対して西に集まり始めた",directionBadge:"⬅️ 西に集まり始めた",category:"movement"},{id:"rule-18-north-gather",name:"北 ＋ 集まれ",sequence:["word-go-north","word-gather"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して北に集まり始めた",behaviorText:"付近のクジラが発声地点に対して北に集まり始めた",directionBadge:"⬆️ 北に集まり始めた",category:"movement"},{id:"rule-19-east-search",name:"東 ＋ 探せ",sequence:["word-go-east","word-search"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して東を探し始めた",behaviorText:"付近のクジラが発声地点に対して東を探し始めた",directionBadge:"➡️ 東を探し始めた",category:"movement"},{id:"rule-20-west-search",name:"西 ＋ 探せ",sequence:["word-go-west","word-search"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して西を探し始めた",behaviorText:"付近のクジラが発声地点に対して西を探し始めた",directionBadge:"⬅️ 西を探し始めた",category:"movement"},{id:"rule-22-north-search",name:"北 ＋ 探せ",sequence:["word-go-north","word-search"],responseSoundType:"yes_ack",behaviorTitle:"付近のクジラが発声地点に対して北を探し始めた",behaviorText:"付近のクジラが発声地点に対して北を探し始めた",directionBadge:"⬆️ 北を探し始めた",category:"movement"},{id:"rule-23-human-whale-promise",name:"人間とクジラ ＋ 約束",sequence:["word-human-whale","word-promise"],responseSoundType:"greet_human_echo",behaviorTitle:"ズジーズ・ズ/カッカッというコーダが返ってきた",behaviorText:"ズジーズ・ズ/カッカッというコーダが返ってきた",directionBadge:"\uD83D\uDCE1 コーダ応答受信",category:"ritual"},{id:"rule-24-giant-prey-attack",name:"大きい・たくさんの餌 ＋ 攻撃せよ",sequence:["word-giant-prey","word-attack"],responseSoundType:"yes_ack",behaviorTitle:"クジラは巨大な獲物・たくさんの餌への一斉攻撃を開始した",behaviorText:"クジラは巨大な獲物・たくさんの餌への一斉攻撃を開始した",directionBadge:"⚔️ 巨大獲物へ攻撃開始",category:"action"}],$={"word-subsea-volcano":"海の下の火山","word-alert":"周囲を警戒せよ"},V=[{label:"集まれ",subHint:"仲間を集める号令"},{label:"周囲を警戒せよ",subHint:"朝倉教授の記録により最初から確定",isLockedInitial:!0},{label:"敵がいる",subHint:"外敵・危険生物の存在"},{label:"逃げろ",subHint:"退避・逃走の指示"},{label:"（子ども）餌をくれ",subHint:"子クジラからの授乳要求"},{label:"（子ども）自分の場所はここだ",subHint:"子クジラが自分の居場所を知らせる音"},{label:"（大人）自分の場所はここだ",subHint:"大人のクジラが自分の居場所を知らせる音"},{label:"人間",subHint:"人を表す概念"},{label:"我ら・自分（クジラ）",subHint:"クジラ自身・同胞を表す概念"},{label:"あなたたち・あなた",subHint:"呼びかけの対象"},{label:"約束",subHint:"交わされた盟約・契り"},{label:"東",subHint:"方角（東）"},{label:"西",subHint:"方角（西）"},{label:"南",subHint:"方角（南）"},{label:"北",subHint:"方角（北）"},{label:"挨拶／こんにちは",subHint:"出会ったときの挨拶"},{label:"海の下の火山",subHint:"朝倉教授の記録により最初から確定",isLockedInitial:!0},{label:"クジラの子ども",subHint:"子クジラを表す概念"},{label:"大きい・たくさんの餌",subHint:"大量の餌・巨大な獲物"},{label:"普通の餌",subHint:"通常のイカなどの餌"},{label:"攻撃せよ",subHint:"対象への攻撃指示"},{label:"探せ",subHint:"索敵・捜索の指示"},{label:"了解した",subHint:"単独1語で使われる肯定・了解の返答"},{label:"人間とクジラ",subHint:"人とクジラの双方を表す複合概念"}],_="mm_workbench_player_word_labels_v2",I=({words:e,standalone:t=!1})=>{let a,[n,l]=(0,r.useState)([]),[o,c]=(0,r.useState)(!1),[I,z]=(0,r.useState)(null),[E,L]=(0,r.useState)(null),[O,B]=(0,r.useState)(!1),[H,D]=(0,r.useState)(null),[W,F]=(0,r.useState)([]),[G,J]=(0,r.useState)({...$}),[Q,Y]=(0,r.useState)(null),[U,K]=(0,r.useState)(!1),[X,Z]=(0,r.useState)(!1),[ee,et]=(0,r.useState)(null),ea=(0,r.useRef)(null),es=(0,r.useRef)(null),er=(0,r.useRef)([]),[en,ei]=(0,r.useState)(null),[el,eo]=(0,r.useState)(null),ed=(0,r.useRef)(null),ec=(0,r.useRef)(null),em=(0,r.useRef)(null),eu=(0,r.useRef)(null),ep=(0,r.useRef)(!1),ex=(0,r.useRef)([]),eh=(0,r.useRef)(!0),[ef,eb]=(0,r.useState)("");(0,r.useEffect)(()=>(eh.current=!0,()=>{eh.current=!1,eu.current?.abort(),null!==em.current&&cancelAnimationFrame(em.current),null!==ea.current&&clearTimeout(ea.current),er.current.forEach(clearTimeout)}),[]);let eg=r.useMemo(()=>(Array.isArray(e)?e:[]).filter(e=>"word-go-south"!==e.id).map(e=>"word-human-whale"===e.id?{...e,soundPattern:"低音長打＋均等2連打（ド・ドーッカッカッ）"}:e),[e]),ey=r.useMemo(()=>[...["word-subsea-volcano","word-alert"].map(e=>eg.find(t=>t.id===e)).filter(e=>!!e),...eg.filter(e=>!$[e.id])],[eg]),ew=(0,r.useCallback)(e=>{let t=ey.findIndex(t=>t.id===e),a=t>=0?String(t+1).padStart(2,"0"):"00",s=eg.find(t=>t.id===e),r=(s?.soundPattern.match(/（(.+?)）/)?.[1]||s?.soundPattern||"クリック音").split("/")[0].trim(),n=!!$[e],i=$[e]||G[e]||"";return{code:`音 #${a}`,onomatopoeia:r,symbol:s?.symbol||"●●",isLocked:n,assignedJapanese:i,trueMeaning:s?s.meaning:e}},[ey,eg,G]);(0,r.useEffect)(()=>{try{let e=localStorage.getItem(_);if(e){let t=JSON.parse(e);t&&"object"==typeof t&&J({...t,...$})}}catch{}},[]);let ev=e=>{let t={...e,...$};J(t);try{localStorage.setItem(_,JSON.stringify(t))}catch{}},eT=()=>{let e={};eg.forEach(t=>{e[t.id]=t.meaning}),ev(e)},ej=(0,r.useCallback)((e,t)=>{let a=function(e,t=1){let a=80,s=e.map(e=>{let s=d(e),r={wordId:e,startOffsetMs:a,durationMs:s.durationMs/t,pulses:s.pulses.map(e=>({...e,delayMs:e.delayMs/t,durationMs:e.durationMs/t}))};return a+=r.durationMs+280/t,r});return{segments:s,totalDurationMs:s.length?a-280/t:0}}(e),s=a.segments.map(e=>{let t=ew(e.wordId);return{...e,buttonCode:t.code,assignedLabel:t.assignedJapanese||"未解明（？？？）"}}),r=a.totalDurationMs;return{title:t||(1===e.length?`${ew(e[0]).code}『${ew(e[0]).onomatopoeia}』の音響波形`:`${e.length}語連結パターンの音響波形`),wordIds:[...e],totalDurationMs:r,segments:s,recordedAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}},[ew]),ek=(0,r.useCallback)((e,t,a)=>{if(!e)return;let s=e.getContext("2d");if(!s)return;let r=e.width,n=e.height;s.fillStyle="rgb(2, 6, 23)",s.fillRect(0,0,r,n);let i=!!(t&&t.segments.length>=4),l=n/(i?2:1),o=r-44;if(!t||0===t.segments.length){s.lineWidth=1,s.strokeStyle="rgba(14, 116, 144, 0.22)",s.beginPath();for(let e=36;e<r;e+=45)s.moveTo(e,0),s.lineTo(e,n-18);for(let e=18;e<n-18;e+=22)s.moveTo(32,e),s.lineTo(r,e);s.stroke();let e=Math.floor((n-18)*.56);s.strokeStyle="rgba(56, 189, 248, 0.28)",s.setLineDash([4,4]),s.beginPath(),s.moveTo(32,e),s.lineTo(r,e),s.stroke(),s.setLineDash([]),s.fillStyle="rgba(148, 163, 184, 0.7)",s.font="9px monospace",s.fillText("高音",4,24),s.fillText("中音",4,e+3),s.fillText("低音",4,n-24),s.fillStyle="rgba(148, 163, 184, 0.6)",s.font="11px sans-serif",s.textAlign="center",s.fillText("音を鳴らすと、ここに時間変化の波形・リズムが記録されて残ります",r/2+10,e+4),s.textAlign="start";return}let d=i?Math.ceil(t.segments.length/2):t.segments.length;(i?[{rowIndex:0,segments:t.segments.slice(0,d),startIndexOffset:0},{rowIndex:1,segments:t.segments.slice(d),startIndexOffset:d}]:[{rowIndex:0,segments:t.segments,startIndexOffset:0}]).forEach(e=>{if(0===e.segments.length)return;let n=e.rowIndex*l,i=n+l,d=n+16,c=i-16,m=Math.floor(d+(c-d)*.54);1===e.rowIndex&&(s.strokeStyle="rgba(56, 189, 248, 0.35)",s.lineWidth=1,s.beginPath(),s.moveTo(0,n),s.lineTo(r,n),s.stroke()),s.lineWidth=1,s.strokeStyle="rgba(14, 116, 144, 0.2)",s.beginPath();for(let e=36;e<r;e+=45)s.moveTo(e,n+2),s.lineTo(e,i-14);let u=Math.max(16,Math.floor((c-d)/3));for(let e=d;e<=c;e+=u)s.moveTo(32,e),s.lineTo(r,e);s.stroke(),s.strokeStyle="rgba(56, 189, 248, 0.28)",s.setLineDash([4,4]),s.beginPath(),s.moveTo(32,m),s.lineTo(r,m),s.stroke(),s.setLineDash([]),s.fillStyle="rgba(148, 163, 184, 0.75)",s.font="9px monospace",s.fillText("高音",4,d+6),s.fillText("中音",4,m+3),s.fillText("低音",4,c-2);let p=e.segments[0],x=e.segments[e.segments.length-1],h=Math.max(0,p.startOffsetMs-70),f=Math.max(h+800,x.startOffsetMs+x.durationMs+110),b=Math.max(1,f-h),g=e=>36+Math.min(1,Math.max(0,(e-h)/b))*o,y=e=>c-Math.min(1,Math.max(0,(e-1050)/2650))*(c-d);s.fillStyle="rgba(100, 116, 139, 0.9)",s.font="8.5px monospace";let w=b<=1200?200:b<=2600?400:800,v=Math.ceil(h/w)*w;for(let e=v;e<=f;e+=w){let t=g(e);s.fillText(`${(e/1e3).toFixed(1)}s`,t-8,i-4)}if(e.segments.forEach((r,l)=>{let o=e.startIndexOffset+l,u=g(r.startOffsetMs);t.segments.length>1&&(l>0&&(s.strokeStyle="rgba(99, 102, 241, 0.45)",s.setLineDash([2,3]),s.beginPath(),s.moveTo(u-6,n+4),s.lineTo(u-6,i-14),s.stroke(),s.setLineDash([])),s.fillStyle="rgba(165, 243, 252, 0.9)",s.font="bold 9px sans-serif",s.fillText(`${o+1}.${r.buttonCode}`,u+2,n+11)),r.pulses.length>1&&(s.strokeStyle="rgba(251, 191, 36, 0.55)",s.lineWidth=1.5,s.beginPath(),r.pulses.forEach((e,t)=>{let a=g(r.startOffsetMs+e.delayMs),n=y(e.freqHz);0===t?s.moveTo(a,n):s.lineTo(a,n)}),s.stroke()),r.pulses.forEach(e=>{let t=r.startOffsetMs+e.delayMs,n=null===a||a>=t,i=g(t),l=Math.max(i+6,g(t+e.durationMs)),o=l-i,u=y(e.freqHz),p="#22d3ee",x="rgba(34, 211, 238, 0.35)";e.freqHz<=1400?(p="#f59e0b",x="rgba(245, 158, 11, 0.35)"):e.freqHz<=2e3&&(p="#34d399",x="rgba(52, 211, 153, 0.35)"),s.globalAlpha=n?1:.25;let h=(c-d)*.42*e.amplitude;s.fillStyle=x,s.beginPath(),s.moveTo(i,m-h),s.lineTo(l,m),s.lineTo(i,m+h),s.closePath(),s.fill(),s.strokeStyle=p,s.lineWidth=1.6,s.beginPath();for(let e=i;e<=l;e+=2.5){let t=(e-i)/Math.max(1,o),a=Math.max(2,h*Math.exp(-(3.2*t))*Math.abs(Math.cos(t*Math.PI*5)));s.moveTo(e,m-a),s.lineTo(e,m+a)}s.stroke(),s.fillStyle="#fde047",s.beginPath(),s.arc(i+1.5,u,3,0,2*Math.PI),s.fill(),s.globalAlpha=1})}),null!==a&&a>=h&&a<=f){let e=g(a);s.strokeStyle="#f43f5e",s.lineWidth=2,s.beginPath(),s.moveTo(e,n+2),s.lineTo(e,i-14),s.stroke()}})},[]);(0,r.useEffect)(()=>{ek(ed.current,en,el),ek(ec.current,en,el)},[en,el,ek,Q]);let eN=async(e,t=[])=>{if(!m)throw Error("音声を利用できない");let a=new AbortController;eu.current=a;let s=await m.startTimeline(e,a.signal);if(!eh.current)return s.cancel(),!1;ei(e),ex.current=t;let r=()=>{let a=s.elapsedMs();eo(Math.min(a,e.totalDurationMs));let n=e.segments.findIndex(e=>a>=e.startOffsetMs&&a<e.startOffsetMs+e.durationMs);z(n<0?null:t[n]??null),L(n<0?null:e.segments[n].wordId),em.current=requestAnimationFrame(r)};return r(),await s.finished,null!==em.current&&cancelAnimationFrame(em.current),em.current=null,!a.signal.aborted&&!!eh.current&&(z(null),L(null),eo(null),!0)},eq=async e=>{if(!ep.current){ep.current=!0,c(!0),eb("");try{await e()}catch(e){eh.current&&!(e instanceof DOMException&&"AbortError"===e.name)&&eb("音声を再生できなかった。もう一度再生を押して確認。")}finally{ep.current=!1,eh.current&&(c(!1),z(null),L(null))}}},eM=e=>eq(async()=>{l(t=>t.length<8?[...t,e]:t),await eN(ej([e]),n.length<8?[n.length]:[])}),eA=(e,t,a)=>(e.stopPropagation(),eq(async()=>{await eN(ej([t]),void 0===a?[]:[a])})),eS=(e,t)=>{if($[e])return;let a={...G};t?a[e]=t:delete a[e],ev(a),Y(null)},eP=e=>{ea.current&&window.clearTimeout(ea.current),et(e),ea.current=window.setTimeout(()=>{et(null),ea.current=null},200)},eC=e=>eq(async()=>{let t=(e||n).slice(0,8);if(0===t.length||(e&&l(t),D(null),!await eN(ej(t),t.map((e,t)=>t))))return;let a=(e=>{let t=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});if(1===e.length&&"word-ack"===e[0])return{id:`log-${Date.now()}`,timestamp:t,sequenceIds:[...e],matchedRuleId:null,matchedRuleIds:[],title:"クジラから『カッ（了解した）』というクリック音が返ってきた",text:"",badge:"\uD83D\uDC0B 応答確認",status:"success"};if(1===e.length)return{id:`log-${Date.now()}`,timestamp:t,sequenceIds:[...e],matchedRuleId:null,matchedRuleIds:[],title:"クジラは反応していない（1語単独の発信）",text:"クジラは了解である「カッ」以外は、2語の組み合わせ（厳密な順序）で話すようだ。",badge:"\uD83D\uDCA1 2語ごとの組み合わせが必要",status:"partial"};let a=[],s=!1;for(let t=0;t+1<e.length;t+=2){let r=e[t],n=e[t+1],i=R.find(e=>2===e.sequence.length&&e.sequence[0]===r&&e.sequence[1]===n);i?a.push(i):R.find(e=>2===e.sequence.length&&e.sequence[0]===n&&e.sequence[1]===r)&&(s=!0)}if(a.length>0){let s=1===a.length?a[0].behaviorTitle:a.map(e=>`・${e.behaviorTitle}`).join("\n"),r=1===a.length?a[0].directionBadge||"\uD83D\uDC0B クジラのアクション":`🐋 クジラのアクション（${a.length}件成立）`;return{id:`log-${Date.now()}`,timestamp:t,sequenceIds:[...e],matchedRuleId:a[0].id,matchedRuleIds:a.map(e=>e.id),title:s,text:"",badge:r,status:"success"}}return s?{id:`log-${Date.now()}`,timestamp:t,sequenceIds:[...e],matchedRuleId:null,matchedRuleIds:[],title:"クジラは反応していない（語順が逆のようだ）",text:"2語の順序が厳密に決まっているようだ。前後の順番を入れ替えて試してみよう。",badge:"\uD83D\uDD04 語順不一致",status:"partial"}:{id:`log-${Date.now()}`,timestamp:t,sequenceIds:[...e],matchedRuleId:null,matchedRuleIds:[],title:"クリック音は海へ反響したが、クジラは反応していない",text:"この組み合わせでは2語成語が成立しなかったようだ。",badge:"❌ パターン不一致",status:"fail"}})(t),s=(a.matchedRuleIds||[]).map(e=>R.find(t=>t.id===e)).filter(e=>!!e);if(await new Promise(e=>setTimeout(e,300)),eh.current)if(D(a),F(e=>[a,...e]),s.length>0)for(let e of(await m?.playSuccessFanfare(),s)){if(!eh.current)return;"greet_you_echo"===e.responseSoundType?(await new Promise(e=>setTimeout(e,200)),await m?.playWordSound("word-greet",1),await new Promise(e=>setTimeout(e,240)),await m?.playWordSound("word-you",1)):"greet_human_echo"===e.responseSoundType&&(await new Promise(e=>setTimeout(e,200)),await m?.playWordSound("word-greet",1),await new Promise(e=>setTimeout(e,240)),await m?.playWordSound("word-human",1))}else 1===t.length&&"word-ack"===t[0]&&await m?.playWordSound("word-ack",1)}),eR=ey.filter(e=>!!($[e.id]||G[e.id])).length;return(0,s.jsxs)("div",{className:`flex flex-col bg-slate-950 text-slate-100 ${t?"min-h-screen w-full":"h-full w-full overflow-hidden"}`,children:[ef&&(0,s.jsx)("div",{role:"alert",className:"bg-red-950 p-3 text-sm text-red-100",children:ef}),!t&&(0,s.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-6 py-2.5",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,s.jsx)("div",{className:"flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300",children:(0,s.jsx)(p.A,{className:"h-4 w-4"})}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("h2",{className:"text-xs font-bold text-white flex items-center gap-2",children:["プレイヤー操作用「クジラクリック音解読・行動観測」モバイルWebアプリ",(0,s.jsx)("span",{className:"rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-[10px] text-cyan-300 font-mono",children:"/sonar"})]}),(0,s.jsx)("p",{className:"text-[11px] text-slate-400",children:"再生した音の波形が時間軸で画面に残り、各クリック音ボタンに「日本語の意味」を別画面からあてはめて解読を進められます。"})]})]}),(0,s.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,s.jsxs)("button",{type:"button",onClick:()=>u("both"),className:"flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition",title:"『マッコウクジラ音響言語解析システム』のプレイヤー提示用シート（表面1ページ＋裏面1ページ＝計2ページ）を印刷・PDF保存します",children:[(0,s.jsx)(x.A,{className:"h-3.5 w-3.5"}),"プレイヤー提示用シート（A4・表裏2ページ）を印刷 / PDF保存"]}),(0,s.jsxs)("a",{href:"/sonar",target:"_blank",rel:"noopener noreferrer",className:"flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-900/60 transition",title:"スマホや別タブでプレイヤー専用の全画面Webアプリを開きます",children:[(0,s.jsx)(h.A,{className:"h-3.5 w-3.5"}),"プレイヤー専用画面（/sonar）を開く"]})]})]}),(0,s.jsxs)("div",{className:"flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 md:p-6",children:[(0,s.jsx)("style",{children:`
            @keyframes abyss-quake {
              0%   { transform: translate(0, 0) rotate(0deg); }
              10%  { transform: translate(-8px, -5px) rotate(-1.2deg); }
              20%  { transform: translate(8px, 4px) rotate(1.2deg); }
              30%  { transform: translate(-9px, 5px) rotate(-1.0deg); }
              40%  { transform: translate(7px, -6px) rotate(1.1deg); }
              50%  { transform: translate(-7px, 4px) rotate(-1.2deg); }
              60%  { transform: translate(8px, 3px) rotate(1.0deg); }
              70%  { transform: translate(-6px, -4px) rotate(-0.8deg); }
              80%  { transform: translate(6px, 4px) rotate(0.8deg); }
              90%  { transform: translate(-4px, -2px) rotate(-0.5deg); }
              100% { transform: translate(0, 0) rotate(0deg); }
            }
            .abyss-quake-active {
              animation: abyss-quake 0.22s infinite ease-in-out;
              box-shadow: 0 0 80px rgba(239, 68, 68, 0.95), inset 0 0 35px rgba(220, 38, 38, 0.55) !important;
            }
          `}),(0,s.jsx)("label",{ref:es,"aria-hidden":"true",className:"sr-only pointer-events-none opacity-0 fixed -top-10 -left-10",children:(0,s.jsx)("input",{type:"checkbox",switch:""})}),(0,s.jsxs)("div",{className:"mx-auto flex max-w-6xl flex-col lg:flex-row items-start justify-center gap-6",children:[(0,s.jsxs)("div",{className:`w-full max-w-md mx-auto rounded-[28px] bg-slate-950 overflow-hidden flex flex-col transition-all duration-500 ${U?"border-4 border-red-600 ring-4 ring-red-500/40 shadow-[0_0_50px_rgba(220,38,38,0.65)]":"border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50"} ${X?"abyss-quake-active":""}`,children:[(0,s.jsxs)("div",{className:`px-4 py-3 border-b flex items-center justify-between transition-colors duration-500 ${U?"bg-gradient-to-r from-red-950 via-rose-950/80 to-red-950 border-red-500/50":"bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-cyan-500/20"}`,children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsxs)("span",{className:"relative flex h-2.5 w-2.5",children:[(0,s.jsx)("span",{className:`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${U?"bg-red-500":"bg-cyan-400"}`}),(0,s.jsx)("span",{className:`relative inline-flex rounded-full h-2.5 w-2.5 ${U?"bg-red-500":"bg-cyan-400"}`})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"text-xs font-bold tracking-wider text-white flex items-center gap-1.5",children:[(0,s.jsx)(f.A,{className:`h-3.5 w-3.5 ${U?"text-red-400":"text-cyan-400"}`}),"クジラ音響解読・発信端末"]}),(0,s.jsxs)("div",{className:`text-[10px] font-mono ${U?"text-red-300":"text-cyan-400/80"}`,children:["解読状況: ",eR," / ",ey.length," 語あてはめ済"]})]})]}),(0,s.jsx)("div",{className:"flex items-center gap-1.5",children:(0,s.jsxs)("button",{onClick:()=>{B(!!m?.toggleAmbient())},className:`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold border transition ${O?"border-cyan-400 bg-cyan-900/60 text-cyan-200":"border-slate-700 bg-slate-900 text-slate-400"}`,title:"深海の環境音（水圧ノイズ）を流します",children:[O?(0,s.jsx)(b.A,{className:"h-3 w-3 text-cyan-300"}):(0,s.jsx)(g.A,{className:"h-3 w-3"}),"深海音"]})})]}),Q?(a=ew(Q),(0,s.jsxs)("div",{className:"p-4 bg-slate-950 flex-1 flex flex-col space-y-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between border-b border-slate-800 pb-3",children:[(0,s.jsxs)("button",{onClick:()=>Y(null),className:"flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition",children:[(0,s.jsx)(y.A,{className:"h-3.5 w-3.5 text-cyan-400"}),"クリック音一覧に戻る"]}),(0,s.jsx)("span",{className:"text-[11px] font-bold text-amber-300",children:"日本語対応画面"})]}),(0,s.jsxs)("div",{className:"rounded-xl border border-cyan-500/40 bg-slate-900/90 p-3.5 space-y-2.5",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)("span",{className:"rounded bg-cyan-950 border border-cyan-600/60 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300",children:a.code}),(0,s.jsxs)("span",{className:"text-sm font-extrabold text-amber-300",children:["『",a.onomatopoeia,"』"]})]}),(0,s.jsxs)("p",{className:"mt-1 text-[11px] text-slate-300",children:["現在のあてはめ：",a.assignedJapanese?(0,s.jsxs)("span",{className:"ml-1 font-bold text-emerald-300",children:["【",a.assignedJapanese,"】"]}):(0,s.jsx)("span",{className:"ml-1 text-slate-500",children:"未解明（？？？）"})]})]}),(0,s.jsxs)("button",{onClick:e=>eA(e,Q),className:"flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition",children:[(0,s.jsx)(b.A,{className:"h-4 w-4"}),"音を聴く"]})]}),(0,s.jsx)("div",{className:"rounded-lg border border-slate-800 bg-slate-950 overflow-hidden",children:(0,s.jsx)("canvas",{ref:ec,width:380,height:96,className:"w-full h-24"})})]}),(0,s.jsxs)("div",{className:"space-y-2",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("h3",{className:"text-xs font-bold text-white flex items-center gap-1.5",children:[(0,s.jsx)(w.A,{className:"h-3.5 w-3.5 text-amber-400"}),"このクリック音にあてはめる日本語を選択してください"]}),a.assignedJapanese&&(0,s.jsx)("button",{onClick:()=>eS(Q,""),className:"text-[11px] text-rose-400 hover:text-rose-300 underline",children:"未解明（？？？）に戻す"})]}),(0,s.jsx)("div",{className:"grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-0.5",children:V.map(e=>{let t=a.assignedJapanese===e.label,r=Object.keys(G).find(t=>t!==Q&&G[t]===e.label),n=r?ew(r):null;return(0,s.jsxs)("button",{disabled:e.isLockedInitial,onClick:()=>eS(Q,e.label),className:`rounded-xl border p-2.5 text-left transition flex flex-col justify-between ${e.isLockedInitial?"border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed":t?"border-emerald-400 bg-emerald-950/70 text-white ring-1 ring-emerald-400":"border-slate-800 bg-slate-900 hover:border-amber-400/60 hover:bg-slate-800/80"}`,children:[(0,s.jsxs)("div",{className:"flex items-center justify-between gap-1",children:[(0,s.jsx)("span",{className:"text-xs font-extrabold text-white",children:e.label}),e.isLockedInitial?(0,s.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-amber-300",children:[(0,s.jsx)(v.A,{className:"h-2.5 w-2.5"}),"確定済"]}):t?(0,s.jsxs)("span",{className:"inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300",children:[(0,s.jsx)(T.A,{className:"h-2.5 w-2.5"}),"選択中"]}):n?(0,s.jsxs)("span",{className:"rounded bg-indigo-950 border border-indigo-700/60 px-1.5 py-0.5 text-[9px] text-indigo-300",children:[n.code,"で使用中"]}):null]}),(0,s.jsx)("div",{className:"mt-1 text-[10px] text-slate-400 leading-tight",children:e.subHint})]},e.label)})})]})]})):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"p-3.5 bg-slate-900/60 border-b border-slate-800 space-y-3",children:[(0,s.jsxs)("div",{className:"rounded-xl border border-cyan-500/30 bg-slate-950 overflow-hidden",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-900/80",children:[(0,s.jsxs)("div",{className:"flex items-center gap-1.5 text-[10px] font-bold text-cyan-300",children:[(0,s.jsx)(j.A,{className:"h-3.5 w-3.5 text-cyan-400"}),(0,s.jsx)("span",{children:en?en.title:"時間変化・音響波形ログ（再生後も形が残ります）"})]}),en&&(0,s.jsxs)("button",{onClick:()=>eq(async()=>{if(en&&en.wordIds.length>0){let e=ex.current.map((e,t)=>n[e]===en.wordIds[t]?e:-1);await eN(en,e)}}),disabled:o,className:"flex items-center gap-1 rounded bg-cyan-950 border border-cyan-600/50 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-800 disabled:opacity-40 transition",title:"今画面に残っている波形の音をもう一度再生します",children:[(0,s.jsx)(k.A,{className:"h-2.5 w-2.5"}),"もう一度再生"]})]}),(0,s.jsx)("canvas",{ref:ed,"data-playback-ms":el??"","data-duration-ms":en?.totalDurationMs??0,width:400,height:en&&en.segments.length>=4?216:112,className:`w-full block transition-all duration-200 ${en&&en.segments.length>=4?"h-52":"h-28"}`})]}),(0,s.jsx)("div",{className:`min-h-[104px] rounded-xl border p-3 transition-all duration-300 flex flex-col justify-center ${o?"border-cyan-500/60 bg-cyan-950/30 animate-pulse":H?.status==="success"?"border-emerald-400 bg-gradient-to-br from-emerald-950/70 via-cyan-950/50 to-slate-950 shadow-lg shadow-emerald-950/50":H?.status==="partial"?"border-amber-400/70 bg-amber-950/30":H?.status==="fail"?"border-rose-500/50 bg-rose-950/25":"border-slate-800 bg-slate-950/90"}`,children:o?(0,s.jsxs)("div",{className:"text-center space-y-1 py-2",children:[(0,s.jsxs)("div",{className:"text-xs font-bold text-cyan-300 flex items-center justify-center gap-2",children:[(0,s.jsx)(f.A,{className:"h-4 w-4 animate-bounce"}),"海中にクリック音パターンを放流しています……"]}),(0,s.jsx)("p",{className:"text-[11px] text-cyan-400/80",children:"クジラたちの反応をソナーで観測中……"})]}):H?(0,s.jsxs)("div",{className:"space-y-1.5",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,s.jsxs)("span",{className:`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${"success"===H.status?"bg-emerald-500/20 text-emerald-300 border border-emerald-400/40":"partial"===H.status?"bg-amber-500/20 text-amber-300 border border-amber-400/40":"bg-rose-500/20 text-rose-300 border border-rose-400/40"}`,children:["success"===H.status?(0,s.jsx)(N.A,{className:"h-3 w-3"}):(0,s.jsx)(q.A,{className:"h-3 w-3"}),H.badge]}),(0,s.jsx)("span",{className:"text-[10px] font-mono text-slate-400",children:H.timestamp})]}),(0,s.jsx)("div",{className:`text-sm font-extrabold tracking-wide leading-snug whitespace-pre-line ${"success"===H.status?"text-emerald-200":"partial"===H.status?"text-amber-200":"text-rose-200"}`,children:H.title}),H.text&&(0,s.jsx)("p",{className:"text-xs text-slate-200 leading-relaxed whitespace-pre-line",children:H.text})]}):(0,s.jsxs)("div",{className:"text-center space-y-1 py-1.5",children:[(0,s.jsx)("div",{className:"text-xs font-bold text-slate-400",children:"【クジラの行動観測モニター】"}),(0,s.jsxs)("p",{className:"text-[11px] text-slate-500 leading-relaxed",children:["クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、",(0,s.jsx)("br",{}),"ここにクジラの行動が文字で表示されます。"]})]})})]}),(0,s.jsxs)("div",{className:"p-3.5 bg-slate-950 border-b border-slate-800 space-y-2.5",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("span",{className:"text-[11px] font-bold text-cyan-300 flex items-center gap-1.5",children:[(0,s.jsx)("span",{children:"発信するクリック音パターン"}),(0,s.jsxs)("span",{className:"rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400",children:[n.length," / 8語（2語ごと判定）"]})]}),(0,s.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,s.jsxs)("button",{onClick:()=>{o||(eP("backspace"),l(e=>e.slice(0,-1)))},disabled:0===n.length&&"backspace"!==ee||o,className:`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${"backspace"===ee?"border-cyan-200 bg-cyan-400 text-slate-950 font-extrabold ring-2 ring-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]":"border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors duration-150 disabled:opacity-40"}`,children:[(0,s.jsx)(M.A,{className:"h-3 w-3"}),"1つ戻す"]}),(0,s.jsxs)("button",{onClick:()=>{o||(eP("clear"),l([]),D(null))},disabled:0===n.length&&"clear"!==ee||o,className:`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${"clear"===ee?"border-amber-200 bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.9)]":"border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors duration-150 disabled:opacity-40"}`,children:[(0,s.jsx)(A.A,{className:"h-3 w-3"}),"クリア"]})]})]}),(0,s.jsx)("div",{className:"min-h-[46px] rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex flex-wrap items-center gap-1.5",children:0===n.length?(0,s.jsx)("span",{className:"text-xs text-slate-500 px-1",children:"下のクリック音ボタンをタップしてパターンを作ってください"}):n.map((e,t)=>{let a=ew(e),i=I===t;return(0,s.jsxs)(r.Fragment,{children:[(0,s.jsxs)("button",{onClick:a=>eA(a,e,t),className:`rounded-lg px-2 py-1 text-xs font-bold transition flex items-center gap-1 ${i?"bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 scale-105 shadow-lg":"bg-indigo-950/90 border border-indigo-500/50 text-indigo-100 hover:bg-indigo-900"}`,title:"タップしてこの音と波形を確認",children:[(0,s.jsxs)("span",{className:"text-[10px] font-mono text-cyan-300",children:[t+1,"."]}),(0,s.jsx)("span",{children:a.assignedJapanese?`${a.assignedJapanese}`:`${a.code}（${a.onomatopoeia}）`})]}),t<n.length-1&&(0,s.jsx)("span",{className:`text-xs font-bold ${t%2==1?"text-cyan-400 px-1":"text-slate-500"}`,children:t%2==1?"｜":"＋"})]},`${e}-${t}`)})}),(0,s.jsxs)("button",{onClick:()=>eC(),disabled:0===n.length||o,className:"w-full rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 py-3 px-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-40 transition flex items-center justify-center gap-2",children:[(0,s.jsx)(b.A,{className:`h-5 w-5 ${o?"animate-ping":""}`}),o?"クリック音を海中に放流中...":"海中にクリック音を流す（発信）"]})]}),(0,s.jsxs)("div",{className:"p-3.5 space-y-2.5 bg-slate-950",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsx)("span",{className:"text-[11px] font-bold text-slate-200",children:"クリック音ボタン（タップで音を鳴らして追加）"}),(0,s.jsx)("span",{className:"text-[10px] text-amber-300",children:"「日本語をあてはめる」で意味を記録できます。"})]}),(0,s.jsx)("div",{className:"grid grid-cols-2 gap-2",children:ey.map(e=>{let t=E===e.id,a=ew(e.id);return(0,s.jsxs)("div",{onClick:()=>eM(e.id),role:"button",tabIndex:0,onKeyDown:t=>{("Enter"===t.key||" "===t.key)&&eM(e.id)},className:`group relative rounded-xl border p-2.5 text-left transition cursor-pointer select-none flex flex-col justify-between ${t?"border-cyan-400 bg-cyan-950/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400":a.isLocked?"border-amber-500/40 bg-slate-900/95 hover:border-amber-400":a.assignedJapanese?"border-emerald-500/40 bg-slate-900/95 hover:border-emerald-400":"border-slate-800 bg-slate-900/90 hover:border-cyan-500/50 hover:bg-slate-900"}`,children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center justify-between gap-1",children:[(0,s.jsx)("span",{className:"rounded bg-slate-950 border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300",children:a.code}),(0,s.jsxs)("button",{type:"button",onClick:t=>eA(t,e.id),className:"rounded-lg bg-slate-800/90 px-1.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-600 hover:text-white transition flex items-center gap-1",title:"パターンに追加せず、クリック音と波形だけを確認します",children:[(0,s.jsx)(b.A,{className:"h-3 w-3"}),"試聴"]})]}),(0,s.jsxs)("div",{className:"mt-1.5 text-xs font-extrabold text-amber-200",children:["『",a.onomatopoeia,"』"]}),(0,s.jsx)("div",{className:"mt-1",children:a.isLocked?(0,s.jsxs)("div",{className:"inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-extrabold text-amber-200",children:[(0,s.jsx)(v.A,{className:"h-3 w-3 text-amber-400 shrink-0"}),a.assignedJapanese]}):a.assignedJapanese?(0,s.jsxs)("div",{className:"inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-extrabold text-emerald-200",children:[(0,s.jsx)(w.A,{className:"h-3 w-3 text-emerald-400 shrink-0"}),a.assignedJapanese]}):(0,s.jsx)("div",{className:"text-[11px] font-bold text-slate-500",children:"【未解明：？？？】"})})]}),(0,s.jsx)("div",{className:"mt-2 pt-1.5 border-t border-slate-800/80",children:a.isLocked?(0,s.jsxs)("div",{className:"text-[10px] font-semibold text-amber-400/90 flex items-center gap-1",children:[(0,s.jsx)(N.A,{className:"h-3 w-3 shrink-0"}),"朝倉教授記録により確定"]}):(0,s.jsxs)("button",{type:"button",onClick:t=>{var a;return a=e.id,void(t.stopPropagation(),$[a]||ep.current||(ei(ej([a])),ex.current=[],eo(null),Y(a)))},className:`w-full rounded-lg py-1 px-2 text-[10px] font-bold transition flex items-center justify-center gap-1 ${a.assignedJapanese?"bg-slate-800 text-emerald-300 hover:bg-slate-700 border border-emerald-500/30":"bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600 hover:text-white border border-indigo-500/40"}`,children:[(0,s.jsx)(w.A,{className:"h-3 w-3"}),a.assignedJapanese?"日本語を変更する":"日本語をあてはめる"]})})]},e.id)})}),(0,s.jsx)("div",{className:"pt-3 border-t border-slate-800/80",children:(0,s.jsxs)("button",{type:"button",onClick:()=>{K(!0),eT(),m?.playAbyssBraamTriple();try{es.current?.click()}catch{}try{"u">typeof navigator&&"vibrate"in navigator&&navigator.vibrate([1600,600,1600,600,1700])}catch{}er.current.forEach(e=>window.clearTimeout(e)),er.current=[],[{delay:0,shaking:!0,haptic:!1},{delay:1650,shaking:!1,haptic:!1},{delay:2200,shaking:!0,haptic:!0},{delay:3850,shaking:!1,haptic:!1},{delay:4400,shaking:!0,haptic:!0},{delay:6150,shaking:!1,haptic:!1}].forEach(e=>{let t=window.setTimeout(()=>{if(Z(e.shaking),e.haptic)try{es.current?.click()}catch{}},e.delay);er.current.push(t)})},className:`w-full rounded-xl border px-3 py-3 text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${U?"border-red-500 bg-gradient-to-r from-red-950 via-red-900/90 to-red-950 text-red-100 shadow-lg shadow-red-950/90 ring-1 ring-red-400/60":"border-red-900/60 bg-slate-950/90 text-red-400/90 hover:border-red-500 hover:bg-red-950/60 hover:text-red-200 shadow-inner"}`,children:[(0,s.jsx)(S.A,{className:"h-4 w-4 shrink-0 text-red-400"}),(0,s.jsx)("span",{children:"狂気の深淵を覗き込み、クジラの言語をより理解する"})]})})]})]})]}),!t&&(0,s.jsxs)("div",{className:"w-full lg:w-96 space-y-4",children:[(0,s.jsxs)("div",{className:"rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 space-y-3 shadow-lg",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)(p.A,{className:"h-4 w-4 text-cyan-400"}),(0,s.jsx)("h3",{className:"text-xs font-bold text-white",children:"『マッコウクジラ音響言語解析システム』QR"})]}),(0,s.jsx)("span",{className:"rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-[10px] font-mono text-cyan-300",children:"PW: whale-study"})]}),(0,s.jsx)("div",{className:"flex flex-col items-center gap-2 rounded-xl bg-white p-3",children:(0,s.jsx)("img",{src:i("releases/images/sonar_qr.png"),alt:"マッコウクジラ音響言語解析システム QRコード",className:"h-44 w-44 object-contain"})}),(0,s.jsxs)("div",{className:"text-[11px] text-slate-300 space-y-2",children:[(0,s.jsxs)("div",{children:["スマートフォンのカメラでQRコードを読み取り、アクセスパスワード ",(0,s.jsx)("strong",{className:"font-mono text-cyan-300",children:"whale-study"})," を入力するとプレイヤー画面が開きます。"]}),(0,s.jsxs)("button",{type:"button",onClick:()=>u("both"),className:"w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition",children:[(0,s.jsx)(x.A,{className:"h-4 w-4 shrink-0"}),(0,s.jsx)("span",{children:"プレイヤー提示用シート（A4・表裏2ページ）を印刷 / PDF保存"})]})]})]}),(0,s.jsxs)("div",{className:"rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)(w.A,{className:"h-4 w-4 text-emerald-400"}),(0,s.jsx)("h3",{className:"text-xs font-bold text-white",children:"日本語あてはめ状態の管理（作者・テスト用）"})]}),(0,s.jsxs)("span",{className:"text-[11px] font-mono text-emerald-300",children:[eR,"/",ey.length,"語"]})]}),(0,s.jsxs)("p",{className:"text-[11px] text-slate-400 leading-relaxed",children:["初期状態では朝倉教授が示した",(0,s.jsx)("strong",{children:"『ゴゴゴゴ…＝海の下の火山』『ドォン…ドォン…＝周囲を警戒せよ』の2語のみ確定"}),"しており、残りの22語はプレイヤーが実験しながら別画面で日本語をあてはめます。"]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,s.jsxs)("button",{onClick:()=>{let e={...$};J(e),K(!1),Z(!1),er.current.forEach(e=>window.clearTimeout(e)),er.current=[];try{localStorage.setItem(_,JSON.stringify(e))}catch{}},className:"rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-[11px] font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition flex items-center justify-center gap-1.5",children:[(0,s.jsx)(A.A,{className:"h-3.5 w-3.5"}),"初期状態（2語のみ確定）に戻す"]}),(0,s.jsxs)("button",{onClick:eT,className:"rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-[11px] font-bold text-emerald-200 hover:bg-emerald-900/50 transition flex items-center justify-center gap-1.5",children:[(0,s.jsx)(S.A,{className:"h-3.5 w-3.5"}),"正解の日本語をすべてあてはめる"]})]})]}),(0,s.jsxs)("div",{className:"rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)(P.A,{className:"h-4 w-4 text-amber-400"}),(0,s.jsx)("h3",{className:"text-xs font-bold text-white",children:"ワンタップ動作テスト（代表的な2語成語パターン）"})]}),(0,s.jsx)("p",{className:"text-[11px] text-slate-400 leading-relaxed",children:"下のボタンを押すと、2語成語のクリック音パターンが再生されて時間変化の波形が画面に残り、クジラのアクションが文字で表示されます。"}),(0,s.jsx)("div",{className:"space-y-2",children:[{label:"①「海の下の火山」＋「周囲を警戒せよ」",sub:"ゴゴゴゴ… ＋ ドォン…ドォン… ➔『クジラは海底火山を警戒し始めた』",seq:["word-subsea-volcano","word-alert"],color:"border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200"},{label:"②「大きい・たくさんの餌」＋「集まれ」",sub:"チチチチチチッ！ ＋ カ・カ・カカッ！ ➔『クジラが大量の餌に集まり始めた』",seq:["word-giant-prey","word-gather"],color:"border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-200"},{label:"③「北」＋「集まれ」",sub:"ピ・ピピッ ＋ カ・カ・カカッ！ ➔『付近のクジラが発声地点に対して北に集まり始めた』",seq:["word-go-north","word-gather"],color:"border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200"},{label:"④「挨拶／こんにちは」＋「あなたたち・あなた」",sub:"ズジーズ・ズ ＋ ドド・ツツツ ➔『同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた』",seq:["word-greet","word-you"],color:"border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200"},{label:"⑤「人間とクジラ」＋「約束」",sub:"ド・ドーッカッカッ ＋ チ・トン・チ ➔『ズジーズ・ズ/カッカッというコーダが返ってきた』",seq:["word-human-whale","word-promise"],color:"border-pink-500/40 bg-pink-950/30 hover:bg-pink-900/50 text-pink-200"},{label:"⑥【4語連続】「北＋集まれ」｜「大きい・たくさんの餌＋攻撃せよ」",sub:"2語ごとに順番に判定 ➔ 2つのクジラの行動が順番に表示されるテスト",seq:["word-go-north","word-gather","word-giant-prey","word-attack"],color:"border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200"}].map((e,t)=>(0,s.jsxs)("button",{onClick:()=>{Y(null),eC(e.seq)},disabled:o,className:`w-full rounded-xl border p-2.5 text-left transition disabled:opacity-40 ${e.color}`,children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsx)("span",{className:"text-xs font-bold",children:e.label}),(0,s.jsx)(k.A,{className:"h-3.5 w-3.5 shrink-0"})]}),(0,s.jsx)("div",{className:"mt-0.5 text-[10px] opacity-80",children:e.sub})]},t))})]}),(0,s.jsxs)("div",{className:"rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("span",{className:"text-xs font-bold text-slate-200 flex items-center gap-1.5",children:[(0,s.jsx)(C.A,{className:"h-4 w-4 text-cyan-400"}),"発信・観測ログ履歴（試行錯誤の記録）"]}),W.length>0&&(0,s.jsx)("button",{onClick:()=>F([]),className:"text-[10px] text-slate-500 hover:text-slate-300",children:"履歴クリア"})]}),0===W.length?(0,s.jsx)("p",{className:"text-xs text-slate-500 py-4 text-center",children:"まだクリック音を発信していません。"}):(0,s.jsx)("div",{className:"max-h-60 overflow-y-auto space-y-2 pr-1",children:W.map(e=>(0,s.jsxs)("div",{className:"rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs space-y-1",children:[(0,s.jsxs)("div",{className:"flex items-start justify-between gap-2",children:[(0,s.jsx)("span",{className:`font-bold text-[11px] whitespace-pre-line ${"success"===e.status?"text-emerald-400":"partial"===e.status?"text-amber-400":"text-rose-400"}`,children:e.title}),(0,s.jsx)("span",{className:"text-[10px] font-mono text-slate-500",children:e.timestamp})]}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1",children:e.sequenceIds.map((t,a)=>{let r=ew(t);return(0,s.jsx)("span",{className:"rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300",children:r.assignedJapanese?`${r.code}:${r.assignedJapanese}`:`${r.code}(${r.onomatopoeia})`},`${e.id}-${a}`)})})]},e.id))})]})]})]})]})]})};var z=a(1499),E=a(7428);let L="whale-study",O="mm_sonar_player_auth_v1";function B(){let[e,t]=(0,r.useState)(!1),[a,i]=(0,r.useState)(!0),[l,o]=(0,r.useState)(""),[d,c]=(0,r.useState)("");return((0,r.useEffect)(()=>{try{localStorage.getItem(O)===L&&t(!0)}catch{}finally{i(!1)}},[]),a)?(0,s.jsx)("div",{className:"min-h-screen w-full bg-slate-950 flex items-center justify-center text-cyan-400 text-xs font-mono",children:"読み込み中..."}):e?(0,s.jsxs)("div",{className:"relative min-h-screen w-full bg-slate-950",children:[(0,s.jsx)(I,{words:n,standalone:!0}),(0,s.jsx)("div",{className:"pb-6 flex justify-center bg-slate-950",children:(0,s.jsxs)("button",{type:"button",onClick:()=>{t(!1),o("");try{localStorage.removeItem(O)}catch{}},className:"flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400 hover:border-slate-700 hover:text-slate-200 transition",children:[(0,s.jsx)(E.A,{className:"h-3 w-3"}),"パスワード画面に戻す（ロック）"]})})]}):(0,s.jsx)("div",{className:"min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-slate-100",children:(0,s.jsxs)("div",{className:"w-full max-w-sm rounded-3xl border-2 border-cyan-500/30 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/60 space-y-6",children:[(0,s.jsxs)("div",{className:"flex flex-col items-center text-center space-y-2",children:[(0,s.jsx)("div",{className:"flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-inner",children:(0,s.jsx)(f.A,{className:"h-6 w-6"})}),(0,s.jsx)("h1",{className:"text-base font-extrabold tracking-wider text-white",children:"クジラ音響解読・発信端末"}),(0,s.jsx)("p",{className:"text-xs text-slate-400 leading-relaxed",children:"端末にアクセスするにはパスワードを入力してください。"})]}),(0,s.jsxs)("form",{onSubmit:e=>{if(e.preventDefault(),l.trim()===L){t(!0),c("");try{localStorage.setItem(O,L)}catch{}}else c("パスワードが正しくありません。")},className:"space-y-4",children:[(0,s.jsxs)("div",{className:"space-y-1.5",children:[(0,s.jsxs)("label",{className:"block text-xs font-bold text-cyan-300 flex items-center gap-1.5",children:[(0,s.jsx)(z.A,{className:"h-3.5 w-3.5"}),"アクセスパスワード"]}),(0,s.jsx)("input",{type:"password",value:l,onChange:e=>{o(e.target.value),d&&c("")},placeholder:"パスワードを入力...",autoFocus:!0,className:"w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"})]}),d&&(0,s.jsxs)("div",{className:"flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-300",children:[(0,s.jsx)(q.A,{className:"h-4 w-4 shrink-0 text-rose-400"}),(0,s.jsx)("span",{children:d})]}),(0,s.jsxs)("button",{type:"submit",className:"w-full rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 py-3 px-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.99] transition flex items-center justify-center gap-2",children:[(0,s.jsx)(v.A,{className:"h-4 w-4"}),"ロックを解除して端末を開く"]})]})]})})}}},e=>{e.O(0,[195,441,794,358],()=>e(e.s=4443)),_N_E=e.O()}]);