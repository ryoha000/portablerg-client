import type { SliderEvent } from "svelte-slider"
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
    try {
      videoEle.onloadedmetadata = () => {
        duration = videoEle.duration
        movieDuration.set(duration)
      }
      videoEle.addEventListener('timeupdate', () => {
        currentTime = videoEle.currentTime
        if (endTime * duration < currentTime) {
          videoEle.pause()
          currentTime = startTime * duration
          videoEle.currentTime = currentTime
        }
      })
      ele = videoEle
    } catch (e) {
      console.error(e)
    }
    return
  }

  const change = (e: SliderEvent) => {
    try {
      const arr = e.detail
      if (!ele || arr.length !== 2) return
      if (arr[0] === startTime || arr[0] === endTime) {
        currentTime = duration * arr[1]
        ele.currentTime = currentTime
      }
      if (arr[1] === startTime || arr[1] === endTime) {
        currentTime = duration * arr[0]
        ele.currentTime = currentTime
      }
      [startTime, endTime] = arr
      if (startTime === endTime) {
        console.log(duration)
      }
      movieDuration.set((endTime - startTime) * duration)
    } catch (e) {
      console.error(e)
    }
  }

  const confirmSave = async () => {
    try {
      if (startTime === endTime) {
        alert(`開始時刻と終了時刻が同じです。startTime: ${startTime}, endTime: ${endTime}`)
        return
      }
      const title = await trimOutputMovie(startTime * duration, endTime * duration)
      if (title) {
        await saveMovie(title)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const togglePlay = async () => {
    try {
      if (!ele) return
      if (ele.currentTime === duration * endTime) {
        ele.currentTime = duration * startTime
      }
      if (ele.paused) {
        await ele.play()
      } else {
        ele.pause()
      }
    } catch (e) {
      console.error(e)
    }
  }
  return { init, change, confirmSave, togglePlay }
}

export default useTabletMovie
