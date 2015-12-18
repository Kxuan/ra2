(function () {
    "use strict";

    /**
     *
     * @param {Palette} palette
     * @param {{type:int, shape: Shape|Resource|string}[] | null} build
     * @param {{type:int, shape: Shape|Resource|string}[] | null} normal
     * @param {{type:int, shape: Shape|Resource|string}[] | null} destroy
     * @constructor
     */
    var Ra2BuildingModel = function (palette, build, normal, destroy) {
        this.palette = palette;

        this.build = toArray(build);
        this.normal = toArray(normal);
        this.destroy = toArray(destroy);
        Object.defineProperty(this, 'ready', {
            value: false,
            configurable: true
        });
    };
    inherits(Ra2BuildingModel, GAME.BuildingModel);
    Ra2BuildingModel.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();

        var self = this;
        return Promise
            .all(this.build.concat(this.normal).concat(this.destroy)
                .map(function (layer) {
                    layer.shape = new GAME.ColoredShape(layer.shape, self.palette);
                    return layer.shape.load();
                }))
            .then(function () {
                var layers = self.normal.map(function (layer) {
                        return parseNormalLayer(layer)
                    })
                    .concat(self.build.map(function (layer) {
                        return {
                            states: {build: Range(0, layer.shape.shape.frames.length / 2)},
                            shape: layer.shape
                        }
                    }))
                    .concat(self.destroy.map(function (layer) {
                        return {
                            states: {destroy: Range(0, layer.shape.shape.frames.length / 2)},
                            shape: layer.shape
                        }
                    }));
                GAME.BuildingModel.call(self, layers);
                return GAME.BuildingModel.prototype.load.call(self);
            });
    };
    global.Ra2BuildingModel = Ra2BuildingModel;

    function parseNormalLayer(layer) {
        var states = Object.create(null);
        var duration;

        switch (layer.type) {
            case 1: // One state: normal = injure = broken
                duration = layer.shape.shape.frames.length / 2;
                states = {
                    normal: Range(0, duration),
                    injure: Range(0, duration),
                    broken: Range(0, duration),
                    __proto__: null
                };
                break;
            case 2:// Two state: normal, injure = broken
                if (layer.shape.shape.frames.length % 4 != 0) {
                    throw new Error("Unexpected shape frame count");
                }
                duration = layer.shape.shape.frames.length / 4;
                states = {
                    normal: Range(0, duration),
                    injure: Range(duration, duration * 2),
                    broken: Range(duration, duration * 2),
                    __proto__: null
                };
                break;
            case 3:// Three state: normal, injure, broken
                if (layer.shape.shape.frames.length % 6 != 0) {
                    throw new Error("Unexpected shape frame count");
                }
                duration = layer.shape.shape.frames.length / 6;
                states = {
                    normal: Range(0, duration),
                    injure: Range(duration, duration * 2),
                    broken: Range(duration * 2, duration * 3),
                    __proto__: null
                };
                break;
            default:
                throw new Error("Unexpected state type");
        }

        return {
            states: states,
            shape: layer.shape
        };
    }
})();