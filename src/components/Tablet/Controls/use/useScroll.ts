import ZingTouch from '../../../../lib/ZingTouch/ZingTouch'

const useScroll = (ws: WebSocket) => {
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement) => {
    region.bind(ele, 'pan', (e: PanEvent) => {
        if (e.detail.data.length === 0) {
            return
        }
        const data = e.detail.data[0]
        const message = JSON.stringify({
            type: 'scroll',
            dPoint: {
                x: data.change.x,
                y: data.change.y
            }
        })
        ws.send(message)
    })
  };
  return { init };
};

export default useScroll
