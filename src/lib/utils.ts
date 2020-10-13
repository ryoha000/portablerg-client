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

export const confirm = (element: HTMLMediaElement, stream: MediaStream) => {
  if (window.confirm('デスクトップの画面を表示しますか？')) {
    playVideo(element, stream)
  } else {
    confirm(element, stream)
  }
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
