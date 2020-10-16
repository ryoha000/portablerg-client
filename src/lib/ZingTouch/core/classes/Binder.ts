/**
 * @file Binder.js
 */

/**
 * A chainable object that contains a single element to be bound upon.
 * Called from ZingTouch.bind(), and is used to chain over gesture callbacks.
 * @class
 */
class Binder {
  /**
   * Constructor function for the Binder class.
   * @param {Element} element - The element to bind gestures to.
   * @param {Boolean} bindOnce - Option to bind once and only emit
   * the event once.
   * @param {Object} state - The state of the Region that is being bound to.
   * @return {Object} - Returns 'this' to be chained over and over again.
   */
  constructor(element: any, bindOnce: any, state: any) {
    /**
     * The element to bind gestures to.
     * @type {Element}
     */
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'element' does not exist on type 'Binder'... Remove this comment to see the full error message
    this.element = element;

    Object.keys(state.registeredGestures).forEach((key) => {
      // @ts-expect-error
      this[key] = (handler: any, capture: any) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'element' does not exist on type 'Binder'... Remove this comment to see the full error message
        state.addBinding(this.element, key, handler, capture, bindOnce);
        return this;
      };
    });
  }
}

export default Binder;
