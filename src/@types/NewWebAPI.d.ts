class ImageCapture {
  constructor(track: MediaStreamTrack)
}
interface ImageCapture {
  track: MediaStreamTrack
  takePhoto: () => Promise<Blob>
  grabFrame: () => Promise<ImageBitmap>
}

class MediaRecorder {
  constructor(stream: MediaStream, options?: any)
}
interface MediaRecorder {
  mimeType: Readonly<MimeType>
  state: Readonly<'inactive' | 'recording' | 'paused'>
  stream: MediaStream
  videoBitsPerSecond: Readonly<number>
  audioBitsPerSecond: Readonly<number>
  pause: () => void
  resume: () => void
  start: (timeslice: number) => void
  stop: () => void
  requestData: () => Blob
  ondataavailable: (evt: BlobEvent) => void | Promise<void>
  onerror: (evt: CustomEvent) => void
  onstop: () => void
}

interface HTMLMediaElement {
  videoWidth: number
  videoHeight: number
}
interface BlobEvent {
  ibubbles: boolean
  cancelBubble: boolean
  cancelable: boolean
  composed: boolean
  currentTarget: MediaRecorder
  data: Blob
  defaultPrevented: boolean
  eventPhase: 0
  isTrusted: boolean
  path: []
  returnValue: boolean
  srcElement: MediaRecorder
  target: MediaRecorder
  timeStamp: number
  timecode: number
  type: "dataavailable"
}
