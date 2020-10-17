import ZingTouch from "../../../lib/ZingTouch/ZingTouch";
import { get } from 'svelte/store';
import { sendDataMessage } from '../../../lib/utils'
import { store } from "../../../store";
import type { TabletSetting } from "../useSetting";
import { getSize, WindowRect } from "../../../lib/coordinary";

const TAP_OR_DRAG_TIME = 500

const useTablet = (dc: RTCDataChannel, ele: HTMLElement) => {
  const container: HTMLElement | null = get(store.container)
  let ratio = 1
  let winRect: WindowRect | null = get(store.windowRect)
  store.windowRect.subscribe(v => winRect = v)
  let startTime = 0
  let isDragging = false
  let tapPoint = { x: 0, y: 0 }

  const init = () => {
    const region: Region = new ZingTouch.Region(container);
    store.videoRegion.set(region)
    const setting: TabletSetting | null = get(store.setting)
    if (!setting || !winRect) {
      console.error('winRect or setting is NULL !!!')
      return
    }
    const s = getSize(winRect, window.innerWidth, window.innerHeight)
    // const s = getSize(winRect, screen.width, screen.height)
    setting.windowRect.start.x = `0px`
    setting.windowRect.start.y = `0px`
    setting.windowRect.width = `${s.width}px`
    setting.windowRect.height = `${s.height}px`
    ratio = s.expr
    store.setting.set(setting)

    const dragPan = getDrag()
    region.bind(ele, dragPan, () => {})
    region.bind(ele, 'swipe', (e: SwipeEvent) => {
      if (e.detail.data.length !== 0) {
        const data = e.detail.data[0]
        const r = data.velocity * data.duration
        sendDataMessage(
          {
            type: 'scroll',
            dPoint: {
              x: r * Math.cos(data.currentDirection / Math.PI),
              y: r * Math.sin(data.currentDirection / Math.PI)
            }
          },
          dc
        )
      }
    })
  };
  const dispose = (...elements: HTMLElement[]) => {
    const region: Region | null = get(store.videoRegion)
    if (!region) return
    for (const ele of elements) {
      region.unbind(ele)
    }
  }

  const getDrag = () => {
    const dragPan: Pan = new ZingTouch.Pan({ onStart: panStart, onMove: panMove, onEnd: panEnd })
    return dragPan
  }
  const panStart = (e: ZingInput[]) => {
    startTime = performance.now()
    isDragging = false
    tapPoint = { x: e[0].initial.x, y: e[0].initial.y }
    // sendDataMessage({ type: 'moveDragStart', point: toPoint(e[0].initial.x, e[0].initial.y, ratio) }, dc)
  }
  const panMove = (e: ZingInput[], state: any, element: HTMLElement, event: PanData) => {
    if (!isDragging) {
      if (performance.now() - startTime > TAP_OR_DRAG_TIME) {
        sendDataMessage({ type: 'moveDragStart', point: toPoint(e[0].initial.x, e[0].initial.y, ratio) }, dc)
        isDragging = true
      }
    } else {
      const current = e[0].current
      const point = toPoint(current.screenX, current.screenY, ratio)
      sendDataMessage({ type: 'moveDragging', point: point }, dc)
    }
  }
  const panEnd = () => {
    if (!isDragging) {
      sendDataMessage({ type: 'moveTap', point: toPoint(tapPoint.x, tapPoint.y, ratio) }, dc)
    } else {
      sendDataMessage({ type: 'dragEnd' }, dc)
    }
    isDragging = false
    startTime = 0
    tapPoint = { x: 0, y: 0 }
  }

  const toPoint = (x: number, y: number, ratio: number) => {
    if (winRect === null) {
      console.error('winrect is null')
      return
    }
    return {
      x: winRect.left + (x * ratio),
      y: winRect.top + (y * ratio),
    }
  }
  return { init, dispose };
};


export default useTablet
