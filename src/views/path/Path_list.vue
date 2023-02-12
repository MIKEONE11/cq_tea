<template>
	<div id="path_index">
		<Header>
			<span v-if="pathStatus">添加地址</span>
			<span v-else>编辑地址</span>
		</Header>
		<section>
			<van-address-edit
			  v-if="pathStatus"
			  :area-list="areaList"
			  show-set-default
			  @save="onAdd"
			/>
			
			<van-address-edit
			  v-else
			  :address-info="AddressInfo"
			  :area-list="areaList"
			  show-delete
			  show-set-default
			  show-search-result
			  @save="onUpdate"
			  @delete="onDelete"
			/>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Header from "@/components/path/Header.vue"
import Tabbar from '@/components/common/Tabbar.vue'
import { Toast } from 'vant';
import http from '@/common/api/request.js'

export default {
	components: {
		Header,
		Tabbar
	},
	created() {
		let key = JSON.parse(this.$route.params.key)
		//从订单页面进来的
		if( key == 'add' ){
			this.pathStatus = true;
		} else {
			this.AddressInfo = key;
			this.AddressInfo.isDefault = this.AddressInfo.isDefault == 1 ? true : false
		}
	},
	data() {
		return {
			pathStatus: false,
			AddressInfo: {},
			areaList:{
				province_list: {
				  110000: '北京市',
				  120000: '天津市',
				  130000: '江西省'
				},
				city_list: {
				  110100: '北京市',
				  120100: '天津市',
				  130100: '赣州市',
				  130200: '南昌市',
				  130300: '九江市',
				  130400: '抚州市',
				  
				},
				county_list: {
				  110101: '东城区',
				  110102: '西城区',
				  120101: '塘沽区',
				  130101: '兴国县',
				  130102: '信丰县',
				  130103: '泰和县',
				  
				},
			},
			searchResult: []
		}
	},
	methods: {
		// 点击保存触发 ==> 增加
		onAdd(content){		//content就是填写的信息对象
			content.isDefault = content.isDefault == true ? 1:0 
			http.$axios({
				url: '/api/addAddress',
				method: "POST",
				headers: {
					token: true
				},
				data: {
					...content
				}
			}).then(res => {
				if(res.success) {
					Toast(res.msg);
					this.$router.push('/path')
				}
			})
		},
		//点击保存触发 ==> 修改
		onUpdate( content ){
			content.isDefault = content.isDefault==true ? 1 : 0;
			http.$axios({
				url:'/api/updateAddress',
				method:"post",
				headers:{
					token:true
				},
				data:{
					...content
				}
			}).then(res=>{
				if( !res.success ) return;
				Toast(res.msg);
				this.$router.push('/path');
			})
		},
		//删除
		onDelete(content) {
			http.$axios({
				url:'/api/deleteAddress',
				method:"post",
				headers:{
					token:true
				},
				data:{
					id:content.id
				}
			}).then(res=>{
				if( !res.success ) return;
				Toast(res.msg);
				this.$router.push('/path');
			})
		},
	}
}
</script>

<style lang='scss' scoped>
#path_index {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
::v-deep .van-button--danger {
	background-color: #B0352F;
	border: 1px solid #B0352F;
}

::v-deep .van-address-edit__buttons{
	display: flex;
	justify-content: center;
	align-items:center;
	flex-wrap: wrap;
}

::v-deep .tabbar{
    border-top:2px solid #ccc;
}
</style>