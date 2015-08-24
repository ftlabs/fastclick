# FastClick #

FastClick是一个轻便且易于使用的库，用于解决在移动浏览器上的实际点击和触发点击(`click`)事件之间有300毫秒延时的问题。它在不给当前逻辑引入任何干扰的情况下，能缩短您程序的延迟并提高响应性。

FastClick由[FT Labs](http://labs.ft.com/)开发，本组织是Financial Times的一部分。

[Explication en français](http://maxime.sh/2013/02/supprimer-le-lag-des-clics-sur-mobile-avec-fastclick/).

[日本語で説明](https://developer.mozilla.org/ja/docs/Mozilla/Firefox_OS/Apps/Tips_and_techniques#Make_events_immediate)。

[English Readme](https://github.com/ftlabs/fastclick/blob/master/README.md)。

## 为什么会存在延时？ ##

根据[Google](https://developers.google.com/mobile/articles/fast_buttons):

> ...移动浏览器在您点击按钮后会等待大约300毫秒才触发点击事件。这么做是为了判断用户是否实际上想双击。

## 兼容性 ##

本库是[FT Web App](http://app.ft.com/)的一部分，并且在以下的移动浏览器上经过了测试：

* Mobile Safari (iOS 3及以上版本)
* Chrome (iOS5及以上版本)
* Chrome on Android (ICS)
* Opera Mobile 11.5及以上版本
* Android Browser (Android 2及以上版本)
* PlayBook OS 1及以上版本

## 不需要使用的场合 ##

FastClick在桌面浏览器上不会有任何行为

Android上的Chrome 32+在[viewport meta tag](https://developer.mozilla.org/en-US/docs/Mobile/Viewport_meta_tag)中使用`width=device-width`选项时，没有这样的300毫秒延迟，所以本库也不会采取措施。

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

同样的，对任意版本的Android上的Chrome在viewport meta tag中启用`user-scalable=no`选项的情况也适用。但请注意，`user-scalable=no`选项也会禁用双指缩放，这可能降低可访问性。

对于IE11+，您可以使用`touch-action: manipulation;`在某些元素（例如链接和按钮）上来禁用双击缩放。对于IE10请使用`-ms-touch-action: manipulation`。

## 用法 ##

在您的JavaScript脚本集合中包含fastclick.js或者把它加进您的HTML页面。就像这样：


```html
<script type='application/javascript' src='/path/to/fastclick.js'></script>
```

只有在这个脚本加载后，您才可以在页面上的任何一个元素上实例化FastClick。

推荐的在`body`上实例化FastClick的方法如下：

```js
if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}
```

或者如果您使用了jQuery的话：

```js
$(function() {
	FastClick.attach(document.body);
});
```

如果您使用了Browserify或者其他CommonJS样式的模块系统，那么您调用`require('fastclick')`时会返回名叫`FastClick.attach`的函数。所以，在使用这些加载器的情况下最简单的使用FastClick的方法是：

```js
var attachFastClick = require('fastclick');
attachFastClick(document.body);
```

### 压缩版###

运行`make`来借助Closure Compiler REST API构建一个压缩版的FastClick。压缩后的文件会被保存到`build/fastclick.min.js`，或者您可以[下载预压缩版](http://build.origami.ft.com/bundles/js?modules=fastclick)。

注意：预压缩版使用[我们的构建服务](http://origami.ft.com/docs/developer-guide/build-service/)构建。这版本通过`Origami.fastclick`暴露了`FastClick`对象，并且有Browserify/CommonJS API（见上文）

```js
var attachFastClick = Origami.fastclick;
attachFastClick(document.body);
```

### AMD ###

FastClick支持AMD（异步模块定义）。这允许它被一个AMD加载器（比如[RequireJS](http://requirejs.org/)）惰性加载。请注意使用AMD加载时，返回的是完整的`FastClick`对象，_而非_`FastClick.attach`。

```js
var FastClick = require('fastclick');
FastClick.attach(document.body, options);
```

### 包管理器 ###

你可以通过[Component](https://github.com/component/component), [npm](https://npmjs.org/package/fastclick) 或者 [Bower](http://bower.io/)安装FastClick。

对于Ruby，有一个第三方模块[fastclick-rails](http://rubygems.org/gems/fastclick-rails)。对于.NET，可以获取[NuGet package](http://nuget.org/packages/FastClick)。

## 高级 ##

### 使用 `needsclick` 选项忽略特定的元素###

如果您需要FastClick忽略某些特定的元素，可以给它加上`needsclick`类。
```html
<a class="needsclick">Ignored by FastClick</a>
```

#### 用途 1: 需要非模拟点击(non-synthetic click) ####

在内部，FlastCick在浏览器触发`touchend`事件的同时使用`document.createEvent`触发了一个模拟的(synthetic)点击(`click`)事件，然后抑制浏览器之后触发的点击事件。在[triggering focus example](http://ftlabs.github.com/fastclick/examples/focus.html)描述的某些场合中，需要浏览器触发的点击事件。

这就是`needsclick`类有用的地方，把它加到任何一个需要非模拟点击的地方。


#### 用途 2: Twitter Bootstrap 2.2.2 下拉菜单 ####

另一个需要用`needsclick`的地方是Twitter Bootstrap 2.2.2的下拉菜单。Bootstrap给下拉菜单加上了自己的`touchstart`监听器，所以你应该让FastClick忽略它们。如果不这么做，触控设备会自动在下拉菜单被点击以后又关闭它们，因为FastClick和Bootstrap都执行了模拟点击，一个打开菜单，另一个立刻又关上了它。

```html
<a class="dropdown-toggle needsclick" data-toggle="dropdown">Dropdown</a>
```

## 实例 ##

FastClick被设计用来对付许多不同的浏览器奇葩现象。下面是一些解释的例子：

* [基本用处](http://ftlabs.github.com/fastclick/examples/layer.html) 显示了对用户感知响应度的提升
* [触发焦点](http://ftlabs.github.com/fastclick/examples/focus.html) 在输入元素上使用`click` handler
* [输入元素](http://ftlabs.github.com/fastclick/examples/input.html) 虽然不接受点击事件，但是更快地获得焦点

## 测试 ##

本库未经自动化测试。`tests/`目录中的文件都是手动执行的测试用例。我们考虑过执行这些测试的最佳方式，但是它们都很依赖于具体的浏览器/设备，甚至有的很主观，所以并没有必要进行太过琐碎的自动化测试。

## 感谢与协作 ##

FastClick 由[FT Labs](http://labs.ft.com)的[Rowan Beentje](http://twitter.com/rowanbeentje)、 [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia) 和 [Matthew Andrews](http://twitter.com/andrewsmatt) 维护。 所有FT Labs开放的源代码均采用MIT许可证。我们欢迎评论、反馈和建议。如果想提出issue或者pull request，请不要顾虑。

The Chinese version of this document is translated by [Harry Chen](https://www.github.com/Harry-Chen).
