<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="150"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="160"
        ></el-table-column>
        <el-table-column label="状态" width="180">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <div>
                <!-- 修改按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserById(scope.row.id)"
              ></el-button>
              <!-- 分配角色按钮 -->
              <el-tooltip
                effect="dark"
                content="分配角色"
                placement="top"
                :enterable="false"
              >
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                ></el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加用户对话框内容主体 -->
      <span>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>

          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <!-- 添加用户对话框的取消按钮 -->
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <!-- 添加用户对话框的确定按钮 -->
        <el-button type="primary" @click="addUser"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    
    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="aditDialogClosed"
    >
      <!-- 修改用户信息表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule,value,callback) =>{
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)){
        // 如果校验成功，则证明是合法的邮箱，返回callback
        return callback()
      }
      // 如果校验失败，则调用callback函数并new一个Error()错误对象
      callback(new Error('请输入正确的邮箱！'))
    }

    // 验证手机的规则
    var checkMobile = (rule,value,callback)=>{
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if(regMobile.test(value)){
        return callback()
      }
      callback(new Error('请输入正确的手机号！'))
    }

    // 密码的校验规则
    var checkPassword = (rule,value,callback)=>{
      const regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{1,50}$/
      if(regPassword.test(value)){
        return callback()
      }
      callback(new Error('密码必须是字母和数字的组合！'))
    }

    return {
      // 获取用户列表对象参数
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 4,
      },
      userList: [],
      total: 0,
      // 控制添加用户的对话框的显示与隐藏
      addDialogVisible:false,
      // 添加用户的表单数据
      addForm: {
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      // 添加表单的验证规则对象
      addFormRules:{
        username:[
          {required:true,message:'请输入用户名',triggle:'blur'},
          {min:3,max:10,message:'用户名长度在3-10个字符之间',triggle:'blur'}
        ],
        password:[
          {required:true,message:'请输入密码',triggle:'blur'},
          {min:6,max:15,message:'用户名长度在6-15个字符之间',triggle:'blur'},
          {validator:checkPassword,triggle:'blur'}
        ],
        email:[
          {required:true,message:'请输入邮箱',triggle:'blur'},
          {validator:checkEmail,triggle:'blur'}
        ],
        mobile:[
          {required:true,message:'请输入手机号',triggle:'blur'},
          {validator:checkMobile,triggle:'blur'}
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible:false,

      // 查询到的用户信息对象
      editForm:{},

      // 修改用户验证规则
      editFormRules:{
        email:[
          {required:true,message:'请输入邮箱',triggle:'blur'},
          {validator:checkEmail,triggle:'blur'}
        ],
        mobile:[
          {required:true,message:'请输入手机号',triggle:'blur'},
          {validator:checkMobile,triggle:'blur'}
        ]
      }
    }
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      //  console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      //  如果获取数据成功，则为用户列表和总数赋值
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 把userInfo的状态进行立即取反，以保证页面的显示不出错
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("修改状态失败！");
      }
      this.$message.success("用户状态更新成功！");
    },
    // 监听添加用户对话框关闭事件
    addDialogClosed(){
      // 添加用户对话框关闭之后重置表单并移除校验结果
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户表单的预验证
    addUser(){
      // 先获取表单的引用对象，然后调用validate函数，参数为一个回调函数
      // 该回调函数会在校验结束后被调用
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return 
        // 如果表达那预验证通过，则可以发起真正的添加用户的网络请求
        // 请求的post函数会返回一个Promis，为了简化操作，需使用async和await
        const {data:res} = await this.$http.post('users',this.addForm)
        if(res.meta.status!==201){
          console.log(res);
          return this.$message.error('添加用户失败！请重试！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 刷新列表
        this.getUserList()
      })
    },
    // 查询用户信息
    async showEditDialog(id){
      const {data:res} = await this.$http.get(`users/${id}`)
      if (res.meta.status != 200){
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭时重置表单数据
    aditDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        // 发起修改用户信息的请求
        const {data:res} = await this.$http.put(`users/${this.editForm.id}`,{email:this.editForm.email,mobile:this.editForm.mobile})
        if(res.meta.status != 200) {
          return this.$message.error('用户信息更新失败！请重试！')
        }
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新获取数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('用户信息修改成功！')
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 如果用户点击了确认删除，则返回confirm字符串
        // 如果用户取消了删除，则返回cancel
        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除！')
        }
        const {data:res} = await this.$http.delete('users/' + id)
        if(res.meta.status!=200){
          return this.$message.err('删除用户失败！请重试！')
        }
        // 提示用户删除成功
        this.$message.success('删除用户成功！')
        // 重新获取用户信息并展示
        this.getUserList()
    }
  },
};
</script>

<style>
</style>