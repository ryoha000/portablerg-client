import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import type { TabletSetting } from './useSetting'
import { get, writable } from 'svelte/store'
import { getSetting } from '../../lib/useDB'
import { store } from '../../store'

export const overIndex = writable(-1)

const PADDING = 16
const HEIGHT = 64
const BOX_SIZE = HEIGHT + PADDING * 2

const useSort = (container: HTMLElement) => {
  const region: Region = new ZingTouch.Region(container, false, true);
  const tops: number[] = []
  const elements: (null | HTMLElement)[] = []
  let dragBuffer = 0
  let isDragging: boolean[] = []

  const init = async () => {
    const s: TabletSetting = await getSetting()
    for (const [i] of s.controlTemplates.entries()) {
      tops.push(BOX_SIZE * (i + 1) + PADDING)
      elements.push(null)
    }
    const onPanStart = (inputs: ZingInput[]) => {
      if (inputs.length === 0) {
        console.error('pan start error')
        return
      }
      const initial = inputs[0].initial
      dragBuffer = 0
      isDragging =isDragging.map(_ => false)
      tops.forEach((top, i) => {
        if (top < initial.y && initial.y < top + HEIGHT) {
          isDragging[i] = true
        }
      })
    }
  
    const onPanMove = (inputs: ZingInput[], state: any, element: HTMLElement, output: PanData) => {
      if (!output || output.data.length === 0) {
        return
      }
      const draggingIndex = isDragging.findIndex(v => v === true)
      const elem = elements[draggingIndex]
      if (draggingIndex === -1 || !elem) {
        return
      }
      const data = output.data[0]
      dragBuffer += data.change.y
      elem.style.transform = `translateY(${dragBuffer}px)`
      const dOver = Math.floor((dragBuffer + BOX_SIZE / 2) / BOX_SIZE)
      const oIndex = draggingIndex + dOver
      if (oIndex > tops.length + 1 || oIndex < 0) {
        if (isDragging.some(v => v === true)) {
          isDragging = isDragging.map(() => false)
          elem.style.transform = ''
          updateList(draggingIndex)
          overIndex.set(-1)
        }
        return
      }
      const newOverIndex = getValidIndex(oIndex, tops.length)
      overIndex.set(newOverIndex)
    }
  
    const onPanEnd = () => {
      const draggingIndex = isDragging.findIndex(v => v === true)
      const elem = elements[draggingIndex]
      if (draggingIndex === -1 || !elem) {
        return
      }
      isDragging.map(() => false)
      elem.style.transform = ''
      updateList(draggingIndex)
      overIndex.set(-1)
    }
  
    const customPan = new ZingTouch.Pan({ onStart: onPanStart, onMove: onPanMove, onEnd: onPanEnd })
    region.bind(container, customPan, () => {})
  }

  const setupElements = (ele: HTMLElement, index: number) => {
    elements[index] = ele
  }
  const updateList = (draggingIndex: number) => {
    const prev: TabletSetting | null = get(store.setting)
    if (!prev) return
    const tmp = prev.controlTemplates[draggingIndex]
    const oIndex: number = get(overIndex)
    if (oIndex === -1) {
      return
    }
    prev.controlTemplates[draggingIndex] = prev.controlTemplates[oIndex]
    prev.controlTemplates[oIndex] = tmp
    store.setting.set(prev)
  }
  return { init, setupElements }
};

const getValidIndex = (index: number, len: number) => {
  if (index < 0) return 0
  if (index > len - 1) return len - 1
  return index
}

export default useSort
