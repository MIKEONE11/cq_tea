import {
	INIT_ORDER
} from './mutations_types.js'

export default {
	state: {
		list: [],
		order_id: localStorage.getItem('tea_orderId') || ""
	},
	getters: {},
	mutations: {
		[INIT_ORDER](state, orderId) {
			state.list = orderId;
			// 存储订单号
			state.order_id = orderId[0].order_id;
			// 设置一个id号
			localStorage.setItem("tea_orderId", orderId[0].order_id);
		}
	}
}