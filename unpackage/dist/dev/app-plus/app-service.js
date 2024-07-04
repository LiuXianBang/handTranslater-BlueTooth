if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const bluetoothlist = vue.ref([]);
  const servicelist = vue.ref([]);
  const audio_api = "http://10.40.131.62:8000/tts?text=";
  var audio_src = vue.ref("");
  var responce_text = vue.ref("_ _");
  var isshowed = vue.ref(false);
  var bluetooth_status = vue.ref({
    target_name: "Soul_Translator",
    target_service: "0000FFE0-0000-1000-8000-00805F9B34FB",
    connected_device: "",
    current_service: "",
    notifyUuid_uuid: "",
    writeUuid_uuid: "",
    init_blue: null,
    discovery: null,
    find_target: null,
    connected: null,
    get_service: null,
    find_target_service: null,
    get_CharacteId: null,
    notice: null
  });
  var translate_word = vue.ref([]);
  const translator_dict = {
    "normal": "[stop]",
    "me": "我",
    "you": "你",
    "what": "什么",
    "WC": "厕所",
    "thanks": "谢谢",
    "subway": "地铁",
    "meet": "认识",
    "me": "我",
    "home": "家",
    "helpme": "帮我",
    "heart": "心",
    "clock": "时间",
    "can": "可以",
    "bye": "再见",
    "at": "在"
  };
  function translator(input) {
    if (translator_dict[input] != void 0) {
      return translator_dict[input];
    }
  }
  function handle_message(input) {
    var message = translator(hex2String(ab2hex(input)));
    formatAppLog("log", "at pages/index/index.vue:104", message);
    if (message != "" && message != void 0) {
      if (message == "[stop]") {
        formatAppLog("log", "at pages/index/index.vue:107", translate_word.value);
        if (translate_word.value.length > 0) {
          if (translate_word.value.find((element) => element == "什么") != void 0 && translate_word.value.find((element) => element == "时间" != void 0)) {
            responce_text.value = "现在什么时间？";
            play_audio(responce_text.value);
            translate_word.value = [];
          } else {
            gpt_request(translate_word.value);
            translate_word.value = [];
          }
        }
      } else {
        responce_text.value = "_ _";
        translate_word.value.push(message);
      }
    }
  }
  function gpt_request(words) {
    uni.request({
      url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      //仅为示例，并非真实接口地址。
      data: {
        model: "GLM-4-0520",
        messages: [{
          role: "user",
          content: "你是一位熟练手语的专家，你可以通过词组组成的句子理解手语的真正含义。请用中文使下面的词组构成符合自然表达的句子，如果无法组成句子则直接返回词组，切记不要改变原意且不管是否可以表达都无需添加任何额外的信息或评论，保持回复的简洁和直接：" + words
          // content: "通过[start]和[stop]间的词，将其构成符合自然表达的句子，如果无法组成句子则直接返回，切记不要改变原意且不管是否可以表达都无需添加任何额外的信息或评论，保持回复的简洁和直接：[start] " + word +" [stop]"
        }]
      },
      header: {
        "Authorization": "Bearer 0ed2bef9cc03d071f5833d883693eb71.ErbGECCEmtlB85J8"
        //自定义请求头信息
      },
      method: "POST",
      success: (res) => {
        formatAppLog("log", "at pages/index/index.vue:145", res.data);
        var choices = res.data.choices;
        var content = choices[0];
        var message = choices[0].message;
        var content = message.content;
        formatAppLog("log", "at pages/index/index.vue:150", content);
        responce_text.value = content;
        play_audio(responce_text.value);
      }
    });
  }
  function test_request() {
  }
  function play_audio(words) {
    formatAppLog("log", "at pages/index/index.vue:166", "播放 " + audio_api + words);
    var resource_src = audio_api + words;
    if (resource_src == audio_src.value) {
      audio_src.value = "";
      setTimeout(() => {
        audio_src.value = resource_src;
      }, 200);
    } else {
      audio_src.value = resource_src;
    }
  }
  function show_presentation() {
    setTimeout(() => {
      wv = plus.webview.open("http://10.40.131.62:5173/?animate=No", "", { additionalHttpHeaders: { "ngrok-skip-browser-warning": "123321" } });
      wv.setStyle({
        // top: 600,
        height: 150,
        width: 150,
        margin: "auto"
        // left:50,
        // webviewBGTransparent:true,
      });
    }, 1e3);
  }
  function auto_connect(max_retry, retry = 0) {
    formatAppLog("log", "at pages/index/index.vue:197", max_retry, retry, bluetooth_status.value);
    if (retry == max_retry) {
      uni.showToast({
        title: "蓝牙打开失败",
        // type: 'error',
        icon: "error",
        duration: 5e3
      });
      return;
    }
    if (bluetooth_status.value.init_blue == null) {
      initBlue();
      bluetooth_status.value.init_blue = false;
      retry = 0;
    }
    if (bluetooth_status.value.init_blue == false) {
      setTimeout(() => {
        auto_connect(max_retry, retry + 1);
      }, 1e3);
    }
    if (bluetooth_status.value.init_blue == true) {
      if (bluetooth_status.value.discovery == null) {
        discovery();
        uni.showLoading({
          title: "正在搜索设备"
        });
        bluetooth_status.value.discovery = false;
        retry = 0;
      }
      if (bluetooth_status.value.discovery == false) {
        setTimeout(() => {
          auto_connect(max_retry, retry + 1);
        }, 1e3);
        return;
      }
      if (bluetooth_status.value.discovery == true) {
        if (bluetooth_status.value.find_target == null) {
          formatAppLog("log", "at pages/index/index.vue:238", "等待找到目标");
          bluetooth_status.value.find_target = false;
          retry = 0;
        }
        if (bluetooth_status.value.find_target == false) {
          setTimeout(() => {
            auto_connect(max_retry, retry + 1);
          }, 1e3);
        }
        if (bluetooth_status.value.find_target == true) {
          if (bluetooth_status.value.connected == null) {
            connetBlue(bluetoothlist.value[0]);
            formatAppLog("log", "at pages/index/index.vue:251", "尝试连接");
            uni.hideLoading();
            uni.showLoading({
              title: "尝试连接设备"
            });
            bluetooth_status.value.connected = false;
            retry = 0;
          }
          if (bluetooth_status.value.connected == false) {
            setTimeout(() => {
              auto_connect(max_retry, retry + 1);
            }, 1e3);
            return;
          }
          if (bluetooth_status.value.connected == true) {
            if (bluetooth_status.value.get_service == null) {
              formatAppLog("log", "at pages/index/index.vue:267", "连接成功");
              getservices();
              bluetooth_status.value.get_service = false;
              uni.hideLoading();
              uni.showLoading({
                title: "尝试获得设备服务"
              });
              retry = 0;
            }
            if (bluetooth_status.value.get_service == false) {
              setTimeout(() => {
                auto_connect(max_retry, retry + 1);
              }, 1e3);
              return;
            }
            if (bluetooth_status.value.get_service == true) {
              if (bluetooth_status.value.find_target_service == null) {
                var flag = false;
                servicelist.value.forEach((service) => {
                  if (service.uuid == bluetooth_status.value.target_service) {
                    flag = true;
                  }
                });
                if (flag) {
                  bluetooth_status.value.find_target_service = true;
                } else {
                  bluetooth_status.value.find_target_service = false;
                }
              }
              if (bluetooth_status.value.find_target_service == false) {
                setTimeout(() => {
                  auto_connect(max_retry, max_retry);
                }, 1e3);
                return;
              }
              if (bluetooth_status.value.find_target_service == true) {
                if (bluetooth_status.value.get_CharacteId == null) {
                  formatAppLog("log", "at pages/index/index.vue:307", "找到目标服务");
                  getCharacteId(bluetooth_status.value.target_service);
                  bluetooth_status.value.get_CharacteId = false;
                  uni.hideLoading();
                  uni.showLoading({
                    title: "已找到目标服务"
                  });
                  retry = 0;
                }
                if (bluetooth_status.value.get_CharacteId == false) {
                  setTimeout(() => {
                    auto_connect(max_retry, retry + 1);
                  }, 1e3);
                  return;
                }
                if (bluetooth_status.value.get_CharacteId == true) {
                  if (bluetooth_status.value.notice == null) {
                    formatAppLog("log", "at pages/index/index.vue:326", "获得CharacteId");
                    startNotice();
                    formatAppLog("log", "at pages/index/index.vue:328", "开始监听");
                    uni.hideLoading();
                    uni.showLoading({
                      title: "开始监听"
                    });
                    bluetooth_status.value.notice = false;
                    retry = 0;
                  }
                  if (bluetooth_status.value.notice == false) {
                    setTimeout(() => {
                      auto_connect(max_retry, retry + 1);
                    }, 1e3);
                    return;
                  }
                  if (bluetooth_status.value.notice == true) {
                    uni.hideLoading();
                    uni.showToast({
                      title: "连接成功",
                      duration: 2e3
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  function getservices() {
    if (bluetooth_status.value.connected_device == "") {
      uni.showToast({
        title: "请先连接蓝牙",
        icon: "none"
      });
    }
    uni.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: bluetooth_status.value.connected_device,
      success: function(res) {
        bluetooth_status.value.get_service = true;
        formatAppLog("log", "at pages/index/index.vue:376", res);
        for (var i = 0; i < res.services.length; i++) {
          servicelist.value.push(res.services[i]);
        }
      },
      fail: function(res) {
        bluetooth_status.value.get_service = false;
      }
    });
  }
  function getCharacteId(services) {
    formatAppLog("log", "at pages/index/index.vue:389", services);
    uni.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: bluetooth_status.value.connected_device,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: services,
      success: function(res) {
        formatAppLog("log", "at pages/index/index.vue:396", res);
        for (var i = 0; i < res.characteristics.length; i++) {
          var model = res.characteristics[i];
          if (model.properties.write) {
            bluetooth_status.value.current_service = services;
            bluetooth_status.value.writeUuid_uuid = model.uuid;
          }
          if (model.properties.notify) {
            bluetooth_status.value.current_service = services;
            bluetooth_status.value.notifyUuid_uuid = model.uuid;
          }
          bluetooth_status.value.get_CharacteId = true;
        }
      },
      fail: function() {
        bluetooth_status.value.get_CharacteId = false;
      }
    });
  }
  function initBlue() {
    uni.openBluetoothAdapter({
      success(res) {
        formatAppLog("log", "at pages/index/index.vue:420", "初始化蓝牙成功");
        formatAppLog("log", "at pages/index/index.vue:421", res);
        bluetooth_status.value.init_blue = true;
      },
      fail(err) {
        formatAppLog("log", "at pages/index/index.vue:425", "初始化蓝牙失败");
        formatAppLog("error", "at pages/index/index.vue:426", err);
        bluetooth_status.value.init_blue = false;
      }
    });
  }
  function discovery() {
    bluetoothlist.value = [];
    uni.startBluetoothDevicesDiscovery({
      success(res) {
        formatAppLog("log", "at pages/index/index.vue:437", "开始搜索");
        bluetooth_status.value.discovery = true;
        uni.onBluetoothDeviceFound(found);
      },
      fail(err) {
        bluetooth_status.value.discovery = false;
        formatAppLog("log", "at pages/index/index.vue:445", "搜索失败");
        formatAppLog("error", "at pages/index/index.vue:446", err);
      }
    });
  }
  function connetBlue(device) {
    const deviceId = device.deviceId;
    uni.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId,
      success(res) {
        formatAppLog("log", "at pages/index/index.vue:458", res);
        bluetooth_status.value.connected_device = device.deviceId;
        bluetooth_status.value.connected = true;
      },
      fail(res) {
        formatAppLog("log", "at pages/index/index.vue:463", res);
        bluetooth_status.value.connected = false;
      }
    });
  }
  function found(res) {
    for (var i = 0; i < res.devices.length; i++) {
      var device = res.devices[i];
      if (device.name == "") {
        continue;
      }
      if (device.name == bluetooth_status.value.target_name) {
        formatAppLog("log", "at pages/index/index.vue:478", "找到目标");
        bluetooth_status.value.find_target = true;
        uni.stopBeaconDiscovery();
        bluetoothlist.value.push(device);
        break;
      }
    }
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
      formatAppLog("log", "at pages/index/index.vue:519", "Illegal Format ASCII Code!");
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
    uni.notifyBLECharacteristicValueChange({
      state: true,
      // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: bluetooth_status.value.connected_device,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: bluetooth_status.value.current_service,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: bluetooth_status.value.notifyUuid_uuid,
      //第一步 开启监听 notityid  第二步发送指令 write
      success(res) {
        uni.onBLECharacteristicValueChange((res2) => {
          formatAppLog(
            "log",
            "at pages/index/index.vue:560",
            `characteristic ${res2.characteristicId} has changed, now is ${res2.value}`
          );
          handle_message(res2.value);
        });
        bluetooth_status.value.notice = true;
      },
      fail(err) {
        formatAppLog("log", "at pages/index/index.vue:567", err);
        bluetooth_status.value.notice = false;
      }
    });
  }
  var wv;
  const _sfc_main$1 = {
    data() {
      return {
        debug: false,
        responce_text,
        isshowed,
        audio_src,
        audioAction: {
          method: "pause"
        }
      };
    },
    onReady() {
      wv = plus.webview.create("");
      uni.setNavigationBarTitle({
        title: "Soul_Translator"
      });
    },
    onLoad() {
      plus.screen.lockOrientation("portrait-primary");
    },
    methods: {
      auto_connect,
      test_request,
      show_presentation
    },
    components: {}
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("div", {
        class: "card",
        "data-bs-theme": "dark",
        style: { "height": "100vh", "border-radius": "0%" }
      }, [
        vue.createElementVNode("div", null, [
          vue.createElementVNode("view", {
            class: "d-flex justify-content-center",
            style: { "margin-top": "25vh" }
          }, [
            vue.createElementVNode("view", {
              class: "text-box",
              "scroll-y": "true"
            }, [
              vue.createElementVNode(
                "text",
                { style: { "font-size": "45px" } },
                vue.toDisplayString($data.responce_text),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "fixed-bottom" }, [
            vue.createElementVNode("view", { style: { "margin-left": "10px", "margin-right": "10px" } }, [
              $data.debug ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 0,
                class: "d-grid"
              }, [
                vue.createElementVNode("button", {
                  onClick: _cache[0] || (_cache[0] = (...args) => $options.test_request && $options.test_request(...args)),
                  class: "btn btn-success",
                  type: "button"
                }, "测试接口")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("br"),
              vue.createElementVNode("div", { class: "d-grid" }, [
                vue.createElementVNode("button", {
                  onClick: _cache[1] || (_cache[1] = ($event) => $options.auto_connect(10)),
                  class: "btn btn-primary",
                  type: "button"
                }, "自动连接")
              ]),
              vue.createElementVNode("br"),
              $data.debug ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 1,
                class: "d-grid"
              }, [
                vue.createElementVNode("button", {
                  onClick: _cache[2] || (_cache[2] = ($event) => $options.show_presentation()),
                  class: "btn btn-primary",
                  type: "button"
                }, "展示")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("br")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "page-section page-section-gap",
            style: { "text-align": "center" }
          }, [
            vue.createElementVNode("audio", {
              style: { "text-align": "left" },
              src: $data.audio_src,
              autoplay: ""
            }, null, 8, ["src"])
          ])
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/38200/Desktop/handTranslater/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/38200/Desktop/handTranslater/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
