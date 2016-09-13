# Intent.js

Provides a promise for user intent based on mouse movement and other gestures. Useful for advanced navigation systems.

![](./res/img/demo.gif)

## Getting Started

First, download via bower: `bower install intentjs`

This script is AMD aware so you're welcome to `var Intent = require('intentjs');`. Without require, Intent will be globally accessible.

Wherever you need to determine user intent based on mouse movements in your code, call Intent like so:

```javascript
var intent = Intent(element1, element2);

intent.watch().then(function () {
  // WHATEVER YOU NEED TO DO IF USER HAS NO INTENT
});
```

`element1` is the originating element (like a menu item), and `element2` is the element that the user may or may not intend to hover over.

That's all there is to it.

## Contributing

I would greatly appreciate quality contributions via pull-requests.
