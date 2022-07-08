<template>
  <div class="login_container">
    <div class="login_box">
      <!-- logo -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区 -->
      <el-form
        ref="LoginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-yonghu"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="iconfont icon-mima"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 5,
            max: 20,
            message: "长度在 5 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetLoginForm() {
      // console.log(this);
      this.$refs.LoginFormRef.resetFields()
    },
    login(){
      // 点击登录后调用login方法，下面接着调用validate函数并传递一个valid回调函数用以校验表单项是否通过预验证，其返回值是布尔值，
      // 如果返回值为true则表示预验证通过，可以进行服务器请求，如果没通过，则不发起请求
      this.$refs.LoginFormRef.validate(async valid=>{
        // console.log(valid);
        if(!valid) return 
        // 用解构赋值把post请求返回的data属性接收到（返回的是一个Promise对象，所以要使用async和await）
        const {data:res} = await this.$http.post('login',this.loginForm)
        // console.log(res);
        // 请求返回的res里的data属性里的status属性可以判断请求是否成功，如果成功，给用户提示成功
        // 如果请求失败，给用户提示失败
        if(res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功！')
      // 将登录成功之后的token保存到客户端的sessionstorage中，
      // 项目中除了登录之外的其他API接口，必须在登录之后才能访问
      // token只应在当前网站打开期间使用，所以将token保存到客户端的session storage中
      window.sessionStorage.setItem('token',res.data.token)
      // 通过编程式导航跳转到后台主页，路由地址是/home
      this.$router.push('/home')
      })
    }
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #008c8c;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>