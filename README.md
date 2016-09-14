# Intent

Provides a promise for user intent based on mouse movement and other gestures. Useful for advanced navigation systems. The idea for this plugin came after reading [this post](http://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown), which discussed Amazon's method for lighting fast menu system. _Tl;dr_ they gauge user intent by checking the direction of mouse movements after hovering over a menu item. That's exactly what this plugin does for you. It looks at two elements (like a menu item and its context window), creates a bounding triangle, then returns a promise when the user's mouse cursor exits the bounding area.

![](./res/img/demo.gif)

## Getting Started

First, download via bower: `bower install intentjs`

This script is AMD aware so you're welcome to `var Intent = require('intentjs');`. Without require, Intent will be globally accessible.

Wherever you need to determine user intent based on mouse movements in your code, call Intent like so:

```javascript
Intent(element1, element2).watch().then(function () {
  // WHATEVER YOU NEED TO DO IF USER HAS NO INTENT
});
```

`element1` is the originating element (like a menu item), and `element2` is the element that the user may or may not intend to hover over.

That's all there is to it. See [this example](res/example.html) for a more fleshed out example.

## Contributing

I would greatly appreciate quality contributions via pull-requests.
