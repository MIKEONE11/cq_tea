<template>
	<div id="search-index">
		<Header></Header>
		<section>
			<div class="search-history">
				<h2>
					<i class="iconfont">&#xe64d;</i>
					<span>历史搜索</span>
					<span @click="deleteStorage()">清空历史记录</span>
				</h2>
				<ul v-if="searchArr.length">
					<li 
					v-for="(item, index) in searchArr"
					:key="index"
					@click="goSearchList(item)">{{item}}</li>
				</ul>
				<div v-else>
					暂无搜索数据...
				</div>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from '@/components/search/Header.vue'
import { MessageBox } from 'mint-ui';
	
export default {
	name: 'Index',
	data() {
		return {
			searchArr: []
		}
	},
	components: {
		Tabbar,
		Header,
	},
	created() {
		this.searchArr = JSON.parse(localStorage.getItem('searchList')) || []
	},
	methods: {
		deleteStorage() {
			MessageBox({		//返回一个Promise
			  title: '提示',
			  message: '确定要删除搜索记录?',
			  showCancelButton: true
			}).then(res=> {		//根据点击的是取消还是确定进行下一步动作
				if(res == 'confirm') {			//假如返回的是 confirm 就执行对应操作
					// 删除本地存储
					localStorage.removeItem('searchList')
					// 清空数据
					this.searchArr = []
				}
			})
		},
		// 点击历史搜索，进入结果搜索页面
		goSearchList(item) {
			this.$router.push({
				name: 'list',
				query: {
					key: item
				}
			})
		}
	}
}
</script>

<style scoped>
#search-index {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}	

section {
	flex: 1;
	background-color: #f5f5f5;
	overflow: hidden;
}

.search-history {
	padding: 0.266667rem  0.533333rem;
}

.search-history h2 {
	position: relative;
	font-weight: 400;
	font-size: 0.48rem;
	color: #333;
}

.search-history h2 span:last-child {
	position: absolute;
	right: 0;
}

.search-history h2 i {
	padding-right: 0.133333rem;
	color: red;
	font-size: 0.426667rem;
}

.search-history ul {
	display:flex;
	flex-wrap: wrap;
	padding: 0.533333rem 0;
}

.search-history ul li {
	padding: 0.08rem 0.16rem;
	margin-right: 0.4rem;
	margin-bottom: 0.4rem;
	font-size: 0.373333rem;
	border: 1px solid #ccc;
	color: #999;
}

.search-history div{
	margin-top: 0.8rem;
	color: #999;
	font-size: 0.373333rem;
}
</style>