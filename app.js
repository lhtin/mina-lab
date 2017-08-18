import {_App, log} from 'utils/debug';
_App({
    onLaunch: function (options) {
    },
    onShow: function (options) {
        log(`scene: ${options.scene}`);
        if (this.globalData.hideTime
        && Date.now() - this.globalData.hideTime > 7000
        && options.path === 'pages/lab1/lab') {
            log('进入后台超过7秒钟');
            this.globalData.needBack = true;
        }
    },
    onHide: function () {
        this.globalData.hideTime = Date.now();
    },
    onError: function (msg) {
    },
    globalData: {
        hideTime: false,
        needBack: false
    }
});