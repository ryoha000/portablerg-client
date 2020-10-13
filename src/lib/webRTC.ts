import { get } from 'svelte/store';
import useTablet from '../components/Tablet/use/useTablet';
import { store } from '../store';
import type { WindowRect } from './coordinary';
import { sendDataMessage, sendWSMessageWithID } from './utils';
// @ts-ignore
import { push } from 'svelte-spa-router'

const useWebRTC = () => {
  let id: string | null = null
  store.me.subscribe(v => id = v)
  let isConnected = false
  store.isConnected.subscribe(v => isConnected = v)

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
          if (!isConnected) {
            setOffer(message);
          } else {
            deleteConnection()
            setTimeout(() => {
              console.warn('reconnecting host')
              connectHost()
            }, 5000);
          }
          break;
        }
        case 'candidate': {
          const candidate = new RTCIceCandidate(message.ice);
          addIceCandidate(candidate);
          break;
        }
        case 'close': {
          console.log('peer is closed ...');
          hangUp();
          setTimeout(() => {
            console.warn('reconnecting host')
            connectHost()
          }, 5000);
          break;
        }
        case 'windowRect': {
          const rect: WindowRect = message.rect
          store.windowRect.set(rect)
          store.isTabletMode.set(true)
          const dc: RTCDataChannel = get(store.dataChannel)
          const { init } = useTablet(dc, get(store.remoteVideoElement))
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
    const m = { type: 'candidate', ice: candidate }
    const ws: WebSocket = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, m, ws)
  }

  // Videoの再生を開始する
  function playVideo(element : HTMLMediaElement, stream: MediaStream) {
    console.log('play video')
    if (element.srcObject) {
      console.warn("already setted")
      return
    }
    try {
      element.srcObject = stream
      // const s = new MediaStream()
      // element.srcObject = s;
      // stream.getTracks().forEach(v => s.addTrack(v))
      // stream.getTracks().forEach(v => s.addTrack(v))
      element.onloadedmetadata = () => {
        console.log('loaded meta data')
        element.play();
      }
    } catch(error) {
      console.error('error auto play:' + error);
    }
  }

  // WebRTCを利用する準備をする
  function prepareNewConnection(isOffer: boolean) {
    const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
    const peer = new RTCPeerConnection(pc_config);

    peer.ondatachannel = (e) => {
      const dataChannel =  e.channel
      dataChannel.onerror = (e) => { console.error(e) }
      store.dataChannel.set(dataChannel)
    }

    // リモートのMediStreamTrackを受信した時
    peer.ontrack = async (evt) => {
      console.log('-- peer.ontrack()');
      store.isConnected.set(true)
      store.remoteVideoStream.set(evt.streams[0])
      const remoteVideoElement: HTMLMediaElement = get(store.remoteVideoElement)
      if (remoteVideoElement && !get(store.isIOS)) {
        playVideo(remoteVideoElement, evt.streams[0])
      }
    };

    // ICE Candidateを収集したときのイベント
    peer.onicecandidate = evt => {
      if (evt.candidate) {
        sendIceCandidate(evt.candidate);            
      } else {
        console.log('empty ice event');
      }
    };

    // Offer側でネゴシエーションが必要になったときの処理
    peer.onnegotiationneeded = async () => {
      try {
        if(isOffer){
          const negotiationneededCounter = get(store.negotiationneededCounter)
          if(negotiationneededCounter === 0){
            console.log('createOffer')
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            sendSdp(peer.localDescription);
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
      const peerConnection: RTCPeerConnection = get(store.peerConnection)
      switch (peer.iceConnectionState) {
        case 'closed':
        case 'failed':
          if (peerConnection) {
            hangUp();
          }
          break;
        case 'disconnected':
          if (peerConnection) {
            hangUp();
            push('/')
          }
          break;
      }
    };

    return peer;
  }

  // 手動シグナリングのための処理を追加する
  function sendSdp(sessionDescription: RTCSessionDescription | null) {
    if (!sessionDescription) {
      console.error('sessionDescription is NULL')
      return
    }
    const m = { type: sessionDescription.type, sdp: sessionDescription.sdp }
    const ws: WebSocket = get(store.ws)
    if (!ws) {
      console.error('ws is NULL !!!')
      return
    }
    sendWSMessageWithID(id, m, ws)

    return
  }

  // Answer SDPを生成する
  async function makeAnswer() {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (!peerConnection) {
      console.error('peerConnection NOT exist!');
      return;
    }
    try{
      let answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
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
      await makeAnswer();
      // 怪しい
    } catch(err){
      console.error('setRemoteDescription(offer) ERROR: ', err);
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
        store.remoteVideoStream.set(null)
        store.isConnected.set(false)
        const remoteVideoElement: HTMLMediaElement = get(store.remoteVideoElement)
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = null
        }
        if (video) {
          video.srcObject = null
        }
        return;
      }
    }
    console.log('peerConnection is closed.');
  }

  const deleteConnection = () => {
    const peerConnection: RTCPeerConnection = get(store.peerConnection)
    if (peerConnection) {
      if(peerConnection.iceConnectionState !== 'closed'){
        console.log('deleteConnection')
        peerConnection.close();
        store.peerConnection.set(null)
        store.negotiationneededCounter.set(0)
        const remoteVideoElement: HTMLMediaElement = get(store.remoteVideoElement)
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = null
        }
        store.remoteVideoStream.set(null)
        store.isConnected.set(false)
        return;
      }
    }
    console.log('peerConnection is closed.');
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
    hangUp,
    connectHost,
    playVideo
  }
}

export default useWebRTC
