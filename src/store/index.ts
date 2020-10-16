import { writable } from 'svelte/store'
import type { TabletSetting } from '../components/Tablet/useSetting'
import type { WindowRect } from '../lib/coordinary'
import type { FFmpegWorker } from '@ffmpeg/ffmpeg'

export const store = {
  remoteVideoElement: writable<null | HTMLMediaElement | HTMLVideoElement>(null),
  peerConnection: writable<null | RTCPeerConnection>(null),
  negotiationneededCounter: writable(0),
  remoteVideoStream: writable<null | MediaStream>(null),
  ws: writable<WebSocket | null>(null),
  dataChannel: writable<RTCDataChannel | null>(null),
  isConnected: writable(false),
  connection: writable<IDBDatabase | null>(null),
  isTabletMode: writable(false),
  windowRect: writable<WindowRect | null>(null),
  videoRegion: writable<Region | null>(null),
  isIOS: writable(false),
  container: writable<HTMLElement | null>(null),

  setting: writable<TabletSetting | null>(null),

  me: writable<string>(''),

  buffer: writable<Blob[]>([]),
  ffmpeg: writable<FFmpegWorker | null>(null),
  editableMovie: writable<Uint8Array | null>(null),
  downloadBlob: writable<{ data: Blob, type: string, callBack?: () => void } | null>(null),
}
