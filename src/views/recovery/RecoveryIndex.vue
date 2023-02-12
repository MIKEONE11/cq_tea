<template>
	<div id="login container">
		<Header>
			<span>找回密码</span>
		</Header>
		
		<section>
			<div class="login-tel">
				<input 
				type="text" 
				placeholder="请输入手机号" 
				pattern="[0-9]*"		
				v-model="userTel">	<!-- pattern="[0-9]*": 规定输入内容为纯数字 -->
			</div>
			<div class="login-code">
				<input type="text" 
				placeholder="请输入短信验证码" 
				pattern="[0-9]*"
				v-model="userCode">
				<button 
				:disabled="disabled"
				@click="sendCode()">{{codeMessage}}</button>
			</div>
			<div class="login-btn" @click="next()">
				下一步
			</div>
		</section>
		
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from '@/views/login/Header.vue'
import { Toast } from 'mint-ui'
import http from '@/common/api/request.js'

export default {
	data(){
		return {
			disabled: false,
			userTel:'',
			//表单验证规则
			rules: {		
				//手机号验证
				userTel: {					
					rule: /^1[23456789]\d{9}$/,
					message: '手机号不能为空，并且是11位数字'
				},
			},
			codeNum: 6,
			codeMessage: '获取短信验证码',
			code: '',
			userCode: ''
		}
	},
	components: {
		Tabbar,
		Header
	},
	methods: {
		// 点击获取短信验证码功能
		sendCode() {
			// 前端验证:调用validata验证输入内容是否符合要求
			if( !this.validata('userTel')) return;
			// 请求短信验证码接口
			http.$axios({
				url: '/api/code',
				method: 'POST',
				data: {
					phone: this.userTel
				}
			}).then(res=> {
				if(res.success) {
					this.code = res.data
				}
			})
			
			//禁用按钮
			this.disabled = true;
			// 倒计时
			let timer = setInterval(() => {
				--this.codeNum
				this.codeMessage = `重新发送${this.codeNum}s`
			},1000)
			// 6s后停止倒计时，codeNum 重新赋值为6
			setTimeout(() => {
				clearInterval(timer);
				this.codeNum = 6
				this.disabled = false
				this.codeMessage = '获取短信验证码'
			},6000)
			
		},
		// 密码登录
		goUserLogin() {
			this.$router.push('/userLogin').catch(err => err)
		},
		// 注册
		goRegister() {
			this.$router.push('/register')
		},
		//验证信息提示
		validata(key) {
			let bool = true;
			if(!this.rules[key].rule.test(this[key])) {		
				// test() 方法用于检测一个字符串是否匹配某个模式.
				//如果字符串中有匹配的值返回 true ，否则返回 false。
				
				// 提示信息
				Toast(this.rules[key].message)
				bool = false
				return false		//阻止提交表单
			}
			return bool
		},
		// 点击登录
		next() {
			// 如果验证码不正确
			if(this.code != this.userCode) {
				// 提示信息
				Toast('验证码不正确')
				return
			}
			// 告诉后端，用户输入的手机号是否存在
			// 发送请求
			http.$axios({
				url: '/api/selectUser',
				method: 'POST',
				data: {
					phone: this.userTel
				}
			}).then(res=> {
				if(!res.success) {
					Toast(res.msg)
					return
				}
				this.$router.push({
					name: 'Btn',
					query: {
						phone:this.userTel
					}
				})
			})
		},
		
	}
}
</script>

<style scoped lang="scss">
section {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 0.42rem;
	background-color: #f5f5f5;
	div {
		margin: 0.3666rem 0;
		width: 8.93333rem;
		height: 1.17333rem;
	}
	input{
		box-sizing: border-box;
		padding: 0 0.26666rem;
		line-height: 1.17333rem;
		border: 0.0325rem solid #ccc;
		border-radius: 0.21212rem;
		background-color: #fff;
	}
	.login-tel {
		margin-top: 0.8rem;
		input {
			width: 8.93333rem;
		}
	}
	.login-code {
		display: flex;
		input {
			flex: 1;
			overflow: hidden;	
			border-radius: 0.21212rem 0 0 0.21212rem;
			border-right: none;
			
		}
		button {
			padding: 0 0.5333rem;
			height: 1.153333rem;
			background-color: #b0352f;
			border: 0;
			color: #fff;
			font-size: 0.375rem;
			border-radius: 0 0.21212rem 0.21212rem 0;
		}
	}
	.login-btn {
		line-height: 1.17333rem;
		color: #fff;
		text-align: center;
		background-color: #b0352f;
		border-radius: 0.16rem;
	}
}	
</style>