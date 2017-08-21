class EventCenter {
    constructor() {
        this.handlers = {};
    }
    emit(eventType, data) {
        let cbs = this.handlers[eventType];
        cbs && cbs.map(cb => cb(data));
    }
    on(eventType, cb) {
        let cbs = this.handlers[eventType] || [];
        cbs.push(cb);
        this.handlers[eventType] = cbs;
    }
}

export { EventCenter};