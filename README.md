## FT Labs, Google and Facebook will be hosting a discussion about making web apps agnostic to different input technologies at [Edge](http://edgeconf.com/), London, 9 February 2013.

# FastClick

FastClick is a simple, easy-to-use library for eliminating the 300ms delay between a physical tap and the firing of a `click` event on mobile browsers. The aim is to make your application feel less laggy and more responsive while avoiding any interference with your current logic.

FastClick is developed by [FT Labs](http://labs.ft.com/), part of the Financial Times.

## Compatibility

The library has been deployed as part of the [FT Web App](http://app.ft.com/) and is tried and tested on the following mobile browsers:

* Mobile Safari on iOS 3 and upwards
* Chrome on iOS 5 and upwards
* Chrome on Android (ICS)
* Opera Mobile 11.5 and upwards
* Android Browser since Android 2
* PlayBook OS 1 and upwards

FastClick doesn't attach any listeners on desktop browsers as it is not needed. Those that have been tested are:

* Safari
* Chrome
* Internet Explorer
* Firefox
* Opera

## Usage

Include fastclick.js in your JavaScript bundle or add it to your HTML page like this:

```html
<script type='application/javascript' src='/path/to/fastclick.js'></script>
```

The script must be loaded prior to instantiating FastClick on any element of the page.

To instantiate FastClick on the `body`, which is the recommended method of use:

```js
window.addEventListener('load', function() {
	new FastClick(document.body);
}, false);
```

### Google Closure Compiler

FastClick supports compilation with `ADVANCED_OPTIMIZATIONS` ('advanced mode'), which should reduce its size by about 70% (60% gzipped). Note that exposure of the `FastClick` variable isn't forced therefore you must compile it along with all of your code.

### AMD

FastClick has AMD (Asynchronous Module Definition) support. This allows it to be lazy-loaded with an AMD loader, such as [RequireJS](http://requirejs.org/).

### Component

FastClick comes with support for installation via the [Component package manager](https://github.com/component/component).

### NPM

Installation via the [Node Package Manager](https://npmjs.org/package/fastclick) is supported, although Component is preferred as this is not strictly a Node packagage.

## Advanced

### Ignore certain elements with `needsclick` class
Sometimes you need FastClick to ignore certain elements. You can do this easily by adding the `needsclick` class.
```html
<a class="needsclick">Ignored by FastClick</a>
```

#### Use case 1: non-synthetic click required
Internally, FastClick uses `document.createEvent` to fire a synthetic `click` event as soon as `touchend` is fired by the browser. It then suppresses the additional `click` event created by the browser after that. In some cases, the non-synthetic `click` event created by the browser is required, as described in the [triggering focus example](http://ftlabs.github.com/fastclick/examples/focus.html).

This is where the `needsclick` class comes in. Add the class to any element that requires a non-synthetic click.

#### Use case 2: Twitter Bootstrap 2.2.2 dropdowns
Another example of when to use the `needsclick` class is with dropdowns in Twitter Bootstrap 2.2.2. Bootstrap add its own `touchstart` listener for dropdowns, so you want to tell FastClick to ignore those. If you don't, touch devices will automatically close the dropdown as soon as it is clicked, because both FastClick and Bootstrap execute the synthetic click, one opens the dropdown, the second closes it immediately after.

```html
<a class="dropdown-toggle needsclick" data-toggle="dropdown">Dropdown</a>
```

## Examples

FastClick is designed to cope with many different browser oddities. Here are some examples to illustrate this:

* [basic use](http://ftlabs.github.com/fastclick/examples/layer.html) showing the increase in perceived responsiveness
* [triggering focus](http://ftlabs.github.com/fastclick/examples/focus.html) on an input element from a `click` handler
* [input element](http://ftlabs.github.com/fastclick/examples/input.html) which never receives clicks but gets fast focus

## Credits and collaboration

The lead developer of FastClick is [Rowan Beentje](http://twitter.com/rowanbeentje) at FT Labs. This fork is currently maintained by [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia). All open source code released by FT Labs is licenced under the MIT licence. We welcome comments, feedback and suggestions.  Please feel free to raise an issue or pull request. Enjoy.
