<template>
	<div class="home">
		<div class="header">
			<div class="header-main">
				<Header></Header>
				<ly-tab
					v-model="selectedId"
					:items="items"
					:options="options"
					@change="changeTab"
				/>
			</div>
		</div>
		<section class="wrapper">
			<div>
				<div v-for="(item, index) in newData" :key="index">
					<Swiper 
					v-if="item.type=='swiperList'" 
					:swiperList='item.data'></Swiper>
					<Icons 
					v-if="item.type=='iconList'" 
					:iconList='item.data'></Icons>
					<Recommend 
					v-if="item.type=='recommendList'" 
					:recommendList='item.data'
					></Recommend>
					<Ad 
					v-if="item.type=='adList'"
					:adList="item.data"
					></Ad>
					<Like 
					v-if="item.type=='likeList'"
					:likeList='item.data'></Like>
				</div>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from '@/components/home/Header.vue'
import Swiper from '@/components/home/Swiper.vue'
import Icons from '@/components/home/Icons.vue'
import Recommend from '@/components/home/Recommend.vue'
import Like from '@/components/home/Like.vue'
import Ad from '@/components/home/Ad.vue'
import BScroll from 'better-scroll'
import http from '@/common/api/request.js'

export default {
    name: "home",
    data() {
	    return {
		    selectedId: 0,
			items:[],
			oBetterScroll:'',
			tBetterScroll:'',
			newData: [],
		    options:{
			    activeColor:'#b0352f',
			}
		}
    },
	mounted(){
		
	},
	created() {
		this.getData()
	},
	methods: {
		async getData() {
			let res = await http.$axios({
				url: '/api/index_list/0/data/1'
			})
			this.items = Object.freeze(res.topBar)
			// Object.freeze()：使对象的属性无法被修改，提高安全性
			this.newData = Object.freeze(res.data)
			
			// 当DOM都加载完毕再去执行
			this.oBetterScroll = this.$nextTick(() => {
			    this.bscorll = new BScroll('.wrapper', {
			      	movable: true,
			      	zoom: true,
					click: true
			    })  
			})
			
		},
		async addData(index) {
			let res = await http.$axios({
				url: '/api/index_list/'+ index +'/data/1'
			})
			
			if(res.constructor != Array) {		//缺陷:推荐的ly-tab比其他的ly-tab返回的数据少一层
				this.newData = Object.freeze(res.data)
			} else {
				this.newData = Object.freeze(res)
			}
			
			// 当DOM都加载完毕再去执行
			this.tBetterScroll = this.$nextTick(() => {
			    this.bscorll = new BScroll('.wrapper', {
			      	movable: true,
			      	zoom: true,
					click: true
			    })  
				/* vue中的 ref：获取dom节点
​					使用：<div ref="aaa"></div>
​					获取：this.$refs.aaa
				*/
			})
		},
		changeTab(item, index) {
			this.addData(index)		//点击ly-tab将index传给addData函数
		}
	},
    components: {
		Tabbar,
		Header,
		Swiper,
		Icons,
		Recommend,
		Like,
		Ad
	}
};
</script>

<style>
.home {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
	
.header {
	width: 100%;
	height: 2.213333rem;
}

/* .header-main {
	position: fixed;
	left: 0;
	top: 0;
} */

section {
	flex: 1;
	overflow: hidden;
}
	
.ly-tab {
	border-bottom: none;
}
	
</style>

  