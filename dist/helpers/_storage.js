"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSCfgStorage = void 0;
class Storage {
    constructor() {
        this._loaded = false;
        this.data = {};
    }
    static create() {
        if (!this._instance) {
            this._instance = new Storage();
        }
        return this._instance;
    }
    get(key) {
        if (!this.has(key) || typeof this.data[key] === undefined) {
            return null;
        }
        return this.data[key];
    }
    getAll() {
        return this.data;
    }
    init(json) {
        this.data = json;
        this._loaded = true;
    }
    has(key) {
        return Object.keys(this.data).includes(key);
    }
    set(key, value) {
        this.data[key] = value;
    }
    isLoaded() {
        return this._loaded;
    }
}
const _STORAGE = Storage.create();
function get(key) {
    return _STORAGE.get(key);
}
function getAll() {
    return _STORAGE.getAll();
}
function init(json) {
    _STORAGE.init(json);
}
function has(key) {
    return _STORAGE.has(key);
}
function isLoaded() {
    return _STORAGE.isLoaded();
}
function set(key, value) {
    _STORAGE.set(key, value);
}
const RWSCfgStorage = {
    init,
    get, getAll,
    has, isLoaded,
    set
};
exports.RWSCfgStorage = RWSCfgStorage;
//# sourceMappingURL=_storage.js.map