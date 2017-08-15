import {now, log, sleep_5000} from 'utils/debug';

log('App out');
App({
  onLaunch: function (options) {
    log('App onLaunch');
  },
  onShow: function (options) {
    log('App onShow');
  },
  onHide: function () {
    log('App onHide');
  },
  onError: function (msg) {
    log(msg);
  }
});