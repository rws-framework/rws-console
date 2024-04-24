declare function get(key: string): any;
declare function getAll(): {
    [key: string]: any;
};
declare function init(json: {
    [key: string]: any;
}): void;
declare function has(key: string): boolean;
declare function isLoaded(): boolean;
declare function set(key: string, value: any): void;
declare const RWSCfgStorage: {
    init: typeof init;
    get: typeof get;
    getAll: typeof getAll;
    has: typeof has;
    isLoaded: typeof isLoaded;
    set: typeof set;
};
export { RWSCfgStorage };
