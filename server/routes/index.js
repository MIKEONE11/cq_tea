var express = require('express');
var router = express.Router();
var connection = require('../db/sql.js')
var user = require('../db/userSql.js')
var QcloudSms = require("qcloudsms_js");	//SDK引入
let jwt = require('jsonwebtoken');

// 引入支付宝配置文件
const alipaySdk = require('../db/alipay.js');
const AlipayFormData = require('alipay-sdk/lib/form').default;
// 引入axios
let axios = require('axios')

// 解除token过期时间
function getTimeToken( exp ){
    let getTime = parseInt(  new Date().getTime() / 1000 );		//获取到当前时间戳
    console.log(getTime,exp);
    return  getTime - exp  >  60*3600 
} 

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

// 支付状态
router.post('/api/successPayment',function(req,res,next){
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	// 订单号
	let out_trade_no = req.body.out_trade_no;	
	let trade_no = req.body.trade_no;
	
	// 支付宝配置
	// 开始对接支付宝API
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	//支付时的信息
	formData.addField('bizContent', {
		out_trade_no,
		trade_no 
	});
	
	//返回promise
	const result = alipaySdk.exec(
	  'alipay.trade.query',
	  {},
	  { formData: formData },
	);
	// 后端请求支付宝
	result.then(resData=> {
		axios({
			method: 'GET',
			url: resData
		}).then(data => {
			let responseCode = data.data.alipay_trade_query_response;
			if(  responseCode.code == '10000' ){
				switch(  responseCode.trade_status  ){
					case 'WAIT_BUYER_PAY':
	                    res.send({
	                        data:{
	                            code:0,
	                            data:{
	                                msg:'支付宝有交易记录，没付款'
	                            }
	                        }
	                    })
	                break;
					case 'TRADE_CLOSED':
					    res.send({
					        data:{
					            code:1,
					            data:{
					                msg:'交易关闭'
					            }
					        }
					    })
					break;
					case 'TRADE_FINISHED':
	                    res.send({
	                        data:{
	                            code:2,
	                            data:{
	                                msg:'交易完成，不可退款'
	                            }
	                        }
	                    })
	                break;
					case 'TRADE_SUCCESS':
						connection.query(`select * from user where tel = ${tokenObj.tel}`,function(error,results){
							// 用户id
							let uId = results[0].id;
							connection.query(`select * from store_order where uId = ${uId} and order_id = ${out_trade_no}`, function(err,result) {
								let id = result[0].id;
								// 订单的状态从2=>3
								connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`, function(){
									res.send({
									    data:{
									        code:2,
									        data:{
									            msg:'交易完成'
									        }
									    }
									})
								})
							})
						})
	                break;
				}
			}else if(responseCode.code == '40004') {
				res.send({
					data: {
						code: 4,
						msg: '交易不存在'
					}
				})
			}
		}).catch( err=>{
            res.send({
                data:{
                    code:500,
                    msg:'交易失败',
                    err
                }
            })
        })
	})	
})
	
	
	
	
// 发起支付
router.post('/api/payment',function(req,res,next){
	//订单号
	let orderId = req.body.orderId;
	//商品总价
	let price = req.body.price;
	//购买商品的名称
	let name = req.body.name;
	// 开始对接支付宝API
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	
	//支付时的信息
	formData.addField('bizContent', {
	  outTradeNo: orderId,//订单号
	  productCode: 'FAST_INSTANT_TRADE_PAY',//写死的
	  totalAmount: price,//价格
	  subject: name,//商品名称
	});
	
	//支付成功或者失败跳转的链接
	formData.addField('returnUrl', 'http://localhost:8080/payment');
	//返回promise
	const result = alipaySdk.exec(
	  'alipay.trade.page.pay',
	  {},
	  { formData: formData },
	);
	//对接支付宝成功，支付宝方返回的数据
	result.then(resp=>{
		res.send({
			data:{
				code:200,
				success:true,
				msg:'支付中',
				paymentUrl: resp  //resp：这里是支付页面的url链接，
			}
		})
	})
})

// 修改订单状态
router.post('/api/submitOrder',function(req,res,next){
    //token
    let token = req.headers.token;
    let tokenObj = jwt.decode(token);
    //订单号
    let orderId = req.body.orderId;
    //购物车选中的商品id
    let shopArr = req.body.shopArr;
    //查询用户
    connection.query(`select * from user where tel = ${tokenObj.tel}`,function(error,results){
        //用户id
        let uId = results[0].id;
        connection.query(`select * from store_order where uId = ${uId} and order_id = ${orderId}`,function(err,result){
            //订单的数据库id
            let id = result[0].id;
			console.log(id)
            //修改订单状态 1==>2
            connection.query(`update store_order set order_status = replace(order_status,'1','2') where id = ${id}`,function(e,r){
                //购物车数据删除
                shopArr.forEach(v=>{
                    connection.query(`delete from goods_car where id = ${v}`,function(){
                        
                    })
                })
				res.send({
				    data:{
				        code:200,
				        success:true
				    }
				})
            })
        })
    })
})

// 查询订单
router.post('/api/selectOrder',function(req,res,next){
    //接收前端给后端的订单号
    let orderId = req.body.orderId;
    connection.query(`select * from store_order where order_id='${orderId}'`,function(err,result){
         res.send({
            data:{
                 success:true,
                 code:200,
                 data:result
            }
         })
    })
})

// 生成一个订单
router.post('/api/addOrder',function(req,res,next){
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	// 前端给后端的数据
	let goodsArr = req.body.arr;
	
	// 生成订单号ord_id，规则：时间戳 + 6位随机数
	function setTimeDateFmt( s ){
		return s < 10 ? '0' + s : s
	}
	function randomNumber(){
		const now = new Date();
		let month = now.getMonth() + 1;
		let day = now.getDate();
		let hour = now.getHours();
		let minutes = now.getMinutes();
		let seconds = now.getSeconds();
		month = setTimeDateFmt(month);
		day = setTimeDateFmt(day);
		hour = setTimeDateFmt(hour);
		minutes = setTimeDateFmt(minutes);
		seconds = setTimeDateFmt(seconds);
		let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000 )).toString();
		return orderCode;
	}
	//商品列表名称
	let goodsName = [];
	//订单商品总金额
	let goodsPrice = 0;
	//订单商品总数量
	let goodsNum = 0;
	//订单号
	let orderId = randomNumber();
	
	goodsArr.forEach(v=>{
		goodsName.push( v.goods_name );
		goodsPrice += v.goods_price * v.goods_num;
		goodsNum += parseInt(v.goods_num);
	})
	
	//查询当前用户
	connection.query(`select * from user where tel = ${tokenObj.tel}`,function(error,results){
		//用户id
		let uId = results[0].id;
		connection.query(`insert into store_order (order_id,goods_name,goods_price,goods_num,order_status,uId) values ('${ orderId }','${goodsName}','${goodsPrice}','${goodsNum}','1',${uId})`,function(){
			connection.query(`select * from store_order where uId = ${uId} and order_id='${orderId}'`,function(err,result){
				 res.send({
					 data:{
						 success:true,
						 code:200,
						 data:result
					 }
				 })
			})
		})
	})
})

// 删除收货地址
router.post('/api/deleteAddress',function(req,res,next){
    let id = req.body.id;
    connection.query(`delete from address where id = ${id}`,function(error,results){
        res.send({
            data:{
                code:200,
                success:true,
                msg:'删除成功'
            }
        })
    })
})

// 修改收获地址
router.post('/api/updateAddress',function(req,res,next){
    //token
    let token = req.headers.token;
    let tokenObj = jwt.decode(token);
    //拿到前端给后端传入的数据
    let body = req.body;
    let [id,name,tel,province,city,county,addressDetail,isDefault,areaCode] = [
        body.id,
        body.name,
        body.tel,
        body.province,
        body.city,
        body.county,
        body.addressDetail,
        body.isDefault,
        body.areaCode
    ];
    //查询用户
    connection.query(`select * from user where tel = ${tokenObj.tel}`,function(error,results){
        //用户id
        let uId = results[0].id;
        //对应查询到0 或者 1 有没有默认收货地址
        connection.query(`select * from address where uId = ${uId} and isDefault = ${isDefault}`,function(err,result){
            if( result.length > 0 ){
                let addressId = result[0].id;
                connection.query(`update address isDefault = replace(isDefault,'1','0') where id = ${addressId}`,function(e,r){
                    let updateSql = `update address set uId = ? , name = ? , tel = ? , province = ? , city = ? ,county = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
                    connection.query(updateSql,[uId,name,tel,province,city,county,addressDetail,isDefault,areaCode],function(errors,datas){
                        res.send({
                            data:{
                                code:200,
                                success:true,
                                msg:'修改成功'
                            }
                        })
                    })
                })
            }else{
                let updateSql = `update address set uId = ? , name = ? , tel = ? , province = ? , city = ? ,county = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
                connection.query(updateSql,[uId,name,tel,province,city,county,addressDetail,isDefault,areaCode],function(errors,datas){
                    res.send({
                        data:{
                            code:200,
                            success:true,
                            msg:'修改成功'
                        }
                    })
                })
            }
        })
    })
})

//查询收货地址
router.post('/api/selectAddress',function(req,res,next){
    //token
    let token = req.headers.token;
    let tokenObj = jwt.decode(token);
    //查询用户
    connection.query(`select * from user where tel = ${tokenObj.tel}`,function(error,results){
        //用户id
        let uId = results[0].id;
        connection.query(`select * from address where uId = ${uId}`,function(err,result){
            res.send({
                data:{
                    code:200,
                    success:true,
                    msg:'查询成功',
                    data:result
                }
            })
        })
    })
})

// 新增收获地址
router.post('/api/addAddress', function(req, res, next){
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	//拿到前端给后端传入的数据
	let body = req.body;
	let [name,tel,province,city,county,addressDetail,isDefault,areaCode] = [
		body.name,
		body.tel,
		body.province,
		body.city,
		body.county,
		body.addressDetail,
		body.isDefault,
		body.areaCode
	];
	//console.log(tokenObj)		{ tel: '13970773711', iat: 1670406238, exp: 1670406298 }
	//查询用户
	connection.query(`select * from user where tel=${tokenObj.tel}`,function(error,results){
		//用户id
		let uId = results[0].id;
		// 增加一条收货地址
		if(isDefault != 1) {
			connection.query(`insert into address (uId,name,tel,province,city,county,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${province}","${city}","${county}","${addressDetail}","${isDefault}","${areaCode}")`,function(){
				res.send({
					data:{
						code:200,
						success:true,
						msg:'收货地址添加成功', 
					}
				})
			})
		} else {
			connection.query(`select * from address where uId=${uId} and isDefault = ${isDefault}`,(err, result) => {
				if(result.length > 0) {
					let addressId = result[0].id
					connection.query(`update address set isDefault = replace(isDefault, '1', '0') where id = ${addressId}`, (e,r) => {
						connection.query(`insert into address (uId,name,tel,province,city,county,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${province}","${city}","${county}","${addressDetail}","${isDefault}","${areaCode}")`,function(e,r){
							res.send({
								data:{
									code:200,
									success:true,
									msg:'收货地址添加成功'
								}
							})
						})
					})
				} else {
					connection.query(`insert into address (uId,name,tel,province,city,county,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${province}","${city}","${county}","${addressDetail}","${isDefault}","${areaCode}")`,function(){
						res.send({
							data:{
								code:200,
								success:true,
								msg:'收货地址添加成功', 
							}
						})
					})
				}
			})
		}
	})
})

// 修改购物车数量
router.post('/api/updateNum', function(req, res, next){
	let id = req.body.id;
	let changeNum = req.body.num;
	connection.query(`select * from goods_car where id=${id}`,(error, results) => {
		let num = results[0].goods_num;
		connection.query(`update goods_car set goods_num = replace(goods_num, ${num}, ${changeNum}) where id = ${id}`, (err, result)=> {
			res.send({
				data: {
					code: 200,
					success: true
				}
			})
		})
	})
})

// 删除购物车数据
router.post('/api/deleteCar', function(req, res, next){
	let arrId = req.body.arrId;
	    
	for(let i=0;i<arrId.length;i++){
		connection.query(`delete from goods_car where id = ${arrId[i]}`,function(error,results){
			res.send({
				data:{
					code:200,
					success:true,
					msg:'删除成功'
				}
			})
		})
	}
})

// 查询购物车
router.post('/api/selectCar', function(req, res, next){
	// token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	
	// 查询用户
	connection.query(`select * from user where tel=${tokenObj.tel}`,function(error, results) {
		// 用户id
		let uId = results[0].id
		// 查询购物车
		connection.query(`select * from goods_car where uId=${uId}`, (error, result) => {
			res.send({
				data: {
					caode: 200,
					success: true,
					data: result
				}
			})
		})
	})
})

// 添加购物车数据
router.post('/api/addCar', function(req, res, next) {
	// 后端接收前端的参数
	let goodsId = req.body.goodsId;
	
	// token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	
	 //如果执行，就证明token过期了
	if(  getTimeToken(tokenObj.exp) ){
		res.send({
			data:{
				code:1000
			}
		})
	}
	
	// 查询用户
	connection.query(`select * from user where tel=${tokenObj.tel}`,function(error, results) {
		// 用户id
		let uId = results[0].id
		// 查询商品
		connection.query(`select * from like_detail where id=${goodsId}`, function(err, result) {
			let goodsName = result[0].name;
			let goodsPrice = result[0].price;
			let goodsImgUrl = result[0].imgUrl;
			
			// 查询当前用户在之前是否添加过本商品
			connection.query(`select * from goods_car where uId = ${uId} and goods_id=${goodsId}`,function(e,r) {
				if(r.length > 0) {
					let num = r[0].goods_num
					// 用户之前是添加过该商品到购物车
					connection.query(`update goods_car set goods_num=replace(goods_num,${num},${parseInt(num) + 1} ) where id = ${r[0].id}`,function(e,data) {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '添加成功'
							}
						})
					})
				}else{
					// 如果没有就新增
					connection.query(`insert into goods_car (uId, goods_id, goods_name, goods_price, goods_num, goods_imgUrl) values ("${uId}", "${goodsId}", "${goodsName}", "${goodsPrice}", "1", "${goodsImgUrl}")`,() => {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '添加成功'
							}
						})
					})
				}
			})
			
			
		})
	})
	
	
})

// 修改密码
router.post('/api/recovery', function(req, res, next) {
	let params = {
		userTel: req.body.phone,
		userPwd: req.body.pwd
	}
	connection.query(user.queryUserTel(params), (error, results) =>{
		// 某一条记录数id
		let id = results[0].id
		let pwd = results[0].pwd
		connection.query(`update user set pwd=replace(pwd,'${pwd}','${params.userPwd}') where id=${id}`,function(err,result) {
			res.send({
				code:200,
				data:{
					success:true,
					msg:'修改成功'
				}
			})
		})
	})
});

// 查询用户是否存在
router.post('/api/selectUser', (req, res, next) => {
	let params = {
		userTel: req.body.phone
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, results) =>{
		if(results.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true,
				}
			})
		}else {
			res.send({
				code: 0,
				data: {
					success: false,
					msg: '此用户不存在'
				}
			})
		}
	})
})

// 注册
router.post('/api/register', (req, res, next) => {
	let params = {
		userTel: req.body.phone,
		userPwd: req.body.pwd
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, results) => {
		if(error) throw error;
		if(results.length > 0) {
			// 用户存在
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '用户已存在',
					data: results[0]
				}
			})
		} else {
			// 不存在，新增一条数据
			connection.query(user.insertData(params), (err, result) => {
				// 新增一条用户数据后再次查询这条用户数据
				connection.query(user.queryUserTel(params), function(e, r) {
					if(error) throw error;
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '注册成功',
							data: r[0]
						}
					})
				})
			})
		}
	})
})

// 增加一个用户
router.post('/api/addUser', (req, res, next) => {
	let params = {
		userTel: req.body.phone
	}
	
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), (error, results) => {
		if(error) throw error;
		if(results.length > 0) {
			// 用户存在
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '登录成功',
					data: results[0]
				}
			})
		} else {
			// 不存在，新增一条数据
			connection.query(user.insertData(params), (err, result) => {
				// 新增一条用户数据后再次查询这条用户数据
				connection.query(user.queryUserTel(params), function(e, r) {
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '登录成功',
							data: r[0]
						}
					})
				})
			})
		}
	})
})

// 发送短信验证码
router.post('/api/code', (req, res, next) => {
	// 接收用户手机号
	let tel = req.body.phone;
	
	// 短信应用SDK AppID
	var appid = 1400187558;  // SDK AppID是1400开头
	
	// 短信应用SDK AppKey
	var appkey = "dc9dc3391896235ddc2325685047edc7";
	
	// 需要发送短信的手机号码
	var phoneNumbers = [tel];
	
	// 短信模板ID，需要在短信应用中申请
	var templateId = 285590;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
	
	// 签名
	var smsSign = "三人行慕课";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`
	
	// 实例化QcloudSms
	var qcloudsms = QcloudSms(appid, appkey);
	
	// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
	function callback(err, ress, resData) {
	    if (err) {
	        console.log("err: ", err);
	    } else {
			res.send({
				code: 200,
				data: {
					success: true,
					data: ress.req.body.params[0]
				}
			})
	    }
	}
	// 指定模板ID单发短信
	var ssender = qcloudsms.SmsSingleSender();
	//这个变量：params 就是往手机上，发送的短信
	var params = [Math.floor( Math.random()*(9999-1000))+1000];		//Math.floor() 向下取整，如Math.floor(0.3)=0；生成4位随机数
	ssender.sendWithParam(86, phoneNumbers[0], templateId,
	  params, smsSign, "", "", callback);  // 签名参数不能为空串
})

// 登录
router.post('/api/login', function(req, res, next) {
	// // 后端要接收前端传递过来的值
	let params = {
		userTel: req.body.userTel,
		userPwd: req.body.userPwd
	}
	// 
	let userTel = params.userTel;
	let userPwd = params.userPwd  || '666666';
	//引入token包
	let jwt = require('jsonwebtoken');
	//用户信息
	let payload = {tel:userTel};
	//口令
	let secret = 'xiaoluxian';
	//生成token
	let token = jwt.sign(payload,secret,{
		expiresIn:6000
	});
	
	
	// 查询用户手机号是否存在
	connection.query(user.queryUserTel(params), function(error, results) {
		// 手机号存在
		if(results.length > 0) {	
			// 记录的id
			let id = results[0].id;
			connection.query(user.queryUserPwd(params), function(err, result) {
				if(result.length > 0) {
					 connection.query(`update user set token = '${token}' where id = ${id}`,function(){
						 // 手机号和密码都正确
						 res.send({
						 	code: 200,
						 	data: {
						 		success: true,
						 		msg: '登录成功',
						 		data: result[0]
						 	}
						 })
					 })
					
				}else{
					// 密码错误
					res.send({
						code: 302,
						data: {
							success: false,
							msg: '密码错误'
						}
					})
				}
			})
		}else {
			// 手机号不存在
			res.send({
				code: 301,
				data: {
					success: false,
					msg: '手机号不存在'
				}
			})
		}
	})
});

// 查询商品id的数据
router.get('/api/goods/id', function(req, res, next) {
	let id = req.query.id			// 接收传过来的id
	connection.query("select * from like_detail where id=" + id + "", function (error, results) {
		res.send({
			code: 0,
			data: results[0]
		})
		
	})
})

// 分类的数据
router.get('/api/goods/list', function(req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				// 一级：
				id: 0,
				name: '推荐',
				data: [
					{
						// 二级
						id: 0,
						name: '推荐',
						list: [
							// 三级
							{
								id: 0,
								name: '铁观音',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '紫砂壶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '金骏眉',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '绿茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 4,
								name: '武夷岩茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 5,
								name: '龙井',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 6,
								name: '云南滇红',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 7,
								name: '建盏',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 1,
				name: '绿茶',
				data: [
					{
						// 二级
						id: 0,
						name: '绿茶',
						list: [
							// 三级
							{
								id: 0,
								name: '龙井',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '黄山毛峰',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '碧螺春',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '雀舌',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 4,
								name: '太平猴魁',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 5,
								name: '珍惜白茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 6,
								name: '乐安瓜片',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 2,
				name: '乌龙',
				data: [
					{
						// 二级
						id: 0,
						name: '乌龙',
						list: [
							// 三级
							{
								id: 0,
								name: '永春佛手',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '铁观音',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '武夷岩茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '漳平水仙',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 3,
				name: '红茶',
				data: [
					{
						// 二级
						id: 0,
						name: '红茶',
						list: [
							// 三级
							{
								id: 0,
								name: '英德红茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '坦洋工夫',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '金骏眉',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '正山小种',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 4,
								name: '云南滇红',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 5,
								name: '祁门红茶',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 4,
				name: '白茶',
				data: [
					{
						// 二级
						id: 4,
						name: '白茶',
						list: [
							// 三级
							{
								id: 0,
								name: '白牡丹',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '牡丹王',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '白毫银针',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '寿眉',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 5,
				name: '普洱',
				data: [
					{
						// 二级
						id: 0,
						name: '普洱',
						list: [
							// 三级
							{
								id: 0,
								name: '生茶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '熟茶',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
			{
				// 一级：
				id: 5,
				name: '茶具',
				data: [
					{
						// 二级
						id: 0,
						name: '茶具',
						list: [
							// 三级
							{
								id: 0,
								name: '茶宠',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 1,
								name: '紫砂壶',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 2,
								name: '建盏',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 3,
								name: '功夫茶具',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 4,
								name: '茶具配件',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 5,
								name: '主人杯',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 6,
								name: '干泡茶具',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 7,
								name: '旅行茶具',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 8,
								name: '整套茶具',
								imgUrl: '/img/t1.jpeg'
							},
							{
								id: 9,
								name: '茶盘',
								imgUrl: '/img/t1.jpeg'
							}
						]
					}
				]
			},
		]
	})
});

//查询商品数据接口
router.get('/api/goods/shopList', function (req, res, next) {
	// 前端给后端的数据
	let [searchName,orderName] = Object.keys(req.query);
	let [name,order] = Object.values(req.query);

	connection.query('select * from goods_list where name like "%'+name+'%" order by '+orderName+' '+order+'',function(error,results){
		res.send({
			code:0,
			data:results
		})
		console.log(results)	
	})
})

// 首页铁观音数据
router.get('/api/index_list/2/data/1', function(req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id:1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: 'img/tgy.jpeg'
					},
					{
						id: 1,
						imgUrl: 'img/tgy.jpeg'
					},
				]
			},
			{
				id:2,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					},
					{
						id: 2,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					},
					{
						id: 3,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					}
				]
			}
		]
	});
});

// 首页大红袍数据
router.get('/api/index_list/1/data/1', function(req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id:1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: '/img/dhp.jpeg'
					},
					{
						id: 2,
						imgUrl: '/img/dhp.jpeg'
					},
				]
			},
			{
				id:2,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					},
					{
						id: 2,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					},
					{
						id: 3,
						imgUrl: '/img/like.jpeg',
						name: '建阳红色芝麻毫建盏茶具',
						price: '399'
					}
				]
			}
		]
	});
});

// 首页推荐数据
router.get('/api/index_list/0/data/1', function(req, res, next) {
	res.send({
		code: 0,
		data: {
			topBar: [
			  {id:0,label:'推荐'},
			  {id:1,label:'大红袍'},
			  {id:3,label:'铁观音'},
			  {id:4,label:'金骏梅'},
			  {id:5,label:'绿茶'},
			  {id:6,label:'紫砂壶'},
			  {id:7,label:'漳平水仙'},
			],
			data: [
				//这是swiper
				{
					id:0,
					type:'swiperList',
					data:[
						{id:0,imgUrl:'img/swiper1.jpeg'},
						{id:1,imgUrl:'img/swiper2.jpeg'},
						{id:2,imgUrl:'img/swiper3.jpeg'}
					]
				},
				// 这是icons
				{
					id:1,
					type: 'iconList',
					data: [
						{
							id: 1,
							title: '自茶饮',
							imgUrl: './img/icons1.png'
						},
						{
							id: 2,
							title: '品牌茶',
							imgUrl: './img/icons2.png'
						},
						{
							id: 3,
							title: '茶具',
							imgUrl: './img/icons3.png'
						},
						{
							id: 4,
							title: '领福利',
							imgUrl: './img/icons4.png'
						},
						{
							id: 5,
							title: '官方验证',
							imgUrl: './img/icons5.png'
						}
					]
				},
				// 爆款推荐
				{
					id:2,
					type: 'recommendList',
					data:[
						{
							id:1,
							name:'龙井1號铁罐250g',
							content:'鲜爽甘醇 口粮首选',
							price:'68',
							imgUrl:'./img/recommend.jpeg'
						},
						{
							id:2,
							name:'龙井1號铁罐250g',
							content:'鲜爽甘醇 口粮首选',
							price:'68',
							imgUrl:'./img/recommend.jpeg'
						}
					]
				},
				// 猜你喜欢
				{
					id:3,
					type: 'likeList',
					data: [
						{
							id: 1,
							imgUrl: '/img/like.jpeg',
							name: '建阳红色芝麻毫建盏茶具',
							price: '399'
						},
						{
							id: 2,
							imgUrl: '/img/like.jpg',
							name: '早春珍惜白茶',
							price: '258'
						},
						{
							id: 3,
							imgUrl: '/img/goods4.jpg',
							name: '明前一级春茶龙井破春',
							price: '98'
						},
						{
							id: 4,
							imgUrl: '/img/goods1.jpg',
							name: '武夷山高级大红袍2号',
							price: '99'
						},
						{
							id: 5,
							imgUrl: '/img/goods3.jpg',
							name: '漳平水仙兰香1号',
							price: '99'
						},
						{
							id: 6,
							imgUrl: '/img/like3.jpeg',
							name: '建阳红色芝麻毫建盏茶具',
							price: '399'
						},
						{
							id: 7,
							imgUrl: '/img/like4.jpg',
							name: '2022明前碧螺春',
							price: '138'
						},
						{
							id: 8,
							imgUrl: '/img/like6.jpg',
							name: '建阳红色芝麻毫建盏茶具',
							price: '259'
						},
						{
							id: 9,
							imgUrl: '/img/like7.jpg',
							name: '武夷山高级大红袍2号',
							price: '89'
						},
						{
							id: 10,
							imgUrl: '/img/like11.jpg',
							name: '建阳青目小黑滴建盏茶具',
							price: '399'
						},
						{
							id: 11,
							imgUrl: '/img/like10.jpeg',
							name: '三色快客杯',
							price: '59'
						},
						{
							id: 12,
							imgUrl: '/img/like13.jpeg',
							name: '便携式恒温茶具套组',
							price: '268'
						},
						{
							id: 13,
							imgUrl: '/img/like14.jpeg',
							name: '高山流水陶瓷旅行茶具',
							price: '399'
						},
						{
							id: 14,
							imgUrl: '/img/like15.jpeg',
							name: '牛步青云旅行茶具',
							price: '99'
						},
						{
							id: 15,
							imgUrl: '/img/like16.jpeg',
							name: '四角排水伸缩',
							price: '329'
						}	
					]
				}
			]
		}
	})
});

module.exports = router;
