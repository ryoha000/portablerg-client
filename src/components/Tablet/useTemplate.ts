import ZingTouch from '../../lib/ZingTouch/ZingTouch'
import { ControlType, Control, TabletSetting, getControlKeyName, RGBA } from './useSetting'
import { derived, get, Readable, writable } from 'svelte/store'
import type { NumRect } from './useLayout'
import { store } from '../../store'

interface MetaControls {
  ele: HTMLElement
  type: ControlType
  x: number
  y: number
  width: number
  height: number
  distanceCenter: {
    x: number
    y: number
  }
  isDragging: boolean
  color: RGBA
}

const useTemplate = () => {
  let container: HTMLElement | null = null
  let region: Region | null = null
  const init = (containerElement: HTMLElement) => {
    region = new ZingTouch.Region(containerElement, false, true);
    container = containerElement
  }

  const rects = writable<MetaControls[]>([])
  let substanceRects: MetaControls[] = []
  rects.subscribe(v => substanceRects = v)
  let color: RGBA = [0, 0, 0, 0.1]

  const controls: Readable<Control[]> = derived(rects, $rects => {
    const res: Control[] = []
    for (const type of Object.values(ControlType)) {
      const index = $rects.findIndex(v => v.type === type)
      if (index > -1) {
        res.push({
          rect: {
            start: {
              x: `${$rects[index].x}px`,
              y: `${$rects[index].y}px`
            },
            width: `${$rects[index].width}px`,
            height: `${$rects[index].height}px`
          },
          color: color,
          type: $rects[index].type,
          zIndex: 1
        })
      } else {
        res.push({
          rect: {
            start: {
              x: `0px`,
              y: `0px`
            },
            width: `0px`,
            height: `0px`
          },
          color: color,
          type: type,
          zIndex: 1
        })
      }
    }
    return res
  })

  const setupHandler = (ele: HTMLElement,type: ControlType, borderElement: HTMLElement) => {
    if (!region || !container) {
      console.error('not initialize')
      return
    }

    const onPanStart = (inputs: ZingInput[]) => {
      if (inputs.length === 0) {
        console.error('pan start error')
        return
      }
      const initial = inputs[0].initial
      rects.update($rects => $rects.map(($rect, i) => {
        const isDragging = $rect.x < initial.x && initial.x < $rect.x + $rect.width && $rect.y < initial.y && initial.y < $rect.y + $rect.height
        return { ...$rect, isDragging }
      }))
    }

    const onPanMove = (inputs: ZingInput[], state: any, element: HTMLElement, output: PanData) => {
      if (!output || output.data.length === 0) {
        return
      }
      const draggingIndex = substanceRects.findIndex(v => v.isDragging === true)
      if (draggingIndex === -1) {
        return
      }

      const data = output.data[0]
      rects.update($rects => $rects.map(($rect, index) => {
        if (index !== draggingIndex) return $rect
        return { ...$rect, x: $rect.x + data.change.x, y: $rect.y + data.change.y }
      }))
    }

    const customPan = new ZingTouch.Pan({ onStart: onPanStart, onMove: onPanMove })
    region.bind(container, customPan, () => {})
  
    const onDistanceStart = (inputs: ZingInput[], state: any, element: HTMLElement) => {
      if (inputs.length < 2) {
        return
      }
      const distanceCenter = {
        x: (inputs[0].current.x + inputs[1].current.x) / 2,
        y: (inputs[0].current.y + inputs[1].current.y) / 2,
      }
      rects.update($rects => $rects.map($rect => {
        if ($rect.type !== type) return $rect
        return { ...$rect, distanceCenter }
      }))
    }
    const onDistanceMove = (inputs: ZingInput[], state: any, element: HTMLElement, movement: DistanceData) => {
      if (!movement || inputs.length < 2) {
        return
      }
      const distanceCenter = substanceRects.find(v => v.type === type)?.distanceCenter
      if (!distanceCenter) {
        console.log('the type is not found')
        return
      }
      const change1 = getChange(distanceCenter, inputs[0])
      const change2 = getChange(distanceCenter, inputs[1])
      rects.update($rects => $rects.map($rect => {
        if ($rect.type !== type) return $rect
        if (inputs[0].current.x < inputs[1].current.x) {
          $rect.x -= change1.x
          $rect.y -= change1.y
          $rect.width += change1.x + change2.x
          $rect.height += change1.y + change2.y
        } else {
          $rect.x -= change2.x
          $rect.y -= change2.y
          $rect.width += change1.x + change2.x
          $rect.height += change1.y + change2.y
        }
        return { ...$rect, distanceCenter }
      }))
    }
    const customDistance: Distance = new ZingTouch.Distance({ onStart: onDistanceStart, onMove: onDistanceMove })
    region.bind(ele, customDistance, () => {})

    const side = 5 * 16
    const borderElementRect = borderElement.getBoundingClientRect()
    rects.update($rects => {
      $rects.push({
        ele: ele,
        type: type,
        x: (window.innerWidth - side) / 2,
        y: borderElementRect.y + (borderElementRect.height - side) / 2,
        width: side,
        height: side,
        distanceCenter: {
          x: 0,
          y: 0
        },
        isDragging: false,
        color: color
      })
      return $rects
    })
    // 見えるように
    ele.classList.remove('invisible')
  }
  const addControl = (borderElement: HTMLElement) => {
    const prev: TabletSetting | null = get(store.setting)
    if (!prev) return
    let maxID = -1
    for (const c of prev.controlTemplates) {
      if (c.id > maxID) {
        maxID = c.id
      }
    }
    const newControls: Control[] = []
    const containerRect = borderElement.getBoundingClientRect()
    for (const rect of substanceRects) {
      const percentRect = getRect(rect, containerRect)
      if (!percentRect) {
        console.log(getControlKeyName(rect.type), ' is not contain')
        continue
      }
      newControls.push({
        rect: percentRect,
        color: color,
        type: rect.type,
        zIndex: 1
      })
    }
    if (newControls.length === 0) {
      return
    }
    const newControl = {
      id: maxID + 1,
      controls: newControls
    }
    prev.controlTemplates.push(newControl)
    store.setting.set(prev)
    return newControl
  }
  const changeColor = (rgba: RGBA) => {
    console.log('changeColor')
    console.log(rgba)
    color = rgba
    rects.update(v => v.map($rect => ({ ...$rect, color: rgba })))
  }
  return { controls, init, setupHandler, addControl, changeColor }
};

const getChange = (center: { x: number, y: number }, input: ZingInput) => {
  return {
    x: Math.abs(input.current.x - center.x) - Math.abs(input.previous.x - center.x),
    y: Math.abs(input.current.y - center.y) - Math.abs(input.previous.y - center.y)
  }
}

const getRect = (rect: NumRect, containerRect: NumRect) => {
  const x = getStartPoint(rect.x , containerRect.x, containerRect.width)
  const y = getStartPoint(rect.y , containerRect.y, containerRect.height)
  const width = rect.width / containerRect.width
  const height = rect.height / containerRect.height
  if (x + width < 0 || x > 1) {
    return null
  }
  if (y + height < 0 || y > 1) {
    return null
  }
  return {
    start: {
      x: x < 0 ? getPercent(0) : getPercent(x),
      y: y < 0 ? getPercent(0) : getPercent(y)
    },
    width: getPercentSize(x, width),
    height: getPercentSize(y, height),
  }
}

const getPercentSize = (point: number, size: number) => {
  // 正の方向ににはみ出してるとき
  if (point + size > 1) {
    return getPercent(1 - point)
  }
  // 負の方向にはみ出してるとき
  if (point < 0) {
    return getPercent(size + point)
  }
  return getPercent(size)
}

const getPercent = (num: number) => {
  return `${num * 100}%`
}

const getStartPoint = (inner: number, containerPoint: number, containerBase: number) => {
  return (inner - containerPoint) / containerBase
}

export default useTemplate
