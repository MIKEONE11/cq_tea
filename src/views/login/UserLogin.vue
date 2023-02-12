<template>
	<div id="login container">
		<Header>
			<span>密码登录</span>
		</Header>
		
		<section>
			<div class="login-tel">
				<input type="text" v-model="userTel" placeholder="请输入手机号" pattern="[0-9]*">
			</div>
			<div class="login-code">
				<input type="text" v-model="userPwd" placeholder="请输入密码">
			</div>
			<div class="login-btn" @click="login()">
				登录
			</div>
			<div class="tab">
				<span @click="goLogin()">短信登录</span>
				<span @click="goRecovery()">找回密码</span>
				<span @click="goRegister()">快速注册</span>
			</div>
		</section>
		
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from './Header.vue'
import { Toast } from 'mint-ui'
import http from '@/common/api/request.js'
import {mapMutations} from 'vuex'

export default {
	data() {
		return {
			userTel: '',	//用户输入的手机号
			userPwd: '',	//用户输入的密码
			//表单验证规则
			rules: {		
				//手机号验证
				userTel: {					
					rule: /^1[23456789]\d{9}$/,
					message: '手机号不能为空，并且是11位数字'
				},
				// 密码验证
				userPwd: {					
					rule: /^\w{6,12}$/,
					message: '密码不能为空，并且要求6-12位'
				}
			}
		}
	},
	components: {
		Tabbar,
		Header
	},
	methods: {
		...mapMutations(['USER_LOGIN']),
		// 点击登录按钮	
		login() {
			// 前端验证
			if( !this.validata('userTel')) return;
			if( !this.validata('userPwd')) return;
			http.$axios({
				url: '/api/login',
				method: 'POST',
				data: {
					userTel: this.userTel,
					userPwd: this.userPwd
				}
			}).then(res => {
				// 提示信息
				Toast(res.msg)
				// 登录失败
				if (!res.success) return
				
				// 登录成功 => 跳转页面，存储信息
				this.USER_LOGIN(res.data)
				Toast('登录成功')
				this.$router.push('/my');
				
			})
			
			// 发送请求，后端验证
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
		// 点击短信登录回到登录页面
		goLogin() {
			this.$router.push('/login')
		},
		// 点击注册按钮
		goRegister() {
			this.$router.push('/register')
		},
		// 点击找回密码按钮	
		goRecovery() {
			this.$router.push('/recovery')
		}
	}
}
</script>

<style scoped lang="scss">
section {
	display: flex;
	flex-direction: column;
	font-size: 0.42rem;
	align-items: center;
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
		}
	}
	.login-btn {
		line-height: 1.17333rem;
		color: #fff;
		text-align: center;
		background-color: #b0352f;
		border-radius: 0.16rem;
	}
	.tab {
		display: flex;
		justify-content: space-between;
		font-size: 0.475rem;
	}
}	
</style>