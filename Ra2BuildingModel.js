(function () {
    "use strict";

    /**
     *
     * @param opt
     * @return {Ra2BuildingModel}
     * @constructor
     */
    var Ra2BuildingModel = function (opt) {
        if (!(this instanceof Ra2BuildingModel))
            return new Ra2BuildingModel(opt);

        opt.build = toArray(opt.build);
        opt.normal = toArray(opt.normal);
        opt.destroy = toArray(opt.destroy);

        Object.defineProperty(this, 'ready', {
            value: false,
            configurable: true
        });

        var self = this;
        this.load = function () {
            return Promise
            //First load all shapes
                .all(opt.build.concat(opt.normal).concat(opt.destroy)
                    .map(function (layer) {
                        layer.graph = GAME.Graph(layer.shape, opt.palette);
                        return layer.graph.load();
                    }))
                .then(function () {
                    var layers = opt.normal.map(parseNormalLayer.bind(this))
                        .concat(opt.build.map(parseSpecialLayer.bind(this, "build")))
                        .concat(opt.destroy.map(parseSpecialLayer.bind(this, "destroy")));

                    //After all layer has been parsed, construct BuildingModel
                    GAME.BuildingModel.call(self, layers);

                    delete self.load;

                    //Call to real .load()
                    return GAME.BuildingModel.prototype.load.call(self);
                });
        }
    };
    inherits(Ra2BuildingModel, GAME.BuildingModel);

    global.Ra2BuildingModel = Ra2BuildingModel;

    function parseSpecialLayer(state, layer) {
        var states = {__proto__: null};
        states[state] = Range(0, layer.graph.shape.frames.length / 2);
        return {
            states: states,
            graph: layer.graph
        }
    }

    function parseNormalLayer(layer) {
        var states = {__proto__: null};
        var duration;

        switch (layer.type) {
            case 1: // One state: normal = injure = broken
                duration = layer.graph.shape.frames.length / 2;
                states = {
                    normal: Range(0, duration),
                    injure: Range(0, duration),
                    broken: Range(0, duration),
                    __proto__: null
                };
                break;
            case 2:// Two state: normal, injure = broken
                if (layer.graph.shape.frames.length % 4 != 0) {
                    throw new Error("Unexpected shape frame count");
                }
                duration = layer.graph.shape.frames.length / 4;
                states = {
                    normal: Range(0, duration),
                    injure: Range(duration, duration * 2),
                    broken: Range(duration, duration * 2),
                    __proto__: null
                };
                break;
            case 3:// Three state: normal, injure, broken
                if (layer.graph.shape.frames.length % 6 != 0) {
                    throw new Error("Unexpected shape frame count");
                }
                duration = layer.graph.shape.frames.length / 6;
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
            graph: layer.graph
        };
    }
})();