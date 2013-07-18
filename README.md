# FastClick #

FastClick is a simple, easy-to-use library for eliminating the 300ms delay between a physical tap and the firing of a `click` event on mobile browsers. The aim is to make your application feel less laggy and more responsive while avoiding any interference with your current logic.

FastClick is developed by [FT Labs](http://labs.ft.com/), part of the Financial Times.

[Explication en français](http://maxime.sh/2013/02/supprimer-le-lag-des-clics-sur-mobile-avec-fastclick/).

[日本語で説明](https://developer.mozilla.org/ja/docs/Mozilla/Firefox_OS/Apps/Tips_and_techniques#Make_events_immediate)。

[Краткое пояснение на русском языке](http://job-blog.bullgare.ru/2013/02/библиотека-для-более-отзывчивой-рабо/).

## Why does the delay exist? ##

According to [Google](https://developers.google.com/mobile/articles/fast_buttons):

> ...mobile browsers will wait approximately 300ms from the time that you tap the button to fire the click event. The reason for this is that the browser is waiting to see if you are actually performing a double tap.

## Compatibility ##

The library has been deployed as part of the [FT Web App](http://app.ft.com/) and is tried and tested on the following mobile browsers:

* Mobile Safari on iOS 3 and upwards
* Chrome on iOS 5 and upwards
* Chrome on Android (ICS)
* Opera Mobile 11.5 and upwards
* Android Browser since Android 2
* PlayBook OS 1 and upwards

## When it isn't needed ##

FastClick doesn't attach any listeners on desktop browsers or Chrome on Android with `user-scalable=no` in the [viewport meta tag](https://developer.mozilla.org/en-US/docs/Mobile/Viewport_meta_tag) as it is not needed. You should add this tag if you want to disable double-tap-to-zoom entirely.

```html
<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
```

For IE10, you can use `-ms-touch-action: none` to disable double-tap-to-zoom on certain elements (like links and buttons) as described in [this MSDN blog post](http://blogs.msdn.com/b/askie/archive/2013/01/06/how-to-implement-the-ms-touch-action-none-property-to-disable-double-tap-zoom-on-touch-devices.aspx). For example:

```css
a, input, button {
	-ms-touch-action: none !important;
}
```

You'll then have no tap delay on those elements, without needing FastClick.

## Usage ##

Include fastclick.js in your JavaScript bundle or add it to your HTML page like this:

```html
<script type='application/javascript' src='/path/to/fastclick.js'></script>
```

The script must be loaded prior to instantiating FastClick on any element of the page.

To instantiate FastClick on the `body`, which is the recommended method of use:

```js
window.addEventListener('load', function() {
	FastClick.attach(document.body);
}, false);
```

Don't forget to add a [shim](https://developer.mozilla.org/en-US/docs/DOM/EventTarget.removeEventListener#Compatibility) for `addEventListener` if you want to support IE8 and below.

Otherwise, if you're using jQuery:

```js
$(function() {
	FastClick.attach(document.body);
});
```

If you're using Browserify or another Commonjs-style module system, the `FastClick.attach` function will
be returned when you call `require('fastclick')`. As a result, the easiest way to use FastClick
with these loaders is as follows:

```js
var attachFastClick = require('fastclick');
attachFastClick(document.body);
```

### Minified ###

Run `make` to build a minified version of FastClick using the Closure Compiler REST API. The minified file is saved to `build/fastclick.min.js`.

### AMD ###

FastClick has AMD (Asynchronous Module Definition) support. This allows it to be lazy-loaded with an AMD loader, such as [RequireJS](http://requirejs.org/).

### Package managers ###

You can install FastClick using [Component](https://github.com/component/component), [npm](https://npmjs.org/package/fastclick) or [Bower](http://bower.io/).

For Ruby, there's a third-party gem called [fastclick-rails](http://rubygems.org/gems/fastclick-rails). For .NET there's a [NuGet package](http://nuget.org/packages/FastClick).

## Advanced ##

### Ignore certain elements with `needsclick` ###

Sometimes you need FastClick to ignore certain elements. You can do this easily by adding the `needsclick` class.
```html
<a class="needsclick">Ignored by FastClick</a>
```

#### Use case 1: non-synthetic click required ####

Internally, FastClick uses `document.createEvent` to fire a synthetic `click` event as soon as `touchend` is fired by the browser. It then suppresses the additional `click` event created by the browser after that. In some cases, the non-synthetic `click` event created by the browser is required, as described in the [triggering focus example](http://ftlabs.github.com/fastclick/examples/focus.html).

This is where the `needsclick` class comes in. Add the class to any element that requires a non-synthetic click.

#### Use case 2: Twitter Bootstrap 2.2.2 dropdowns ####

Another example of when to use the `needsclick` class is with dropdowns in Twitter Bootstrap 2.2.2. Bootstrap add its own `touchstart` listener for dropdowns, so you want to tell FastClick to ignore those. If you don't, touch devices will automatically close the dropdown as soon as it is clicked, because both FastClick and Bootstrap execute the synthetic click, one opens the dropdown, the second closes it immediately after.

```html
<a class="dropdown-toggle needsclick" data-toggle="dropdown">Dropdown</a>
```

## Examples ##

FastClick is designed to cope with many different browser oddities. Here are some examples to illustrate this:

* [basic use](http://ftlabs.github.com/fastclick/examples/layer.html) showing the increase in perceived responsiveness
* [triggering focus](http://ftlabs.github.com/fastclick/examples/focus.html) on an input element from a `click` handler
* [input element](http://ftlabs.github.com/fastclick/examples/input.html) which never receives clicks but gets fast focus

## Tests ##

There are no automated tests. The files in `tests/` are manual reduced test cases. We've had a think about how best to test these cases, but they tend to be very browser/device specific and sometimes subjective which means it's not so trivial to test.

## Credits and collaboration ##

The lead developer of FastClick is [Rowan Beentje](http://twitter.com/rowanbeentje) at FT Labs. This fork is currently maintained by [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia). All open source code released by FT Labs is licenced under the MIT licence. We welcome comments, feedback and suggestions.  Please feel free to raise an issue or pull request. Enjoy.
