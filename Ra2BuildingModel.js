(function () {
    "use strict";

    /**
     *
     * @param {Palette} palette
     * @param {Object.<string,{type:int, shape: Shape|Resource|string}[] | null>} opt
     * @constructor
     */
    var Ra2BuildingModel = function (palette, opt) {
        if (!(this instanceof Ra2BuildingModel))
            return new Ra2BuildingModel(palette, opt);

        this.palette = palette;

        this.build = toArray(opt.build);
        this.normal = toArray(opt.normal);
        this.destroy = toArray(opt.destroy);
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
            //First load all shapes
            .all(this.build.concat(this.normal).concat(this.destroy)
                .map(function (layer) {
                    layer.shape = GAME.ColoredShape(layer.shape, self.palette);
                    return layer.shape.load();
                }))
            .then(function () {
                var layers = self.normal.map(parseNormalLayer.bind(this))
                    .concat(self.build.map(parseSpecialLayer.bind(this, "build")))
                    .concat(self.destroy.map(parseSpecialLayer.bind(this, "destroy")));

                //After all layer has been parsed, construct BuildingModel
                GAME.BuildingModel.call(self, layers);
                GAME.BuildingModel.prototype.load.call(self);

                //Cleanup all resources
                self.palette = self.normal = self.build = self.destroy = null;
            });
    };
    global.Ra2BuildingModel = Ra2BuildingModel;

    function parseSpecialLayer(state, layer) {
        var states = {__proto__: null};
        states[state] = Range(0, layer.shape.shape.frames.length / 2);
        return {
            states: states,
            shape: layer.shape
        }
    }

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