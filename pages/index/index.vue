<template>
	<view class="content">

		<div class="card" data-bs-theme="dark" style="height: 100vh;border-radius: 0%;">
			<div>
				<view class="d-flex justify-content-center" style="margin-top: 25vh;">
					<view class="text-box" scroll-y="true">
						<text style="font-size: 45px;">{{responce_text}}</text>
					</view>
				</view>
				<view class="fixed-bottom">
					<view style="margin-left: 10px;margin-right: 10px;">
						<div class="d-grid" v-if="debug">
							<button @click="test_request" class="btn btn-success" type="button">测试接口</button>
						</div>
						<br>
						<div class="d-grid">
							<button @click="auto_connect(10)" class="btn btn-primary" type="button">自动连接</button>
						</div>
						<br>
						<div class="d-grid" v-if="debug">
							<button @click="show_presentation()" class="btn btn-primary" type="button">展示</button>
						</div>
						<br>
					</view>
				</view>

				<view class="page-section page-section-gap" style="text-align: center;">
					<audio style="text-align: left" :src="audio_src" autoplay></audio>
				</view>
			</div>

		</div>

	</view>
</template>

<script>
	import {
		defineComponent,
		onMounted,
		ref,
		watch
	} from 'vue'
	import * as THREE from 'three';

	const bluetoothlist = ref([])
	const servicelist = ref([])

	const audio_api = "http://10.40.131.62:8000/tts?text="
	var audio_src = ref("")

	var responce_text = ref("_ _")

	var isshowed = ref(false)

	var bluetooth_status = ref({
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

	})

	var translate_word = ref([])
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

	}

	function translator(input) {
		if (translator_dict[input] != undefined) {
			return translator_dict[input]
		}
	}

	function handle_message(input) {
		var message = translator(hex2String(ab2hex(input)))
		console.log(message)
		if (message != "" && message != undefined) {
			if (message == "[stop]") {
				console.log(translate_word.value)
				if(translate_word.value.length >0){
					
					if(translate_word.value.find((element) => element == "什么") != undefined && translate_word.value.find((element) => element == "时间" != undefined) ){
						responce_text.value = "现在什么时间？"
						play_audio(responce_text.value)
						translate_word.value = []
					}else{
						gpt_request(translate_word.value)
						translate_word.value = []
					}

				}

			} else {
				responce_text.value = "_ _"
				translate_word.value.push(message)

			}
		}
	}

	function gpt_request(words) {
		uni.request({
			url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', //仅为示例，并非真实接口地址。
			data: {
				model: 'GLM-4-0520',
				messages: [{
					role: "user",
					content: "你是一位熟练手语的专家，你可以通过词组组成的句子理解手语的真正含义。请用中文使下面的词组构成符合自然表达的句子，如果无法组成句子则直接返回词组，切记不要改变原意且不管是否可以表达都无需添加任何额外的信息或评论，保持回复的简洁和直接：" + words
					// content: "通过[start]和[stop]间的词，将其构成符合自然表达的句子，如果无法组成句子则直接返回，切记不要改变原意且不管是否可以表达都无需添加任何额外的信息或评论，保持回复的简洁和直接：[start] " + word +" [stop]"
				}],
			},
			header: {
				'Authorization': 'Bearer 0ed2bef9cc03d071f5833d883693eb71.ErbGECCEmtlB85J8' //自定义请求头信息
			},
			method: "POST",
			success: (res) => {
				console.log(res.data);
				var choices = res.data.choices;
				var content = choices[0];
				var message = choices[0].message;
				var content = message.content;
				console.log(content)
				responce_text.value = content
				play_audio(responce_text.value)
			}
		});
	}

	function test_request() {
		// gpt_request(["帮我", "送", "家", "谢谢"])
		
	}
	// watch(responce_text,()=>{
	// 	console.log("播放 "+ audio_api+words)
	// 	play_audio(responce_text.value)
	// })
	function play_audio(words) {
		console.log("播放 " + audio_api + words)
		var resource_src = audio_api + words
		if (resource_src == audio_src.value) {
			audio_src.value = ""
			setTimeout(() => {
				audio_src.value = resource_src
			}, 200)

		} else {
			audio_src.value = resource_src
		}

	}

	function show_presentation() {
		setTimeout(() => {
				wv = plus.webview.open('http://10.40.131.62:5173/?animate=No',"",{additionalHttpHeaders:{"ngrok-skip-browser-warning":'123321'}});
				
				wv.setStyle({
					// top: 600,
					height: 150,
					width:150,
					margin:"auto",
					// left:50,
					// webviewBGTransparent:true,
				})

				}, 1000)
		}

		function auto_connect(max_retry, retry = 0) {
			console.log(max_retry, retry, bluetooth_status.value)
			if (retry == max_retry) {
				uni.showToast({
					title: '蓝牙打开失败',
					// type: 'error',
					icon: 'error',
					duration: 5000,
				});
				return
			}
			if (bluetooth_status.value.init_blue == null) {
				initBlue();
				bluetooth_status.value.init_blue = false
				retry = 0
			}

			if (bluetooth_status.value.init_blue == false) {
				setTimeout(() => {
					auto_connect(max_retry, retry + 1)
				}, 1000);
			}

			if (bluetooth_status.value.init_blue == true) {
				if (bluetooth_status.value.discovery == null) {
					discovery()
					uni.showLoading({
						title: '正在搜索设备',
					})
					bluetooth_status.value.discovery = false
					retry = 0
				}

				if (bluetooth_status.value.discovery == false) {
					setTimeout(() => {
						auto_connect(max_retry, retry + 1)
					}, 1000);
					return
				}

				if (bluetooth_status.value.discovery == true) {
					if (bluetooth_status.value.find_target == null) {
						console.log("等待找到目标")
						bluetooth_status.value.find_target = false
						retry = 0
					}
					if (bluetooth_status.value.find_target == false) {
						setTimeout(() => {
							auto_connect(max_retry, retry + 1)
						}, 1000);
					}
					if (bluetooth_status.value.find_target == true) {
						if (bluetooth_status.value.connected == null) {

							connetBlue(bluetoothlist.value[0])
							console.log("尝试连接")
							uni.hideLoading();
							uni.showLoading({
								title: '尝试连接设备',
							})
							bluetooth_status.value.connected = false
							retry = 0
						}
						if (bluetooth_status.value.connected == false) {
							setTimeout(() => {
								auto_connect(max_retry, retry + 1)
							}, 1000);
							return
						}
						if (bluetooth_status.value.connected == true) {
							if (bluetooth_status.value.get_service == null) {
								console.log("连接成功")
								getservices()
								bluetooth_status.value.get_service = false
								uni.hideLoading();
								uni.showLoading({
									title: '尝试获得设备服务',
								})
								retry = 0
							}
							if (bluetooth_status.value.get_service == false) {
								setTimeout(() => {
									auto_connect(max_retry, retry + 1)
								}, 1000);
								return
							}
							if (bluetooth_status.value.get_service == true) {
								if (bluetooth_status.value.find_target_service == null) {
									var flag = false
									servicelist.value.forEach((service) => {
										if (service.uuid == bluetooth_status.value.target_service) {
											flag = true
										}
									});
									if (flag) {
										bluetooth_status.value.find_target_service = true
									} else {
										bluetooth_status.value.find_target_service = false
									}

								}
								if (bluetooth_status.value.find_target_service == false) {
									setTimeout(() => {
										auto_connect(max_retry, max_retry)
									}, 1000);
									return
								}

								if (bluetooth_status.value.find_target_service == true) {

									if (bluetooth_status.value.get_CharacteId == null) {
										console.log("找到目标服务")
										getCharacteId(bluetooth_status.value.target_service)
										bluetooth_status.value.get_CharacteId = false
										uni.hideLoading();
										uni.showLoading({
											title: '已找到目标服务',
										})
										retry = 0
									}
									if (bluetooth_status.value.get_CharacteId == false) {
										setTimeout(() => {
											auto_connect(max_retry, retry + 1)
										}, 1000);
										return
									}
									if (bluetooth_status.value.get_CharacteId == true) {

										// console.log(bluetooth_status.value.notifyUuid_uuid)
										if (bluetooth_status.value.notice == null) {
											console.log("获得CharacteId")
											startNotice()
											console.log("开始监听")
											uni.hideLoading();
											uni.showLoading({
												title: '开始监听',
											})
											bluetooth_status.value.notice = false
											retry = 0
										}
										if (bluetooth_status.value.notice == false) {
											setTimeout(() => {
												auto_connect(max_retry, retry + 1)
											}, 1000);
											return
										}
										if (bluetooth_status.value.notice == true) {
											uni.hideLoading();
											uni.showToast({
												title: '连接成功',
												duration: 2000
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
					title: '请先连接蓝牙',
					icon: 'none'
				});
			}
			uni.getBLEDeviceServices({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId: bluetooth_status.value.connected_device,
				success: function(res) {
					bluetooth_status.value.get_service = true
					console.log(res)
					for (var i = 0; i < res.services.length; i++) {
						servicelist.value.push(res.services[i])

					}
				},
				fail: function(res) {
					bluetooth_status.value.get_service = false
				}
			})
		}

		function getCharacteId(services) {
			console.log(services)
			uni.getBLEDeviceCharacteristics({
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				deviceId: bluetooth_status.value.connected_device,
				// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
				serviceId: services,
				success: function(res) {
					console.log(res)
					for (var i = 0; i < res.characteristics.length; i++) { //2个值
						var model = res.characteristics[i]
						if (model.properties.write) {
							bluetooth_status.value.current_service = services
							bluetooth_status.value.writeUuid_uuid = model.uuid
						}
						if (model.properties.notify) {
							bluetooth_status.value.current_service = services
							bluetooth_status.value.notifyUuid_uuid = model.uuid
						}
						bluetooth_status.value.get_CharacteId = true
					}

				},
				fail: function() {
					bluetooth_status.value.get_CharacteId = false
				}
			})
		}

		function initBlue() {
			uni.openBluetoothAdapter({
				success(res) {
					console.log('初始化蓝牙成功')
					console.log(res)
					bluetooth_status.value.init_blue = true
				},
				fail(err) {
					console.log('初始化蓝牙失败')
					console.error(err)
					bluetooth_status.value.init_blue = false

				}
			})
		}

		function discovery() {
			bluetoothlist.value = []
			uni.startBluetoothDevicesDiscovery({
				success(res) {
					console.log('开始搜索')
					// 开启监听回调
					bluetooth_status.value.discovery = true
					uni.onBluetoothDeviceFound(found)

				},
				fail(err) {
					bluetooth_status.value.discovery = false
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
					bluetooth_status.value.connected_device = device.deviceId
					bluetooth_status.value.connected = true
				},
				fail(res) {
					console.log(res)
					bluetooth_status.value.connected = false
				}
			})
		}

		function found(res) {

			for (var i = 0; i < res.devices.length; i++) {
				var device = res.devices[i]
				if (device.name == "") {
					continue
				}
				// console.log(device.name)
				if (device.name == bluetooth_status.value.target_name) {
					console.log("找到目标")
					bluetooth_status.value.find_target = true
					uni.stopBeaconDiscovery()
					bluetoothlist.value.push(device)
					break
				}

			}
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
			return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
				return parseInt(h, 16)
			})).buffer
		}

		function ab2hex(buffer) {
			const hexArr = Array.prototype.map.call(
				new Uint8Array(buffer),
				function(bit) {
					return ('00' + bit.toString(16)).slice(-2)
				}
			)
			return hexArr.join('')
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
				curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
				resultStr.push(String.fromCharCode(curCharCode));
			}
			return resultStr.join("");
		}

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

		function startNotice() {
			uni.notifyBLECharacteristicValueChange({
				state: true, // 启用 notify 功能
				// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
				deviceId: bluetooth_status.value.connected_device,
				// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
				serviceId: bluetooth_status.value.current_service,
				// 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
				characteristicId: bluetooth_status.value.notifyUuid_uuid, //第一步 开启监听 notityid  第二步发送指令 write
				success(res) {
					//接收蓝牙返回消息
					uni.onBLECharacteristicValueChange((res) => {
						console.log(
							`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
						handle_message(res.value)
					})
					bluetooth_status.value.notice = true
				},
				fail(err) {
					console.log(err)
					bluetooth_status.value.notice = false
				}
			})
		}

		function write(str) {
			//this.string2buffer-->字符串转换成ArrayBufer（设备接收数据的格式ArrayBufer）
			var buff = string2ArrayBuffer(str); //9.0
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

		var wv;
		export default {
			data() {
				return {
					debug: false,
					responce_text,
					isshowed,
					audio_src,
					audioAction: {
						method: 'pause'
					}
				}
			},
			onReady() {
				wv= plus.webview.create('');
				uni.setNavigationBarTitle({
					title: 'Soul_Translator'
				});
			},
			onLoad() {
				plus.screen.lockOrientation("portrait-primary")
			},
			methods: {
				auto_connect,
				test_request,
				show_presentation,
			},
			components: {

			}
		}
</script>

<style>
	.renderArea {
		width: 100%;
		height: 50vh;
		position: absolute;
		left: 0;
		top: 0;
		touch-action: none;
		z-index: 10;
		outline: 0;
	}
</style>