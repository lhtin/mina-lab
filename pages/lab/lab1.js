import {MyPage} from '../../libs/c/index';
import {Selector} from '../cs/Selector';

MyPage({
    data: {
        selector1: {
            selected: null,
            list: []
        },
        photoPath: '',
        tempFilePaths: []
    },
    usingComponents: {
        // 'selector': [
        //     {
        //         use: '<my-selector list="{{selector1.list}}" bindattached="selector1Attached" bindselect="selector1Selected"></my-selector>',
        //         name: 'selector1Data',
        //         model: Selector
        //     }
        // ]
    },
    selector1Attached: function (detail) {
        this.selector1 = detail.instance;
    },
    selector1Selected: function (detail) {
        this.setData({
            'selector1.selected': detail.selectedItem
        })
    },
    showSelector1: function () {
        this.selector1.show();
    },
    uploadPhoto: function () {
        let self = this;
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                console.log(res.tempFilePaths);
                self.setData({
                    tempFilePaths: res.tempFilePaths
                })
            },
            fail: function (errMsg) {
                console.error(errMsg);
            }
        })
    },
    takePhoto: function () {
        let self = this;
        this.cameraCtx.takePhoto({
            success(res) {
                let tempImagePath = res.tempImagePath;
                console.log(tempImagePath);
                self.setData({
                    photoPath: tempImagePath
                })
            },
            fail(errMsg) {
                console.error(errMsg);
            }
        })
    },
    onCameraStop: function () {
        console.log('bindstop')
    },
    onCameraError: function () {
        console.log('binderror')
    },
    onLoad: function () {
        this.setData({
            'selector1.list': ['选项1', '选项2', '选项3']
        });

        this.cameraCtx = wx.createCameraContext();

        // wx.authorize({
        //     scope: 'scope.userLocation',
        //     success() {
        //         // wx.chooseLocation({
        //         //     success(res) {
        //         //         console.log(res);
        //         //         let result = {
        //         //             name: res.name,
        //         //             address: res.address,
        //         //             latitude: res.latitude,
        //         //             longitude: res.longitude
        //         //         }
        //         //     }
        //         // });
        //
        //         wx.getLocation({
        //             success(res) {
        //                 let result = {
        //                     latitude: res.latitude,
        //                     longitude: res.longitude
        //                 };
        //                 wx.openLocation({
        //                     name: '宝体',
        //                     address: '宝安体育馆',
        //                     latitude: result.latitude,
        //                     longitude: result.longitude,
        //                     scale: 28
        //                 })
        //             }
        //         });
        //     },
        //     fail(errMsg) {
        //         console.error(errMsg)
        //     }
        // })
    }
});