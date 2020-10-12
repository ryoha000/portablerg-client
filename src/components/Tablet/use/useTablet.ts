import ZingTouch from "../../../lib/ZingTouch/ZingTouch";
import { get } from 'svelte/store';
import { sendWSMessageWithID } from '../../../lib/utils'
import { store } from "../../../store";
import type { TabletSetting } from "../useSetting";
import { getSize, WindowRect } from "../../../lib/coordinary";

const ALLOW_DRAG_START_RADIUS = 20

const useTablet = (ws: WebSocket, ele: HTMLElement) => {
  let id = ""
  store.me.subscribe(v => id = v)
  let ratio = 1
  let winRect: WindowRect = get(store.windowRect)
  store.windowRect.subscribe(v => winRect = v)
  const region: Region = new ZingTouch.Region(document.body);

  const init = () => {
    const setting: TabletSetting = get(store.setting)
    const s = getSize(winRect, window.innerWidth, window.innerHeight)
    console.log(s)
    setting.windowRect.width = `${s.width}px`
    setting.windowRect.height = `${s.height}px`
    ratio = s.expr
    store.setting.set(setting)

    const downUpTap = getTap()
    region.bind(ele, downUpTap, () => {})
    const dragPan = getDrag()
    region.bind(ele, dragPan, () => {})
    region.bind(ele, 'swipe', (e: SwipeEvent) => {
      if (e.detail.data.length !== 0) {
        console.log('scroll !')
        const data = e.detail.data[0]
        const r = data.velocity * data.duration
        sendWSMessageWithID(
          id,
          {
            type: 'scroll',
            dPoint: {
              x: r * Math.cos(data.currentDirection / Math.PI),
              y: r * Math.sin(data.currentDirection / Math.PI)
            }
          },
          ws
        )
      }
    })
  };
  const dispose = (...elements: HTMLElement[]) => {
    for (const ele of elements) {
      region.unbind(ele)
    }
  }

  const getTap = () => {
    const endTap = (inputs: ZingInput[]) => {
      const point = inputs[0].initial
      sendWSMessageWithID(id, { type: 'moveTap', point: toPoint(point.x, point.y, ratio) }, ws)
    }
    const downUpTap: Tap = new ZingTouch.Tap({ onEnd: endTap })
    return downUpTap
  }

  const getDrag = () => {
    const dragPan: Pan = new ZingTouch.Pan({ threshold: ALLOW_DRAG_START_RADIUS, onStart: panStart, onMove: panMove, onEnd: panEnd })
    return dragPan
  }
  const panStart = (e: ZingInput[]) => {
    console.log('panStart')
    sendWSMessageWithID(id, { type: 'moveDragStart', point: toPoint(e[0].initial.x, e[0].initial.y, ratio) }, ws)
  }
  const panMove = (e: ZingInput[], state: any, element: HTMLElement, event: PanData) => {
    const current = e[0].current
    console.log(current)
    const point = toPoint(current.screenX, current.screenY, ratio)
    console.log('dragging !')
    sendWSMessageWithID(id, { type: 'moveDragging', point: point }, ws)
  }
  const panEnd = () => {
    console.log('pan end')
    sendWSMessageWithID(id, { type: 'dragEnd' }, ws)
  }

  const toPoint = (x: number, y: number, ratio: number) => {
    if (winRect === null) { console.error('winrect is null') }
    return {
      x: winRect.left + (x * ratio),
      y: winRect.top + (y * ratio),
    }
  }
  return { init, dispose };
};


export default useTablet
