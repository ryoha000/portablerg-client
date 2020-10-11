import { get } from "svelte/store"
import type { ControlTemplate, Rect, TabletSetting } from "../components/Tablet/useSetting"
import { store } from "../store"

const initialWindowRect = {
  width: '80%',
  height: '80%',
  start: {
    x: '0px',
    y: '0px'
  }
}
const initialControlRect = {
  width: '500px',
  height: '300px',
  start: {
    x: '0px',
    y: '0px'
  }
}
const firstControlTemplate: ControlTemplate = {
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
const initialSort = [0]

export const getSetting = async (): Promise<TabletSetting> => {
  const nowS: TabletSetting = get(store.setting)
  if (nowS) {
    return nowS
  }
  const { init } = useDB()
  return await init()
}

const useDB = () => {
  const init = () => {
    return new Promise<TabletSetting>((resolve, reject) => {
      const openRequest = indexedDB.open('portablerg-setting')
      let initializedDB = false

      openRequest.onupgradeneeded = () => {
        const conn = openRequest.result
        createInitialData(conn)
        const s = { windowRect: initialWindowRect, controlRect: initialControlRect, controlTemplates: [firstControlTemplate] }
        store.setting.set(s)
        store.connection.set(conn)
        initializedDB = true
        resolve(s)
      }

      openRequest.onsuccess = async () => {
        if (initializedDB) return
        const conn = openRequest.result

        const getRects = () => new Promise<{ type: 'window' | 'control', rect: Rect }[]>((resolve, reject) => {
          const txRect = conn.transaction('rect', 'readonly')
          const winReq = txRect.objectStore('rect').getAll()
          winReq.onsuccess = () => resolve(winReq.result)
          winReq.onerror = (e) => reject(e)
        })
        const getTemplates = () => new Promise<ControlTemplate[]>((resolve, reject) => {
          const txTemplate = conn.transaction('template', 'readonly')
          const tmpReq = txTemplate.objectStore('template').getAll()
          tmpReq.onsuccess = () => resolve(tmpReq.result)
          tmpReq.onerror = (e) => reject(e)
        })
        const getSort = () => new Promise<{ id: 1, value: number[] }>((resolve, reject) => {
          const txSort = conn.transaction('sort', 'readonly')
          const sortReq = txSort.objectStore('sort').get(1)
          sortReq.onsuccess = (e) => resolve(sortReq.result)
          sortReq.onerror = (e) => reject(e)
        })
  
        let rects: { type: 'window' | 'control', rect: Rect }[] = []
        let tmps: ControlTemplate[] = []
        let sort: number[] = []
  
        try {
          await Promise.all([
            rects = await getRects(),
            tmps = await getTemplates(),
            sort = (await getSort()).value,
          ])
          const winRect = rects[rects.findIndex(v => v.type === 'window')].rect
          const ctrlRect = rects[rects.findIndex(v => v.type === 'control')].rect
          const sortedTemplates = sort.map(v => {
            const index = tmps.findIndex(tmp => tmp.id === v)
            if (index === -1) {
              throw 'ソートテーブルが整合性を保っていません'
            }
            return tmps[index]
          })
          if (!winRect || !ctrlRect || !sort) {
            console.log(winRect, ctrlRect, sort)
            throw 'データが取れませんでした'
          }
          const s = { windowRect: winRect, controlRect: ctrlRect, controlTemplates: sortedTemplates }
          store.setting.set({ windowRect: winRect, controlRect: ctrlRect, controlTemplates: sortedTemplates })
          store.connection.set(conn)
          resolve(s)
        } catch (e) {
          console.error(e)
          resetInitialData(conn)
          const s = { windowRect: initialWindowRect, controlRect: initialControlRect, controlTemplates: [firstControlTemplate] }
          store.setting.set(s)
          store.connection.set(conn)
          alert('設定の読み込みでエラーが発生しました。初期設定にリセットしました。')
          resolve(s)
        }
      }

      openRequest.onerror = (e) => {
        console.error(e)
        const s = { windowRect: initialWindowRect, controlRect: initialControlRect, controlTemplates: [firstControlTemplate] }
        store.setting.set(s)
        alert('IndexedDBが無効になっています。設定は保存されません。')
        resolve(s)
      }
    })
  }
  const createInitialData = (conn: IDBDatabase) => {
    const rectStore = conn.createObjectStore('rect', { keyPath: 'type' })
    rectStore.put({ type: 'window', rect: initialWindowRect })
    rectStore.put({ type: 'control', rect: initialControlRect })

    const templateStore = conn.createObjectStore('template', { keyPath: 'id' })
    templateStore.put(firstControlTemplate)

    const sortStore = conn.createObjectStore('sort', { keyPath: 'id' })
    sortStore.put({ id: 1, value: initialSort })
  }
  const resetInitialData = (conn: IDBDatabase) => {
    const txRect = conn.transaction('rect', 'readwrite')
    const rectStore = txRect.objectStore('rect')
    rectStore.put({ type: 'window', rect: initialWindowRect })
    rectStore.put({ type: 'control', rect: initialControlRect })
    
    const txTemp = conn.transaction('template', 'readwrite')
    const tempStore = txTemp.objectStore('template')
    tempStore.put(firstControlTemplate)

    const txSort = conn.transaction('sort', 'readwrite')
    const sortStore = txSort.objectStore('sort')
    sortStore.put({ id: 1, value: initialSort })
  }
  const update = async (db: 'rect' | 'sort' | 'template', obj: unknown) => {
    const conn: IDBDatabase | null = get(store.connection)
    if (!conn) {
      console.error('connection is NULL')
      return
    }

    return new Promise((resolve, reject) => {
      const tx = conn.transaction(db, 'readwrite')
      const req = tx.objectStore(db).put(obj)
      req.onsuccess = () => resolve()
      req.onerror = (e) => reject(e)
    })
  }
  const deleteTemplateByID = async (id: number) => {
    const prev = await getSetting()
    const deleteIndex = prev.controlTemplates.findIndex(v => v.id === id)
    if (deleteIndex < 0) return
    prev.controlTemplates.splice(deleteIndex, 1)
    store.setting.set(prev)

    const conn: IDBDatabase | null = get(store.connection)
    if (!conn) {
      console.error('connection is NULL')
      return
    }

    const deleteTemplate = new Promise<void>((resolve, reject) => {
      const tx = conn.transaction('template', 'readwrite')
      const req = tx.objectStore('template').delete(id)
      req.onsuccess = () => resolve()
      req.onerror = (e) => reject(e)
    })
    return Promise.all([await deleteTemplate, update('sort', { id: 1, value: prev.controlTemplates.map(v => v.id) })])
  }
  return {
    init,
    update,
    deleteTemplateByID
  }
}

export default useDB
