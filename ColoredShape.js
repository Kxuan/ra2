(function () {
    "use strict";
    var cached_colored_shapes = {};
    /**
     * ColoredShape
     * @param {Shape|Resource|string} shape
     * @param {Palette|Resource|string} palette
     * @constructor
     */
    var ColoredShape = function (shape, palette) {
        this.shape = GAME.Shape.get(shape);
        this.palette = GAME.Palette.get(palette);
        cached_colored_shapes[this.shape.resource.path + "&" + this.palette.resource.path] = this;
        console.info("ColoredShape Created(%s)", this.shape.resource.path + "&" + this.palette.resource.path);
    };

    ColoredShape.get = function (shape, palette) {
        var name;
        if (shape instanceof ColoredShape) {
            return shape;
        }

        shape = GAME.Shape.get(shape);
        palette = GAME.Palette.get(palette);
        name = shape.resource.path + "&" + palette.resource.path;

        if (name in cached_colored_shapes) {
            return cached_colored_shapes[name];
        } else {
            return new ColoredShape(shape, palette);
        }
    };

    ColoredShape.prototype.ready = false;
    ColoredShape.prototype.shape = null;
    ColoredShape.prototype.palette = null;
    /**
     *
     * @type {ImageData[]}
     */
    ColoredShape.prototype.frames = null;
    /**
     *
     * @returns {*}
     */
    ColoredShape.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();

        var self = this;
        return Promise.all([this.shape.load(), this.palette.load()]).then(function () {
            if (self.ready)
                return;
            self.ready = true;
            var colorMap = self.palette.map,
                shapeFrames = self.shape.frames;

            self.frames = shapeFrames.map(function (frame, frameIndex) {
                if (frame.width == 0 || frame.height == 0) {
                    //The are size is zero. Just skip it
                    return null;
                }

                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');
                canvas.width = frame.width;
                canvas.height = frame.height;
                var imgData = ctx.createImageData(frame.width, frame.height);
                var p = 0, indexColor;
                if (frameIndex < shapeFrames.length / 2) {
                    for (var i = 0; i < frame.u8Image.length; i++) {
                        indexColor = frame.u8Image[i];
                        if (indexColor == 0) {
                            //TODO Is that right?
                            imgData.data[p + 3] = 0;
                            p += 4;
                        } else {
                            imgData.data[p++] = colorMap[frame.u8Image[i]].R;
                            imgData.data[p++] = colorMap[frame.u8Image[i]].G;
                            imgData.data[p++] = colorMap[frame.u8Image[i]].B;
                            imgData.data[p++] = 255;
                        }
                    }
                } else {
                    for (var i = 0; i < frame.u8Image.length; i++) {
                        switch (frame.u8Image[i]) {
                            case 0:
                                imgData.data[p + 3] = 0;
                                break;
                            case 1:
                                imgData.data[p + 3] = 128;
                                break;
                            default:
                                throw new Error("Unexpected shadow value");
                        }
                        p += 4;
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                return {
                    x: frame.x,
                    y: frame.y,
                    canvas: canvas
                }
            });
            return self;
        });
    };

    /**
     *
     * @param {int} frameIndex
     * @param {CanvasRenderingContext2D} ctx
     */
    ColoredShape.prototype.draw = function (frameIndex, ctx) {
        if (!this.frames || !this.frames[frameIndex])
            return;
        var frame = this.frames[frameIndex];
        ctx.drawImage(frame.canvas, frame.x, frame.y);
    };
    GAME.ColoredShape = ColoredShape;
})();