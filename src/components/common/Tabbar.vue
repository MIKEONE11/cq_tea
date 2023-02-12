<template>
	<div id="tabbar">
		<ul>
			<li 
			v-for="(item, index) in routerList" 
			:key="index"
			@click="switchTab(item.path)"> 
			<!-- 动态绑定src属性的情况要将资源添加到public中，访问也是访问的public目录 -->
				<img :src="$route.path.includes(item.path) ? item.selected : item.active"></img>
				<span :class='$route.path.includes(item.path) ? "active" : "" '>{{item.title}}</span>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'tabbar',
	data() {
		return {
			routerList: [
				{
					title: '首页',
					path: '/home',
					active: '/img/home.png',
					selected: '/img/home-select.png'
				},
				{
					title: '分类',
					path: '/list',
					active: '/img/list.png',
					selected: '/img/list-select.png'
				},
				{
					title: '购物车',
					path: '/car',
					active: '/img/cart.png',
					selected: '/img/cart-select.png'
				},
				{
					title: '我的',
					path: '/my',
					active: '/img/my.png',
					selected: '/img/my-select.png'
				},
			]
		}
	},
	methods: {
		switchTab(path) {
			// 判断是否是同一个路由
			if(this.$route.path == path) return 
			// 对应跳转页面，根组件一般使用无法回退（replace）
			this.$router.push(path)
		}
	}
}
</script>

<style scoped>
#tabbar {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 1.6rem;
	background-color: #fff;
	
}	

#tabbar ul {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	height: 100%;
}
#tabbar ul li {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	/* 纵向图片文字纵向排列 */
}
#tabbar ul li img {
	width: 0.826667rem;
	height: 0.826667rem;
	font-size: 0.533333rem;
}
#tabbar ul li span {
	font-size: 0.426667rem;
}
.active {
	color: red;
}
</style>