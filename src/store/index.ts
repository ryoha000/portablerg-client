import { writable } from 'svelte/store'
import type { TabletSetting } from '../components/Tablet/useSetting'
import type { WindowRect } from '../lib/coordinary'

export const store = {
  remoteVideoElement: writable<null | (HTMLMediaElement & HTMLVideoElement)>(null),
  peerConnection: writable<null | RTCPeerConnection>(null),
  negotiationneededCounter: writable(0),
  remoteVideoStream: writable<null | MediaStream>(null),
  ws: writable<WebSocket | null>(null),
  dataChannel: writable<RTCDataChannel | null>(null),
  isConnected: writable(false),
  connection: writable<IDBDatabase | null>(null),
  isTabletMode: writable(false),
  windowRect: writable<WindowRect | null>(null),
  videoRegion: writable<Region>(null),
  isIOS: writable(false),
  container: writable(null),

  setting: writable<TabletSetting | null>(null),

  me: writable<string | null>(null),

  chunks: writable<Blob[]>([]),
  recorder: writable<MediaRecorder | null>(null),
  ffmpeg: writable<FFmpeg | null>(null),
  editableMovie: writable(null)
}
