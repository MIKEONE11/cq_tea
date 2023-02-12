import {
	CAR_LIST, 
	CHECK_ALL, 
	UN_CHECK_ALL,
	CHECK_ITEM,
} from './mutations_types.js'	
import { Toast,Dialog } from 'vant'
import http from '@/common/api/request.js'

export default {
	state: {
		list:[],			//购物车的数据
		selectList: []		//选中的数据
	},
	getters: {
		// 判断两个数组中元素个数是否相等
		isCheckedAll(state) {
			return state.list.length == state.selectList.length;
		},
		totals(state) {
			let total = {
				num: 0,
				price: 0
			}
			state.list.forEach(v=>{
				if(v.checked) {
					total.num += parseInt(v.goods_num);
					total.price += v.goods_price * v.goods_num;
				}
			})
			return total
		}
	},
	mutations: {
		[CAR_LIST](state, carArr) {
			state.list = carArr;
			// 初始时候将list赋值给selectLsit
			state.selectList = state.list.map(v=>{
				return v.id;
			})
		},
		// 全选		将selectList中存入每一个list的id，并且将list的checked变为true
		[CHECK_ALL](state) {
			state.selectList = state.list.map(v=> {
				v.checked = true
				return v.id
			})
		},
		// 全不选		将selectList设置为空数组（此时两个数组长度不相等），并且将list的checked设置为false
		[UN_CHECK_ALL](state) {
			state.list.forEach(v=> {
				v.checked = false
			})
			state.selectList = []
		},
		// 单选
		[CHECK_ITEM](state, index) {
			// 获取到每个商品中的id
			let id = state.list[index].id
			// 根据商品id去selectList数组中查找是否有对应的元素
			let i = state.selectList.indexOf(id)
			// 如果能在selectList找到对应的id，就删除
			if(i>-1) {
				return state.selectList.splice(i,1)
			}
			// 如果之前没有选中，就给selectList添加一个id进去
			state.selectList.push(id)
		},
		//删除
		delGoods( state ){
			state.list = state.list.filter(v=>{
				return state.selectList.indexOf( v.id ) == -1
			})
		}
	},
	actions: {
		// 如果selectList中的个数等于list的，那么在调用该方法时提交全不选的方法，反之提交全选方法
		checkAllFn({commit, getters}) {
			getters.isCheckedAll ? commit('UN_CHECK_ALL') : commit('CHECK_ALL');
		},
		// 删除购物车数据操作
		delGoodsFn({commit,state},id) {
			 //如果没有选中，则提示信息
			if( state.selectList.length == 0 ){
				Toast('请选择商品');
			}
			let arrCart = [];
			Dialog.confirm({
			  message: '确定要删除这些商品吗？',
			}).then(() => {
				if( typeof id =='number' ){
				//单个删除
					arrCart = [id];		//将要删除的单个list变成一个数组
					let index = state.list.findIndex(v=>{
						return v.id == id 
					})
					state.list.splice(index,1);
				}else{
				//多选删除
					arrCart = state.selectList;		//将所有的项变成一个数组
					commit('delGoods');
					// // 全不选
					// commit('UN_CHECK_ALL')
				}
				
				http.$axios({
					url:'/api/deleteCar',
					method:'post',
					data:{
					   arrId:arrCart
					}
				}).then(res=>{
					if( res.success ){
						Toast(res.msg)
					}
				})
			})
		}
	}
}