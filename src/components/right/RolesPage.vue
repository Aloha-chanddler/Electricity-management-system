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
          <!-- 数据列 -->
          <template slot-scope="scope">
            <el-row 
            :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']"
            v-for="(item1,i1) in scope.row.children" 
            :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                closable
                @close="removeRightById(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row 
                :class="[i2 === 0 ? '':'bdtop','vcenter']"
                v-for="(item2,i2) in item1.children" 
                :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag 
                    type="success"
                    closable
                    @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag 
                    :class="[i3 === 0 ? '':'bdtop']"
                    v-for="(item3,i3) in item2.children" 
                    :key="item3.id" 
                    type="warning"
                    closable
                    @close="removeRightById(scope.row,item3.id)"
                    >
                    {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
                
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row.children}}
            </pre> -->
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
              @click="showSetRightDialog(scope.row)"
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

    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @closed='setRightDialogClosed'
      >
      <el-tree 
      :data="rightsList" 
      :props="treeProps" 
      show-checkbox
      node-key='id'
      default-expand-all
      :default-checked-keys='defKey'
      ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data(){
      return {
        roleList:[],
        rightsList:[],
        // 定义一个roleId可以保存获取到的角色id,默认为空
        roleId:'',
        // 树形控件的属性绑定对象
        treeProps:{
          children:'children',
          label:'authName'
        },
        // 树形控件默认勾选的Id数组
        defKey:[],
        editForm1:{},
        editDialogVisible:false,
        // 控制分配权限对话框的显示与隐藏
        setRightDialogVisible:false,
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
      },
      async removeRightById(role,rightId){
        // 弹框提示用户是否要删除
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult !== 'confirm'){
          return this.$message.info('取消删除')
        }
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200){
          return this.$message.error('删除权限失败')
        }
        // 不建议重新获取角色列表
        // this.getRoleList()
        // 而是把请求的数据直接给当前角色赋值
        role.children = res.data
      },
      // 展示分配权限对话框
      async showSetRightDialog(role){
        // 先把角色的Id保存起来以供后续给角色授权时使用
        this.roleId = role.id
        // 获取角色权限的数据
        const {data:res} = await this.$http.get('rights/tree')
        if(res.meta.status!=200){
          return this.$message.error('获取权限列表失败！')
        }
        this.rightsList = res.data
        console.log(this.rightsList);
        // 在点击'分配角色权限'按钮的时候调用getLeafKeys函数
        this.getLeafKeys(role,this.defKey)
        this.setRightDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有的三级权限的id，并保存到defKey数组中
      // 该方法接收两个参数，node节点参数，arr要保存id的数组
      getLeafKeys(node,arr){
        // 判断该节点是否有children属性，如果没有则正明该节点是三级节点，直接把该节点的Id值赋值给arr数组
        if(!node.children){
          return arr.push(node.id)
        }
        // 如果node节点包含children，则证明该节点还不是三级节点，应调用递归方法，直到找到三级节点为止
        node.children.forEach(item => {
          this.getLeafKeys(item,arr)
        });
      },
      // 设置对话框关闭的时候，重置角色id数组
      setRightDialogClosed(){
        // this.setRightDialogVisible =false
        this.defKey = []
      },
      // 点击为角色分配权限
      async allotRights(){
        // 通过定义一个数组，拿到所有半选中和全选中状态下的id
        const keys = [
          // 通过引用调用getCheckedKeys函数获取到目前被选中节点的key
          ...this.$refs.treeRef.getCheckedKeys(),
          // 通过引用调用getHalfCheckedKeys函数获取到目前半选中节点的key
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // 形成以逗号拼接的字符串，才能通过网络请求发送给服务器
        const idStr = keys.join(',')
        // 发起角色授权的网络请求,请求的参数需要通过参数名为rids的请求体传递给后端
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status !== 200){
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功！')
        // 重新刷新角色权限的数据列表
        this.getRoleList()
        // 把对话框隐藏起来
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>