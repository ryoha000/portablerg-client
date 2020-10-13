import { store } from "../store"
import { get } from 'svelte/store'

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
  return `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
}

export const captureAndSave = async () => {
  const canvas = new HTMLCanvasElement()
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
    const aTag = document.createElement("a");
    document.body.appendChild(aTag)
    aTag.download = `${getDate()}.png`
    aTag.href = URL.createObjectURL(blob)
    aTag.click()
    aTag.remove()
  })
  canvas.remove()
}
