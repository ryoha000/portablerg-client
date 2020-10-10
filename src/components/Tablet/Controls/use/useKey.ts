import ZingTouch from "../../../../lib/ZingTouch/ZingTouch";
import { sendWSMessageWithID } from '../../../../lib/utils'
import { store } from "../../../../store";

const useKey = (ws: WebSocket) => {
  let id = ""
  store.me.subscribe(v => id = v)
  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement, type: 'enter' | 'up' | 'down') => {
    region.bind(ele, "tap", (e: TapEvent) => {
      sendWSMessageWithID(id, { type: type }, ws)
    });
  };
  return { init };
};

export default useKey;
