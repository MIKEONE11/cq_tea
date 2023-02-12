<template>
	<div class="car container">
		<header>
			<i class="iconfont" @click="goBack()">&#xe660;</i>
			<span>购物车</span>
			<span @click="isNavBar()" v-text="isNavStatus ? '完成': '编辑'">编辑</span>
		</header>
		<section v-if="list.length">
			<div class="cart-title">
				<van-checkbox @click="checkAllFn" :value="isCheckedAll"></van-checkbox>
				<span>商品</span>
			</div>
			<ul>
				<li	v-for="(item, index) in list" :key="index">
					<div class='check'> 
						<van-checkbox v-model="item.checked" @click="CHECK_ITEM(index)"></van-checkbox>
					</div>
					<h2>
						<img :src="item.goods_imgUrl" alt="">
					</h2>
					
					<div class="goods">
						<div class='goods-title'>
							<span>{{item.goods_name}}</span>
							<i class="iconfont" @click="delGoodsFn(item.id)">&#xe74b;</i>
							
						</div>
						<div class='goods-price'>￥{{item.goods_price}}</div>
						<van-stepper @change='changeNum($event,item)' v-model="item.goods_num" integer />
					</div>
				</li>
			</ul>
			
		</section>
		<section class="null-list" v-else>
			暂无数据
			<router-link to="/home">去主页看看~</router-link>
		</section>
		<footer v-if="list.length">
			<div class='radio'>
				 <van-checkbox @click="checkAllFn" :value="isCheckedAll"></van-checkbox>
			</div>
			<div class="total" v-show="!isNavStatus">
				<div>
					共有 
					<span class='total-active'>{{totals.num}}</span> 
					件商品
				</div>
				<div>
					<span>总计：</span>
					<span class='total-active'>￥{{totals.price.toFixed(2)}} + 0茶币</span>
				</div>
			</div>
			<div class="order" v-if="isNavStatus" @click="delGoodsFn">删除</div>
			<div class="order" v-if="!isNavStatus" @click="goOrder">去结算</div>
		</footer>
	</div>
</template>

<script setup> 
import { Toast } from 'mint-ui';
import http from '@/common/api/request.js'
import {mapMutations, mapGetters, mapState, mapActions} from 'vuex'
	
export default{
  name: 'Car',
  data() {
	  return {
		  checked: true,
		  isNavStatus: false
	  }
  },
  created() {
	this.getData()
  },
  computed: {
	  ...mapState({
		  list: state => state.car.list ,
		  selectList: state => state.car.selectList
	  }),
	  ...mapGetters(['isCheckedAll','totals']),
	  goodsList() {
	  	return this.selectList.map(id=>{
	  		return this.list.find(v=> v.id == id)
	  	})
	  }
  },
  methods: {
	  ...mapMutations(['CAR_LIST','CHECK_ITEM','INIT_ORDER']),
	  ...mapActions(['checkAllFn','delGoodsFn']),
	  async getData() {
		  let res = await http.$axios({
		  	url: '/api/selectCar',
			method: 'POST',
			headers: {
				token: true
			}
		  })
		  
		  // 当页面请求到购物车数据时，为每一个数据添加一个checked属性赋值为true
		  res.data.forEach(v=>{
			v['checked']=true;
		  })
		  
		  this.CAR_LIST(res.data)
	  },
	  goBack() {
		  this.$router.push('/home');
	  },
	  // 点击编辑或完成
	  isNavBar() {
		  this.isNavStatus = !this.isNavStatus; 
	  },
	  // 修改数量
	  changeNum(value,item) {		
		  //van-stepper ui组件中的change事件自带两个参数value，detail,
			//value就是修改后的数量，item就是当前购物车商品的数据
		  // 当前购物车商品的id以及修改后的数量 ==传递给后端
		  http.$axios({
		  	url: '/api/updateNum',
			method: 'POST',
			headers: {
				token: true
			},
			data: {
				id: item.id,
				num: value
			}
		  })
	  },
	  // 去结算
	  goOrder() {
		  if( !this.selectList.length ){
			  Toast('请至少选择一件商品');
			  return;
		  }
		  
		  // 要提交到结算页的选中的商品
		  let newList = [];
		  this.list.forEach(item => {
			  this.selectList.filter(v=>{
				  if(v == item.id){
					  newList.push(item)
				  }
			  })
		  })
		  
		  // 生成一个订单
		  http.$axios({
		  	url: '/api/addOrder',
			method: 'POST',
			headers: {
				token: true
			},
			data: {
				arr: newList
			}
		  }).then(res=>{
			  if( !res.success ) return;
			  //存储订单号
			  this.INIT_ORDER(res.data);
			  // 进入提交订单页面
			  this.$router.push({
				  path: '/order',
				  query: {
					  detail: JSON.stringify(this.selectList),
					  goodsList: JSON.stringify(this.goodsList)
				  }
			  })
		  })
	  }
  }
}	
</script>

<style scoped lang="scss">
.container {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
	
header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 1.173333rem;
    color:#fff;
    background-color: #b0352f;
    i{
        padding:0 0.4rem;
        font-size:0.586666rem;
    }
    span{
        padding:0 0.4rem;
        font-size:0.426666rem;
    }
}

section{
    background-color: #f5f5f5;
    .cart-title{
        display: flex;
        padding:0.433333rem 0.533333rem 0.333333rem 0.533333rem;
        span{
            padding:0 0.4rem;
            font-weight: 500;
            font-size:0.48rem;
        }
    }
    ul{
        display: flex;
        flex-direction: column;
        li{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding:0.26rem 0.733333rem 0.26rem 0.533333rem;
            margin:0.213333rem 0;
            background-color: #fff;
            .check{
                padding-right:0.373333rem;
            }
			h2 {
				display: flex;
				align-items: end;
			}
            .goods{
                display: flex;
                flex-direction: column;
				width: 5rem;
                font-size:0.32rem;
                .goods-title{
                    display: flex;
					justify-content: space-between;
                    i{
                        font-size:0.586666rem;
                    }
                }
                .goods-price{
                    padding:0.08rem 0;
                    color:#b0352f;
                }
                ::v-deep .van-stepper{
                    text-align: right;
                }
            }
            img{
                width: 2rem;
                height: 2rem;
            }
        }
    }
}


.null-list {
	margin: 5rem 1.7rem;
	color: #ccc;
	font-size: 0.625rem;                                                                                                                                                                                                                                                                                                                                                                                                                                        
	background-color: #fff;
}

footer{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 1.28rem;
    border-top:0.053333rem solid #ccc;
    .radio{
        padding:0 0.4rem;
    }
    .total{
        flex:1;
        font-size:0.32rem;
        .total-active{
            color:#b0352f;
        }
    }
    .order{
        width: 3.2rem;
        line-height: 1.28rem;
        color:#fff;
        text-align: center;
        font-size: 0.426666rem;
        background-color: #b0352f;
    }
}
</style>