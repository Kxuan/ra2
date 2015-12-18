(function () {
    this.GAME = {
        VER: 1
    };
    this.Range = function (start, end, step) {
        if (typeof step != 'number')
            step = parseInt(step) || 1;

        var arr = new Array((end - start) / step),
            i = 0, p;
        for (p = start; p < end; p += step) {
            arr[i++] = p;
        }
        return arr;
    };

    this.inherits = function (ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        })
    };
    this.toArray = function (obj) {
        var result = [];
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== null && arguments[i] !== undefined) {
                result = result.concat(arguments[i]);
            }
        }
        return result;
    };
    if (this.global === undefined) {
        global = this;
    }
})();