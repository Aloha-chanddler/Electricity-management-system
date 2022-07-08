<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/talogo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
        >
          <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="subItem.id + '' " v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="iconfont icon-liebiao"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区 -->
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return{
      // 准备一个空数组用于接收请求过来的菜单栏参数
      menuList:[],
      iconObj:{
        '125':'iconfont icon-yonghu1',
        '103':'iconfont icon-quanxian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-dingdan',
        '145':'iconfont icon-shujutongji'
      }
    }
  },
  // 当页面挂载后马上调用getMenuList函数，用于立即加载菜单栏信息
  created(){
    this.getMenuList()
  },
  name: "HomePage",
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      // 解构赋值用于接收响应的data数据，请求的地址'nemus'是根据API文档定义的
      const {data:res} = await this.$http.get('menus')
      // 判断如果响应的状态码不为200，则请求失败，给用户提示信息
      if(res.meta.status!==200) return this.$message.error(res.meta.msg)
      // 如果请求成功，则把res.data中的数据赋值给之前在data配置项中提前定义的menuList
      this.menuList = res.data
      // 可以打印到控制台中查看本次响应的data(res)里面的参数有哪些
      console.log(res);
    }
  },
};
</script>

<style lang='less' scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;
    > img {
      margin-right: 8px;
      margin-left: 8px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu{
  border-right: none;
}
}

.el-main {
  background-color: #eaedf1;
}

.iconfont{
  margin-right: 10px;
}


</style>