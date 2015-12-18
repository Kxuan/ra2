(function () {
    "use strict";

    var Frame = function (metaData) {
        var uint16View = new Uint16Array(metaData),
            uint32View = new Uint32Array(metaData);
        this.x = uint16View[0];
        this.y = uint16View[1];
        this.width = uint16View[2];
        this.height = uint16View[3];
        this.flags = uint16View[4] & 0xff;

        this.radarColor = uint32View[3];
        this.file_offset = uint32View[5];

        this.image = new ArrayBuffer(this.width * this.height);
        this.u8Image = new Uint8Array(this.image);
    };
    Frame.prototype.x = -1;
    Frame.prototype.y = -1;
    Frame.prototype.width = -1;
    Frame.prototype.height = -1;
    Frame.prototype.flags = -1;
    Frame.prototype.radarColor = 0;
    Frame.prototype.file_offset = -1;

    Frame.prototype.decodeData = function (imageData) {
        switch (this.flags) {
            case 0x03:
                Decode3(imageData, this.image, this.width, this.height);
                break;
            default:
                throw new Error("Unexpected frame flag.");
        }
    };

    var cached_shapes = {};
    /**
     * Shape
     * @param {String|Resource} res
     * @constructor
     */
    var Shape = function (res) {
        if (!(this instanceof Shape))
            return Shape.get(res);
        this.resource = GAME.Resource.get(res);
        cached_shapes[this.resource.path] = this;
        console.info("Shape Created(%s)", this.resource.path);
    };
    /**
     * Get a shape
     * @param {Shape|Resource|string} res
     * @returns {Shape}
     */
    Shape.get = function (res) {
        var path;
        if (res instanceof Shape) {
            return res;
        } else if (res instanceof GAME.Resource) {
            path = res.path;
        } else {
            path = res;
        }

        if (path in cached_shapes)
            return cached_shapes[path];
        else
            return new Shape(res);
    };

    Shape.prototype.resource = null;
    Shape.prototype.ready = false;
    Shape.prototype.width = -1;
    Shape.prototype.height = -1;
    /**
     * @type {Frame[]}
     */
    Shape.prototype.frames = [];
    Shape.prototype.load = function () {
        if (this.ready)
            return false;
        var self = this;
        return this.resource.load().then(function (rawData) {
            self.ready = true;
            var raw = new Uint16Array(rawData);
            self.width = raw[1];
            self.height = raw[2];
            self.frames = new Array(raw[3]);

            var byteView = new Uint8Array(rawData);
            //8 = sizeof(shp file header) = 2 (unknown) + 2 (width) + 2 (height) + 2 (frame count)
            var offset = 8;

            var i;
            //Load frames meta data
            for (i = 0; i < self.frames.length; i++) {
                self.frames[i] = new Frame(
                    rawData.slice(offset, offset + 24));
                offset += 24;
            }

            //Load image data
            for (i = 0; i < self.frames.length; i++) {
                if (self.frames[i].file_offset == 0) {
                    if (self.frames[i].width == 0 && self.frames[i].height == 0) {
                        continue;
                    } else {
                        throw new ReferenceError("Frame %d is not zero size, but file_offset pointer to zero!");
                    }
                }
                self.frames[i].decodeData(rawData.slice(self.frames[i].file_offset));
            }
        });
    };

    Shape.Frame = Frame;
    GAME.Shape = Shape;

    //Decode the frame data when flags == 3
    function Decode3(src, dst, width, height) {
        var Source = new Uint8Array(src),
            Dest = new Uint8Array(dst);

        if ((src.byteLength & 0x7) != 0) {
            throw new Error("Source length is not align to 8");
        }
        var SP = 0, DP = 0;
        var x, y, Count, v, maxdp;

        var readByte = function () {
            if (SP >= Source.length)
                throw new Error("Read out of range");

            return Source[SP++];
        }, writeByte = function (v) {
            if (DP >= Dest.length)
                throw new Error("Write out of range");

            Dest[DP++] = v;
        };

        SP = 0;
        DP = 0;

        for (y = 1; y <= height; y++) {
            Count = (readByte() | (readByte() << 8)) - 2;
            x = 0;
            while (Count > 0) {
                Count--;
                v = readByte();

                if (v != 0) {
                    x++;
                    writeByte(v);
                } else {
                    Count--;

                    v = readByte();
                    if (x + v > width) {
                        v = width - x;
                        if (Count > 0)
                            console.warn("x + v > width && Count > 0")
                    }
                    x = x + v;

                    while (v-- > 0)
                        writeByte(0)
                }
            }
        }

        if (DP != dst.byteLength)
            throw new Error("Data size incorrect")
    }

})();