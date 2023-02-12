<template>
	<div id="icons">
		<ul class="icons">
			<li v-for="(item, index) in iconList" :key="index">
				<img :src="item.imgUrl" alt="">
				<span>{{item.title}}</span>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		iconList: Array
	},
	data() {
		return {
		}
	}
}
</script>

<style scoped>
.icons {
	display: flex;
	justify-content: space-around;
	padding: 0.4rem 0
}	

.icons li {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.icons img {
	width: 1.013333rem;
	height: 1.013333rem;
}

.icons span {
	padding: 0.16rem 0;
	font-size: 0.426666rem
}

</style>