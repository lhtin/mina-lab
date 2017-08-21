let logs = [];

function now() {
    let d = new Date();
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
    // return Date.now();
}

function log(str) {
    let msg = `[${now()}] ${str}`;
    logs.push({
        time: now(),
        msg: str
    });
    console.log(msg);
}

function sleep(n) {
    let start = Date.now();
    while (Date.now() - start < n) {
    }
}

function sleep_3000(name) {
    let wait = 3000;
    log(`${name} sleep ${wait}ms start`);
    sleep(wait);
    log(`${name} sleep ${wait}ms end`)
}

let _App = (app) => {
    let hooks = ['onLaunch', 'onShow', 'onHide', 'onError'];
    hooks.map((hook) => {
        let temp = app[hook];
        app[hook] = function (...args) {
            log(`App ${hook}`);
            if (hook === 'onHide') {
                log('---------------------------');
            }
            temp && temp.call(this, ...args);
        };
    });
    App(app);
};

let cid = (() => {
    let _cid = 0;
    return () => {
        _cid += 1;
        return `cid_${_cid}`;
    }
})();

let _Page = (page) => {

    // 处理组件
    let _onLoad = page.onLoad;
    page.onLoad = function (...args) {
        Object.keys(this.component || {}).map((key) => {

            let instance = this.component[key];
            instance.__init__({
                pageCtx: this,
                namespace: key
            });
            this[key] = instance;

            let proto = Object.getPrototypeOf(instance);
            Object.getOwnPropertyNames(proto)
                .filter((key) => typeof proto[key] === 'function' && key !== 'constructor')
                .map((key) => {
                let f = proto[key];
                let _f = this[key];
                this[key] = function (...args) {
                    let event = args.length > 0 ? args[0] : false;
                    let cid = event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.cid;
                    if (instance.cid === cid) {
                        f.call(instance, ...args);
                    } else {
                        _f && _f.call(this, ...args);
                    }
                };
            })
        });
        console.log(this);

        _onLoad && _onLoad.call(this, ...args);
    };

    // for debug
    let hooks = ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload'];
    hooks.map((hook) => {
        let temp = page[hook];
        page[hook] = function (...args) {
            log(`${this.route} ${hook}`);
            if (hook === 'onUnload') {
                log('---------------------------');
            }
            temp && temp.call(this, ...args);
            this.setData({
                logs: logs.slice().reverse()
            });
        };
    });
    Page(page);
};

class Component {
    constructor() {
    }

    __init__(config) {
        this.cid = cid();
        this.pageCtx = config.pageCtx;
        this.namespace = config.namespace;
    }

    updateData() {
        let obj = {}, data = {};
        data = this.data || {};
        data.cid = this.cid;
        obj[this.namespace] = data;
        this.pageCtx.setData(obj);
    }
}

export {now, log, sleep, sleep_3000, _App, _Page, Component};