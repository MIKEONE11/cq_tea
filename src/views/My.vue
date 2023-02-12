<template>
	<div id="my">
		<header>
			<div class="user-info" v-if="loginStatus">
				<img :src="userInfo.imgUrl" alt="">
				<span>{{userInfo.nickName}}</span>
			</div>
			<div class="login_reg" @click="goLogin()" v-else>登录/注册</div>
		</header>
		<section>	
			<ul>
				<li @click="goPath()">地址管理</li>
				<li v-if="loginStatus" @click="LOGIN_OUT()">退出登录</li>
			</ul>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '../components/common/Tabbar.vue'
import {mapMutations, mapState} from 'vuex'

export default{ 
  name: 'My',
  components: {
	Tabbar
  },
  computed: {
	  ...mapState({
		  loginStatus: state=>state.user.loginStatus,
		  userInfo: state => state.user.userInfo
	  })
  },
  methods: {
	  ...mapMutations(['LOGIN_OUT']),
	  goLogin () {
		  this.$router.push('/login')
	  },
	  goPath() {
		  this.$router.push('/path')
	  }
  }
}
</script>

<style scoped lang="scss">
#my {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}	

header {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 4.2666rem;
	background-color: #b55105;
	.login_reg {
		font-size: 0.42666rem;
		padding: 0.3125rem;	
		border-radius: 0.1875rem;
		background-color: #ffa60c;
	}
	.user-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 0.5rem;
		img{
			width: 1.76rem;
			height:1.76rem;
			border-radius: 50%;
		}
		span{
			padding:0.533333rem 0;
			font-size:0.48rem;
			color:#fff;
		}
	}
}

section {
	flex: 1;
	overfow: hidden;
	ul li {
		font-size: 0.42666rem;
		padding: 0.3125rem;
	}
}
</style>
