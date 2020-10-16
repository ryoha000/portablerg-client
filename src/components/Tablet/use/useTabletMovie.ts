import { writable } from "svelte/store"
import { saveMovie, trimOutputMovie } from "../../../lib/utils"

export const movieDuration = writable(0)

const useTabletMovie = () => {
  let ele: HTMLMediaElement | null = null
  let duration = 0
  let startTime = 0
  let endTime = 1
  let currentTime = 0

  const init = (videoEle: HTMLMediaElement) => {
    videoEle.onloadedmetadata = (e) => {
      duration = videoEle.duration
      movieDuration.set(duration)
    }
    videoEle.addEventListener('timeupdate', () => {
      currentTime = videoEle.currentTime
      if (endTime * duration < currentTime) {
        videoEle.pause()
      }
    })
    ele = videoEle
    endTime = duration
    return
  }

  const change = (e: SliderEvent) => {
    const arr = e.detail
    if (arr[0] === startTime || arr[0] === endTime) {
      currentTime = duration * arr[1]
      ele.currentTime = currentTime
    }
    if (arr[1] === startTime || arr[1] === endTime) {
      currentTime = duration * arr[0]
      ele.currentTime = currentTime
    }
    [startTime, endTime] = arr
    movieDuration.set((endTime - startTime) * duration)
  }

  const confirmSave = async () => {
    if (startTime === endTime) {
      alert('開始時刻と終了時刻が同じです')
      return
    }
    const title = await trimOutputMovie(startTime * duration, endTime * duration)
    await saveMovie(title)
    return
  }

  const togglePlay = async () => {
    if (ele.currentTime === duration * endTime) {
      ele.currentTime = duration * startTime
    }
    if (ele.paused) {
      await ele.play()
    } else {
      ele.pause()
    }
  }
  return { init, change, confirmSave, togglePlay }
}

export default useTabletMovie
