class Storage {
    private static _instance: Storage;

    private _loaded = false;
    private data: { [key: string]: any } = {};

    private constructor() { }

    static create(): Storage {
        if (!this._instance) {
            this._instance = new Storage();
        }

        return this._instance;
    }

    get(key: string): any {
        if (!this.has(key)) {
            return null;
        }

        return this.data[key];
    }

    getAll(): { [key: string]: any } {
        return this.data;
    }

    init(json: { [key: string]: any }): void {
        this.data = json;
        this._loaded = true;
    }

    has(key: string): boolean {
        return Object.keys(this.data).includes(key);
    }

    isLoaded(): boolean {
        return this._loaded;
    }
}

const _STORAGE = Storage.create();

function get(key: string): any {
    return _STORAGE.get(key);
}

function getAll(): { [key: string]: any } {
    return _STORAGE.getAll();
}

function init(json: { [key: string]: any }): void {
    _STORAGE.init(json);
}

function has(key: string): boolean {
    return _STORAGE.has(key);
}

function isLoaded(): boolean {
    return _STORAGE.isLoaded();
}

const RWSCfgStorage = {
    init,
    get, getAll,
    has, isLoaded
};

export {
    RWSCfgStorage
};
