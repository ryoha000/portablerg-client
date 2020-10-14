import { store } from "../store"
import { get } from 'svelte/store'
import { createFFmpeg } from '@ffmpeg/ffmpeg'

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
    startRecord(stream)
    element.onloadedmetadata = () => {
      console.log('loaded meta data')
      element.play();
    }
  } catch(error) {
    console.error('error auto play:' + error);
  }
}

const startRecord = (stream: MediaStream) => {
  console.log('start record')
  store.chunks.set([])
  const prevRecorder: MediaRecorder = get(store.recorder)
  if (prevRecorder && prevRecorder.state === 'recording') {
    prevRecorder.stop()
  }
  const option = {
    // audioBitsPerSecond : 128000,
    // videoBitsPerSecond : 2500000,
    mimeType: 'video/webm;codecs=h264,opus'
  }
  const recorder = new MediaRecorder(stream, option)
  console.log(recorder)
  console.log(recorder.mimeType)
  setTimeout(() => {
    console.log(recorder.mimeType)
  }, 100);
  recorder.ondataavailable = (e) => {
    // console.log(e)
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

  const videoBlob = new Blob(get(store.chunks), { type: 'video/webm;codecs=h264,opus' })
  const url = URL.createObjectURL(videoBlob)
  download(videoBlob, 'webm')
  await transcode(dataArr)
  // download(videoBlob, 'mp4')
}

const transcode = async (dataArr: any) => {
  // console.log(dataArr)
  const ffmpeg = createFFmpeg({
    log: true
  });
  const start = performance.now()
  const name = 'record.webm';
  console.log('Loading ffmpeg-core.js');
  await ffmpeg.load();
  console.log('Start transcoding');
  await ffmpeg.write(name, dataArr);
  await ffmpeg.transcode(name, 'output.mp4', '-vcodec copy -acodec copy -strict -2');
  console.log('Complete transcoding')
  console.log('time(): ', (performance.now() - start) / 1000)
  const data = ffmpeg.read('output.mp4');

  const aTag = document.createElement("a");
  document.body.appendChild(aTag)
  aTag.download = `output.mp4`
  aTag.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
  aTag.click()
  aTag.remove()
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
