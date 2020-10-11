import { writable, derived } from 'svelte/store';

export interface TabletSetting {
  windowRect: Rect
  controlRect: Rect
  controlTemplates: ControlTemplate[]
}

type RGBA = [number, number, number, number]

export interface ControlTemplate {
  id: number
  controls: Control[]
}

export interface Control {
  rect: Rect
  color: RGBA
  zIndex: number
  type: ControlType
}

export type ControlType = typeof ControlType[keyof typeof ControlType]

export const ControlType = {
  Panel: 0,
  Scroll: 1,
  Enter: 2,
  Up: 3,
  Down: 4,
} as const

export const getControlKeyName = (type: ControlType) => {
  switch (type) {
    case 0:
      return 'Panel'
    case 1:
      return 'Scroll'
    case 2:
      return 'Enter'
    case 3:
      return 'Up'
    case 4:
      return 'Down'
  }
}

export interface Rect {
  width: string
  height: string
  start: Point
}

interface Point {
  x: string
  y: string
}

export interface ControlStyle {
  id: number
  controls: {
    type: ControlType
    style: string
  }[]
}

export const setting = writable<TabletSetting | null>(null)

export const windowStyle = derived(setting, ($setting) => {
  if (!$setting) {
    return ''
  }
  return `position: absolute; ${getStyleFromRect($setting.windowRect)}`
})

export const controlsStyle = derived(setting, ($setting) => {
  if (!$setting) {
    return ''
  }
  return `position: absolute; ${getStyleFromRect($setting.controlRect)}`
})

export const controlStyles = derived(setting, ($setting) => {
  if (!$setting) {
    return []
  }
  const res: ControlStyle[] = []
  for (const template of $setting.controlTemplates) {
    if (!template) {
      continue
    }
    const controlStyle: ControlStyle = { id: template.id, controls: [] }
    for (const control of template.controls) {
      controlStyle.controls.push({
        type: control.type,
        style: getStyleFromControl(control)
      })
    }
    res.push(controlStyle)
  }
  return res
})

export const getStyleFromRect = (rect: Rect) => {
  return `
    width: ${rect.width}; height: ${rect.height}; left: ${rect.start.x}; top: ${rect.start.y};
  `
}

const getRGBA = (rgba: RGBA) => {
  return `rgba(${rgba.join(',')})`
}

const getStyleFromControl = (control: Control) => {
  return `position: absolute; ${getStyleFromRect(control.rect)} z-index: ${control.zIndex}; background-color: ${getRGBA(control.color)};`
}
