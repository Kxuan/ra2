(function () {
    "use strict";
    /**
     *
     * @param {Object.<string, int[]>} states
     * @param {ColoredShape} coloredShape
     * @constructor
     */
    var Layer = function (states, coloredShape) {
        this.states = states;
        this.shape = coloredShape;
        this.width = coloredShape.shape.width;
        this.height = coloredShape.shape.height;
    };
    Layer.prototype.currentState = '';
    Layer.prototype.currentStep = -1;

    /**
     * @type {Object.<string,int[]>}
     */
    Layer.prototype.states = {};
    /**
     * @type {ColoredShape}
     */
    Layer.prototype.shape = null;

    Layer.prototype.width = -1;
    Layer.prototype.height = -1;

    Layer.prototype.setState = function (newState) {
        this.currentState = newState;
        this.currentStep = 0;
    };
    Layer.prototype.step = function () {
        var frames = this.states[this.currentState];
        this.currentStep = (this.currentStep + 1) % frames.length;
    };
    Layer.prototype.draw = function (ctx) {
        var currentFrames = this.states[this.currentState];
        var frameIndex = currentFrames[this.currentStep];
        this.shape.draw(frameIndex, ctx);
    };
    GAME.Layer = Layer;
})();