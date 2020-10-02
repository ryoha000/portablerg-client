/**
 * @file main.js
 * Main file to setup event listeners on the document,
 * and to expose the ZingTouch object
 */

import ZingTouch from '../ZingTouch.js';

if (typeof window !== 'undefined') {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'ZingTouch' does not exist on type 'Windo... Remove this comment to see the full error message
  window.ZingTouch = ZingTouch;
}

export default ZingTouch;
