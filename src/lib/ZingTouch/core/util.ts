/**
 * @file util.js
 * Various accessor and mutator functions to handle state and validation.
 */

/**
 *  Contains generic helper functions
 * @type {Object}
 * @namespace util
 */
let util = {

  /**
   * Normalizes window events to be either of type start, move, or end.
   * @param {String} type - The event type emitted by the browser
   * @return {null|String} - The normalized event, or null if it is an
   * event not predetermined.
   */
  normalizeEvent: Object.freeze({
      mousedown:   'start',
      touchstart:  'start',
      pointerdown: 'start',

      mousemove:   'move',
      touchmove:   'move',
      pointermove: 'move',

      mouseup:   'end',
      touchend:  'end',
      pointerup: 'end',
  }),
  /* normalizeEvent*/

  /**
   * Determines if the current and previous coordinates are within or
   * up to a certain tolerance.
   * @param {Number} currentX - Current event's x coordinate
   * @param {Number} currentY - Current event's y coordinate
   * @param {Number} previousX - Previous event's x coordinate
   * @param {Number} previousY - Previous event's y coordinate
   * @param {Number} tolerance - The tolerance in pixel value.
   * @return {boolean} - true if the current coordinates are
   * within the tolerance, false otherwise
   */
  isWithin(currentX: any, currentY: any, previousX: any, previousY: any, tolerance: any) {
    return ((Math.abs(currentY - previousY) <= tolerance) &&
    (Math.abs(currentX - previousX) <= tolerance));
  },
  /* isWithin*/

  /**
   * Calculates the distance between two points.
   * @param {Number} x0
   * @param {Number} x1
   * @param {Number} y0
   * @param {Number} y1
   * @return {number} The numerical value between two points
   */
  distanceBetweenTwoPoints(x0: any, x1: any, y0: any, y1: any) {
    return Math.hypot(x1 - x0, y1 - y0);
  },

  /**
   * Calculates the midpoint coordinates between two points.
   * @param {Number} x0
   * @param {Number} x1
   * @param {Number} y0
   * @param {Number} y1
   * @return {Object} The coordinates of the midpoint.
   */
  getMidpoint(x0: any, x1: any, y0: any, y1: any) {
    return {
      x: ((x0 + x1) / 2),
      y: ((y0 + y1) / 2),
    };
  },

  /**
   * Calculates the angle between the projection and an origin point.
   *   |                (projectionX,projectionY)
   *   |             /°
   *   |          /
   *   |       /
   *   |    / θ
   *   | /__________
   *   ° (originX, originY)
   * @param {number} originX
   * @param {number} originY
   * @param {number} projectionX
   * @param {number} projectionY
   * @return {number} - Radians along the unit circle where the projection lies
   */
  getAngle(originX: number, originY: number, projectionX: number, projectionY: number) {
    return Math.atan2(projectionY - originY, projectionX - originX);
  },

  /**
   * Calculates the angular distance in radians between two angles along the
   * unit circle
   * @param {number} start - The starting point in radians
   * @param {number} end - The ending point in radians
   * @return {number} The number of radians between the starting point and
   * ending point.
   */
  getAngularDistance(start: any, end: any) {
    return end - start;
  },

  /**
   * Calculates the velocity of pixel/milliseconds between two points
   * @param {Number} startX
   * @param {Number} startY
   * @param {Number} startTime
   * @param {Number} endX
   * @param {Number} endY
   * @param {Number} endTime
   * @return {Number} velocity of px/time
   */
  getVelocity(startX: any, startY: any, startTime: any, endX: any, endY: any, endTime: any) {
    let distance = this.distanceBetweenTwoPoints(startX, endX, startY, endY);
    return (distance / (endTime - startTime));
  },

  /**
   * Returns the farthest right input
   * @param {Array} inputs
   * @return {Object}
   */
  getRightMostInput(inputs: any) {
    let rightMost = null;
    let distance = Number.MIN_VALUE;
    inputs.forEach((input: any) => {
      if (input.initial.x > distance) {
        rightMost = input;
      }
    });
    return rightMost;
  },

  /**
   * Determines is the value is an integer and not a floating point
   * @param {Mixed} value
   * @return {boolean}
   */
  isInteger(value: any) {
    return (typeof value === 'number') && (value % 1 === 0);
  },

  /**
   * Determines if the x,y position of the input is within then target.
   * @param {Number} x -clientX
   * @param {Number} y -clientY
   * @param {Element} target
   * @return {Boolean}
   */
  isInside(x: number, y: number, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    return ((x > rect.left && x < rect.left + rect.width) &&
    (y > rect.top && y < rect.top + rect.height));
  },
  /**
   * Polyfill for event.propagationPath
   * @param {Event} event
   * @return {Array}
   */
  getPropagationPath(event: any) {
    if (event.path) {
      return event.path;
    } else {
      let path = [];
      let node = event.target;
      while (node != document) {
        path.push(node);
        node = node.parentNode;
      }

      return path;
    }
  },

  /**
   * Retrieve the index inside the path array
   * @param {Array} path
   * @param {Element} element
   * @return {Element}
   */
  getPathIndex(path: any, element: any) {
    let index = path.length;

    path.forEach((obj: any, i: any) => {
      if (obj === element) {
        index = i;
      }
    });

    return index;
  },

  setMSPreventDefault(element: any) {
    element.style['-ms-content-zooming'] = 'none';
    element.style['touch-action'] = 'none';
  },

  removeMSPreventDefault(element: any) {
    element.style['-ms-content-zooming'] = '';
    element.style['touch-action'] = '';
  },

  preventDefault(event: any) {
    if (event.preventDefault) {
      if(event.cancelable){
        event.preventDefault();
      }
    } else {
      event.returnValue = false;
    }
  }
};

export default util;
