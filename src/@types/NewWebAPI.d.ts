class ImageCapture {
  constructor(track: MediaStreamTrack)
}
interface ImageCapture {
  track: MediaStreamTrack
  takePhoto: () => Promise<Blob>
  grabFrame: () => Promise<ImageBitmap>
}
