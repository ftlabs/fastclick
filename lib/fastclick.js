/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENCE.txt)
 * @codingstandard ftlabs-jslint
 */

/*jslint browser:true*/
/*global Node, define*/

(function() {
	'use strict';

	var


		/**
		 * Android requires an exception for labels.
		 *
		 * @type boolean
		 */
		android = navigator.userAgent.indexOf('Android') > 0,


		/**
		 * Earlier versions of Chrome for Android don't report themselves as "Chrome" but "CrMo" - check for both.
		 *
		 * @type boolean
		 */
		chromeAndroid = android && (/Chrome|CrMo/).test(navigator.userAgent),


		/**
		 * Playbook requires a greater scroll boundary.
		 *
		 * @type number
		 */
		scrollBoundary = (android || (navigator.userAgent.indexOf('PlayBook') === -1)) ? 5 : 20;


	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {Element} target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	function needsClick(target) {
		switch (target.nodeName.toLowerCase()) {
			case 'label':
			case 'video':
				return true;
			default:
				return (/\bneedsclick\b/).test(target.className);
		}
	}

	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param  {Element} target target DOM element.
	 * @return {boolean}  Returns true if the element requires a call to focus to simulate native click.
	 */
	function needsFocus(target) {
		switch(target.nodeName.toLowerCase()) {
			case 'textarea':
			case 'select':
				return true;
			case 'input':
				switch (target.type) {
					case 'button':
					case 'checkbox':
					case 'file':
					case 'image':
					case 'radio':
					case 'submit':
						return false;
					default:
						return true;
				}
				break;
			default:
				return (/\bneedsfocus\b/).test(target.className);
		}
	}


	/**
	 * Retrieve an element based on coordinates within the window.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @return {Element}
	 */
	function eleAtWindowPosition(x, y) {

		// On Chrome for Android, amend coordinates by the device pixel ratio.
		if (chromeAndroid && window.devicePixelRatio) {
			x *= window.devicePixelRatio;
			y *= window.devicePixelRatio;
		}

		return document.elementFromPoint(x, y);
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
			 * @type Function
			 */
			oldOnClick,


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

				// If the touch has moved, cancel the click tracking
				} else if (Math.abs(window.pageXOffset - clickStart.scrollX) > scrollBoundary || Math.abs(window.pageYOffset - clickStart.scrollY) > scrollBoundary) {
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
				var targetElement, forElement, targetCoordinates, clickEvent;

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
				targetElement = eleAtWindowPosition(targetCoordinates.x, targetCoordinates.y);

				// If we're not clicking anything exit early
				if (!targetElement) {
					return false;
				}

				// If the targetted node is a text node, target the parent instead
				if (targetElement.nodeType === Node.TEXT_NODE) {
					targetElement = targetElement.parentElement;
				}

				if (targetElement.nodeName.toLowerCase() === 'label' && targetElement.htmlFor) {
					forElement = document.getElementById(targetElement.htmlFor);
					if (forElement) {
						targetElement.focus();
						if (android) {
							return false;
						}

						targetElement = forElement;
					}
				} else if (needsFocus(targetElement)) {
					targetElement.focus();
					return false;
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
				
				return false;
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

				targetElement = eleAtWindowPosition(clickStart.x - clickStart.scrollX, clickStart.y - clickStart.scrollY);

				// Derive and check the target element to see whether the click needs to be permitted;
				// unless explicitly enabled, prevent non-touch click events from triggering actions,
				// to prevent ghost/doubleclicks.
				if (!targetElement || !needsClick(targetElement)) {

					// Prevent any user-added listeners declared on FastClick element from being fired.
					if (event.stopImmediatePropagation) {
						event.stopImmediatePropagation();
					}

					// Cancel the event
					event.stopPropagation();
					event.preventDefault();

					return false;
				}

				// If clicks are permitted, return true for the action to go through.
				return true;
			};

		if (!layer || !layer.nodeType) {
			throw new TypeError('Layer must be a document node');
		}

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
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

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	if (typeof define === 'function' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else {

		// Browser global
		window.FastClick = FastClick;
	}
}());