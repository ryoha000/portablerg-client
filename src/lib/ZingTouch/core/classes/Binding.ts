/**
 * @file Binding.js
 */

/**
 * Responsible for creating a binding between an element and a gesture.
 * @class Binding
 */
class Binding {
  /**
   * Constructor function for the Binding class.
   * @param {Element} element - The element to associate the gesture to.
   * @param {Gesture} gesture - A instance of the Gesture type.
   * @param {Function} handler - The function handler to execute when a
   * gesture is recognized
   * on the associated element.
   * @param {Boolean} [capture=false] - A boolean signifying if the event is
   * to be emitted during
   * the capture or bubble phase.
   * @param {Boolean} [bindOnce=false] - A boolean flag
   * used for the bindOnce syntax.
   */
  constructor(element: any, gesture: any, handler: any, capture: any, bindOnce: any) {
    /**
     * The element to associate the gesture to.
     * @type {Element}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'element' does not exist on type 'Binding... Remove this comment to see the full error message
    this.element = element;
    /**
     * A instance of the Gesture type.
     * @type {Gesture}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'gesture' does not exist on type 'Binding... Remove this comment to see the full error message
    this.gesture = gesture;
    /**
     * The function handler to execute when a gesture is
     * recognized on the associated element.
     * @type {Function}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'handler' does not exist on type 'Binding... Remove this comment to see the full error message
    this.handler = handler;

    /**
     * A boolean signifying if the event is to be
     * emitted during the capture or bubble phase.
     * @type {Boolean}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'capture' does not exist on type 'Binding... Remove this comment to see the full error message
    this.capture = (typeof capture !== 'undefined') ? capture : false;

    /**
     * A boolean flag used for the bindOnce syntax.
     * @type {Boolean}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'bindOnce' does not exist on type 'Bindin... Remove this comment to see the full error message
    this.bindOnce = (typeof bindOnce !== 'undefined') ? bindOnce : false;
  }

}

export default Binding;
