import { get } from "svelte/store"
import useDB from "../../lib/useDB"
import { sendWSMessageWithID } from "../../lib/utils"
import { store } from "../../store"
import useTouch from "./Controls/use/useTouch"
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

export const toggleTabletMode = async (e: MouseEvent) => {
  e.stopPropagation()
  const prev: boolean = get(store.isTabletMode)
  const ws: WebSocket = get(store.ws)
  const remoteMediaElement: HTMLMediaElement = get(store.remoteVideoElement)
  const { dispose } = useTablet(ws, remoteMediaElement)
  if (prev) {
    const { init: initDB } = useDB()
    dispose(remoteMediaElement)
    await initDB()
  }
  if (!prev) {
    sendWSMessageWithID(get(store.me), { type: 'tabletMode' }, ws)
  }
}
