import { get } from "svelte/store"
import useDB from "../../lib/useDB"
import { sendDataMessage } from "../../lib/utils"
import { store } from "../../store"
import useTablet from "./use/useTablet"
import { ControlStyle, controlStyles } from "./useSetting"

export const getNextIndex = (nowIndex: number, d: 1 | -1) => {
  const tmp: ControlStyle[] = get(controlStyles)
  if (nowIndex === -1) {
    if (tmp.length === 0) {
      alert('コントロールが登録されていません')
      return 0
    }
    return 0
  }
  // 右端の時
  if (nowIndex + 1 === tmp.length) {
    if (d === 1) {
      return 0
    }
  }
  // 左端の時
  if (nowIndex === 0) {
    if (d === -1) {
      return tmp.length - 1
    }
  }
  return nowIndex + d
}

export const toggleTabletMode = async (e: Event) => {
  const prev: boolean = get(store.isTabletMode)
  const dc: RTCDataChannel | null = get(store.dataChannel)
  if (prev && dc) {
    const remoteMediaElement: HTMLMediaElement | null = get(store.remoteVideoElement)
    if (!remoteMediaElement) return
    const { dispose } = useTablet(dc, remoteMediaElement)
    const { init: initDB } = useDB()
    dispose(remoteMediaElement)
    await initDB()
    store.isTabletMode.set(false)
  }
  if (!prev && dc) {
    sendDataMessage({ type: 'tabletMode' }, dc)
  }
}
