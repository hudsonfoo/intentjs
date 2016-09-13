(function () {
  "use strict";

  /**
   * Accepts an active element like a menu item, and an element
   * that we're tracking intent for.
   * @param {node} activeEl original element that was activated
   * @param {node} trackingEl element that we track intent for
   * @param {object} options
   * @returns {object} new instance of Intent
   */
  var Intent = function (activeEl, trackingEl, options) {
    if (!(this instanceof Intent)) {
      return new Intent(activeEl, trackingEl, options);
    }

    this.queue = [];

    this.activeEl = activeEl;
    this.trackingEl = trackingEl;
    this.verticies = {};
    this.mouseP = { x: undefined, y: undefined };
    this.options = options || {};
    this.timeout = null;

    // Merge passed options with default options
    this.options.timeout = this.options.timeout || 2000;

    return this;
  };

  /**
   * Kicks off the whole thing by setting a timer and monitoring
   * mouse movement.
   * @returns {promise} on intent cancellation
   */
  Intent.prototype.watch = function() {
    this.timeout = setTimeout(this.cancel, this.options.timeout);
    self.boundListener = self.listen.bind(this);
    document.addEventListener("mousemove", this.boundListener);

    return this.promise();
  };

  /**
   * Sets the verticies of the the intent triangle
   * @param {node} activeEl original element that was activated
   * @param {node} trackingEl element that we track intent for
   * @param {object} options
   * @returns {object} new instance of Intent
   */
  Intent.prototype.setVerticies = function(activeEl, trackingEl) {
    var self = this;

    activeEl = activeEl || this.activeEl;
    trackingEl = trackingEl || this.trackingEl;

    // A is the exact position of the mouse within the activeEl
    var activeElBounds = activeEl.getBoundingClientRect();
    var trackingElBounds = trackingEl.getBoundingClientRect();

    this.verticies.p0 = { x: self.mouseP.x, y: self.mouseP.y };

    // B is the coordinates of either the top right or top left corner of the trackingEl (whichever is closest)
    this.verticies.p1 = { x: trackingElBounds.left, y: trackingElBounds.top };

    // C is the coordinates of either the bottom right or bottom left corner of the trackingEl (whichever is closest)
    this.verticies.p2 = { x: trackingElBounds.left, y: trackingElBounds.bottom };
  };

  /**
   * Manages actions based on mouse movements
   */
  Intent.prototype.listen = function(e) {
    var self = this;

    // Update saved mouse position
    self.mouseP.x = e.pageX;
    self.mouseP.y = e.pageY;

    if (!self.verticiesSet()) {
      self.setVerticies();
    }

    if (self.isActive()) {
      // If user is not within intent triangle, resolve promise
      if (!self.isInBounds(self.mouseP, self.verticies)) {
        self.resolvePromises();
        self.cancel();
      }
    }
  };

  /**
   * Executes all promises
   */
  Intent.prototype.resolvePromises = function() {
    for (var i in this.queue) {
      this.queue[i]();
    }
  };

  /**
   * Determines if verticies for triangle bounds are set
   */
  Intent.prototype.verticiesSet = function() {
    return typeof this.verticies.p0 === "object"
    && typeof this.verticies.p1 === "object"
    && typeof this.verticies.p2 === "object";
  };

  /**
   * Determines whether or not this tracker is active
   * @returns {boolean}
   */
  Intent.prototype.isActive = function() {
    return this.verticiesSet()
      && this.queue.length > 0;
  };

  /**
   * Checks to see if a given coordinate is within the intent triangle
   * @param {object} p coordinate that will be tested
   * @param {object} verticies coordinates of intent triangle
   * @returns {boolean}
   */
  Intent.prototype.isInBounds = function(p, verticies) {
    var v0 = [verticies.p2.x - verticies.p0.x, verticies.p2.y - verticies.p0.y];
    var v1 = [verticies.p1.x - verticies.p0.x, verticies.p1.y - verticies.p0.y];
    var v2 = [p.x - verticies.p0.x, p.y - verticies.p0.y];

    var dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
    var dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
    var dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
    var dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
    var dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);

    var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);

    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return ((u >= 0) && (v >= 0) && (u + v < 1));
  };

  /**
   * Always keep your promises
   */
  Intent.prototype.promise = function() {
    var self = this;

    return {
      then: function (fn) {
        if (typeof fn === "function") {
          self.queue.push(fn);
        }
      }
    };
  };

  /**
   * Removes promises, clears timeout, stops listening for movement.
   */
  Intent.prototype.cancel = function() {
    document.removeEventListener("mousemove", this.boundListener);
    clearTimeout(this.timeout);
    this.queue = [];
  };

  /**
   * AMD
   */
  if (typeof define === "function" && define.amd) {
    define("intent", [], function () {
      return Intent;
    });
  } else {
    window.Intent = Intent;
  }

}).call(this);
