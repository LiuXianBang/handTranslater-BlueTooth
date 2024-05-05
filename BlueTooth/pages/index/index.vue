<template>
	<view class="content">
		<web-view :webview-styles="webviewStyles" src="http://localhost:5173/" update-title="false" ></web-view>
		<view class="text-area">
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
			<button @click="initBlue">初始化蓝牙</button>
			<button @click="discovery">搜索</button>
		</view>
	</view>
</template>

<script>
	import { defineComponent, ref } from 'vue'
	const bluetoothlist = ref([])
	function initBlue() {

		uni.openBluetoothAdapter({
			success(res) {
				console.log('初始化蓝牙成功')
				console.log(res)
			},
			fail(err) {
				console.log('初始化蓝牙失败')
				console.error(err)
			}
		})
	}
	function discovery() {
		bluetoothlist.value = []
	    uni.startBluetoothDevicesDiscovery({
	        success(res) {
	            console.log('开始搜索')
	            
	            // 开启监听回调
	            uni.onBluetoothDeviceFound(found)
	        },
	        fail(err) {
	            console.log('搜索失败')
	            console.error(err)
	        }
	    })
	}
	function found(res) {
	    // console.log(res)
		bluetoothlist.value.push(res.devices[0])
	}


	export default {
		data() {
			return {
				bluetoothlist,
			}
		},
		onReady() {

		},
		onLoad() {
		},
		methods: {
			initBlue,
			discovery,
		}
	}
</script>

<style>
.webgl {
  display: block;
  width: 100vw;
  height: 80vh;
  z-index: 100;
}
</style>
