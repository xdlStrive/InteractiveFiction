<template>
  <div style="width: 100%;height: calc(100vh - 70px);">
    <super-flow
      ref="superFlow"
      :node-list="nodeList"
      :link-list="linkList"
      :origin="origin"
      :graph-menu="graphMenuList"
      :node-menu="nodeMenuList"
      :enter-intercept="enterIntercept"
      :output-intercept="outputIntercept"
    >
      <template #node="{meta}">
        <div :class="`flow-node flow-node-${meta.prop}`">
          <section>{{ meta.desc }}</section>
        </div>
      </template>
    </super-flow>

    <el-dialog
      :title="drawerConf.title"
      :visible.sync="drawerConf.visible"
      :close-on-click-modal="false"
      width="500px"
    >
      <el-form
        v-show="drawerConf.type === drawerType.node"
        ref="nodeSetting"
        :model="nodeSetting"
        @keyup.native.enter="settingSubmit"
        @submit.native.prevent
      >
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="nodeSetting.name" placeholder="请输入节点名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="节点描述" prop="desc">
          <el-input v-model="nodeSetting.desc" placeholder="请输入节点描述" maxlength="30" />
        </el-form-item>
      </el-form>
      <el-form
        v-show="drawerConf.type === drawerType.link"
        ref="linkSetting"
        :model="linkSetting"
        @keyup.native.enter="settingSubmit"
        @submit.native.prevent
      >
        <el-form-item label="连线描述" prop="desc">
          <el-input v-model="linkSetting.desc" placeholder="请输入连线描述" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="drawerConf.cancel">取 消</el-button>
        <el-button type="primary" @click="settingSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="新增选择" :visible.sync="selectFormVisible" width="40%" @close="newSelectClose">
      <el-form label-width="80px">
        <el-form-item label="选择类型">
          <el-radio-group v-model="selectForm.selectType">
            <el-radio :label="0">普通选择</el-radio>
            <el-radio :label="1">重要抉择</el-radio>
            <el-radio :label="2">bad-end 结局</el-radio>
          </el-radio-group>
        </el-form-item>
        <ul>
          <li v-for="(item, index) in selectInputList" :key="index">
            <el-form-item :label="item.labelName">
              <el-input v-model="item.inputValue" />
            </el-form-item>
          </li>
        </ul>
        <el-form-item class="addSelectBox">
          <el-button type="primary" style="margin-right: 40px;" @click="addSelectInput">增加选项</el-button>
          <el-button type="success" @click="submitSelect">提交选择</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
const drawerType = {
  node: 0,
  link: 1
}

import SuperFlow from 'vue-super-flow'
import 'vue-super-flow/lib/index.css'
import { addBranch } from '@/api/branch'
import { modifyBranch } from '@/api/branch'
import { addParagraph } from '@/api/paragraph'
import { modifyChapter } from '@/api/chapter'

export default {
  name: 'TreeChart',
  components: { SuperFlow },
  props: {
    paragraphsList: {
      type: Array,
      default: function() {
        return []
      }
    },
    chapterId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      drawerType,
      drawerConf: {
        title: '',
        visible: false,
        type: null,
        info: null,
        open: (type, info) => {
          const conf = this.drawerConf
          conf.visible = true
          conf.type = type
          conf.info = info
          if (conf.type === drawerType.node) {
            conf.title = '节点'
            if (this.$refs.nodeSetting) this.$refs.nodeSetting.resetFields()
            this.$set(this.nodeSetting, 'name', info.meta.name)
            this.$set(this.nodeSetting, 'desc', info.meta.desc)
          } else {
            conf.title = '连线'
            if (this.$refs.linkSetting) this.$refs.linkSetting.resetFields()
            this.$set(this.linkSetting, 'desc', info.meta ? info.meta.desc : '')
          }
        },
        cancel: () => {
          this.drawerConf.visible = false
          if (this.drawerConf.type === drawerType.node) {
            this.$refs.nodeSetting.clearValidate()
          } else {
            this.$refs.linkSetting.clearValidate()
          }
        }
      },
      linkSetting: {
        desc: ''
      },
      nodeSetting: {
        width: 100,
        height: 50
      },
      origin: [0, 0],
      nodeList: [],
      linkList: [],
      selectParams: {
        graph: {},
        coordinate: []
      },
      graphMenuList: [ // 画布右键菜单及事件
        [
          {
            label: '段落节点',
            disable(graph) {
              return false
              // return !!graph.nodeList.find(node => node.meta.prop === 'paragraph')
            },
            selected: (graph, coordinate) => {
              const paragraph = graph.nodeList.find(node => node.meta.prop === 'paragraph')
              if (paragraph) {
                graph.addNode({
                  width: 100,
                  height: 50,
                  coordinate: coordinate,
                  meta: {
                    prop: 'paragraph',
                    name: '段落节点'
                  }
                })
              }
            }
          },
          {
            label: '选项节点',
            disable: false,
            selected: (graph, coordinate) => {
              this.selectFormVisible = true
              this.selectParams.graph = graph
              this.selectParams.coordinate = coordinate
            }
          }
        ],
        [
          {
            label: '全选',
            selected: (graph, coordinate) => {
              graph.selectAll()
            }
          }
        ]
      ],
      nodeMenuList: [
        [
          {
            label: '新增子节点',
            hidden(node) {
              return node.meta.prop === 'paragraph'
            },
            selected: (node, coordinate) => {
              this.drawerConf.open(drawerType.node, node)
            }
          }
        ], [
          {
            label: '删除',
            disable: false,
            hidden(node) {
              return node.meta.prop === ''
            },
            selected: (node, coordinate) => {
              this.$confirm('确认删除？', '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                node.remove()
                this.$message({
                  type: 'success',
                  message: '删除成功！'
                })
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除操作'
                })
              })
            }
          }
        ]
      ],
      // 新增选项弹窗
      selectFormVisible: false,
      selectForm: {
        selectType: 0
      },
      selectInputList: [{
        labelName: '选项一',
        inputValue: ''
      }]
    }
  },
  created() {
    this.initChart(this.paragraphsList)
    const nodeList = [
      {
        'id': 'node0',
        'width': 100,
        'height': 50,
        'coordinate': [155, 0],
        'meta': {
          'prop': 'paragraph',
          'desc': '选择章节'
        }
      }
    ]
    const linkList = []
    setTimeout(() => {
      this.nodeList = nodeList
      this.linkList = linkList
    }, 100)
  },
  methods: {
    initChart(data) {
      console.log(data)
      this.nodeList = []
      let nodeNum = 0
      let coordinates = [164, 0]
      for (let [index, item] of data.entries()) { // for of 数组时无法取到index，所以需要调用数组的entries方法
        if (item.content.length === 1) { // 主线段落节点
          this.nodeList.push({
            id: 'node' + (nodeNum++),
            width: '100',
            height: '50',
            coordinate: JSON.parse(JSON.stringify(coordinates)),
            meta: {
              prop: 'paragraph',
              desc: item.content[0].substring(3, 15)
            }
          })
          this.linkList.push({
            id: 'link' + nodeNum,
            startId: 'node' + (nodeNum - 1),
            endId: 'node' + nodeNum,
            startAt: [50, 50],
            endAt: [50, 0]
          })
          coordinates[1] = 80 * ++index
        } else if (item.content.length > 1) { // 选项段落节点
          coordinates[1] = 80 * index++
          let itemIndex = 0
          for (let items of item.content) {
            let paddingLeft = (428 / item.content.length - 100) / 2
            coordinates[0] = paddingLeft + (428 / item.content.length) * itemIndex
            this.nodeList.push({
              id: 'node' + (nodeNum++),
              width: '100',
              height: '50',
              coordinate: JSON.parse(JSON.stringify(coordinates)),
              meta: {
                prop: 'select',
                desc: items.substring(3, 15)
              }
            })
            itemIndex++
            this.linkList.push({
              id: 'link' + nodeNum,
              startId: 'node' + (nodeNum - itemIndex - 1),
              endId: 'node' + nodeNum,
              startAt: [50, 50],
              endAt: [50, 0]
            })
          }
          coordinates[0] = 164
          coordinates[1] = 80 * ++index
        }
      }
    },
    enterIntercept(formNode, toNode, graph) { // 限制连线进入节点
      console.log(234)
      const formType = formNode.meta.prop
      if (formType === 'select') {
        const params = {
          branch_id: formNode.id,
          paragraph_id: toNode.id
        }
        modifyBranch(params).then(res => {
          console.log(res)
        })
      }

      switch (toNode.meta.prop) {
        case 'paragraph':
          return true
        case 'select':
          return [
            'paragraph',
            'select'
          ].includes(formType)
        case 'end':
          return [
            'paragraph',
            'select'
          ].includes(formType)
        default:
          return true
      }
    },
    outputIntercept(node, graph) { // 限制节点生成连线
      return !(node.meta.prop === 'end')
    },
    settingSubmit() {
      const conf = this.drawerConf
      if (this.drawerConf.type === drawerType.node) {
        if (!conf.info.meta) conf.info.meta = {}
        Object.keys(this.nodeSetting).forEach(key => {
          this.$set(conf.info.meta, key, this.nodeSetting[key])
        })
        this.$refs.nodeSetting.resetFields()
      } else {
        if (!conf.info.meta) conf.info.meta = {}
        Object.keys(this.linkSetting).forEach(key => {
          this.$set(conf.info.meta, key, this.linkSetting[key])
        })
        this.$refs.linkSetting.resetFields()
      }
      conf.visible = false
    },
    addSelectInput() { // 增加选项方法
      const selectInputNum = this.selectInputList.length
      if (selectInputNum === 1) {
        this.selectInputList.push({
          labelName: '选项二',
          inputValue: ''
        })
      } else if (selectInputNum === 2) {
        this.selectInputList.push({
          labelName: '选项三',
          inputValue: ''
        })
      } else if (selectInputNum === 3) {
        this.selectInputList.push({
          labelName: '选项四',
          inputValue: ''
        })
      } else {
        return
      }
    },
    submitSelect() { // 提交选择方法
      this.addBranchs().then(v => {
        const branchParams = {
          selectType: this.selectForm.selectType, // 选择支的类型（一般选项、重要抉择、bad-end选项）
          selects: v
        }
        addParagraph(branchParams).then(res => {
          console.log(res)
          const paragraphsListArr = this.paragraphsList.map((val, index) => {
            return val.paragraph_id
          })
          paragraphsListArr.push(res.data.paragraph_id)
          const params = {
            chapter_id: this.chapterId,
            paragraph_list: paragraphsListArr
          }
          console.log(params)
          modifyChapter(params).then(res => {
            if (res.code === 20000) {
              this.$message({
                type: 'success',
                message: res.msg
              })
            }
          })
        })
      })
    },
    async addBranchs() { // 保存分支
      let branchIDArr = []
      for (let i in this.selectInputList) {
        let paddingLeft = (428 / this.selectInputList.length - 100) / 2
        let coordinate = [paddingLeft + (428 / this.selectInputList.length) * i, this.selectParams.coordinate[1]]
        await addBranch().then(res => {
          console.log(res)
          branchIDArr[i] = res.data.branch_id
          this.selectParams.graph.addNode({
            id: res.data.branch_id,
            width: 100,
            height: 50,
            coordinate: coordinate,
            meta: {
              prop: 'select',
              name: '选项节点',
              desc: this.selectInputList[i].inputValue
            }
          })
        })
      }
      return branchIDArr
    },
    newSelectClose() { // 新增选择弹窗的关闭事件
      this.selectInputList = this.selectInputList.slice(0, 2)
    }
  }
}
</script>

<style>
  .super-flow {
    background-color: #fff;
  }
  .super-flow__node {
    border-radius: 3px;
  }
  .flow-node {
    height: 100%;
    padding: 5px 2px;
    font-size: 14px;
  }
  .flow-node-paragraph {
    border-bottom: 5px solid #409EFF;
  }
  .flow-node-select {
    border-bottom: 5px solid #67C23A;
  }
</style>
