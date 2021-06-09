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
export default {
  name: 'TreeChart',
  components: { SuperFlow },
  props: {
    paragraphsList: {
      type: Array,
      default: function() {
        return []
      }
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
        height: 50,
        name: '',
        desc: ''
      },
      origin: [0, 0],
      nodeList: [],
      linkList: [],
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
              addBranch().then(res => {
                graph.addNode({
                  width: 100,
                  height: 50,
                  coordinate: coordinate,
                  meta: {
                    prop: 'select',
                    name: '选项节点'
                  }
                })
              })
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
              // if (node.meta.prop === 'paragraph') {

              // }
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
      ]
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
            console.log(this.linkList)
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
      const formType = formNode.meta.prop
      console.log(123)
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
