(function () {
    "use strict";

    var COLOR_DEPTH_6BIT_TO_8BIT = [0x00, 0x04, 0x08, 0x0c, 0x10, 0x14, 0x18, 0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30, 0x34, 0x38, 0x3c, 0x41, 0x45, 0x49, 0x4d, 0x51, 0x55, 0x59, 0x5d, 0x61, 0x65, 0x69, 0x6d, 0x71, 0x75, 0x79, 0x7d, 0x82, 0x86, 0x8a, 0x8e, 0x92, 0x96, 0x9a, 0x9e, 0xa2, 0xa6, 0xaa, 0xae, 0xb2, 0xb6, 0xba, 0xbe, 0xc3, 0xc7, 0xcb, 0xcf, 0xd3, 0xd7, 0xdb, 0xdf, 0xe3, 0xe7, 0xeb, 0xef, 0xf3, 0xf7, 0xfb, 0xff];

    var cached_palettes = {};
    /**
     * Palette
     * @param {Resource} res
     * @constructor
     */
    var Palette = function (res) {
        this.resource = GAME.Resource.get(res);
        cached_palettes[this.resource.path] = this;
        console.info("Palette Created(%s)",this.resource.path);
    };
    Palette.empty = new Array(256);
    Palette.empty.fill('#000000');

    /**
     * Get a palette
     * @param {Palette|Resource|string} res
     * @returns {Palette}
     */
    Palette.get = function (res) {
        var path;
        if (res instanceof Palette) {
            return res;
        } else if (res instanceof GAME.Resource) {
            path = res.path;
        } else {
            path = res;
        }

        if (path in cached_palettes)
            return cached_palettes[path];
        else
            return new Palette(res);
    };

    Palette.prototype.resource = null;
    Palette.prototype.ready = false;
    Palette.prototype.map = Palette.empty;
    Palette.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();
        var self = this;
        return this.resource.load().then(function (rawData) {
            if (self.ready)
                return;
            self.ready = true;
            //256 (Indexed color) * 3 (R + G + B)
            if (rawData.byteLength != 256 * 3) {
                throw new Error("illegal palette content");
            }
            var raw = new Uint8Array(rawData);
            var map = new Array(256);
            var index = 0;
            for (var offset = 0; offset < 256 * 3; offset += 3) {
                map[index++] = {
                    R: COLOR_DEPTH_6BIT_TO_8BIT[raw[offset]],
                    G: COLOR_DEPTH_6BIT_TO_8BIT[raw[offset + 1]],
                    B: COLOR_DEPTH_6BIT_TO_8BIT[raw[offset + 2]]
                }
            }
            self.map = map;
        });
    };

    GAME.Palette = Palette;
})();