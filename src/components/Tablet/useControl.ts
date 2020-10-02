import { get } from "svelte/store"
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
      console.log('ふりだしに')
      return 0
    }
  }
  // 左端の時
  if (nowIndex === 0) {
    if (d === -1) {
      console.log('ゴールに')
      return tmp.length - 1
    }
  }
  return nowIndex + d
}
