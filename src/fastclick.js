/**
 * @preserve
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 *
 * The below copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @licence MIT License (see LICENCE.txt)
 * @codingstandard ftlabs-jslint
 */

/*jslint browser:true*/
/*global Node*/

var FastClick = (function() {
	'use strict';

	var

		scrollBoundary = navigator.userAgent.indexOf('PlayBook') === -1 ? 5 : 20;


	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {Element} target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	function needsClick(target) {
		return (/\bneedsclick\b/).test(target.className) || ({
			'select': true,
			'input' : true,
			'label' : true,
			'video' : true
		})[target.nodeName.toLowerCase()];
	}


	/**
	 * Instantiate fast-clicking listeners on the specificed layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 */
	function FastClick(layer) {
		var


			/**
			 * The position and page scroll amount when click had started to be tracked.
			 *
			 * @type Object
			 */
			clickStart = { x: 0, y: 0,  scrollX: 0, scrollY: 0 },


			/**
			 * Whether a click is currently being tracked.
			 *
			 * @type boolean
			 */
			trackingClick = false,


			/**
			 * Maximum distance (37 pixels) to the power of two.
			 *
			 * @type number
			 */
			bound = Math.pow(37, 2),


			/**
			 * On touch start, record the position and scroll offset.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			onTouchStart = function(event) {
				trackingClick = true;

				clickStart.x = event.targetTouches[0].pageX;
				clickStart.y = event.targetTouches[0].pageY;
				if (clickStart.x === event.targetTouches[0].clientX) {
					clickStart.x += window.pageXOffset;
				}
				if (clickStart.y === event.targetTouches[0].clientY) {
					clickStart.y += window.pageYOffset;
				}
				clickStart.scrollX = window.pageXOffset;
				clickStart.scrollY = window.pageYOffset;

				return true;
			},


			/**
			 * Update the last position.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			onTouchMove = function(event) {
				if (!trackingClick) {
					return true;
				}

				// Detect whether a click has left the bounds of would be defined as a click, defined as a circle of radius sqrt(bound) around the start point.
				if ((Math.pow(event.targetTouches[0].pageX - clickStart.x, 2) + Math.pow(event.targetTouches[0].pageY - clickStart.y, 2)) > bound) {
					trackingClick = false;
				}

				// If the touch has moved, cancel the click tracking
				if (Math.abs(window.pageXOffset - clickStart.scrollX) > scrollBoundary || Math.abs(window.pageYOffset - clickStart.scrollY) > scrollBoundary) {
					trackingClick = false;
				}

				return true;
			},


			/**
			 * On touch end, determine whether to send a click event at once.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			onTouchEnd = function(event) {
				var targetElement, targetCoordinates, clickEvent;

				if (!trackingClick) {
					return true;
				}

				trackingClick = false;

				// Set up the coordinates to match
				targetCoordinates = {
					x: clickStart.x - clickStart.scrollX,
					y: clickStart.y	- clickStart.scrollY
				};

				// Derive the element to click as a result of the touch.
				targetElement = document.elementFromPoint(targetCoordinates.x, targetCoordinates.y);

				// If we're not clicking anything exit early
				if (!targetElement) {
					return false;
				}

				// If the targetted node is a text node, target the parent instead
				if (targetElement.nodeType === Node.TEXT_NODE) {
					targetElement = targetElement.parentNode;
				}

				// Prevent the actual click from going though - unless the target node is marked as requiring
				// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted
				// to open the options list and so the original event is required.
				if (needsClick(targetElement)) {
					return false;
				}

				// Synthesise a click event, with an extra attribute so it can be tracked
				clickEvent = document.createEvent('MouseEvents');
				clickEvent.initMouseEvent('click', true, true, window, 1, 0, 0, targetCoordinates.x, targetCoordinates.y, false, false, false, false, 0, null);
				clickEvent.forwardedTouchEvent = true;
				targetElement.dispatchEvent(clickEvent);
				event.preventDefault();
			},


			/**
			 * On touch cancel, stop tracking the click.
			 */
			onTouchCancel = function() {
				trackingClick = false;
			},


			/**
			 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
			 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
			 * an actual click which should be permitted.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			onClick = function(event) {
				var targetElement;

				if (event.forwardedTouchEvent) {
					return true;
				}

				// Programmatically generated events targeting a specific element should be permitted
				if (!event.cancelable) {
					return true;
				}

				targetElement = document.elementFromPoint(clickStart.x - clickStart.scrollX, clickStart.y - clickStart.scrollY);

				// Derive and check the target element to see whether the
				// click needs to be permitted; unless explicitly enabled, prevent non-touch click events
				// from triggering actions, to prevent ghost/doubleclicks.
				if (!targetElement || !needsClick(targetElement)) {

					// Cancel the event
					event.stopPropagation();
					event.preventDefault();

					// Prevent any user-added listeners declared on FastClick element from being fired.
					if (event.stopImmediatePropagation) {
						event.stopImmediatePropagation();
					}

					return false;
				}

				// If clicks are permitted, return true for the action to go through.
				return true;
			};

		if (!layer || !layer.nodeType) {
			throw new TypeError('Layer must be a document node');
		}

		// Devices that don't support touch don't need FastClick
		if (window.ontouchstart === undefined) {
			return;
		}

		// Set up event handlers as required
		layer.addEventListener('click', onClick, true);
		layer.addEventListener('touchstart', onTouchStart, true);
		layer.addEventListener('touchmove', onTouchMove, true);
		layer.addEventListener('touchend', onTouchEnd, true);
		layer.addEventListener('touchcancel', onTouchCancel, true);

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {
			layer.addEventListener('click', layer.onclick, false);
			layer.onclick = '';
		}
	}

	return FastClick;

}());