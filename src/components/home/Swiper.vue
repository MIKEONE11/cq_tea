<template>
	<div id="swiper">
		<swiper :options="swiperOption">
		    <swiper-slide v-for="(item, index) in swiperList" :key="index">
				<img :src="item.imgUrl" alt="">
			</swiper-slide>
		</swiper>
			<!--以下看需要添加-->
			<div class="swiper-pagination"></div> 
		
	</div>
</template>

<script>
import {swiper, swiperSlide} from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'

export default {
	name: 'Swiper',
	props: {
		swiperList: Array
	},
	components: {
		swiper,
		swiperSlide
	},
	data(){
	    return {
			swiperOption: {//swiper3
				autoplay: 3000,
				speed: 1000,
				pagination: {
					el: '.swiper-pagination' 
				}
			}
	    }
	}
}
</script>

<style scoped>
#swiper {
	position: relative;
	width: 100%;
	height: 4.4rem;
}

.swiper-container {
	width: 100%;
	height: 4.4rem;
}

#swiper img {
	width: 100%;
	height: 4.4rem;
}

.swiper-pagination {
	width: 100%;
	bottom: 0;
}

::v-deep .swiper-pagination-bullet-active {
	background: #b0352f;
}

::v-deep .swiper-pagination-bullet {
	margin: 0 0.1875rem
}
</style>