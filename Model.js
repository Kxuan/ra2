(function () {
    "use strict";

    /**
     * Model
     * @constructor
     * @param {string} initialState
     * @param {Layer[]} layers
     */
    var Model = function (initialState, layers) {
        if (layers.length == 0)
            throw new RangeError("At least one shape");
        this.layers = layers;
        this.state = initialState;

        layers.forEach(function (layer) {
            layer.setState(initialState);
        })
    };
    /**
     *
     * @type {Layer[]}
     */
    Model.prototype.layers = null;
    Model.prototype.width = -1;
    Model.prototype.height = -1;
    Model.prototype.state = null;
    Object.defineProperty(Model.prototype, 'ready', {
        configurable: true,
        get: function () {
            return this.layers.every(function (layer) {
                return layer.shape.shape.ready;
            });
        }
    });
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
                    return layer.shape.load();
                }))
            .then(function () {
                Object.defineProperty(self, 'ready', {value: true});
                self.width = self.layers[0].width;
                self.height = self.layers[0].height;

                if (self.layers.some(function (layer) {
                        return layer.width != self.width || layer.height != self.height;
                    })) {
                    throw new Error("Some shape has different size");
                }
            });
    };
    Model.prototype.step = function () {
        this.layers.forEach(function (layer) {
            layer.step();
        });
    };
    Model.prototype.setState = function (newState) {
        this.layers.forEach(function (layer) {
            layer.setState(newState);
        });
    };
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    Model.prototype.draw = function (ctx) {
        this.layers.forEach(function (layer) {
            layer.draw(ctx);
        });
    };
    GAME.Model = Model;
})();