import ZingTouch from "../../../../lib/ZingTouch/ZingTouch";
import { writable, get } from 'svelte/store';
import { sendWSMessageWithID } from '../../../../lib/utils'

export const message = writable('')

const DRAG_START_INTERVAL = 500
const ALLOW_DRAG_START_RADIUS = 20
const BUFFER_LENGTH = 3
const MAGNIFICATION = 5

const useTouch = (ws: WebSocket, id: string) => {
  let isDragging = false
  let isMoving = false
  let isScroll = false
  let tapPos = { x: 0, y: 0 }
  let timer: number | null = null
  let dPosBuf: { x: number, y: number }[] = []
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement) => {
    setupDrag(region)
    region.bind(ele, 'dragPan', () => {})
    region.bind(ele, 'tap', (e: TapEvent) => {
      if (!isMoving && !isDragging && !isScroll) {
        console.log('click !')
        sendWSMessageWithID(id, { type: 'click' }, ws)
        resetPan()
      }
    })
    region.bind(ele, 'swipe', (e: SwipeEvent) => {
      if (!isDragging && e.detail.data.length !== 0) {
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
    const scrollPan: Pan = new ZingTouch.Pan({ numInputs: 2 })
    region.register('scrollPan', scrollPan)
    region.bind(ele, 'scrollPan', (e: PanEvent) => {
      if (!isDragging && e.detail.data.length !== 0) {
        isScroll = true
        console.log('scroll !')
        const data = e.detail.data[0]
        sendWSMessageWithID(
          id,
          { type: 'scroll', Point: data.change },
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

  const setupDrag = (region: Region) => {
    const dragPan: Pan = new ZingTouch.Pan({ threshold: ALLOW_DRAG_START_RADIUS, onStart: panStart, onMove: panMove, onEnd: panEnd })
    region.register('dragPan', dragPan)
  }
  const panStart = (e: ZingInput[]) => {
    console.log('panStart')
    tapPos.x = e[0].initial.x
    tapPos.y = e[0].initial.y
    timer = setTimeout(() => {
      console.log('isDragging: true')
      isDragging = true
      sendWSMessageWithID(id, { type: 'dragStart' }, ws)
    }, DRAG_START_INTERVAL)
  }
  const panMove = (e: ZingInput[], state: any, element: HTMLElement, event: PanData) => {
    const current = e[0].current
    const previous = e[0].previous
    const dPoint = {
      x: (current.x - previous.x) * MAGNIFICATION,
      y: (current.y - previous.y) * MAGNIFICATION
    }

    if (isDragging) {
      console.log('dragging !')
      dPosBuf.push(dPoint)
      if (dPosBuf.length < BUFFER_LENGTH) {
        return
      }
      sendDiv('dragging')
      return
    }
    if (isMoving) {
      console.log('moving !')
      dPosBuf.push(dPoint)
      if (dPosBuf.length < BUFFER_LENGTH) {
        return
      }
      sendDiv('move')
      return
    }
    if (timer && checkStartDrag(current.x, current.y)) {
      console.log('probably dragging')
    } else {
      resetPan()
      isMoving = true
    }
  }
  const panEnd = () => {
    console.log('pan end')
    if (isDragging) {
      console.log('dragEnd')
      sendDiv('dragging')
      sendWSMessageWithID(id, { type: 'dragEnd' }, ws)
    }
    console.log('isDragging: false')
    resetPan()
  }

  // tapを初期化する
  const resetPan = () => {
    tapPos = { x: 0, y: 0 }
    isDragging = false
    isMoving = false
    isScroll = false
    if (timer) {
      clearInterval(timer)
    }
  }
  // dragが始まる条件に当たるか調べる(十分条件ではない)
  const checkStartDrag = (x: number, y: number) => {
    const r = Math.sqrt((tapPos.x - x) ** 2 + (tapPos.y - y) ** 2)
    if (r < ALLOW_DRAG_START_RADIUS) {
      return true
    }
    return false
  }
  const sendDiv = (type: 'dragging' | 'move') => {
    const dPoint = dPosBuf.reduce((acc, cur) => ({ x: acc.x + cur.x, y: acc.y + cur.y }), { x: 0, y: 0 })
    dPosBuf = []
    sendWSMessageWithID(
      id,
      { type: type, dPoint: dPoint },
      ws
    )
  }
  return { init, dispose };
};

export default useTouch
