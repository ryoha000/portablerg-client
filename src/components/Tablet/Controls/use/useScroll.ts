import ZingTouch from '../../../../lib/ZingTouch/ZingTouch'
import { sendDataMessage } from '../../../../lib/utils'

const useScroll = (dc: RTCDataChannel) => {
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement) => {
    region.bind(ele, 'pan', (e: PanEvent) => {
      if (e.detail.data.length === 0) {
        return
      }
      const data = e.detail.data[0]
      const message = {
        type: 'scroll',
        dPoint: {
          x: data.change.x,
          y: data.change.y
        }
      }
      console.log(message)
      sendDataMessage(message, dc)
    })
  };
  return { init };
};

export default useScroll
