<template>
	<div id="list">
		<header>
			<div class="returns">
				<i class="iconfont">&#xe660;</i>
			</div>
			<div class="search">
				<i class="iconfont">&#xe602;</i>
				<span>搜您喜欢的...</span>
			</div>
			<div class="homes">
				<i class="iconfont">&#xe69e;</i>
			</div>
		</header>
		<section>
			<div class="list-l" ref="left">
				<ul class="l-items">
					<li 
					v-for="(item, index) in leftData"
					:key="index"
					:class="{active: index == currentIndex}"
					@click="goScroll(index)">{{item.name}}</li>
				</ul>
			</div >
				
			<div class="list-r" ref="right">
				<div class="wrap">
					<ul
					v-for="(item, index) in rightData"
					:key="index">
						<li 
						v-for="(i,v) in item"
						:key="v"
						class="shop-list">
							<h2>{{i.name}}</h2>
							<ul class="r-content">
								<li
								v-for="(j,idx) in i.list"
								:key="idx"
								>
									<img :src="j.imgUrl" alt="">
									<span>{{j.name}}</span>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import http from '@/common/api/request.js'
import Tabbar from '../components/common/Tabbar.vue'
import BScroll from 'better-scroll'

export default{
  name: 'List',
  data() {
	  return {
		  imgHomeUrl: 'img/home.png',
		  leftData: [],				//左侧数据
		  rightData: [],			//右侧数据
		  rightBScroll: '',			//右侧滑动
		  allHeight: [],			//承载右侧每一块高度值
		  scrollY: ''				//右侧滚动距离
	  }
  },
  computed: {
	  currentIndex() {
		  return this.allHeight.findIndex((item,index)=>{
			  // this.allHieght = 0, 311, 622, 843, 1064, 1285, 1416, 1817
			  // 比如：滚动到了400的位置，处在第二和第三板ul之间
			  return this.scrollY >= item && this.scrollY < this.allHeight[index+1]
		  })
	  }
  },
  async created() {
	  let res = await http.$axios({  
		  url: '/api/goods/list'
	  })
	  
	  let leftArr = []
	  let rightArr = []
	  // 开始请求两侧数据
	  res.forEach((v, s) => {
		  leftArr.push({
			  id: v.id,
			  name: v.name
		  })
		  rightArr.push(v.data)
		  
	  })
	  
	  this.leftData = leftArr;
	  this.rightData = rightArr
	  
	  // 当DOM都加载完毕再去执行
	  this.$nextTick(() => {
		  // 左侧滑动
	      new BScroll(this.$refs.left, {
			  click: true,			//better-scroll手动开启点击事件
		  })  
		  // 右侧滑动
	      this.rightBScroll = new BScroll(this.$refs.right, {
			  click: true,
			  probeType: 3
		  })  
		  // 统计右侧所有板块高度值，并且放入数组中
		  let height = 0;
		  this.allHeight.push(height)
		  // 获取右侧每一块高度
		  let uls = this.$refs.right.getElementsByClassName('shop-list')
		  // 把DOM对象转换为真正的数组
		  Array.from(uls).forEach(v=> {
			  height += v.clientHeight;
			  this.allHeight.push(height)
		  })
		  
		  console.log(this.allHeight)
		  // 得到右侧滚动的值
		  this.rightBScroll.on('scroll', (pos)=>{
			  this.scrollY = Math.abs(pos.y)
		  })
	  })
  },
  components: {
	Tabbar	
  },
  methods: {
	  goScroll(index) {
		  this.rightBScroll.scrollTo(0, -this.allHeight[index],500)
	  }
  }
}
</script>

<style scoped lang='scss'>
#list {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 1.173333rem;
		background-color: #b0352f;
		.returns{
			padding:0 0.346667rem;
			i{
				color: #fff;
				font-size:0.693333rem;
			}
		};
		.search{
			display: flex;
			align-items: center;
			flex: 1;
			padding:0.1rem 0.266666rem;
			background-color: #FFFFFF;
			border-radius: 0.64rem;
			i{
				padding-right: 0.16rem;
				color:#666;
				font-size:0.48rem;
			};
			span{
				color:#666;
				font-size:0.473333rem;
			}
		};
		.homes {
			padding: 0 0.346667rem;
			i {
				color: #fff;
				font-size: 0.733333rem;
			}
		}
	};
}	

section {
	display: flex;
	flex: 1;
	overflow: hidden;
}

section .list-l {
	width: 2.48rem;
	border-right: 0.5px solid #ccc;
	background-color: #fff;
	overflow: hidden;
	.l-items {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		li {
			width: 100%;
			padding:0.08rem 0;
			margin:0.433333rem 0;
			text-align: center;
			font-size:0.373333rem;
			&.active {
				color:#b54f4a;
				border-left: 3px solid #b54f4a;
			}
		}
	}
}

section .list-r {
	flex: 1;
	height: 100%;
	overflow: hidden;
	.shop-list {
		text-align: center;
		h2 {
			padding-top: 0.266667rem;
			font-size: 0.64rem;
			font-weight: 400;
		};
		.r-content {
			display: flex;
			flex-wrap: wrap;
			li {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				/* width: 2.4rem; */
				width: 33.33%;
				height: 2.4rem;
				img {
					width: 1.413333rem;
					height: 1.413333rem;
				};
				span {
					font-size: 0.373333rem;
				}
			}
		}
	}
}

::v-deep #tabbar {
	border-top: 0.5px solid #ccc;
}

</style>