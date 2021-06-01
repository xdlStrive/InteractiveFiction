<template>
  <div style="height: calc(100vh - 70px);">
    <super-flow
      ref="superFlow"
      :node-list="nodeList"
      :link-list="linkList"
      :origin="origin"
      :graph-menu="graphMenuList"
      :node-menu="nodeMenuList"
      :enter-intercept="enterIntercept"
      :output-intercept="outputIntercept"
      :link-desc="linkDesc"
    >
      <template #node="{meta}">
        <div :class="`flow-node flow-node-${meta.prop}`">
          <header class="ellipsis">
            {{ meta.name }}
          </header>
          <section>
            {{ meta.desc }}
          </section>
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
          <el-input
            v-model="linkSetting.desc"
            placeholder="请输入连线描述"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="drawerConf.cancel">
          取 消
        </el-button>
        <el-button type="primary" @click="settingSubmit">
          确 定
        </el-button>
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
export default {
  name: 'TreeChart',
  components: { SuperFlow },
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
      graphMenuList: [
        [
          {
            label: '开始节点',
            disable(graph) {
              return !!graph.nodeList.find(node => node.meta.prop === 'start')
            },
            selected: (graph, coordinate) => {
              const start = graph.nodeList.find(node => node.meta.prop === 'start')
              if (!start) {
                graph.addNode({
                  width: 100,
                  height: 50,
                  coordinate: coordinate,
                  meta: {
                    prop: 'start',
                    name: '开始节点'
                  }
                })
              }
            }
          },
          {
            label: '条件节点',
            disable: false,
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 100,
                height: 50,
                coordinate: coordinate,
                meta: {
                  prop: 'condition',
                  name: '条件节点'
                }
              })
            }
          },
          {
            label: '审批节点',
            disable: false,
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 100,
                height: 50,
                coordinate: coordinate,
                meta: {
                  prop: 'approval',
                  name: '审批节点'
                }
              })
            }
          },
          {
            label: '抄送节点',
            disable: false,
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 100,
                height: 50,
                coordinate: coordinate,
                meta: {
                  prop: 'cc',
                  name: '抄送节点'
                }
              })
            }
          },
          {
            label: '结束节点',
            disable(graph) {
              return !!graph.nodeList.find(point => point.meta.prop === 'end')
            },
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 50,
                height: 50,
                coordinate: coordinate,
                meta: {
                  prop: 'end',
                  name: '结束节点'
                }
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
            label: '删除',
            disable: false,
            hidden(node) {
              return node.meta.prop === 'start'
            },
            selected(node, coordinate) {
              node.remove()
            }
          }
        ],
        [
          {
            label: '编辑',
            selected: (node, coordinate) => {
              this.drawerConf.open(drawerType.node, node)
            }
          }
        ]
      ]
    }
  },
  created() {
    const nodeList = [
      {
        'id': 'node0',
        'width': 100,
        'height': 50,
        'coordinate': [170, 0],
        'meta': {
          'prop': 'start',
          'name': '开始节点'
        }
      },
      {
        'id': 'node1',
        'width': 100,
        'height': 50,
        'coordinate': [170, 80],
        'meta': {
          'prop': 'condition',
          'name': '条件节点',
          'desc': '条件节点1'
        }
      }, {
        'id': 'node2',
        'width': 100,
        'height': 50,
        'coordinate': [30, 80],
        'meta': {
          'prop': 'condition',
          'name': '条件节点',
          'desc': '条件节点2'
        }
      }, {
        'id': 'node3',
        'width': 100,
        'height': 50,
        'coordinate': [310, 80],
        'meta': {
          'prop': 'condition',
          'name': '条件节点',
          'desc': '条件节点3'
        }
      }, {
        'id': 'node4',
        'width': 100,
        'height': 50,
        'coordinate': [170, 180],
        'meta': {
          'prop': 'approval',
          'name': '审批节点',
          'desc': '审批节点1'
        }
      },
      {
        'id': 'node5',
        'width': 100,
        'height': 50,
        'coordinate': [170, 260],
        'meta': {
          'prop': 'cc',
          'name': '抄送节点',
          'desc': '抄送节点2'
        }
      },
      {
        'id': 'node6',
        'width': 100,
        'height': 50,
        'coordinate': [170, 360],
        'meta': {
          'prop': 'end',
          'name': '结束节点'
        }
      }
    ]
    const linkList = [
      {
        'id': 'linkcs9ZhumWeTHrtUy8',
        'startId': 'node0',
        'endId': 'node1',
        'startAt': [50, 50],
        'endAt': [50, 0],
        'meta': null
      },
      {
        'id': 'linkII013ovDctUDuPLu',
        'startId': 'node0',
        'endId': 'node2',
        'startAt': [50, 40],
        'endAt': [50, 0],
        'meta': null
      },
      {
        'id': 'linknL75dQV0AWZA85sq',
        'startId': 'node0',
        'endId': 'node3',
        'startAt': [50, 30],
        'endAt': [50, 0],
        'meta': null
      },
      {
        'id': 'linkBDld5rDBw4C6kiva',
        'startId': 'node1',
        'endId': 'node4',
        'startAt': [50, 30],
        'endAt': [50, 0],
        'meta': null
      },
      {
        'id': 'linkA0ZZxRlDI9AOonuq',
        'startId': 'node4',
        'endId': 'node5',
        'startAt': [50, 30],
        'endAt': [50, 0],
        'meta': null
      },
      {
        'id': 'linkhCKTpRAf89gcujGS',
        'startId': 'node5',
        'endId': 'node6',
        'startAt': [50, 30],
        'endAt': [50, 0],
        'meta': null
      }
    ]

    setTimeout(() => {
      this.nodeList = nodeList
      this.linkList = linkList
    }, 100)
  },
  methods: {
    enterIntercept(formNode, toNode, graph) {
      const formType = formNode.meta.prop
      switch (toNode.meta.prop) {
        case 'start':
          return false
        case 'approval':
          return [
            'start',
            'approval',
            'condition',
            'cc'
          ].includes(formType)
        case 'condition':
          return [
            'start',
            'approval',
            'condition',
            'cc'
          ].includes(formType)
        case 'end':
          return [
            'approval',
            'cc'
          ].includes(formType)
        default:
          return true
      }
    },
    outputIntercept(node, graph) {
      return !(node.meta.prop === 'end')
    },
    linkDesc(link) {
      return link.meta ? link.meta.desc : ''
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

</style>
