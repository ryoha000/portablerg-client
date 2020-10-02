interface MediaDevices {
  getDisplayMedia: (MediaStreamConstraints) => MediaStream
}

interface MediaTrackConstraints {
  mandatory: {
    chromeMediaSource?: 'desktop',
    chromeMediaSourceId?: string
  }
}