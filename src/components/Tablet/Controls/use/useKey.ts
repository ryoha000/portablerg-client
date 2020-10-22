import ZingTouch from "../../../../lib/ZingTouch/ZingTouch";
import { sendDataMessage } from '../../../../lib/utils'

const useKey = (dc: RTCDataChannel, rootContainer: HTMLDivElement) => {
  const region: Region = new ZingTouch.Region(rootContainer);

  const init = (ele: HTMLElement, type: 'enter' | 'up' | 'down' | 'left' | 'right' | 'control') => {
    const tapStart = () => {
      sendDataMessage({ type: 'down', key: type }, dc)
    }
    const tapEnd = () => {
      sendDataMessage({ type: 'up', key: type }, dc)
    }
    const keyTap: Tap = new ZingTouch.Tap({ maxDelay: 9999999999999999999999999, onStart: tapStart, onEnd: tapEnd })
    region.bind(ele, keyTap, () => {})
  };
  return { init };
};

export default useKey;
