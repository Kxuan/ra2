(function () {
    "use strict";

    var cached_resources = {};
    /**
     *
     * @param {string} path
     * @returns {Resource}
     * @constructor
     */
    var Resource = function (path) {
        if (!(this instanceof Resource))
            return Resource.get(path);
        this.path = path;
        cached_resources[path] = this;
    };
    Resource.WAITING = 0;
    Resource.LOADING = 1;
    Resource.LOAD = 2;
    Resource.ERROR = 3;

    /**
     * Get a resource
     * @param {Resource|string} path
     * @returns {Resource}
     */
    Resource.get = function (path) {
        if (path instanceof Resource) {
            return path;
        } else if (typeof path == "string") {
            if (path in cached_resources)
                return cached_resources[path];
            else
                return new Resource(path);
        } else {
            throw new TypeError("Unexpected type of arguments");
        }
    };

    Resource.prototype.raw = null;
    Resource.prototype.status = Resource.WAITING;
    Resource.prototype.load = function () {
        var self = this;
        switch (this.status) {
            case Resource.ERROR:
            case Resource.WAITING:
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "files/" + self.path, true);
                    xhr.responseType = "arraybuffer";
                    xhr.addEventListener("load", function (e) {
                        var notify_list = self.onload_notify_list;
                        delete self.onload_notify_list;

                        if (xhr.status == "200" && xhr.response instanceof ArrayBuffer) {
                            self.status = Resource.LOAD;
                            self.raw = xhr.response;
                            resolve(self.raw);
                            if (notify_list) {
                                notify_list.forEach(function (ev) {
                                    ev.resolve(self.raw);
                                });
                            }
                        } else {
                            self.status = Resource.ERROR;
                            self.raw = null;
                            reject();
                            if (notify_list) {
                                notify_list.forEach(function (ev) {
                                    ev.reject();
                                });
                            }
                        }
                    });
                    xhr.send(null);
                });
            case Resource.LOADING:
                if (!this.onload_notify_list)
                    this.onload_notify_list = [];
                return new Promise(function (resolve, reject) {
                    self.onload_notify_list = {
                        resolve: resolve,
                        reject: reject
                    }
                });
            case Resource.LOAD:
                return Promise.resolve(this);
        }
        if (this.status) {
            return Promise.resolve();
        } else {

        }
    };
    GAME.Resource = Resource;
})();