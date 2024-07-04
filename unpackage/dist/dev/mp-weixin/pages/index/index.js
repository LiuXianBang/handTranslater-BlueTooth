"use strict";
const common_vendor = require("../../common/vendor.js");
const bluetoothlist = common_vendor.ref([]);
const servicelist = common_vendor.ref([]);
var url = common_vendor.ref("http://localhost:5173");
var found_text = common_vendor.ref("未找到");
var connected_device = common_vendor.ref("");
var cuurent_service = common_vendor.ref("");
var notifyUuid = common_vendor.ref("");
var writeUuid = common_vendor.ref("");
var responce_text = common_vendor.ref("_ _");
common_vendor.index.setNavigationBarTitle({
  title: "Soul_Translator"
});
function test_request() {
  common_vendor.index.request({
    url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    //仅为示例，并非真实接口地址。
    data: {
      model: "GLM-4-0520",
      messages: [{
        role: "user",
        content: "请用中文简洁使下面的单词组成句子并表达自然，无需添加任何额外的信息或评论，保持回复的简洁和直接：I am boy"
      }]
    },
    header: {
      "Authorization": "Bearer 0ed2bef9cc03d071f5833d883693eb71.ErbGECCEmtlB85J8"
      //自定义请求头信息
    },
    method: "POST",
    success: (res) => {
      console.log(res.data);
      var choices = res.data.choices;
      var content = choices[0];
      var message = choices[0].message;
      var content = message.content;
      console.log(content);
      responce_text.value = content;
    }
  });
}
function getservices() {
  if (connected_device.value == "") {
    common_vendor.index.showToast({
      title: "请先连接蓝牙",
      type: "error",
      icon: "none"
    });
  }
  common_vendor.index.getBLEDeviceServices({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: connected_device.value,
    success: function(res) {
      console.log(res);
      for (var i = 0; i < res.services.length; i++) {
        servicelist.value.push(res.services[i]);
        console.log(servicelist);
      }
    }
  });
}
function getCharacteId(services) {
  console.log(services);
  common_vendor.index.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: connected_device.value,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: services,
    success: function(res) {
      console.log(res);
      for (var i = 0; i < res.characteristics.length; i++) {
        var model = res.characteristics[i];
        if (model.properties.write) {
          cuurent_service.value = services;
          writeUuid.value = model.uuid;
        }
        if (model.properties.notify) {
          cuurent_service.value = services;
          notifyUuid.value = model.uuid;
        }
      }
    }
  });
}
function initBlue() {
  common_vendor.index.openBluetoothAdapter({
    success(res) {
      common_vendor.index.showToast({
        title: "初始化蓝牙成功",
        icon: "success",
        duration: 800
      });
      console.log("初始化蓝牙成功");
      console.log(res);
    },
    fail(err) {
      common_vendor.index.showToast({
        title: "请打开蓝牙",
        type: "error",
        icon: "none"
      });
      console.log("初始化蓝牙失败");
      console.error(err);
    }
  });
}
function discovery() {
  connected_device.value = "";
  bluetoothlist.value = [];
  common_vendor.index.startBluetoothDevicesDiscovery({
    success(res) {
      console.log("开始搜索");
      common_vendor.index.showLoading({
        title: "正在搜索设备"
      });
      common_vendor.index.onBluetoothDeviceFound(found);
    },
    fail(err) {
      console.log("搜索失败");
      console.error(err);
    }
  });
}
function connetBlue(device) {
  const deviceId = device.deviceId;
  common_vendor.index.createBLEConnection({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId,
    success(res) {
      console.log(res);
      common_vendor.index.showToast({
        title: "连接成功",
        icon: "success",
        duration: 800
      });
      connected_device.value = device.deviceId;
      return true;
    },
    fail(res) {
      common_vendor.index.showToast({
        title: "连接失败",
        type: "error",
        icon: "none"
      });
      console.log(res);
      return false;
    }
  });
}
function found(res) {
  if (connected_device.value != "") {
    return;
  }
  for (var i = 0; i < res.devices.length; i++) {
    var device = res.devices[i];
    if (device.name == "") {
      continue;
    }
    console.log(device.name);
    if (device.name == "Soul_Translator") {
      console.log("找到目标");
      found_text.value = "找到目标";
      common_vendor.index.stopBeaconDiscovery();
      bluetoothlist.value.push(device);
      if (connetBlue(device)) {
        break;
      }
    }
  }
}
function string2ArrayBuffer(str) {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    if (val === "") {
      val = str.charCodeAt(i).toString(16);
    } else {
      val += "," + str.charCodeAt(i).toString(16);
    }
  }
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
    return parseInt(h, 16);
  })).buffer;
}
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ("00" + bit.toString(16)).slice(-2);
    }
  );
  return hexArr.join("");
}
function hex2String(hex_str) {
  let trimedStr = hex_str.trim();
  let rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  let len = rawStr.length;
  if (len % 2 !== 0) {
    console.log("Illegal Format ASCII Code!");
    return "";
  }
  let curCharCode;
  let resultStr = [];
  for (let i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}
function startNotice() {
  common_vendor.index.notifyBLECharacteristicValueChange({
    state: true,
    // 启用 notify 功能
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
    deviceId: connected_device.value,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: cuurent_service.value,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: notifyUuid.value,
    //第一步 开启监听 notityid  第二步发送指令 write
    success(res) {
      common_vendor.index.onBLECharacteristicValueChange((res2) => {
        console.log(`characteristic ${res2.characteristicId} has changed, now is ${res2.value}`);
        console.log(hex2String(ab2hex(res2.value)));
      });
    },
    fail(err) {
      console.log(err);
    }
  });
}
function write(str) {
  var buff = string2ArrayBuffer(str);
  common_vendor.index.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: connected_device.value,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: cuurent_service.value,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: writeUuid.value,
    //第二步写入的特征值
    // 这里的value是ArrayBuffer类型
    value: buff,
    success: function(res) {
      console.log("写入成功");
    },
    fail: function(err) {
      console.log(err);
    },
    complete: function() {
      console.log("调用结束");
    }
  });
}
const _sfc_main = {
  data() {
    return {
      responce_text,
      bluetoothlist,
      servicelist,
      url,
      found_text,
      notifyUuid,
      cuurent_service,
      writeUuid
    };
  },
  onReady() {
  },
  onLoad() {
  },
  methods: {
    test_request,
    initBlue,
    discovery,
    getservices,
    getCharacteId,
    startNotice,
    write
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.responce_text),
    b: common_vendor.o((...args) => $options.test_request && $options.test_request(...args)),
    c: common_vendor.t($data.found_text),
    d: common_vendor.t($data.cuurent_service),
    e: common_vendor.t($data.notifyUuid),
    f: common_vendor.t($data.writeUuid),
    g: common_vendor.o((...args) => $options.initBlue && $options.initBlue(...args)),
    h: common_vendor.o((...args) => $options.discovery && $options.discovery(...args)),
    i: common_vendor.f($data.bluetoothlist, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.deviceId),
        b: common_vendor.t(item.name)
      };
    }),
    j: common_vendor.o((...args) => $options.getservices && $options.getservices(...args)),
    k: common_vendor.f($data.servicelist, (service, k0, i0) => {
      return {
        a: common_vendor.t(service.uuid),
        b: common_vendor.o(($event) => $options.getCharacteId(service.uuid))
      };
    }),
    l: common_vendor.o((...args) => $options.startNotice && $options.startNotice(...args)),
    m: common_vendor.o(($event) => $options.write("abcd"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/38200/Desktop/handTranslater/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
