import { get } from 'svelte/store';
import useTablet from '../components/Tablet/use/useTablet';
import { store } from '../store';
import type { WindowRect } from './coordinary';
import { sendWSMessageWithID } from './utils';

const useWebRTC = () => {
  let id: string | null = null
  store.me.subscribe(v => id = v)

  const setupWS = () => {
    const wsUrl = `wss://ryoha.trap.show/portablerg-server/`;
    const ws = new WebSocket(wsUrl);
    store.ws.set(ws)
    ws.onopen = (evt) => {
      console.log('ws open()');
    };
    ws.onclose = () => {
      console.log('ws closed reconnecting...');
      setupWS()
    }
    ws.onerror = (err) => {
      console.error('ws onerror() ERR:', err);
    };
    ws.onmessage = (evt) => {
      console.log('ws onmessage() data:', evt.data);
      const message = JSON.parse(evt.data);
      switch(message.type){
        case 'offer': {
          console.log('Received offer ...');
          console.log(message.sdp)
          setOffer(message);
          break;
        }
        case 'answer': {
          console.log('Received answer ...');
          console.log(message.sdp)
          setAnswer(message);
          break;
        }
        case 'candidate': {
          console.log('Received ICE candidate ...');
          const candidate = new RTCIceCandidate(message.ice);
          console.log(candidate);
          addIceCandidate(candidate);
          break;
        }
        case 'close': {
          console.log('peer is closed ...');
          hangUp();
          break;
        }
        case 'windowRect': {
          console.log('start tablet mode')
          const rect: WindowRect = message.rect
          console.log(rect)
          store.windowRect.set(rect)
          store.isTabletMode.set(true)
          const { init } = useTablet(ws, get(store.remoteVideoElement))
          init()
          break
        }
        case 'error': {
          console.error(message.data)
          break
        }
        default: { 
          console.log("Invalid message"); 
          break;              
        }         
      }
    };
    return ws
  }

  // ICE candaidate受信時にセットする
  function addIceCandidate(candidate: RTCIceCandidate) {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (peerConnection) {
      peerConnection.addIceCandidate(candidate);
    }
    else {
      console.warn('PeerConnection not exist!');
      return;
    }
  }

  // ICE candidate生成時に送信する
  function sendIceCandidate(candidate: RTCIceCandidate) {
    console.log('---sending ICE candidate ---');
    const m = { type: 'candidate', ice: candidate }
    const message = JSON.stringify(m);
    console.log('sending candidate=' + message);
    const ws: WebSocket = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, m, ws)
  }

  const setStreamByID = async (id: string, localVideo: HTMLMediaElement) => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: id
        }
      }
    })
    store.localStream.set(stream)
    console.log('setted localStream: ', stream)
    playVideo(localVideo, stream)
  }

  // Videoの再生を開始する
  function playVideo(element : HTMLMediaElement, stream: MediaStream) {
    if (element.srcObject) {
      console.warn("already setted")
      return
    }
    try {
      const s = new MediaStream()
      element.srcObject = s;
      stream.getTracks().forEach(v => s.addTrack(v))
      element.onloadedmetadata = () => {
        console.log('loaded meta data')
        element.play();
      }
      console.log(element)
    } catch(error) {
      console.error('error auto play:' + error);
    }
  }

  // WebRTCを利用する準備をする
  function prepareNewConnection(isOffer: boolean) {
    const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
    const peer = new RTCPeerConnection(pc_config);

    // リモートのMediStreamTrackを受信した時
    peer.ontrack = async (evt) => {
      console.log('-- peer.ontrack()');
      store.isConnected.set(true)
      store.remoteVideoStream.set(evt.streams[0])
      const remoteVideoElement: HTMLMediaElement = get(store.remoteVideoElement)
      console.log(remoteVideoElement)
      console.log(evt.streams[0])
      if (remoteVideoElement) {
        playVideo(remoteVideoElement, evt.streams[0])
      }
      // playVideo(remoteVideo, evt.streams[0]);
    };

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
      if (evt.candidate) {
        console.log(evt.candidate);
        sendIceCandidate(evt.candidate);            
      } else {
        console.log('empty ice event');
        // sendSdp(peer.localDescription);
      }
    };

    // Offer側でネゴシエーションが必要になったときの処理
    peer.onnegotiationneeded = async () => {
      try {
        if(isOffer){
          const negotiationneededCounter = get(store.negotiationneededCounter)
          if(negotiationneededCounter === 0){
            console.warn('createOffer')
            const offer = await peer.createOffer();
            console.log('createOffer() succsess in promise');
            await peer.setLocalDescription(offer);
            console.log('setLocalDescription() succsess in promise');
            const id = sendSdp(peer.localDescription);
            store.negotiationneededCounter.update(v => v + 1)
          }
        }
      } catch(err){
        console.error('setLocalDescription(offer) ERROR: ', err);
      }
    }

    // ICEのステータスが変更になったときの処理
    peer.oniceconnectionstatechange = function() {
      console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
      switch (peer.iceConnectionState) {
        case 'closed':
        case 'failed':
          const peerConnection: RTCPeerConnection = get(store.peerConnection)
          if (peerConnection) {
            hangUp();
            store.isConnected.set(false)
          }
          break;
        case 'disconnected':
          break;
      }
    };
    const mouseMoveChannel = peer.createDataChannel('mouseMove')
    console.log(mouseMoveChannel)
    mouseMoveChannel.onmessage = function (event) {
      console.log("データチャネルメッセージ取得:", event.data);
    };
    
    mouseMoveChannel.onopen = function () {
      console.log("データチャネルのオープン");
      // mouseMoveChannel?.send(new Blob([JSON.stringify({ x: 0, y: -10 })], { type: 'text/plain' }));
      // mouseMoveChannel?.send(JSON.stringify({ x: 0, y: -10 }));
    };
    
    mouseMoveChannel.onclose = function () {
      console.log("データチャネルのクローズ");
    };
    store.mouseMoveChannel.set(mouseMoveChannel)
    
    const localStream: MediaStream = get(store.localStream)
    console.log(localStream)
    // ローカルのMediaStreamを利用できるようにする
    if (localStream) {
      console.log('Adding local stream...');
      localStream.getTracks().forEach(track => peer.addTrack(track, (localStream as MediaStream)));
    } else {
      console.warn('no local stream, but continue.');
    }

    return peer;
  }

  // 手動シグナリングのための処理を追加する
  function sendSdp(sessionDescription: RTCSessionDescription | null) {
    if (!sessionDescription) {
      console.error('sessionDescription is NULL')
      return
    }
    console.log('---sending sdp ---');
    // const rId = Math.floor(Math.random() * 100)
    const m = { type: sessionDescription.type, sdp: sessionDescription.sdp }
    const message = JSON.stringify(m);
    console.log('sending SDP=' + message);
    const ws: WebSocket = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, m, ws)

    return
  }

  // Connectボタンが押されたらWebRTCのOffer処理を開始
  function connect() {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (!peerConnection) {
      console.log('make Offer');
      store.peerConnection.set(prepareNewConnection(true))
    }
    else {
      console.warn('peer already exist.');
    }
  }

  // Answer SDPを生成する
  async function makeAnswer() {
    console.log('sending Answer. Creating remote session description...' );
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (!peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try{
      let answer = await peerConnection.createAnswer();
      console.log('createAnswer() succsess in promise');
      await peerConnection.setLocalDescription(answer);
      console.log('setLocalDescription() succsess in promise');
      sendSdp(peerConnection.localDescription);
    } catch(err){
      console.error(err);
    }
  }

  // Offer側のSDPをセットする処理
  async function setOffer(sessionDescription: RTCSessionDescription) {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (peerConnection) {
      console.error('peerConnection alreay exist!');
    }
    const newPeerConnection = prepareNewConnection(false);
    store.peerConnection.set(newPeerConnection)
    try{
      await newPeerConnection.setRemoteDescription(sessionDescription);
      console.log('setRemoteDescription(offer) succsess in promise');
      await makeAnswer();
      // 怪しい
    } catch(err){
      console.error('setRemoteDescription(offer) ERROR: ', err);
    }
  }
  
  // Answer側のSDPをセットする場合
  async function setAnswer(sessionDescription: RTCSessionDescription) {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (!peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try {
      await peerConnection.setRemoteDescription(sessionDescription);
      console.log('setRemoteDescription(answer) succsess in promise');
    } catch(err){
      console.error('setRemoteDescription(answer) ERROR: ', err);
    }
  }

  // P2P通信を切断する
  function hangUp(video?: HTMLMediaElement){
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (peerConnection) {
      if(peerConnection.iceConnectionState !== 'closed'){
        peerConnection.close();
        store.peerConnection.set(null)
        store.negotiationneededCounter.set(0)
        console.log('sending close message');
        if (video) {
          video.srcObject = null
        }
        const ws: WebSocket = get(store.ws)
        if (!ws) {
          console.error('ws is NULL !!!')
          return
        }
        sendWSMessageWithID(id, { type: 'close' }, ws)
        store.remoteVideoStream.set(null)
        return;
      }
    }
    console.log('peerConnection is closed.');
  }

  function sendMouseMove(dPoint: { x: number, y: number }) {
    const mouseMoveChannel: RTCDataChannel = get(store.mouseMoveChannel)
    console.log(mouseMoveChannel)
    mouseMoveChannel.send(JSON.stringify({ dPoint: dPoint }))
  }

  const connectHost = () => {
    const ws: WebSocket = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, { type: 'connect' }, ws)
  }
  return {
    setupWS,
    setStreamByID,
    hangUp,
    connect,
    sendMouseMove,
    connectHost,
    playVideo
  }
}

export default useWebRTC
