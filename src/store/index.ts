import { writable } from 'svelte/store'
import type { TabletSetting } from '../components/Tablet/useSetting'

export const store = {
  localStream: writable<null | MediaStream>(null),
  remoteVideoElement: writable<null | HTMLMediaElement>(null),
  peerConnection: writable<null | RTCPeerConnection>(null),
  negotiationneededCounter: writable(0),
  remoteVideoStream: writable<null | MediaStream>(null),
  ws: writable<WebSocket | null>(null),
  mouseMoveChannel: writable<RTCDataChannel | null>(null),

  setting: writable<TabletSetting | null>(null)
}
