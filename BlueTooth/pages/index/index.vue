<template>
	<view class="content">
<!-- 		<web-view class="web" :webview-styles="webviewStyles" 
			:src=url 
			
		></web-view> -->

		<view class="text-area">
			<view >
				<div>{{found_text}}</div>
				<div>服务:{{cuurent_service}}</div>
				<div>监听:{{notifyUuid}}</div>
				<div>发送:{{writeUuid}}</div>
				
			</view>
			<button @click="initBlue">初始化蓝牙</button>
			<button @click="discovery">搜索</button>
			<scroll-view
				scroll-y
				class="box"
			>
				<view class="item" v-for="item in bluetoothlist">
					<view>
						<text>id: {{ item.deviceId }}</text>    
					</view>
					<view>
						<text>name: {{ item.name }}</text>  
					</view>
				</view>
			</scroll-view>
			
	
		
			<button @click="getservices">搜索服务</button>
			<scroll-view
				scroll-y
				class="box"
			>
				<view class="item" v-for="service in servicelist">
					<view>
						<button @click="getCharacteId(service.uuid)" >uuid: {{ service.uuid }}</button>

					</view>
				</view>
			</scroll-view>
			<button @click="startNotice">监听服务</button>
			<button @click="write('abcd')">发消息</button>
		</view>
	</view>
</template>

<script>

	import { defineComponent, onMounted, ref } from 'vue'

	const bluetoothlist = ref([])
	const servicelist = ref([])
	
	var url = ref("http://localhost:5173");
	var found_text =  ref("未找到");
	var connected_device = ref("")
	var cuurent_service = ref("")
	var notifyUuid = ref("")
	var writeUuid = ref("")
	function string2buffer(str) {
		let val = ""
		if (!str) return;
		let length = str.length;
		let index = 0;
		let array = []
		while (index < length) {
			array.push(str.substring(index, index + 2));
			index = index + 2;
		}
		val = array.join(",");
		// 将16进制转化为ArrayBuffer
		return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
			return parseInt(h, 16)
		})).buffer
	}


	function getservices(){
		if(connected_device.value == ""){
			uni.showToast({
				title: '请先连接蓝牙',
				type: 'error',
				icon: 'none'
			});
		}
		uni.getBLEDeviceServices({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: connected_device.value,
			success: function(res) {
				console.log(res)
				for(var i = 0; i <  res.services.length; i++) {
					servicelist.value.push(res.services[i])
					console.log(servicelist)
				}
			}
		})
	}
	function getCharacteId(services) {
		console.log(services)
		uni.getBLEDeviceCharacteristics({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: connected_device.value,
			// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			serviceId: services,
			success: function(res) {
				console.log(res)
				for (var i = 0; i < res.characteristics.length; i++) { //2个值
					var model = res.characteristics[i]
					if (model.properties.write) {
						cuurent_service.value = services
						writeUuid.value = model.uuid
					}
					if (model.properties.notify) {
	
						// that.notifyUuid = model.uuid
						cuurent_service.value = services
						notifyUuid.value = model.uuid

					}
				}
			}
		})	
	}
	function initBlue() {
		
		uni.openBluetoothAdapter({
			success(res) {
				uni.showToast({
					title: '初始化蓝牙成功',
					icon: 'success',
					duration: 800
				})
				console.log('初始化蓝牙成功')
				console.log(res)
			},
			fail(err) {
				uni.showToast({
					title: '请打开蓝牙',
					type: 'error',
					icon: 'none'
				});
				console.log('初始化蓝牙失败')
				console.error(err)
			}
		})
	}
	
	function discovery() {
		connected_device.value = ""
		bluetoothlist.value = []
	    uni.startBluetoothDevicesDiscovery({
	        success(res) {
	            console.log('开始搜索')
				uni.showLoading({
					title: '正在搜索设备',
				})
	            // 开启监听回调
	            uni.onBluetoothDeviceFound(found)
	        },
	        fail(err) {
	            console.log('搜索失败')
	            console.error(err)
	        }
	    })
	}
	function connetBlue(device) {
		const deviceId = device.deviceId
		uni.createBLEConnection({
		  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
		  deviceId,
		  success(res) {
		    console.log(res)
			uni.showToast({
				title: '连接成功',
				icon: 'success',
				duration: 800
			})
			connected_device.value = device.deviceId
			return true
		  },
		  fail(res) {
		  	uni.showToast({
		  		title: '连接失败',
		  		type: 'error',
		  		icon: 'none'
		  	});
			console.log(res)
			return false
		  }
		})
	}
	
	function found(res) {
		if (connected_device.value != ""){
			return
		}
		for(var i = 0; i < res.devices.length; i++) {
			var device = res.devices[i]
			if (device.name == ""){
				continue
			}
			if (device.name == "TESTBLE"){
				console.log("找到目标")
				found_text.value = "找到目标"
				uni.stopBeaconDiscovery()
				bluetoothlist.value.push(device)
				if(connetBlue(device)){
					break
				}
			}
			// bluetoothlist.value.push(device)
		}
		// res.devices.foreach(function(item){
		// 	bluetoothlist.value.push(item)
		// })
		// bluetoothlist.value.push(res.devices[0])
	}
	function string2ArrayBuffer(str) {
      // 首先将字符串转为16进制
      let val = ""
      for (let i = 0; i < str.length; i++) {
        if (val === '') {
          val = str.charCodeAt(i).toString(16)
        } else {
          val += ',' + str.charCodeAt(i).toString(16)
        }
      }
      // 将16进制转化为ArrayBuffer
      return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      })).buffer
    }
	function ab2hex(buffer) {
	  const hexArr = Array.prototype.map.call(
	    new Uint8Array(buffer),
	    function (bit) {
	      return ('00' + bit.toString(16)).slice(-2)
	    }
	  )
	  return hexArr.join('')
	}
	function hex2String(hex_str) {
      let trimedStr = hex_str.trim();
      let rawStr = trimedStr.substr(0,2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
      let len = rawStr.length;
      if(len % 2 !== 0) {
        console.log("Illegal Format ASCII Code!");
        return "";
      }
      let curCharCode;
      let resultStr = [];
      for(let i = 0; i < len;i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
        resultStr.push(String.fromCharCode(curCharCode));
      }
      return resultStr.join("");
    }

	function startNotice() {
		var that = this;
		uni.notifyBLECharacteristicValueChange({
			state: true, // 启用 notify 功能
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
			deviceId: connected_device.value,
			// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			serviceId: cuurent_service.value,
			// 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
			characteristicId: notifyUuid.value, //第一步 开启监听 notityid  第二步发送指令 write
			success(res) {
				//接收蓝牙返回消息
				uni.onBLECharacteristicValueChange((res)=>{

				  console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
				  console.log(hex2String(ab2hex(res.value)))
				})
			},
			fail(err) {
				console.log(err)
			}
		})
	}
	function write(str) {
		var that = this
		//this.string2buffer-->字符串转换成ArrayBufer（设备接收数据的格式ArrayBufer）
		var buff = string2ArrayBuffer(str);  //9.0
		uni.writeBLECharacteristicValue({
			// 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
			deviceId: connected_device.value,
			// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			serviceId: cuurent_service.value,
			// 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
			characteristicId: writeUuid.value, //第二步写入的特征值
			// 这里的value是ArrayBuffer类型
			value: buff,
			success: function(res) {
				//此时设备已接收到你写入的数据
				console.log("写入成功")
			},
			fail: function(err) {
				console.log(err)
			},
			complete: function() {
				console.log("调用结束");
			}
		})
	}

	export default {
		data() {
			return {
				bluetoothlist,
				servicelist,
				url,
				found_text,
				notifyUuid,
				cuurent_service,
				writeUuid,
			}
		},
		onReady() {

		},
		onLoad() {

		},
		methods: {
			initBlue,
			discovery,
			getservices,
			getCharacteId,
			startNotice,
			write,
		}
	}
</script>

<style>

</style>
