(function () {
  "use strict";

  /**
   * Accepts an active element like a menu item, and an element
   * that we're tracking intent for.
   * @constructor
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
    this.options.timeout = this.options.timeout || 1000;
    this.options.debug = this.options.debug || false;

    return this;
  };

  /**
   * Kicks off the whole thing by setting a timer and monitoring
   * mouse movement.
   * @returns {promise} on intent cancellation
   */
  Intent.prototype.watch = function() {
    this.timeout = setTimeout(this.cancel.bind(this), this.options.timeout);
    this.boundListener = this.listen.bind(this);
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
    var trackingElBounds;

    activeEl = activeEl || this.activeEl;
    trackingEl = trackingEl || this.trackingEl;

    trackingElBounds = trackingEl.getBoundingClientRect();

    this.verticies.p0 = { x: this.mouseP.x, y: this.mouseP.y };
    this.verticies.p1 = { x: trackingElBounds.left, y: trackingElBounds.top };
    this.verticies.p2 = { x: trackingElBounds.left, y: trackingElBounds.bottom };
  };

  /**
   * Manages actions based on mouse movements
   */
  Intent.prototype.listen = function(e) {
    // Update saved mouse position
    this.mouseP.x = e.pageX;
    this.mouseP.y = e.pageY;

    if (!this.verticiesSet()) {
      this.setVerticies();
    }

    if (this.options.debug) { this.debug(); }
    if (this.isActive()) {
      // If user is not within intent triangle, cancel
      if (!this.isInBounds(this.mouseP, this.verticies)) {
        this.cancel();
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
    this.resolvePromises();
    clearTimeout(this.timeout);
    this.queue = [];
    if (this.options.debug) {
      this.boundingBox.style.visibility = "hidden";
      this.testPoint1.style.visibility = "hidden";
      this.testPoint2.style.visibility = "hidden";
      this.testPoint3.style.visibility = "hidden";
      this.testPoint4.style.visibility = "hidden";
      return;
    }
  };

  Intent.prototype.debug = function() {
    var mouseP = this.mouseP;

    this.boundingBox = this.boundingBox || createTestBoundingBoxEl();
    this.testPoint1 = this.testPoint1 || createTestPointEl();
    this.testPoint2 = this.testPoint2 || createTestPointEl();
    this.testPoint3 = this.testPoint3 || createTestPointEl();
    this.testPoint4 = this.testPoint4 || createTestPointEl();

    updatePointStyle(this.testPoint1, mouseP, "red");
    updatePointStyle(this.testPoint2, this.verticies.p0, "blue");
    updatePointStyle(this.testPoint3, this.verticies.p1, "green");
    updatePointStyle(this.testPoint4, this.verticies.p2, "purple");

    this.boundingBox.style.visibility = "visible";
    this.boundingBox.style.left = this.verticies.p0.x;
    this.boundingBox.style.top = this.verticies.p1.y;
    this.boundingBox.style.borderWidth = this.verticies.p0.y + "px " + (this.verticies.p1.x - this.verticies.p0.x) + "px " + (this.verticies.p2.y - this.verticies.p0.y) + "px 0";

    function updatePointStyle(el, p, color) {
      el.style.visibility = "visible";
      el.style.left = p.x;
      el.style.top = p.y;
      el.style.backgroundColor = color;
    }

    function createTestBoundingBoxEl() {
      var div = document.createElement("div");
      div.style = "position: absolute; opacity: 0.7; width: 0; height: 0; border-style: solid; border-color: transparent #007bff transparent transparent;";
      document.body.appendChild(div);
      return div;
    }

    function createTestPointEl() {
      var div = document.createElement("div");
      div.style = "position: absolute; width: 13px; height: 13px; border-radius: 50%; z-index:99999;";
      document.body.appendChild(div);
      return div;
    }
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
