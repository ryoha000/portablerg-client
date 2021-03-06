import { store } from "../store"
import { get } from 'svelte/store'
import { createWorker, setLogging, FFmpegWorker } from '@ffmpeg/ffmpeg'
import { push } from 'svelte-spa-router'

export const initializeFFmpeg = async () => {
  try {
    setLogging(true)
    const worker = createWorker()
    // const worker = createWorker({ logger: ({ message }) => store.message.update(v => v + '\n' + message) })
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
    if (typeof arrBuf === 'string' || !arrBuf) {
      return
    }
    const dataArr = new Uint8Array(arrBuf)
    console.log('end to dataArr')
    const data = await transcode(dataArr)
    console.log('end to data')
    if (data) {
      store.editableMovie.set(data)
      push('/movie')
    }
  } catch (e) {
    console.error(e)
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
    await ffmpeg.transcode(name, 'output.mp4', '-vcodec copy -strict -2');
    const { data } = await ffmpeg.read('output.mp4');
    store.editableMovie.set(data)
    push('/movie')
    return data
  } catch (e) {
    await transcode(dataArr)
    console.error(e)
  }
  return
}

const getArrayBufferFromBlob = async (blob: Blob): Promise<ArrayBuffer | string | null> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.addEventListener('load', (e) => resolve(fr.result))
    fr.addEventListener('error', (e) => reject(e))
    fr.readAsArrayBuffer(blob)
  })
}

export const trimOutputMovie = async (from: number, to: number) => {
  try {
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
  } catch (e) {
    await trimOutputMovie(from, to)
    console.error(e)
  }
}

export const saveMovie = async (name: string) => {
  const ffmpeg = getFFmpeg()
  const { data } = await ffmpeg.read(name);
  await ffmpeg.remove(name)
  store.downloadBlob.set({
    data: new Blob([data.buffer], { type: 'video/mp4' }),
    type: 'mp4',
    callBack: () => {
      push('/client')
    }
  })
}

const getHHMMSS = (num: number) => {
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
  const ffmpeg: FFmpegWorker | null = get(store.ffmpeg)
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
  // iOS Chromeはaタグのdownloadもtarget="_blank"も効かない
  if (get(store.isIOS) && navigator.userAgent.match(/crios/i)) {
    window.open(URL.createObjectURL(blob), '_blank')
  } else {
    const aTag = document.createElement("a");
    document.body.appendChild(aTag)
    aTag.download = `${getDate()}.${type}`
    aTag.href = URL.createObjectURL(blob)
    aTag.target = '_blank'
    aTag.click()
    aTag.remove()
  }
}

export const captureAndSave = async () => {
  const ele: HTMLVideoElement | HTMLMediaElement | null = get(store.remoteVideoElement)
  if (ele) {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    const size = {
      width: ele.videoWidth,
      height: ele.videoHeight
    }
    canvas.width = size.width
    canvas.height = size.height
    canvas.getContext('2d')?.drawImage((ele as HTMLVideoElement), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        store.downloadBlob.set({ type: 'png', data: blob })
      }
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

export const waitDownload = () => {
  let blob: null | Blob = null
  let downloading = false
  store.downloadBlob.subscribe(v => {
    if (v && !downloading) {
      downloading = true
      blob = v.data
      download(blob, v.type)
      setTimeout(() => {
        downloading = false
        if (v.callBack) v.callBack()
      }, 2000);
    }
  })
}
