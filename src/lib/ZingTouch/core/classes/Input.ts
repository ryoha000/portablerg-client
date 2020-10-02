/**
 * @file Input.js
 */

import ZingEvent from './ZingEvent.js';

/**
 * Tracks a single input and contains information about the
 * current, previous, and initial events.
 * Contains the progress of each Input and it's associated gestures.
 * @class Input
 */
class Input {

  /**
   * Constructor function for the Input class.
   * @param {Event} event - The Event object from the window
   * @param {Number} [identifier=0] - The identifier for each input event
   * (taken from event.changedTouches)
   */
  constructor(event: any, identifier: any) {
    let currentEvent = new ZingEvent(event, identifier);

    /**
     * Holds the initial event object. A touchstart/mousedown event.
     * @type {ZingEvent}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'initial' does not exist on type 'Input'.
    this.initial = currentEvent;

    /**
     * Holds the most current event for this Input, disregarding any other past,
     * current, and future events that other Inputs participate in.
     * e.g. This event ended in an 'end' event, but another Input is still
     * participating in events -- this will not be updated in such cases.
     * @type {ZingEvent}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'current' does not exist on type 'Input'.
    this.current = currentEvent;

    /**
     * Holds the previous event that took place.
     * @type {ZingEvent}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'previous' does not exist on type 'Input'... Remove this comment to see the full error message
    this.previous = currentEvent;

    /**
     * Refers to the event.touches index, or 0 if a simple mouse event occurred.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'identifier' does not exist on type 'Inpu... Remove this comment to see the full error message
    this.identifier = (typeof identifier !== 'undefined') ? identifier : 0;

    /**
     * Stores internal state between events for
     * each gesture based off of the gesture's id.
     * @type {Object}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'progress' does not exist on type 'Input'... Remove this comment to see the full error message
    this.progress = {};
  }

  /**
   * Receives an input, updates the internal state of what the input has done.
   * @param {Event} event - The event object to wrap with a ZingEvent.
   * @param {Number} touchIdentifier - The index of inputs, from event.touches
   */
  update(event: any, touchIdentifier: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'previous' does not exist on type 'Input'... Remove this comment to see the full error message
    this.previous = this.current;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'current' does not exist on type 'Input'.
    this.current = new ZingEvent(event, touchIdentifier);
  }

  /**
   * Returns the progress of the specified gesture.
   * @param {String} id - The identifier for each unique Gesture's progress.
   * @return {Object} - The progress of the gesture.
   * Creates an empty object if no progress has begun.
   */
  getGestureProgress(id: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'progress' does not exist on type 'Input'... Remove this comment to see the full error message
    if (!this.progress[id]) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'progress' does not exist on type 'Input'... Remove this comment to see the full error message
      this.progress[id] = {};
    }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'progress' does not exist on type 'Input'... Remove this comment to see the full error message
    return this.progress[id];
  }

  /**
   * Returns the normalized current Event's type.
   * @return {String} The current event's type ( start | move | end )
   */
  getCurrentEventType() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'current' does not exist on type 'Input'.
    return this.current.type;
  }

  /**
   * Resets a progress/state object of the specified gesture.
   * @param {String} id - The identifier of the specified gesture
   */
  resetProgress(id: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'progress' does not exist on type 'Input'... Remove this comment to see the full error message
    this.progress[id] = {};
  }

}

export default Input;
