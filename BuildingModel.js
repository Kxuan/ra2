(function () {
    "use strict";

    /**
     * a Building of Model
     * @constructor
     * @param layers
     */
    var BuildingModel = function (layers) {
        if (layers.length == 0)
            throw new RangeError("At least one layer");
        this.layers = layers;
    };
    Object.defineProperty(BuildingModel.prototype, 'ready', {
        configurable: true,
        get: function () {
            return this.layers.every(function (layer) {
                return layer.shape.shape.ready;
            });
        }
    });

    BuildingModel.prototype.layers = null;
    BuildingModel.prototype.states = null;
    BuildingModel.prototype.frameIndex = 0;
    BuildingModel.prototype.width = -1;
    BuildingModel.prototype.height = -1;
    BuildingModel.prototype.currentState = null;
    BuildingModel.prototype.onloop = null;

    /**
     *
     * @returns {*}
     */
    BuildingModel.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();

        var self = this;
        return Promise
            .all(
                //Load all colored data
                this.layers.map(function (layer) {
                    return layer.shape.load();
                }))
            .then(function () {
                Object.defineProperty(self, 'ready', {value: true});
                self.width = self.layers[0].shape.shape.width;
                self.height = self.layers[0].shape.shape.height;

                if (self.layers.some(function (layer) {
                        return layer.shape.shape.width != self.width || layer.shape.shape.height != self.height;
                    })) {
                    throw new Error("Some shape has different size");
                }
                return self.layers;
            })
            .then(function (layers) {
                var allLayerStates = layers.reduce(
                    /**
                     *
                     * @param {object} states
                     * @param layer
                     */
                    function (states, layer) {
                        for (var state_name in layer.states) {
                            if (!(state_name in states)) {
                                states[state_name] = [];
                            }
                            states[state_name].push({
                                shape: layer.shape,
                                states: layer.states[state_name],
                                frameIndex: 0
                            });
                        }
                        return states;
                    }, {});

                var canvas, ctx;
                self.states = Object.create(null);

                for (var state_name in allLayerStates) {
                    var currentStateLayers = allLayerStates[state_name];
                    var currentStateFrames = [];

                    do {
                        canvas = document.createElement('canvas');
                        canvas.width = self.width;
                        canvas.height = self.height;
                        ctx = canvas.getContext('2d');
                        currentStateLayers.forEach(function (frame) {
                            frame.shape.draw(frame.states[frame.frameIndex], ctx);
                            frame.shape.draw(frame.states[frame.frameIndex] + frame.shape.shape.frames.length / 2, ctx);
                            frame.frameIndex = (frame.frameIndex + 1) % frame.states.length;
                        });
                        currentStateFrames.push(canvas);
                    } while (currentStateLayers.some(function (f) {
                        return f.frameIndex != 0;
                    }));

                    self.states[state_name] = currentStateFrames;
                }
            });
    };
    BuildingModel.prototype.step = function () {
        var currentStateFrames = this.states[this.currentState];
        if (!currentStateFrames)
            return;
        this.frameIndex = (this.frameIndex + 1) % currentStateFrames.length;
        if (this.frameIndex == 0 && typeof this.onloop == 'function') {
            this.onloop(true);
        }
    };
    BuildingModel.prototype.setState = function (newState, onloop) {
        if (typeof this.onloop == 'function')
            this.onloop(false);
        this.onloop = onloop;
        this.currentState = newState;
        this.frameIndex = 0;
    };
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    BuildingModel.prototype.draw = function (ctx) {
        if (!this.states[this.currentState])
            return;
        ctx.drawImage(this.states[this.currentState][this.frameIndex], 0, 0);
    };
    GAME.BuildingModel = BuildingModel;
})();