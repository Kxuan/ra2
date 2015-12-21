(function () {
    "use strict";

    /**
     * Model
     *
     * Accept a set of layer, For each state each frame,{@link Model} draw them into one canvas.
     *
     * @constructor
     * @param layers
     */
    var Model = function (layers) {
        if (layers.length == 0)
            throw new RangeError("At least one layer");
        this.layers = layers;
    };
    Object.defineProperty(Model.prototype, 'ready', {
        configurable: true,
        get: function () {
            return this.layers.every(function (layer) {
                return layer.graph.shape.ready;
            });
        }
    });

    Model.prototype.layers = null;
    Model.prototype.states = null;
    Model.prototype.frameIndex = 0;
    Model.prototype.width = -1;
    Model.prototype.height = -1;
    Model.prototype.currentState = null;
    Model.prototype.onloop = null;

    /**
     *
     * @returns {*}
     */
    Model.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();

        var self = this;
        return Promise
            .all(
                //Load all colored data
                this.layers.map(function (layer) {
                    return layer.graph.load();
                }))
            .catch(function (err) {
                console.error(err);
                throw err;
            })
            .then(function () {
                Object.defineProperty(self, 'ready', {value: true});
                self.width = self.layers[0].graph.shape.width;
                self.height = self.layers[0].graph.shape.height;

                if (self.layers.some(function (layer) {
                        return layer.graph.shape.width != self.width || layer.graph.shape.height != self.height;
                    })) {
                    console.warn("Some shape has different size, all layer will be crop to %dx%d.", self.width, self.height);
                }

                //remove the ref to layers
                var layers = self.layers;
                delete self.layers;
                return layers;
            })
            .then(function (layers) {
                //split states from all layers
                var allLayerStates = layers.reduce(function (states, layer) {
                    for (var state_name in layer.states) {
                        if (!(state_name in states)) {
                            states[state_name] = [];
                        }
                        states[state_name].push({
                            x: parseInt(layer.x) || 0,
                            y: parseInt(layer.y) || 0,
                            graph: layer.graph,
                            states: layer.states[state_name],
                            frameIndex: 0
                        });
                    }
                    return states;
                }, {__proto__: null});

                self.states = {__proto__: null};

                //for each states, generate its frames
                for (var state_name in allLayerStates) {
                    var currentStateLayers = allLayerStates[state_name];
                    var currentStateFrames = [];
                    var canvas, ctx;

                    do {
                        //draw current frame into a canvas

                        //create a canvas
                        canvas = document.createElement('canvas');
                        canvas.width = self.width;
                        canvas.height = self.height;
                        ctx = canvas.getContext('2d');

                        //draw all frame (current state) into the canvas
                        currentStateLayers.forEach(function (frame) {
                            ctx.save();
                            ctx.translate(frame.x, frame.y);
                            frame.graph.draw(frame.states[frame.frameIndex], ctx);
                            frame.graph.draw(frame.states[frame.frameIndex] + frame.graph.shape.frames.length / 2, ctx);
                            ctx.restore();
                            frame.frameIndex = (frame.frameIndex + 1) % frame.states.length;
                        });

                        //save current frame
                        currentStateFrames.push(canvas);

                        //test whether we are loop back to initial state
                    } while (currentStateLayers.some(function (f) {
                        return f.frameIndex != 0;
                    }));

                    self.states[state_name] = currentStateFrames;
                }

            });
    };

    //forward current play status
    Model.prototype.step = function () {
        var currentStateFrames = this.states[this.currentState];
        if (!currentStateFrames)
            return;
        this.frameIndex = (this.frameIndex + 1) % currentStateFrames.length;
        if (this.frameIndex == 0 && typeof this.onloop == 'function') {
            this.onloop(true);
        }
    };
    Model.prototype.setState = function (newState, onloop) {
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
    Model.prototype.draw = function (ctx) {
        if (!this.states[this.currentState])
            return;
        ctx.drawImage(this.states[this.currentState][this.frameIndex], 0, 0);
    };
    GAME.Model = Model;
})();