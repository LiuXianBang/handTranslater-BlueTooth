"use strict";const e=require("../../common/vendor.js"),d=e.ref([]),u=e.ref([]);var I=e.ref("http://localhost:5173"),h=e.ref("未找到"),a=e.ref(""),l=e.ref(""),f=e.ref(""),v=e.ref("");function C(){a.value==""&&e.index.showToast({title:"请先连接蓝牙",type:"error",icon:"none"}),e.index.getBLEDeviceServices({deviceId:a.value,success:function(t){console.log(t);for(var r=0;r<t.services.length;r++)u.value.push(t.services[r]),console.log(u)}})}function p(t){console.log(t),e.index.getBLEDeviceCharacteristics({deviceId:a.value,serviceId:t,success:function(r){console.log(r);for(var o=0;o<r.characteristics.length;o++){var s=r.characteristics[o];s.properties.write&&(l.value=t,v.value=s.uuid),s.properties.notify&&(l.value=t,f.value=s.uuid)}}})}function w(){e.index.openBluetoothAdapter({success(t){e.index.showToast({title:"初始化蓝牙成功",icon:"success",duration:800}),console.log("初始化蓝牙成功"),console.log(t)},fail(t){e.index.showToast({title:"请打开蓝牙",type:"error",icon:"none"}),console.log("初始化蓝牙失败"),console.error(t)}})}function y(){a.value="",d.value=[],e.index.startBluetoothDevicesDiscovery({success(t){console.log("开始搜索"),e.index.showLoading({title:"正在搜索设备"}),e.index.onBluetoothDeviceFound(_)},fail(t){console.log("搜索失败"),console.error(t)}})}function B(t){const r=t.deviceId;e.index.createBLEConnection({deviceId:r,success(o){return console.log(o),e.index.showToast({title:"连接成功",icon:"success",duration:800}),a.value=t.deviceId,!0},fail(o){return e.index.showToast({title:"连接失败",type:"error",icon:"none"}),console.log(o),!1}})}function _(t){if(a.value=="")for(var r=0;r<t.devices.length;r++){var o=t.devices[r];if(o.name!=""&&o.name=="TESTBLE"&&(console.log("找到目标"),h.value="找到目标",e.index.stopBeaconDiscovery(),d.value.push(o),B(o)))break}}function b(t){let r="";for(let o=0;o<t.length;o++)r===""?r=t.charCodeAt(o).toString(16):r+=","+t.charCodeAt(o).toString(16);return new Uint8Array(r.match(/[\da-f]{2}/gi).map(function(o){return parseInt(o,16)})).buffer}function m(t){return Array.prototype.map.call(new Uint8Array(t),function(o){return("00"+o.toString(16)).slice(-2)}).join("")}function S(t){let r=t.trim(),o=r.substr(0,2).toLowerCase()==="0x"?r.substr(2):r,s=o.length;if(s%2!==0)return console.log("Illegal Format ASCII Code!"),"";let i,c=[];for(let n=0;n<s;n=n+2)i=parseInt(o.substr(n,2),16),c.push(String.fromCharCode(i));return c.join("")}function A(){e.index.notifyBLECharacteristicValueChange({state:!0,deviceId:a.value,serviceId:l.value,characteristicId:f.value,success(t){e.index.onBLECharacteristicValueChange(r=>{console.log(`characteristic ${r.characteristicId} has changed, now is ${r.value}`),console.log(S(m(r.value)))})},fail(t){console.log(t)}})}function L(t){var r=b(t);e.index.writeBLECharacteristicValue({deviceId:a.value,serviceId:l.value,characteristicId:v.value,value:r,success:function(o){console.log("写入成功")},fail:function(o){console.log(o)},complete:function(){console.log("调用结束")}})}const T={data(){return{bluetoothlist:d,servicelist:u,url:I,found_text:h,notifyUuid:f,cuurent_service:l,writeUuid:v}},onReady(){},onLoad(){},methods:{initBlue:w,discovery:y,getservices:C,getCharacteId:p,startNotice:A,write:L}};function E(t,r,o,s,i,c){return{a:e.t(i.found_text),b:e.t(i.cuurent_service),c:e.t(i.notifyUuid),d:e.t(i.writeUuid),e:e.o((...n)=>c.initBlue&&c.initBlue(...n)),f:e.o((...n)=>c.discovery&&c.discovery(...n)),g:e.f(i.bluetoothlist,(n,g,x)=>({a:e.t(n.deviceId),b:e.t(n.name)})),h:e.o((...n)=>c.getservices&&c.getservices(...n)),i:e.f(i.servicelist,(n,g,x)=>({a:e.t(n.uuid),b:e.o(U=>c.getCharacteId(n.uuid))})),j:e.o((...n)=>c.startNotice&&c.startNotice(...n)),k:e.o(n=>c.write("abcd"))}}const D=e._export_sfc(T,[["render",E],["__file","C:/Users/38200/Desktop/handTranslater/BlueTooth/pages/index/index.vue"]]);wx.createPage(D);
