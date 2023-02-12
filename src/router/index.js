import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";


// 抑制 vue-router内部错误,没有进行catch处理,导致的编程式导航跳转问题,往同一地址跳转时会报错的情况。
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}


Vue.use(VueRouter);

const routes = [
  {
	path: '/',
	redirect: '/home'
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/list",
    name: "List",
    component: () =>
      import( "../views/List.vue"),
  },
  {
    path: "/car",
    name: "Car",
    component: () =>
      import( "../views/Car.vue"),
  },
  {
    path: "/my",
    name: "My",
    component: () =>
      import( "../views/My.vue"),
  },
  {
    path: "/search",
    name: "Search",
	children: [
		{
			path: '/',
			name: 'Index',
			component: () =>
			  import( "../views/search/Search-index.vue"),
		},
		{
			path: "list",
			name: "list",
			component: () =>
			  import( "../views/search/Search-list.vue"),
		},
		
	],
    component: () =>
      import( "../views/Search.vue"),
  },
  {
    path: "/detail",
    name: "Detail",
	meta: {
		keepAlive: true,		//此组件需要被缓存：当重复进入商品
	}, 
    component: () =>
      import( "../views/Detail.vue"),
  },
  {
	  path: "/login",
	  name: "Login",
	  component: () =>
		import("../views/login/Login.vue")
  },
  {
  	  path: "/userLogin",
  	  name: "UserLogin",
  	  component: () =>
  		import("../views/login/UserLogin.vue")
  },
  {
  	  path: "/register",
  	  name: "Register",
  	  component: () =>
  		import("../views/login/Register.vue")
  },
  {
    path: "/recovery",
    name: "Recovery",
  	children: [
  		{
  			path: '/',
  			name: 'Index',
  			component: () =>
  			  import( "../views/recovery/RecoveryIndex.vue"),
  		},
  		{
  			path: "btn",
  			name: "Btn",
  			component: () =>
  			  import( "../views/recovery/RecoveryBtn.vue"),
  		},
  		
  	],
	component: () =>
	  import( "../views/recovery/Recovery.vue"),
	},
	{
	  path: "/path",
	  name: "Path",
	  children:[
		{
			path: "/",
			name: "path-index",
			component: () =>
			  import("../views/path/Path-index.vue"),
		},
		{
			path: "path-list",
			name: "path-list",
			component: () =>
			  import("../views/path/Path_list.vue"),
		},
	  ],
	  component: () =>
		import("../views/Path.vue"),
	},
	{
	  path: "/order",
	  name: "Order",
	  meta: {
		  keepAlive: true
	  },
	  component: () =>
		import("../views/Order.vue"),
	},
	{
	  path: "/payment",
	  name: "Payment",
	  component: () =>
		import("../views/Payment.vue"),
	}
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// 设置导航守卫（比如：在未登录状态时，点击地址管理，其实是访问了地址管理接口的，是不正确的，所以要设置导航守卫限制这类访问）
router.beforeEach((to, from, next) => {
		let nextRoute = ['Payment','Car','Path','Order','path-index','path-list'];		//这些参数表示未登录不允许访问的页面
		// 判断是否是登录中
		let userInfo = JSON.parse(localStorage.getItem('teaUserInfo'))
	 
		//当前进入的页面，是不是需要验证哪些页面
		if(  nextRoute.indexOf( to.name ) >= 0  ){
			if( !userInfo ){			//未登录
				router.push('/login');
			}
		}
		
		next();
})

export default router;
