<template>
	<header>
		<div class="search-return" @click="goBack()">
			<i class="iconfont">&#xe660;</i>
		</div>
		<div class="search-main" >
			<i class="iconfont">&#xe602;</i>
			<form action="" onsubmit="return false" @keyup.enter="goSearchList()">
				<input type="text" placeholder="请输入喜欢的产品" v-model="searchData" ref="myInput">	
				<!-- ref="myInput" 滑动页面，关闭键盘 -->
			</form>
		</div>
		<div class="search-btn" @click="goSearchList()">
			搜索
		</div>
	</header>
</template>

<script>
export default {
	data() {
		return {
			searchData: this.$route.query.key || '',
			searchArr: []
		}
	},
	mounted() {
		//键盘监听事件
		window.addEventListener("touchmove", this.myTouchMove, true)
	},
	methods: {
		// 失去焦点
		myTouchMove(){
			this.$refs.muInput.blur();		//键盘收起
		},
		goBack() {
			this.$router.back()
		},
		goSearchList() {
			// 如果搜索的关键字为空的，则不往下执行
			if( !this.searchData ) return
			
			// 注意：不管存进去的是什么类型，返回的永远是 String 类型
			// 判断之前有没有搜索的本地存储
			if(!localStorage.getItem('searchList')) {
				// 没有
				localStorage.setItem('searchList', '[]')
			} else {
				// 之前有
				this.searchArr = JSON.parse(localStorage.getItem('searchList'))
			}
			// 增加数据
			this.searchArr.unshift(this.searchData);
			// ES6  new Set()去重，返回的是一个对象
			let newArr = new Set(this.searchArr)
			// 给本地存储赋值
			// 注意：new Set()去重，返回的是一个对象，给本地存储复制的时候要转换为数组
			localStorage.setItem('searchList', JSON.stringify(Array.from(newArr)))
			
			// 路径如果没有变化，则不跳转
			if(this.searchData == this.$route.query.key) return
			
			// 跳转页面
			this.$router.push({
				name: 'list',
				query: {
					key: this.searchData
				}
			})
			
		}
	},
}
</script>

<style scoped lang="scss">
header{
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 1.173333rem;
	color:#fff;
	background-color: #b0352f;
}
.search-return,.search-btn{
	padding:0 0.266666rem;
}
.search-return i{
	display: flex;
	align-items: center;
	font-size: 0.533333rem;
}
.search-main{
	display: flex;
	align-items: center;
	width: 6.933333rem;
	height: 0.8rem;
	border-radius: 15px;
	background-color: #FFFFFF;
}
.search-main i{
	padding:0 0.266666rem;
	color:#666666;
}
.search-main form{
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	input{
		width: 100%;
		font-size: 0.5rem;
		color: #000;
	}
}
.search-btn{
	font-size:0.426666rem;
}
</style>