import { writable, get, derived } from 'svelte/store';

export interface TabletSetting {
  window: {
    rect: Rect
  }
  controlRect: Rect
  controlTemplates: ControlTemplate[]
}

type RGBA = [number, number, number, number]

interface ControlTemplate {
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

export const getSetting = async (): Promise<TabletSetting> => {
  const nowS: TabletSetting = get(setting)
  if (nowS) {
    return nowS
  }
  const { init } = useSetting()
  await init()
  const newS: TabletSetting = get(setting)
  console.log(newS)
  return newS
}

export const windowStyle = derived(setting, ($setting) => {
  if (!$setting) {
    return ''
  }
  return `position: absolute; ${getStyleFromRect($setting.window.rect)}`
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

const path = '/public/clientSetting.json'

const useSetting = () => {
  const init = async () => {
    const initialSetting: TabletSetting = {
      window: {
        rect: {
          width: '80%',
          height: '80%',
          start: {
            x: '0px',
            y: '0px'
          }
        }
      },
      controlRect: {
        width: '500px',
        height: '300px',
        start: {
          x: '0px',
          y: '0px'
        }
      },
      controlTemplates: [
        {
          id: 0,
          controls: [
            {
              rect: {
                width: '100%',
                height: '100%',
                start: {
                  x: '0',
                  y: '0'
                }
              },
              color: [0, 0, 0, 0.1],
              zIndex: 1,
              type: 0
            }
          ]
        }
      ],
    }
    // const res = await fetch(path, {
    //   headers: { 'Content-Type': 'application/json' },
    //   method: 'GET'
    // })
    // const s = await res.json()
    setting.set(initialSetting)
    console.log('setting: ', initialSetting)
  }
  const update = async () => {
    if (get(setting) === null) {
      alert('setting is null')
      return
    }
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(get(setting))
    })
  }
  const deleteTemplateByID = async (id: number) => {
    const prev = await getSetting()
    const deleteIndex = prev.controlTemplates.findIndex(v => v.id === id)
    if (deleteIndex < 0) return
    prev.controlTemplates.splice(deleteIndex, 1)
    setting.set(prev)
    await update()
  }
  return {
    init,
    update,
    deleteTemplateByID
  }
}

export default useSetting
