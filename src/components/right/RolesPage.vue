<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色按钮 -->
          <el-button 
          type="primary" 
          @click="addDialogVisible = true"
          >添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <pre>
              {{scope.row}}
            </pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div>
              <!-- 修改角色按钮 -->
              <el-button 
                type="primary" 
                icon="el-icon-edit" 
                size="mini"
                @click="showEditDialog(scope.row.id)"
              >编辑</el-button>
              <el-button 
              type="danger" 
              icon="el-icon-delete" 
              size="mini"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button>
              <el-button 
              type="warning" 
              icon="el-icon-setting" 
              size="mini"
              >分配权限</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改角色信息 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="aditDialogClosed"
    >
    <!-- 修改角色信息表单 -->
      <el-form :model="editForm1" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm1.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm1.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确定和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @closed = "addRolesClosed"
      >
      <div>
        <el-form ref="addFormRef" :rules="addRolesRules" :model="addForm" label-width="80px">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data(){
      return {
        roleList:[],
        editForm1:{},
        editDialogVisible:false,
        editFormRules:{
          roleName:[
            {required:true,message:'请输入角色名',triggle:'blur'},
            {min:2,max:10,message:'角色名在2-10个字符之间'}
          ],
          roleDesc:[
            {required:true,message:'请输入角色描述',triggle:'blur'},
            {min:3,max:10,message:'角色描述在3-10个字符之间',triggle:'blur'}
          ]
        },
        addForm:{
          roleName:'',
          roleDesc:'',
        },
        addDialogVisible:false,
        addRolesRules:{
          roleName:[
            {required:true,message:'请输入角色名',triggle:'blur'},
            {min:2,max:10,message:'角色名在2-10个字符之间'}
          ],
          roleDesc:[
            {required:true,message:'请输入角色描述',triggle:'blur'},
            {min:3,max:10,message:'角色描述在3-10个字符之间',triggle:'blur'}
          ]
        }
      }
    },
    created(){
      // 当页面加载时获取到所有数据
      this.getRoleList()
    },
    methods:{
      async getRoleList(){
        const {data:res} = await this.$http.get('roles')
        if(res.meta.status !==200){
          return this.$message.error('获取用户数据失败！请重试！')
        }
        this.roleList = res.data
      },
      // 查询角色信息
      async showEditDialog(id){
        const {data:res} = await this.$http.get('roles/' + id)
        if(res.meta.status!==200){
          return this.$message.error('查询角色信息失败！请重试！')
        }
        this.editForm1 = res.data
        console.log(this.editForm1);
        this.editDialogVisible = true
      },
      // 关闭时重置表单数据
      aditDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      editRolesInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          if(!valid) return
          // 发起修改角色信息的请求
          const {data:res} = await this.$http.put(`roles/${this.editForm1.roleId}`,{roleName:this.editForm1.roleName,roleDesc:this.editForm1.roleDesc})
          console.log(res);
          if(res.meta.status != 200){
            return this.$message.error('修改角色信息失败！')
          }
          this.editDialogVisible = false
          this.getRoleList()
          this.$message.success('修改角色信息成功！')
        })
      },
      // 通过id删除角色
      async removeRoleById(id){
        const conformResult = await this.$confirm('此操作将永久删除该角色，是否继续？','提示',{
          confirmButtonText:'确定',
          cancelButtonText:'取消',
          type:'warning'
        }).catch(err=>err)
        if(conformResult !== 'confirm'){
          return this.$message.info('已取消删除！')
        }
        const {data:res} = await this.$http.delete('roles/' + id)
        if(res.meta.status!== 200){
          return this.$message.error('删除角色失败！')
        }
        // 提示删除成功
        this.$message.success('删除角色成功！')
        // 重新获取角色信息并展示
        this.getRoleList()
      },
      addRole(){
        this.$refs.addFormRef.validate(async valid=>{
          if(!valid) return
          const {data:res} = await this.$http.post('roles',this.addForm)
          if(res.meta.status!==201){
            return this.$message.error('添加角色失败！')
          }
          this.$message.success('添加角色成功！')
          this.addDialogVisible = false
          this.getRoleList()
        })
      },
      addRolesClosed(){
        this.$refs.addFormRef.resetFields()
      }
    }
  }
</script>

<style>

</style>