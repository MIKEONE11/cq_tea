<template>
	<div id="detail">
		<header>
			<div class="header-returns" v-show="isShow">
				<div @click="goBack()">
					<i class="iconfont">&#xe660;</i>
				</div>
				<div @click="goBack()">
					<i class="iconfont">&#xe69e;</i>
				</div>
			</div>
			<div 
			class="header-bar" 
			v-show="!isShow"
			:style='styleOption'>
				<div>
					<i class="iconfont">&#xe660;</i>
				</div>
				<div>
					<span>商品详情</span>
				</div>
				<div>
					<i class="iconfont">&#xe69e;</i>
				</div>
			</div>
		</header>
		
		<section ref="wrapper">
			<div>
				<div class='swiper-main'>
					<swiper :options="swiperOption">
					  <swiper-slide 
						v-for='(item,index) in swiperList' 
						:key='index'
					   >
						<img :src="goods.imgUrl" alt="">
					  </swiper-slide>
					</swiper>
					<div class="swiper-pagination"></div> 
				</div>
				
				<div class="goods-name">
					<h1>{{goods.name}}</h1>
					<div>2022明前龙井，早春全芽，外形好，口感佳</div>
				</div>
				<div class="goods-price">
					<div class="oprice">
						<span>￥</span>
						<B>{{goods.price}}</B>
					</div>
					<div class="pprice">
						<span>价格:</span>
						<del>￥{{goods.price}}</del>
					</div>
				</div>
				
				<div>
					<img :src="goods.imgUrl" alt="" style="width: 100%">
					<img :src="goods.imgUrl" alt="" style="width: 100%">
				</div>
			</div>
		</section>
		
		<footer>
			<div class="add-car" @click="addCar()">加入购物车</div>
			<div>直接购买</div>
		</footer>
	</div>
</template>

<script>
import {swiper, swiperSlide} from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'	
import http from '@/common/api/request.js'
import BScroll from 'better-scroll'
import { Toast } from 'mint-ui'

export default {
	name: 'Detial',
	data(){
	    return {
			id: 0,
			goods: {},
			styleOption: {},
			BetterScroll: '',
			isShow: true,
			swiperOption: {//swiper3
				autoplay: 3000,
				speed: 1000,
				pagination: {
					el: '.swiper-pagination',
					type: 'fraction'		//切换下方小点为数字
					
				}
			},
			swiperList:[
				{
					imgUrl:'./img/swi1.jpeg'
				},
				{
					imgUrl:'./img/swi2.jpeg'
				},
				{
					imgUrl:'./img/swi3.jpeg'
				}
			]
	    }
	},
	components: {
		swiper,
		swiperSlide
	},
	created() {
		// 将当前跳转id保存给组件的id
		this.id = this.$route.query.id;
		this.getData()
	},
	activated() {
		// 判断当前的id和之前的是否一致
		if(this.$route.query.id != this.id) {
			this.getData()				//如果二者id不一致，则再发送一次请求
			this.id = this.$route.query.id
		}
	},
	mounted() {
		this.BetterScroll = new BScroll(this.$refs.wrapper, {
		  	probeType: 3,
			bounce: false,		//取消滑动回弹
			click:true	
		})
		this.BetterScroll.on('scroll',(pos)=>{
			let posY = Math.abs( pos.y );
			let opacity = posY / 180;
			
			opacity = opacity > 1 ? 1 : opacity;
			
			this.styleOption = {
				opacity:opacity
			}
				
			if( posY >= 50 ){
				this.isShow = false;
			}else{
				this.isShow = true;
			}
		})
		
	},
	methods: {
		async getData() {
			let id = this.$route.query.id
			let res = await http.$axios({
				url: '/api/goods/id',
				params: {
					id
				}
			})
			this.goods = res
		},
		goBack() {
			this.$router.back();
		},
		//加入购物车
		addCar() {
			let id = this.$route.query.id
			http.$axios({
				url: '/api/addCar',
				method: 'POST',
				data: {
					goodsId: id,
				},
				headers: {
					token: true
				}
			}).then(res => {
				if(res.success) {
					Toast('添加购物车成功')
				}
			})
		}
	}
}
</script>

<style scoped lang="scss">
#detail {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}

header {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 1.173333rem;
	z-index: 99;
	.header-returns {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 1.173333rem;
		div {
			width: 34px;
			height: 34px;
			margin: 0 0.266667rem;
			ling-height: 1.173333rem; 
			text-align: center;
			background-color: rgba(0,0,0,.3);
			border-radius: 50%;
		};
		i {
			font-size: 0.54rem;
			color: #fff;
		}
	};
	.header-bar{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 1.173333rem;
		font-size:0.426666rem;
		background-color: #fff;
		span{
			padding:0 0.266666rem;
		}
		i{
			padding:0 0.266666rem;
			font-size:0.586666rem;
		}
	}
}

section{
	flex:1;
	overflow: hidden;
}	

.swiper-main{
	position: relative;
	width: 100%;
	height:10rem;
	overflow: hidden;
}
.swiper-container{
	width: 100%;
	height: 10rem;
}
.swiper-container img{
	width: 100%;
	height: 10rem;
}
.swiper-pagination{
	bottom:0.266666rem;
	right: 0.53333rem;
	width: 100%;
	text-align: right;
	color:#FFFFFF;
	font-size:0.426666rem;
	background-color: rgba(0,0,0,.6);
	padding: 0.08rem;
	border-radius: 0.4rem;
}

.swiper-pagination-fraction, .swiper-pagination-custom, .swiper-container-horizontal > .swiper-pagination-bullets{
	width: 1rem;
	left:8.533333rem;
}

.swiper-pagination-traction {
	borde-radius: 0.32rem;
}

.goods-name {
	padding: 0.333333rem 0.26666rem;
	border-bottom: 0.026667rem solid #ccc;
	h1 {
		font-size: 0.533333rem;
		font-weight: 500;
	};
	div {
		padding: 0.08rem 0;
		font-size: 0.373333rem;
		color: #999;
	}
}

.goods-price{
	padding:0.233333rem 0.266666rem;
	.oprice{
		color:red;
		span{
			font-size:0.32rem;
		}
	}
	.pprice{
		color:#999999;
		font-size:0.373333rem;
	}
}


footer {
	display: flex;
	justify-content: space-around;
	align-items: center;
	position: fixed;
	bottom: 0;
	left: 0;
	height: 1.306667rem;
	width: 100%;
	background-color: #fff;
	border-top: 0.026667rem solid #ccc; 
	div {
		width: 50%;
		line-height: 1.306667rem;
		text-align: center;
		font-size: 0.426667rem;
		color:#fff;
		background-color: #ff0000;
		&.add-car {
			background-color: #FF9500;
		}
	}
}


</style>