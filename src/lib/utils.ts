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

const CHUNK_BEHINDE = 1000
const MAX_RECORD_MINUTES = 5
const MAX_CHUNK_LENGTH = MAX_RECORD_MINUTES * 60 * 1000 / CHUNK_BEHINDE

const startRecord = (stream: MediaStream) => {
  store.chunks.set([])
  const prevRecorder: MediaRecorder = get(store.recorder)
  if (prevRecorder && prevRecorder.state === 'recording') {
    prevRecorder.stop()
  }
  const option = {
    mimeType: 'video/webm;codecs=h264,opus'
  }
  try {
    const recorder = new MediaRecorder(stream, option)
    recorder.ondataavailable = (e) => {
      store.chunks.update(v => {
        v.push(e.data)
        if (v.length === 10) {
          alert('10秒立ったよ～')
        }
        if (v.length > MAX_CHUNK_LENGTH) {
          v.shift()
        }
        return v
      })
    }
    recorder.onerror = (e) => { console.error(e) }
    recorder.start(CHUNK_BEHINDE)
    store.recorder.set(recorder)
  } catch {
    alert('MediaRecorderに対応していません')
  }
}

export const saveRecord = async () => {
  const recorder = getRecorder()
  try {
    recorder.stop()
    const dataArr = new Uint8Array(await (new Blob(get(store.chunks)).arrayBuffer()))
    await transcode(dataArr)
  } catch (e) {
    alert(e.toString())
  }
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

const getRecorder = () => {
  const recorder: MediaRecorder | null = get(store.recorder)
  if (!recorder) {
    console.error('recorder is NULL !!!')
    throw 'recorder is NULL !!!'
  }
  return recorder
}

// const capture = async () => {
//   const ele: HTMLVideoElement = get(store.remoteVideoElement)
//   if (ele) {
//     const canvas = document.createElement('canvas')
//     document.body.appendChild(canvas)
//     const size = {
//       width: ele.videoWidth,
//       height: ele.videoHeight
//     }
//     canvas.getContext('2d').drawImage(ele, 0, 0, size.width, size.height);
//     canvas.toBlob(blob => {
//       download(blob, 'png')
//     })
//     canvas.remove()
//   }
//   // const stream: MediaStream = get(store.remoteVideoStream)
//   // console.log(stream)
//   // if (stream) {
//   //   const tracks = stream.getVideoTracks()
//   //   if (tracks.length > 0) {
//   //     const track = tracks[0]
//   //     const capabilities = track.getCapabilities()
//   //     console.log(capabilities)
//   //     const cap = new ImageCapture(track)
//   //     console.log(cap)
//   //     try {
//   //       return (await cap.grabFrame())
//   //     } catch (e) {
//   //       console.error(e)
//   //       return
//   //     }
//   //   }
//   // }
//   return
// }

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
  // aTag.target = '_blank'
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
  // console.log('capture start')
  // const canvas = document.createElement('canvas')
  // document.body.appendChild(canvas)
  // console.log('add canvas')
  // const img: ImageBitmap | null = await capture()
  // console.log('get img bitmap')
  // if (!img) return
  // canvas.width = img.width
  // canvas.height = img.height
  // const context = canvas.getContext('bitmaprenderer')
  // if (context) {
  //   context.transferFromImageBitmap(img)
  //   console.log('bitmaprenderer')
  // } else {
  //   canvas.getContext('2d').drawImage(img, 0, 0)
  //   console.log('2d')
  // }
  // canvas.toBlob(blob => {
  //   download(blob, 'png')
  // })
  // console.log('to blob')
  // canvas.remove()
}
