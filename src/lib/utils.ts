import { store } from "../store"
import { get } from 'svelte/store'
import { createWorker, setLogging } from '@ffmpeg/ffmpeg'
// @ts-ignore
import { push } from 'svelte-spa-router'

export const initializeFFmpeg = async () => {
  try {
    setLogging(true)
    const worker = createWorker({ logger: ({ message }) => console.log(message) })
    await worker.load();
    store.ffmpeg.set(worker)
  } catch (e) {
    console.error(e)
  }
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
  } catch(error) {
    console.error('error auto play:' + error);
  }
}

export const saveRecord = async (blob: Blob) => {
  try {
    const arrBuf = await getArrayBufferFromBlob(blob)
    if (typeof arrBuf === 'string') {
      return
    }
    const dataArr = new Uint8Array(arrBuf)
    await transcode(dataArr)
  } catch (e) {
    alert(e.toString())
  }
}

export const transcode = async (dataArr: Uint8Array) => {
  try {
    const ffmpeg = getFFmpeg()
    const name = 'record.webm';
    try {
      await ffmpeg.remove(name)
    } catch {}
    await ffmpeg.write(name, dataArr);
    try {
      await ffmpeg.remove('output.mp4')
    } catch {}
    await ffmpeg.transcode(name, 'output.mp4', '-vcodec copy -acodec copy -strict -2');
    const { data } = await ffmpeg.read('output.mp4');
    store.editableMovie.set(data)
    push('/movie')
  } catch (e) { console.error(e) }
  return
}

const getArrayBufferFromBlob = async (blob: Blob): Promise<ArrayBuffer | string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.addEventListener('load', (e) => resolve(fr.result))
    fr.addEventListener('error', (e) => reject(e))
    fr.readAsArrayBuffer(blob)
  })
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

export const saveMovie = async (name: string) => {
  const ffmpeg = getFFmpeg()
  const { data } = await ffmpeg.read(name);
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
  aTag.target = '_blank'
  aTag.click()
  aTag.remove()
}

export const captureAndSave = async () => {
  console.log('capture start')
  const ele: HTMLVideoElement | HTMLMediaElement = get(store.remoteVideoElement)
  if (ele) {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    const size = {
      width: ele.videoWidth,
      height: ele.videoHeight
    }
    canvas.width = size.width
    canvas.height = size.height
    alert(JSON.stringify(size))
    canvas.getContext('2d').drawImage((ele as HTMLVideoElement), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      download(blob, 'png')
    })
    canvas.remove()
  }
}

export const concatenation = (segments: ArrayBuffer[]) => {
  let sumLength = 0;
  for(let i = 0; i < segments.length; ++i){
    sumLength += segments[i].byteLength;
  }
  const whole = new Uint8Array(sumLength);
  let pos = 0;
  for(let i = 0; i < segments.length; ++i){
    whole.set(new Uint8Array(segments[i]),pos);
    pos += segments[i].byteLength;
  }
  return whole;
}
