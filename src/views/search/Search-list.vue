<template>
  <div id="search-list">
    <div class="headers">
      <Header></Header>
      <ul>
        <li v-for="(item, index) in searchList.data" :key="index" @click="changeTab(index)">
          <div :class="searchList.currentIndex == index ? 'active' : ''">
            <!-- 根据两者比较判断谁默认高亮 -->
            {{item.name}}
          </div>
          <div class="search-silter" v-if="index != 0">
            <!-- index不等于0就展示上下箭头 -->
            <i class="iconfont" :class="item.status == 1 ? 'active' : ''">&#xe604;</i>
            <i class="iconfont" :class="item.status == 2 ? 'active' : ''">&#xe605;</i>
          </div>
        </li>
      </ul>
    </div>
    <section>
      <ul v-if="goodsList.length">
        <li v-for="(item, index) in goodsList" :key="index">
          <img v-lazy="item.imgUrl" alt="">
          <h3>{{item.name}}</h3>
          <div class="price">
            <div>
              <span>￥</span>
              <b>{{item.price}}</b>
            </div>
            <div>立即购买</div>
          </div>
        </li>
      </ul>
      <div v-else class="none">暂无数据...</div>
    </section>
    <Tabbar></Tabbar>
  </div>
</template>

<script>
import Header from "@/components/search/Header";
import Tabbar from "@/components/common/Tabbar";
import http from "@/common/api/request.js";

export default {
  name: "list",
  data() {
    return {
      goodsList: [],
      searchList: {
        currentIndex: 0,
        data: [
          /* 
					 status: 0	都不亮
					 status: 1	上箭头亮
					 status: 2	下箭头亮
					 */
          { name: "综合", key: "zh" },
          { name: "价格", status: 0, key: "price" },
          { name: "销量", status: 0, key: "num" },
        ],
      },
    };
  },
  computed: {
    orderBy() {
      //知道当前是哪一个对象
      let obj = this.searchList.data[this.searchList.currentIndex];
      //针对于状态，判断是升序还是降序
      let val = obj.status == "1" ? "asc" : "desc";
      return {
        [obj.key]: val,
      };
    },
  },
  components: {
    Header,
    Tabbar,
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      http
        .$axios({
          url: "/api/goods/shopList",
          params: {
            searchName: this.$route.query.key,
            ...this.orderBy,
          },
        })
        .then((res) => {
          this.goodsList = res;
        });
    },
    changeTab(index) {
      // 点击某个选项，使currentIndex赋值为该选项的下标
      this.searchList.currentIndex = index;
      // 点击的下标对应数据的哪一个
      let item = this.searchList.data[index];
      // console.log(item)
      // 取消所有的状态值，让所有的选项的status都为0
      this.searchList.data.forEach((v, i) => {
        if (i != index) {
          v.status = 0;
        }
      });
      // 当前点击的改变状态
      // item.status = item.status == 1 ? 2 : 1
      if (index == this.searchList.currentIndex) {
        item.status = item.status == 1 ? 2 : 1;
      }

      // 发送请求根据点击的是上箭头还是下箭头，进行数据排序，最后渲染
    },
  },
  watch: {
    // 当路由发生了跳转时，可继续进行搜索
    $route() {
      this.getData();
    },
  },
};
</script>

<style scoped lang='scss'>
#search-list {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.headers ul {
  display: flex;
  justify-content: space-around;
  font-size: 0.426667rem;
  padding: 0.4rem 0;
  li {
    display: flex;
    align-items: center;
    div {
      padding: 0 0.08rem;
    }
    .search-silter {
      display: flex;
      flex-direction: column;
    }
    i {
      font-size: 0.164512rem;
    }
  }
}

section {
  flex: 1;
  overflow: hidden;
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

section .none {
  color: #999;
  margin-top: 50%;
  margin-left: 35%;
  /* padding-left: 0.98rem; */
}

section ul li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.266667rem;
  box-sizing: border-box;
  width: 50%;
  h3 {
    padding: 0.133333rem;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.4rem;
    font-weight: 400;
    color: #222;
  }
  .price {
    display: flex;
    justify-content: space-between;
    padding: 0.266667rem 0;
    width: 100%;
    font-size: 0.373333rem;
  }
}

section ul li .price div:first-child {
  color: #b0352f;
}

section ul li .price div:first-child b {
  font-weight: 400;
  font-size: 0.48rem;
}

section ul li .price div:last-child {
  padding: 0.08rem 0.186667rem;
  border-radius: 0.133333rem;
  color: #fff;
  background-color: #b0352f;
}

section ul li img {
  width: 4.533333rem;
  height: 4.533333rem;
}

section ul li img[lazy="loading"] {
  background-color: #f7f7f7;
}

.active {
  color: firebrick;
}
</style>