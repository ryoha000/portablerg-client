import ZingTouch from '../../../../lib/ZingTouch/ZingTouch'
import { sendWSMessageWithID } from '../../../../lib/utils'
import { store } from '../../../../store';

const useScroll = (ws: WebSocket) => {
  let id = ""
  store.me.subscribe(v => id = v)
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement) => {
    region.bind(ele, 'pan', (e: PanEvent) => {
        if (e.detail.data.length === 0) {
          return
        }
        const data = e.detail.data[0]
        sendWSMessageWithID(
          id,
          {
            type: 'scroll',
            dPoint: {
              x: data.change.x,
              y: data.change.y
            }
          },
          ws
        )
    })
  };
  return { init };
};

export default useScroll
