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

let _Page = (page) => {
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

let Component = (api) => {
    Object.setPrototypeOf(api, null);
    let api = Object.assign(Object.create(null), config);

    return {new: () => {
        return {
            api: api,
            
        }
    }};
};

export {now, log, sleep, sleep_3000, _App, _Page, Component};