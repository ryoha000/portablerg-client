/**
 * @file Distance.js
 * Contains the abstract Distance class
 */

import Gesture from './Gesture.js';
import util from './../core/util.js';

const DEFAULT_INPUTS = 2;
const DEFAULT_MIN_THRESHOLD = 1;

/**
 * A Distance is defined as two inputs moving either together or apart.
 * @class Distance
 */
class Distance extends Gesture {
  /**
   * Constructor function for the Distance class.
   * @param {Object} options
   * @param {Object} [options] - The options object.
   * @param {Number} [options.threshold=1] - The minimum number of
   *  pixels the input has to move to trigger this gesture.
   * @param {Function} [options.onStart] - The on start callback
   * @param {Function} [options.onMove] - The on move callback
   */
  constructor(options?: {
    threshold?: number,
    onStart?: (e: CustomEvent) => void,
    onMove?: (e: CustomEvent) => void
  }) {
    super();

    /**
     * The type of the Gesture.
     * @type {String}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Distance'.
    this.type = 'distance';

    /**
     * The minimum amount in pixels the inputs must move until it is fired.
     * @type {Number}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'threshold' does not exist on type 'Dista... Remove this comment to see the full error message
    this.threshold = (options && options.threshold) ?
      options.threshold : DEFAULT_MIN_THRESHOLD;

    /**
     * The on start callback
     */
    if (options && options.onStart && typeof options.onStart === 'function') {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Distanc... Remove this comment to see the full error message
      this.onStart = options.onStart
    }
    /**
     * The on move callback
     */
    if (options && options.onMove && typeof options.onMove === 'function') {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Distance... Remove this comment to see the full error message
      this.onMove = options.onMove
    }
  }

  /**
   * Event hook for the start of a gesture. Initialized the lastEmitted
   * gesture and stores it in the first input for reference events.
   * @param {Array} inputs
   * @param {Object} state - The state object of the current region.
   * @param {Element} element - The element associated to the binding.
   */
  // @ts-expect-error
  start(inputs: any, state: any, element: any) {
    if(!this.isValid(inputs, state, element)) {
      return null;
    }
    if (inputs.length === DEFAULT_INPUTS) {
      // Store the progress in the first input.
      const progress = inputs[0].getGestureProgress(this.getId());
      progress.lastEmittedDistance = util.distanceBetweenTwoPoints(
        inputs[0].current.x,
        inputs[1].current.x,
        inputs[0].current.y,
        inputs[1].current.y);
    }
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Distanc... Remove this comment to see the full error message
    if(this.onStart) {
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'onStart' does not exist on type 'Distanc... Remove this comment to see the full error message
      this.onStart(inputs, state, element);
    }
  }

  /**
   * Event hook for the move of a gesture.
   *  Determines if the two points are moved in the expected direction relative
   *  to the current distance and the last distance.
   * @param {Array} inputs - The array of Inputs on the screen.
   * @param {Object} state - The state object of the current region.
   * @param {Element} element - The element associated to the binding.
   * @return {Object | null} - Returns the distance in pixels between two inputs
   */
  // @ts-expect-error
  move(inputs: any, state: any, element: any) {
    if (state.numActiveInputs() === DEFAULT_INPUTS) {
      const currentDistance = util.distanceBetweenTwoPoints(
        inputs[0].current.x,
        inputs[1].current.x,
        inputs[0].current.y,
        inputs[1].current.y);
      const centerPoint = util.getMidpoint(
        inputs[0].current.x,
        inputs[1].current.x,
        inputs[0].current.y,
        inputs[1].current.y);

      // Progress is stored in the first input.
      const progress = inputs[0].getGestureProgress(this.getId());
      const change = currentDistance - progress.lastEmittedDistance;

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'threshold' does not exist on type 'Dista... Remove this comment to see the full error message
      if (Math.abs(change) >= this.threshold) {
        progress.lastEmittedDistance = currentDistance;
        const movement = {
          distance: currentDistance,
          center: centerPoint,
          change,
        };
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Distance... Remove this comment to see the full error message
        if(this.onMove) {
          // @ts-expect-error ts-migrate(2551) FIXME: Property 'onMove' does not exist on type 'Distance... Remove this comment to see the full error message
          this.onMove(inputs, state, element, movement);
        }
        return movement;
      }
    }
    return null;
  }
}

export default Distance;
