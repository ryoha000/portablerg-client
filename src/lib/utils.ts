import { store } from "../store"
import { get } from 'svelte/store'
import { createFFmpeg } from '@ffmpeg/ffmpeg'
// @ts-ignore
import { push } from 'svelte-spa-router'

export const initializeFFmpeg = async () => {
  const ffmpeg = createFFmpeg({
    log: true
  });
  await ffmpeg.load();
  store.ffmpeg.set(ffmpeg)
}

export const sendDataMessage = (
  obj: Object,
  channel: RTCDataChannel
) => {
  channel.send(JSON.stringify(obj))
}

export const sendWSMessageWithID = (
  id: string,
  obj: Object,
  ws: WebSocket
) => {
  ws.send(JSON.stringify({ ...obj, id: id }))
}

export const playVideo = (element : HTMLMediaElement, stream: MediaStream) => {
  console.log('play video')
  if (element.srcObject) {
    console.warn("already setted")
    return
  }
  try {
    element.srcObject = stream
    element.onloadedmetadata = () => {
      console.log('loaded meta data')
      element.play();
    }
    startRecord(stream)
  } catch(error) {
    console.error('error auto play:' + error);
  }
}

const startRecord = (stream: MediaStream) => {
  store.chunks.set([])
  const prevRecorder: MediaRecorder = get(store.recorder)
  if (prevRecorder && prevRecorder.state === 'recording') {
    prevRecorder.stop()
  }
  const option = {
    mimeType: 'video/webm;codecs=h264,opus'
  }
  const recorder = new MediaRecorder(stream, option)
  console.log(recorder)
  console.log(recorder.mimeType)
  setTimeout(() => {
    console.log(recorder.mimeType)
  }, 100);
  recorder.ondataavailable = (e) => {
    store.chunks.update(v => {
      v.push(e.data)
      return v
    })
  }
  recorder.onerror = (e) => { console.error(e) }
  recorder.start(1000)
  store.recorder.set(recorder)
}

export const saveRecord = async () => {
  const dataArr = new Uint8Array(await (new Blob(get(store.chunks)).arrayBuffer()))
  await transcode(dataArr)
}

const transcode = async (dataArr: Uint8Array) => {
  const ffmpeg = getFFmpeg()
  const name = 'record.webm';
  await ffmpeg.write(name, dataArr);
  await ffmpeg.transcode(name, 'output.mp4', '-vcodec copy -acodec copy -strict -2');
  const data = ffmpeg.read('output.mp4');
  store.editableMovie.set(data)
  push('/movie')
  return
}

export const trimOutputMovie = async (from: number, to: number) => {
  const ffmpeg = getFFmpeg()
  const name = `${getDate()}.mp4`
  await ffmpeg.trim(
    'output.mp4',
    name,
    getHHMMSS(from),
    getHHMMSS(to),
    '-vcodec copy -acodec copy -strict -2'
  )
  return name
}

export const saveMovie = (name: string) => {
  const ffmpeg = getFFmpeg()
  const data = ffmpeg.read(name);
  const aTag = document.createElement("a");
  document.body.appendChild(aTag)
  aTag.download = name
  aTag.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
  aTag.click()
  aTag.remove()
  push('/client')
}

const getHHMMSS = (num: number) => {
  console.log(num / 1000, `${getHours(num)}:${getMinutes(num)}:${getSeconds(num)}`)
  return `${getHours(num)}:${getMinutes(num)}:${getSeconds(num)}`
}

const getHours = (num: number) => {
  return Math.floor(num / 60 / 60 % 60)
}

const getMinutes = (num: number) => {
  return Math.floor(num / 60 % 60)
}

const getSeconds = (num: number) => {
  return num % 60
}

const getFFmpeg = () => {
  const ffmpeg: FFmpeg | null = get(store.ffmpeg)
  if (!ffmpeg) {
    console.error('ffmpeg is NULL !!!')
    throw 'ffmpeg is NULL !!!'
  }
  return ffmpeg
}

const capture = async () => {
  const stream: MediaStream = get(store.remoteVideoStream)
  if (stream) {
    const tracks = stream.getVideoTracks()
    if (tracks.length > 0) {
      const track = tracks[0]
      const capabilities = track.getCapabilities()
      console.log(capabilities)
      const cap = new ImageCapture(track)
      console.log(cap)
      return (await cap.grabFrame())
    }
  }
  return null
}

const getDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${fullTime(now.getMonth() + 1)}-${fullTime(now.getDate())}-${fullTime(now.getHours())}-${fullTime(now.getMinutes())}`
}

const fullTime = (t: number) => {
  return `${('0' + t).slice(-2)}`
}

const download = (blob: Blob, type: string) => {
  const aTag = document.createElement("a");
  document.body.appendChild(aTag)
  aTag.download = `${getDate()}.${type}`
  aTag.href = URL.createObjectURL(blob)
  aTag.click()
  aTag.remove()
}

export const captureAndSave = async () => {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  const img: ImageBitmap | null = await capture()
  canvas.width = img.width
  canvas.height = img.height
  const context = canvas.getContext('bitmaprenderer')
  if (context) {
    context.transferFromImageBitmap(img)
  } else {
    canvas.getContext('2d').drawImage(img, 0, 0)
  }
  canvas.toBlob(blob => {
    download(blob, 'png')
  })
  canvas.remove()
}
