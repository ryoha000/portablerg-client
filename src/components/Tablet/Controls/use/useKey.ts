import ZingTouch from "../../../../lib/ZingTouch/ZingTouch";

const useKey = (ws: WebSocket) => {
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement, type: 'enter' | 'up' | 'down') => {
    region.bind(ele, "tap", (e: TapEvent) => {
      const message = JSON.stringify({
        type: type
      });
      ws.send(message);
    });
  };
  return { init };
};

export default useKey;
