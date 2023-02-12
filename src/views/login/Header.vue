<template>
	<header>
		<div @click="goBack()">
			<i class="iconfont">&#xe660;</i>
		</div>
		<div>
			<slot>
				<span>登录</span>
			</slot>
		</div>
		<div>
			<i class="iconfont" @click="goHome()">&#xe69e;</i>
		</div>
	</header>
</template>

<script>
export default {
	methods: {
		goBack() {
			this.$router.back();
		},
		goHome() {
			this.$router.push('/home')
		}
	}	
}
</script>

<style scoped lang="scss">
header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 1.173333rem;
	background-color: #b0352f;
	color: #fff;
	i {
		padding: 0 0.4rem;
		font-size: 0.68rem;
	}
	span {
		font-size: 0.525rem;
	}
}	
</style>