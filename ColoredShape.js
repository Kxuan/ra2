(function () {
    "use strict";
    /**
     * ColoredShape
     * @param {Shape|Resource|string} shape
     * @param {Palette|Resource|string} palette
     * @constructor
     */
    var ColoredShape = function (shape, palette) {
        this.shape = GAME.Shape.get(shape);
        this.palette = GAME.Palette.get(palette);
    };

    ColoredShape.prototype.ready = false;
    ColoredShape.prototype.shape = null;
    ColoredShape.prototype.palette = null;
    /**
     *
     * @returns {*}
     */
    ColoredShape.prototype.load = function () {
        if (this.ready)
            return Promise.resolve();

        var self = this;
        return Promise.all([this.shape.load(), this.palette.load()]).then(function () {
            self.ready = true;
            return self;
        });
    };

    /**
     *
     * @param {int} frameIndex
     * @param {CanvasRenderingContext2D} ctx
     */
    ColoredShape.prototype.draw = function (frameIndex, ctx) {
        if (!this.ready || !this.shape.frames[frameIndex])
            return;
        var frame = this.shape.frames[frameIndex],
            canvas = drawFrame(frame, this.palette.map, frameIndex < this.shape.frames.length / 2);
        if (canvas) {
            ctx.drawImage(canvas, frame.x, frame.y);
        }
    };
    GAME.ColoredShape = ColoredShape;

    function drawFrame(frame, colorMap, drawForeground) {
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
        if (drawForeground) {
            for (var i = 0; i < frame.u8Image.length; i++) {
                indexColor = frame.u8Image[i];
                if (indexColor == 0) {
                    //TODO Is that right?
                    imgData.data[p + 3] = 0;
                    p += 4;
                } else {
                    imgData.data[p++] = colorMap[indexColor].R;
                    imgData.data[p++] = colorMap[indexColor].G;
                    imgData.data[p++] = colorMap[indexColor].B;
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
        return canvas;
    }
})();