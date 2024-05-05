"use strict";
const common_vendor = require("../../common/vendor.js");
const bluetoothlist = common_vendor.ref([]);
function initBlue() {
  common_vendor.index.openBluetoothAdapter({
    success(res) {
      console.log("初始化蓝牙成功");
      console.log(res);
    },
    fail(err) {
      console.log("初始化蓝牙失败");
      console.error(err);
    }
  });
}
function discovery() {
  bluetoothlist.value = [];
  common_vendor.index.startBluetoothDevicesDiscovery({
    success(res) {
      console.log("开始搜索");
      common_vendor.index.onBluetoothDeviceFound(found);
    },
    fail(err) {
      console.log("搜索失败");
      console.error(err);
    }
  });
}
function found(res) {
  bluetoothlist.value.push(res.devices[0]);
}
const _sfc_main = {
  data() {
    return {
      bluetoothlist
    };
  },
  onReady() {
  },
  onLoad() {
  },
  methods: {
    initBlue,
    discovery
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: _ctx.webviewStyles,
    b: common_vendor.f($data.bluetoothlist, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.deviceId),
        b: common_vendor.t(item.name)
      };
    }),
    c: common_vendor.o((...args) => $options.initBlue && $options.initBlue(...args)),
    d: common_vendor.o((...args) => $options.discovery && $options.discovery(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/38200/Desktop/handTranslater/BlueTooth/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
