/*!
 * jQuery animated slider
 * A simple slider that can be animated using CSS transitions (see example)
 * by David Wallin
 * MIT License
 *
 *
 * USAGE:
 * $("myULList").AnimatedSlider( { } );
 * Note: Behavior may be undefined if you have less than 3 items.
 *
 * options = {
 *      infiniteScroll: true,
 *      visibleItems: 3,        // 3 or 5. if 5, next_item_2 and previous_item_2 will be used.
 *      changedCallback: function(animatedSliderObject, currentItem),       // called every time the slide changes
 *      willChangeCallback: function(animatedSliderObject, currentItem),    // called before the change transition
 *      userChangedCallback: function(animatedSliderObject, currentItem),   // called after the transition
 * };
 *
 *
 * you can get access to the AnimatedSlider object by:
 * var slider = $("myULList").data("AnimatedSlider");
 *
 *
 */

/*
    CSS Classes Needed:   (see animated-slider.css)
        previous_hidden
        next_hidden
        previous_item  
        previous_item_2 *optional
        next_item 
        next_item2 *optional
        current_item

    also, li needs to have transitions set up.
*/

;
(function($, window, document, undefined) {

    // Create the defaults once
    var pluginName = 'AnimatedSlider',
        defaults = {
            infiniteScroll: true,
            visibleItems: 3,
            changedCallback: null,
            willChangeCallback: null,
            userChangedCallback: null,
            useTransitions: true
        };

    var supportsTransitions = _supportsTransitions();

    function Plugin(element, options) {
        this.element = element;
        this.jqElem = $(element);
        this.items = $(this.element).children("li");
        this.numSliderItems = this.items.length;
        this.currentItem = 1;
        this.commandQueue = [];

        this.jqElem.data(pluginName, this);

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.inTransition = false;
        this.init();


    }

    Plugin.prototype.init = function() {
        var pluginThis = this;

        if (pluginThis.options.useTransitions) {
            this.jqElem.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
                function() {
                    if (pluginThis.inTransition) {
                        pluginThis.inTransition = false;

                        if (pluginThis.options.changedCallback)
                            pluginThis.options.changedCallback(pluginThis, pluginThis.currentItem);

                        setTimeout(function() {
                            pluginThis.doCommandQueue();
                        }, 50);



                    }
                });
        } else {
            this.items.css('transition', 'none');
            this.items.find("*").css('transition', 'none');
        }

        if (this.options.prevButton) {
            $(this.options.prevButton).on('click', function(e) {
                e.preventDefault();
                pluginThis.prevItem();
            });
        }

        if (this.options.nextButton) {
            $(this.options.nextButton).on('click', function(e) {

                e.preventDefault();
                pluginThis.nextItem();
            });
        }


        this.setItem(1);

        // If the slider is hidden initially, it may not get the event which ends the transition. Force it to false.
        this.inTransition = false;

    };

    Plugin.prototype.setItem = function(n) {
        var sliderItems = this.items;

        // remove existing state classes
        sliderItems.removeClass();
        var wrapFuncNone = function(n) {
            return n;
        };
        var wrapFunc;

        if (this.options.infiniteScroll)
            wrapFunc = this._wrapIndex;
        else
            wrapFunc = wrapFuncNone;

        for (var i = 0; i < sliderItems.length; i++) {
            // remove all classes
            var item = sliderItems.eq(i);

            if (i == n) {
                item.addClass("current_item");
            } else if (i < n) {
                item.addClass("previous_hidden");
            } else if (i > n) {
                item.addClass("next_hidden");
            }
        }

        if (this.options.infiniteScroll) {
            sliderItems.eq(this._wrapIndex(n - 1)).removeClass().addClass("previous_item");
            sliderItems.eq(this._wrapIndex(n + 1)).removeClass().addClass("next_item");

            if (this.options.visibleItems == 3) {
                sliderItems.eq(this._wrapIndex(n - 2)).removeClass().addClass("previous_hidden");
                sliderItems.eq(this._wrapIndex(n + 2)).removeClass().addClass("next_hidden");
            } else if (this.options.visibleItems == 5) {
                sliderItems.eq(this._wrapIndex(n - 2)).removeClass().addClass("previous_item_2");
                sliderItems.eq(this._wrapIndex(n + 2)).removeClass().addClass("next_item_2");

                sliderItems.eq(this._wrapIndex(n - 3)).removeClass().addClass("previous_hidden");
                sliderItems.eq(this._wrapIndex(n + 3)).removeClass().addClass("next_hidden");
            }

        } else {
            if (n - 1 >= 0)
                sliderItems.eq(n - 1).removeClass().addClass("previous_item");
            if (n + 1 < this.numSliderItems)
                sliderItems.eq(n + 1).removeClass().addClass("next_item");

            if (this.options.visibleItems == 5) {
                if (n - 2 >= 0)
                    sliderItems.eq(n - 1).removeClass().addClass("previous_item_2");
                if (n + 2 < this.numSliderItems)
                    sliderItems.eq(n + 1).removeClass().addClass("next_item_2");

            }
        }

        currentItem = n;


        if (supportsTransitions && this.options.useTransitions) // Modernizr.csstransitions
        {
            this.inTransition = true;

            if (this.options.willChangeCallback)
                this.options.willChangeCallback(this, this.currentItem);

        } else {
            if (this.options.willChangeCallback)
                this.options.willChangeCallback(this, this.currentItem);

            if (this.options.changedCallback)
                this.options.changedCallback(this, this.currentItem);

        }


    }

    Plugin.prototype.nextItem = function() {

        if (this.inTransition) {

            if (this.commandQueue.length < 3) {
                this.commandQueue.push("nextItem");
            }
            return;
        }

        if (this.options.infiniteScroll || this.currentItem < this.numSliderItems - 1) {
            this.currentItem += 1;
            this.currentItem = this._wrapIndex(this.currentItem);
            this.setItem(this.currentItem);

            if (this.options.userChangedCallback)
                this.options.userChangedCallback(this, this.currentItem);
        }
    }

    Plugin.prototype.prevItem = function() {
        if (this.inTransition) {
            if (this.commandQueue.length < 3) {
                this.commandQueue.push("prevItem");
            }
            return;
        }

        if (this.options.infiniteScroll || this.currentItem >= 1) {
            this.currentItem -= 1;
            this.currentItem = this._wrapIndex(this.currentItem);
            this.setItem(this.currentItem);

            if (this.options.userChangedCallback)
                this.options.userChangedCallback(this, this.currentItem);
        }
    }

    Plugin.prototype.clearAnimations = function() {
        this.inTransition = false;
        this.commandQueue = [];
    }

    Plugin.prototype.doCommandQueue = function() {
        if (this.commandQueue.length == 0)
            return;

        var cmd = this.commandQueue.splice(0, 1)[0];

        this[cmd]();
    }


    Plugin.prototype.refresh = function() {
        this.items = $(this.element).children("li");
        this.numSliderItems = this.items.length;

        this.setItem(this.currentItem);

        clearAnimations();
    }

    Plugin.prototype._wrapIndex = function(n) {
        // note: we're assuming that these indexes aren't getting too crazy out of bounds.

        if (n < 0) {
            n += this.numSliderItems;
        }

        if (n >= this.numSliderItems)
            n -= this.numSliderItems;

        return n;
    }

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

    function _supportsTransitions() {
        var b = document.body || document.documentElement;
        var s = b.style;
        var p = 'transition';
        if (typeof s[p] == 'string') {
            return true;
        }

        // Tests for vendor specific prop
        v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
        p = p.charAt(0).toUpperCase() + p.substr(1);
        for (var i = 0; i < v.length; i++) {
            if (typeof s[v[i] + p] == 'string') {
                return true;
            }
        }
        return false;
    }

})(jQuery, window, document);