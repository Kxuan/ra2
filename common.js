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
    }
})();