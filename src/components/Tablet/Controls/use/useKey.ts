import ZingTouch from "../../../../lib/ZingTouch/ZingTouch";
import { sendWSMessageWithID } from '../../../../lib/utils'
import { store } from "../../../../store";

const useKey = (ws: WebSocket) => {
  let id = ""
  store.me.subscribe(v => id = v)

  const region: Region = new ZingTouch.Region(document.body);

  const init = (ele: HTMLElement, type: 'enter' | 'up' | 'down' | 'control') => {
    const tapStart = () => {
      sendWSMessageWithID(id, { type: 'down', key: type }, ws)
    }
    const tapEnd = () => {
      sendWSMessageWithID(id, { type: 'up', key: type }, ws)
    }
    const keyTap: Tap = new ZingTouch.Tap({ maxDelay: 9999999999999999999999999, onStart: tapStart, onEnd: tapEnd })
    region.bind(ele, keyTap, () => {})
  };
  return { init };
};

export default useKey;
