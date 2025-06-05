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
        if (!this.has(key) || typeof this.data[key] === undefined) {
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

    set(key: string, value: any) {
        this.data[key] = value;
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

function set(key: string, value: any): void
{
    _STORAGE.set(key, value);
}

const RWSCfgStorage = {
    init,
    get, getAll,
    has, isLoaded,
    set
};

export {
    RWSCfgStorage
};
