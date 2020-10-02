/**
 * @file ZingEvent.js
 * Contains logic for ZingEvents
 */

import util from '../util.js';

const INITIAL_COORDINATE = 0;
/**
 * An event wrapper that normalizes events across browsers and input devices
 * @class ZingEvent
 */
class ZingEvent {
  /**
   * @constructor
   * @param {Event} event - The event object being wrapped.
   * @param {Array} event.touches - The number of touches on
   *  a screen (mobile only).
   * @param {Object} event.changedTouches - The TouchList representing
   * points that participated in the event.
   * @param {Number} touchIdentifier - The index of touch if applicable
   */
  constructor(event: any, touchIdentifier: any) {
    /**
     * The original event object.
     * @type {Event}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'originalEvent' does not exist on type 'Z... Remove this comment to see the full error message
    this.originalEvent = event;

    /**
     * The type of event or null if it is an event not predetermined.
     * @see util.normalizeEvent
     * @type {String | null}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'ZingEvent'... Remove this comment to see the full error message
    this.type = util.normalizeEvent[ event.type ];

    /**
     * The X coordinate for the event, based off of the client.
     * @type {number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'x' does not exist on type 'ZingEvent'.
    this.x = INITIAL_COORDINATE;

    /**
     * The Y coordinate for the event, based off of the client.
     * @type {number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'y' does not exist on type 'ZingEvent'.
    this.y = INITIAL_COORDINATE;

    let eventObj;
    if (event.touches && event.changedTouches) {
      eventObj = Array.from(event.changedTouches).find( t => {
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        return t.identifier === touchIdentifier;
      });
    } else {
      eventObj = event;
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'x' does not exist on type 'ZingEvent'.
    this.x = this.clientX = eventObj.clientX;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'y' does not exist on type 'ZingEvent'.
    this.y = this.clientY = eventObj.clientY;

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'pageX' does not exist on type 'ZingEvent... Remove this comment to see the full error message
    this.pageX = eventObj.pageX;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'pageY' does not exist on type 'ZingEvent... Remove this comment to see the full error message
    this.pageY = eventObj.pageY;

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'screenX' does not exist on type 'ZingEve... Remove this comment to see the full error message
    this.screenX = eventObj.screenX;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'screenY' does not exist on type 'ZingEve... Remove this comment to see the full error message
    this.screenY = eventObj.screenY;
  }
}

export default ZingEvent;
