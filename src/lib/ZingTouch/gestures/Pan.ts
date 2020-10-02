/**
 * @file Pan.js
 * Contains the Pan class
 */

import Gesture from './Gesture.js';
import util from './../core/util.js';

const DEFAULT_INPUTS = 1;
const DEFAULT_MIN_THRESHOLD = 1;

/**
 * A Pan is defined as a normal movement in any direction on a screen.
 * Pan gestures do not track start events and can interact with distance gestures
 * @class Pan
 */
class Pan extends Gesture {
  /**
   * Constructor function for the Pan class.
   * @param {Object} [options] - The options object.
   * @param {Number} [options.numInputs=1] - Number of inputs for the
   *  Pan gesture.
   * @param {Number} [options.threshold=1] - The minimum number of
   * pixels the input has to move to trigger this gesture.
   * @param {Function} [options.onStart] - The on start callback
   * @param {Function} [options.onMove] - The on move callback
   * @param {Function} [options.onEnd] - The on end callback
   */
  constructor(options: any) {
    super();

    /**
     * The type of the Gesture.
     * @type {String}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Pan'.
    this.type = 'pan';

    /**
     * The number of inputs to trigger a Pan can be variable,
     * and the maximum number being a factor of the browser.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numInputs' does not exist on type 'Pan'.
    this.numInputs = (options && options.numInputs) ?
      options.numInputs : DEFAULT_INPUTS;

    /**
     * The minimum amount in pixels the pan must move until it is fired.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'threshold' does not exist on type 'Pan'.
    this.threshold = (options && options.threshold) ?
      options.threshold : DEFAULT_MIN_THRESHOLD;

    /**
     * The on start callback
     */
    if (options && options.onStart && typeof options.onStart === 'function') {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Pan'. D... Remove this comment to see the full error message
      this.onStart = options.onStart
    }
    /**
     * The on move callback
     */
    if (options && options.onMove && typeof options.onMove === 'function') {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Pan'. Di... Remove this comment to see the full error message
      this.onMove = options.onMove
    }
    /**
     * The on end callback
     */
    if (options && options.onEnd && typeof options.onEnd === 'function') {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Pan'.
      this.onEnd = options.onEnd
    }
  }

  /**
   * Event hook for the start of a gesture. Marks each input as active,
   * so it can invalidate any end events.
   * @param {Array} inputs
   */
  start(inputs: any) {
    inputs.forEach((input: any) => {
      const progress = input.getGestureProgress(this.getId());
      progress.active = true;
      progress.lastEmitted = {
        x: input.current.x,
        y: input.current.y,
      };
    });
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Pan'. D... Remove this comment to see the full error message
    if(this.onStart) {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Pan'. D... Remove this comment to see the full error message
      this.onStart(inputs);
    }
  }

  /**
   * move() - Event hook for the move of a gesture.
   * Fired whenever the input length is met, and keeps a boolean flag that
   * the gesture has fired at least once.
   * @param {Array} inputs - The array of Inputs on the screen
   * @param {Object} state - The state object of the current region.
   * @param {Element} element - The element associated to the binding.
   * @return {Object} - Returns the distance in pixels between the two inputs.
   */
  move(inputs: any, state: any, element: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numInputs' does not exist on type 'Pan'.
    if (this.numInputs !== inputs.length) return null;

    const output = {
      data: [],
    };

    inputs.forEach( (input: any, index: any) => {
      const progress = input.getGestureProgress(this.getId());
      const distanceFromLastEmit = util.distanceBetweenTwoPoints(
        progress.lastEmitted.x,
        input.current.x,
        progress.lastEmitted.y,
        input.current.y
      );
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'threshold' does not exist on type 'Pan'.
      const reachedThreshold = distanceFromLastEmit >= this.threshold;
      if (progress.active && reachedThreshold) {
        output.data[index] = packData( input, progress );
        progress.lastEmitted.x = input.current.x;
        progress.lastEmitted.y = input.current.y;
      }
    });

    // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Pan'. Di... Remove this comment to see the full error message
    if(this.onMove) {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Pan'. Di... Remove this comment to see the full error message
      this.onMove(inputs, state, element, output);
    }
    return output;

    function packData( input: any, progress: any ) {
      const distanceFromOrigin = util.distanceBetweenTwoPoints(
        input.initial.x,
        input.current.x,
        input.initial.y,
        input.current.y
      );
      const currentDistance = util.distanceBetweenTwoPoints(
        progress.lastEmitted.x,
        input.current.x,
        progress.lastEmitted.y,
        input.current.y
      );
      const directionFromOrigin = util.getAngle(
        input.initial.x,
        input.initial.y,
        input.current.x,
        input.current.y
      );
      const currentDirection = util.getAngle(
        progress.lastEmitted.x,
        progress.lastEmitted.y,
        input.current.x,
        input.current.y
      );
      const change = {
        x: input.current.x - progress.lastEmitted.x,
        y: input.current.y - progress.lastEmitted.y,
      };
      const currentDegree = currentDirection * 180 / Math.PI
      const degreeFromOrigin = directionFromOrigin * 180 / Math.PI
      return {
        distanceFromOrigin,
        currentDistance,
        directionFromOrigin,
        currentDirection,
        change,
        degreeFromOrigin,
        currentDegree
      };
    }
  }

  /* move*/

  /**
   * end() - Event hook for the end of a gesture. If the gesture has at least
   * fired once, then it ends on the first end event such that any remaining
   * inputs will not trigger the event until all inputs have reached the
   * touchend event. Any touchend->touchstart events that occur before all
   * inputs are fully off the screen should not fire.
   * @param {Array} inputs - The array of Inputs on the screen
   * @return {null} - null if the gesture is not to be emitted,
   *  Object with information otherwise.
   */
  end(inputs: any) {
    inputs.forEach((input: any) => {
      const progress = input.getGestureProgress(this.getId());
      progress.active = false;
    });
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Pan'.
    if(this.onEnd) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onEnd' does not exist on type 'Pan'.
      this.onEnd(inputs);
    }
    return null;
  }

  /* end*/
}

export default Pan;
