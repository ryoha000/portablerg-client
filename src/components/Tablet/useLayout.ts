import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import useSetting, { TabletSetting, Rect, setting } from './useSetting'
import { get } from 'svelte/store'

export type LayoutType = typeof LayoutType[keyof typeof LayoutType]

export const LayoutType = {
  window: 0,
  control: 1
} as const

export interface NumRect { x: number, y: number, width: number, height: number }

const useLayout = (container: HTMLElement) => {
  const region: Region = new ZingTouch.Region(container, false, true);
  const rects: NumRect[] = []
  const distanceCenters: { x: number, y: number }[] = []
  const elements: (null | HTMLElement)[] = Array(Object.values(LayoutType).length).map(_ => null)
  let isDragging = Array(Object.values(LayoutType).length).map(_ => false)

  const init = async () => {
    let s: TabletSetting | null = get(setting)
    if (!s) {
      const { init: initSetting } = useSetting()
      await initSetting()
    }
    s = get(setting)
    if (!s) {
      return
    }
    for (const type of Object.values(LayoutType)) {
      if (type === LayoutType.window) {
        rects[type] = getNumRect(s.window.rect)
      }
      if (type === LayoutType.control) {
        rects[type] = getNumRect(s.controlRect)
      }
      distanceCenters.push({
        x: 0,
        y: 0
      })
    }
  }
  const setupHandler = (ele: HTMLElement, type: LayoutType) => {
    elements[type] = ele

    const onPanStart = (inputs: ZingInput[]) => {
      if (inputs.length === 0) {
        console.error('pan start error')
        return
      }
      const initial = inputs[0].initial
      isDragging = Array(Object.values(LayoutType).length).map(_ => false)
      rects.forEach((rect, i) => {
        if (rect.x < initial.x && initial.x < rect.x + rect.width && rect.y < initial.y && initial.y < rect.y + rect.height) {
          isDragging[i] = true
        }
      })
    }

    const onPanMove = (inputs: ZingInput[], state: any, element: HTMLElement, output: PanData) => {
      if (!output || output.data.length === 0) {
        return
      }
      const draggingIndex = isDragging.findIndex(v => v === true)
      if (draggingIndex === -1) {
        return
      }
      const data = output.data[0]
      rects[draggingIndex].x += data.change.x
      rects[draggingIndex].y += data.change.y
      const prev: TabletSetting = get(setting)
      if (draggingIndex === LayoutType.window) {
        prev.window.rect = getRect(rects[draggingIndex])
      }
      if (draggingIndex === LayoutType.control) {
        prev.controlRect = getRect(rects[draggingIndex])
      }
      setting.set(prev)
    }

    const customPan = new ZingTouch.Pan({ onStart: onPanStart, onMove: onPanMove })
    region.bind(container, customPan, () => {})
  
    const onDistanceStart = (inputs: ZingInput[], state: any, element: HTMLElement) => {
      console.log('distance move')
      if (inputs.length < 2) {
        return
      }
      distanceCenters[type] = {
        x: (inputs[0].current.x + inputs[1].current.x) / 2,
        y: (inputs[0].current.y + inputs[1].current.y) / 2,
      }
    }
    const onDistanceMove = (inputs: ZingInput[], state: any, element: HTMLElement, movement: DistanceData) => {
      console.log('distance move')
      if (!movement || inputs.length < 2) {
        return
      }
      const change1 = getChange(distanceCenters[type], inputs[0])
      const change2 = getChange(distanceCenters[type], inputs[1])
      if (inputs[0].current.x < inputs[1].current.x) {
        rects[type].x -= change1.x
        rects[type].y -= change1.y
        rects[type].width += change1.x + change2.x
        rects[type].height += change1.y + change2.y
      } else {
        rects[type].x -= change2.x
        rects[type].y -= change2.y
        rects[type].width += change1.x + change2.x
        rects[type].height += change1.y + change2.y
      }
      const prev: TabletSetting = get(setting)
      if (type === LayoutType.window) {
        prev.window.rect = getRect(rects[type])
      }
      if (type === LayoutType.control) {
        prev.controlRect = getRect(rects[type])
      }
      setting.set(prev)
    }
    const customDistance: Distance = new ZingTouch.Distance({ onStart: onDistanceStart, onMove: onDistanceMove })
    region.bind(ele, customDistance, () => {})
  }
  const setButton = (ele: HTMLElement, callback: () => Promise<void>) => {
    const rect = ele.getBoundingClientRect()

    const onTapEnd = (inputs: ZingInput[], timing: TapData) => {
      if (inputs.length === 0) {
        console.error('no tap information')
        return
      }
      const input = inputs[0]
      if (rect.x < input.current.x && input.current.x < rect.x + rect.width && rect.y < input.current.y && input.current.y < rect.y + rect.height) {
        callback()
      }
    }

    const customTap: Tap = new ZingTouch.Tap({ onEnd: onTapEnd })

    region.bind(container, customTap, () => {})
  }
  const dispose = () => {
    region.unbind(container)
  }
  return { init, setupHandler, setButton, dispose }
};

export const setTouch = (ele: HTMLElement, callback: () => Promise<void>) => {
  const region: Region = new ZingTouch.Region(ele, false, true)
  region.bind(ele, 'tap', callback)
}

const getChange = (center: { x: number, y: number }, input: ZingInput) => {
  return {
    x: Math.abs(input.current.x - center.x) - Math.abs(input.previous.x - center.x),
    y: Math.abs(input.current.y - center.y) - Math.abs(input.previous.y - center.y)
  }
}

const getNumRect = (rect: Rect) => {
  return {
    x: conversionPX(rect.start.x, window?.innerWidth),
    y: conversionPX(rect.start.y, window?.innerHeight),
    width: conversionPX(rect.width, window?.innerWidth),
    height: conversionPX(rect.height, window?.innerHeight)
  }
}

const getRect = (numRect: NumRect): Rect => {
  return {
    start: {
      x: `${numRect.x}px`,
      y: `${numRect.y}px`
    },
    width: `${numRect.width}px`,
    height: `${numRect.height}px`
  }
}

const conversionPX = (str: string, base?: number) => {
  if (str.endsWith('px')) {
    return Number(str.replace('px', ''))
  }
  if (str.endsWith('%')) {
    if (!base) return 500
    return base * Number(str.replace('%', '')) / 100
  }
  return 0
}

export default useLayout
