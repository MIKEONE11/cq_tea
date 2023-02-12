import {INIT_DATA} from './mutations_types.js'
export default {
	state: {
		list:[]
	},
	 getters: {
		defaultPath( state ){
			return state.list.filter(v=>{
				return v.isDefault == 1;
			})
		}
	},
	mutations: {
		[INIT_DATA](state, arrPath) {
			state.list = arrPath;
		}
	}
}