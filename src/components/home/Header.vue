<template>
	<header id="header">
		<div class="wrap">
			<i class="iconfont">&#xe60d;</i>
		</div>
		<div class="search" @click="goSearch">
			<i class="iconfont">&#xe602;</i>
			<span>搜你喜欢的...</span>
		</div>
		<div>
			<i class="iconfont">&#xe621;</i>
		</div>
	</header>
</template>

<script>
export default {
	methods: {
		goSearch() {
			this.$router.push('/search')
		}
	}
}
</script>

<style scoped>
header {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	height: 1.173333rem;
	background-color: #b0352f;
}

header div i {
	padding: 0 0.16rem;
	font-size: 0.76rem;
	color: #fff;
	opacity: 0.8;
}

.search {
	flex:1;
	display: flex;
	align-items: center;
	width: 6.56rem;
	height: 0.8rem;
	background-color: #fff;
	border-radius: 0.453333rem;
}

.search span {
	color: gray;
	font-size: 0.426667rem;
}

.search i {	
	display: flex;
	align-items: center;
	/* padding-left: 0.266667rem; */
	color: #000;
	font-size: 0.586667rem;
}
</style>