import { get } from 'svelte/store';
import useTablet from '../components/Tablet/use/useTablet';
import { store } from '../store';
import type { WindowRect } from './coordinary';
import { playVideo, sendWSMessageWithID } from './utils';
// @ts-ignore
import { push } from 'svelte-spa-router'

const useWebRTC = () => {
  let id: string | null = null
  store.me.subscribe(v => id = v)
  let isConnected = false
  store.isConnected.subscribe(v => isConnected = v)
  store.ws.subscribe(v => {
    if (v === null) {
      console.log('ws set null')
      setTimeout(() => {
        if (!get(store.ws)) {
          console.log('reconnecting to websocket server')
          setupWS()
        }
      }, 1000);
    }
  })

  const setupWS = () => {
    const wsUrl = `wss://ryoha.trap.show/portablerg-server/`;
    const ws = new WebSocket(wsUrl);
    store.ws.set(ws)
    ws.onopen = (evt) => {
      console.log('ws open()');
      if (id) {
        sendWSMessageWithID(id, { type: 'reconnectAnswer' }, ws)
      }
    };
    ws.onclose = () => {
      store.ws.set(null)
    }
    ws.onerror = (err) => {
      console.error('ws onerror() ERR:', err);
      store.ws.set(null)
    };
    ws.onmessage = (evt) => {
      try {
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
            break;
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
      } catch (e) {
        console.error(e)
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
      setupWS()
      return
    }
    sendWSMessageWithID(id, m, ws)
  }

  // WebRTCを利用する準備をする
  function prepareNewConnection(isOffer: boolean) {
    const pc_config = {"iceServers":[ {"urls":"stun:stun.webrtc.ecl.ntt.com:3478"} ]};
    const peer = new RTCPeerConnection(pc_config);

    peer.ondatachannel = (e) => {
      if (e.channel.label === 'dataChannel') {
        const dataChannel =  e.channel
        dataChannel.onerror = (e) => { console.error(e) }
        store.dataChannel.set(dataChannel)
        dataChannel.onmessage = (e) => {
          const message = JSON.parse(e.data)
          switch (message.type) {
            case 'windowRect': {
              const rect: WindowRect = message.rect
              const ele: HTMLMediaElement = get(store.remoteVideoElement)
              const size = {
                width: ele.videoWidth,
                height: ele.videoHeight
              }
              if (ele && size.width && size.height) {
                store.windowRect.set({ ...rect, left: rect.right - size.width, top: rect.bottom - size.height })
                store.isTabletMode.set(true)
                const dc: RTCDataChannel = get(store.dataChannel)
                const { init } = useTablet(dc, get(store.remoteVideoElement))
                init()
              }
              break
            }
            default: {
              console.warn('invalid datachannel message')
            }
          }
        }
      }
      if (e.channel.label === 'nonEditMovieChannel') {
        const nonEditMovieChannel = e.channel
        nonEditMovieChannel.onmessage = (e) => {
          store.editableMovie.set(e.data)
        }
      }
      if (e.channel.label === 'editMovieChannel') {
        const editMovieChannel = e.channel
      }
    }

    // リモートのMediStreamTrackを受信した時
    peer.ontrack = async (evt) => {
      console.log('-- peer.ontrack()');
      store.isConnected.set(true)
      store.remoteVideoStream.set(evt.streams[0])
      const remoteVideoElement: HTMLMediaElement = get(store.remoteVideoElement)
      const isIOS: boolean = get(store.isIOS)
      if (remoteVideoElement && !isIOS) {
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
        case 'connected': {
          const ws: WebSocket | null = get(store.ws)
          if (!ws) {
            console.error('connected, but ws is NULL!!!')
            setupWS()
            return
          }
          sendWSMessageWithID(id, { type: 'connected' }, ws)
          break
        }
        case 'closed':
        case 'failed':
          if (peerConnection) {
            hangUp();
          }
          break;
        case 'disconnected':
          if (peerConnection) {
            hangUp();
          }
          push('/')
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
      setupWS()
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
        console.log('hangup')
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
      setupWS()
      return
    }
    sendWSMessageWithID(id, { type: 'connect' }, ws)
  }

  return {
    setupWS,
    hangUp,
    connectHost
  }
}

export default useWebRTC
