<template>
  <div id="left-chart-box">
    <super-flow
      ref="superFlow"
      :node-list="nodeList"
      :link-list="linkList"
      :origin="origin"
      :graph-menu="graphMenuList"
      :node-menu="nodeMenuList"
      :enter-intercept="enterIntercept"
      :output-intercept="outputIntercept"
      :style="{height: canvasHeight + 'px'}"
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
import { fetchBranch } from '@/api/branch'
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
      canvasHeight: 939,
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
      origin: [0, 30],
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
          }, {
            label: '选项节点',
            disable: false,
            selected: (graph, coordinate) => {
              this.selectFormVisible = true
              this.selectParams.graph = graph
              this.selectParams.coordinate = coordinate
            }
          }, {
            label: '分支段落节点',
            disable: false,
            selected: (graph, coordinate) => {
              const paragraphParams = {
                chapter_id: this.chapterId,
                content: ''
              }
              addParagraph(paragraphParams).then(res => { // 新增段落
                if (res.code === 20000) {
                  this.$parent.$parent.$parent.paragraphList.push(res.data)
                  // this.$parent.$parent.$parent.$refs.tinymce.setContent('分支段落')
                  this.$parent.$parent.$parent.$refs.tinymce.init({
                    selector: 'textarea',
                    body_class: 'branch-class',
                    placeholder: '分支段落'
                  })
                  this.$parent.$parent.$parent.paragraphIDList.push(res.data.paragraph_id)
                  this.$message({
                    type: 'success',
                    message: '新增段落成功！'
                  })
                  graph.addNode({
                    width: 100,
                    height: 50,
                    coordinate: coordinate,
                    meta: {
                      prop: 'branch',
                      pid: res.data.paragraph_id,
                      name: '分支段落节点'
                    }
                  })
                }
              })
            }
          }, {
            label: 'bad-end分支段落节点',
            disable: false,
            selected: (graph, coordinate) => {
              const paragraphParams = {
                type: 0,
                chapter_id: this.chapterId,
                content: ''
              }
              addParagraph(paragraphParams).then(res => { // 新增段落
                if (res.code === 20000) {
                  this.$parent.$parent.$parent.paragraphList.push(res.data)
                  // this.$parent.$parent.$parent.$refs.tinymce.setContent('分支段落')
                  this.$parent.$parent.$parent.$refs.tinymce.init({
                    selector: 'textarea',
                    body_class: 'badend-class',
                    placeholder: '分支段落'
                  })
                  this.$parent.$parent.$parent.paragraphIDList.push(res.data.paragraph_id)
                  this.$message({
                    type: 'success',
                    message: '新增段落成功！'
                  })
                  graph.addNode({
                    width: 100,
                    height: 50,
                    coordinate: coordinate,
                    meta: {
                      prop: 'badend',
                      pid: res.data.paragraph_id,
                      name: '分支段落节点'
                    }
                  })
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
            label: '编辑段落',
            selected: (node, coordinate) => {
              console.log(node)
              // this.$parent.$parent.$parent.$refs.tinymce.setContent('分支段落')
              // console.log('this.$parent.$parent.$parent.$refs.tinymce')
              console.log(this.$parent.$parent.$parent.$refs.tinymce)
              this.$parent.$parent.$parent.submitBranch = true
              this.$parent.$parent.$parent.submitBranchID = node.meta.pid
              this.$parent.$parent.$parent.$refs.tinymce.setContent(node.meta.content)
              this.$parent.$parent.$parent.$refs.tinymce.init({
                selector: 'textarea',
                body_class: 'branch-class',
                placeholder: 'placeholder'
              })
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
    initChart(data) { // 初始化流程图
      this.nodeList = []
      this.linkList = []
      let coordinates = [164, 0]
      for (let [index, item] of data.entries()) { // for of 数组时无法取到index，所以需要调用数组的entries方法
        let nodeNum = index
        let previousNode
        let previousCoordinate
        if (this.nodeList.length > 1) {
          previousNode = this.nodeList[this.nodeList.length - 1].id // 选项之前的段落节点
          previousCoordinate = this.nodeList[this.nodeList.length - 1].coordinate
          let childrenNum = this.nodeList[this.nodeList.length - 1].meta.children
          coordinates = [previousCoordinate[0], previousCoordinate[1] + 80]
          if (childrenNum) {
            coordinates = [164, previousCoordinate[1] + 80 * childrenNum]
          }
        }

        if (item.selects === undefined || item.selects.length === 0) { // 主线段落节点
          this.nodeList.push({
            id: 'node' + item.paragraph_id,
            width: '100',
            height: '50',
            coordinate: JSON.parse(JSON.stringify(coordinates)),
            meta: {
              prop: 'paragraph',
              pid: item.paragraph_id,
              index: this.nodeList.length,
              desc: item.paragraph_id + item.content[0].substring(3, 15)
            }
          })
          coordinates[1] = 80 * ++nodeNum
          if (nodeNum >= 11) {
            this.canvasHeight += 80
          }

          let a = this.nodeList.filter(items => items.meta.pid === item.paragraph_id)
          let prevNodeIndex = a[0].meta.index - 1
          if (index > 0 && this.nodeList[prevNodeIndex].meta.prop !== 'select') {
            // 找到当前的index(主线段落连线似乎还有问题)想到的解决方案是给主线段落的meta里加个index，通过index找前一个主线段落
            this.linkList.push({
              id: 'link' + item.paragraph_id,
              startId: 'node' + this.nodeList[prevNodeIndex].meta.pid,
              endId: 'node' + item.paragraph_id,
              startAt: [50, 50],
              endAt: [50, 0]
            })
          }
        } else { // 选项段落节点
          previousNode = this.nodeList[this.nodeList.length - 1].id
          coordinates[1] = this.nodeList[this.nodeList.length - 1].coordinate[1] + 80 // 获取上一个node节点的y坐标再加上80
          for (let [indexs, items] of item.selects_key.entries()) {
            let paddingLeft = (428 / item.selects_key.length - 100) / 2
            coordinates[0] = paddingLeft + (428 / item.selects_key.length) * indexs
            this.nodeList.push({
              id: 'node' + item.paragraph_id + '_' + indexs,
              width: '100',
              height: '50',
              coordinate: JSON.parse(JSON.stringify(coordinates)),
              meta: {
                prop: 'select',
                pid: item.paragraph_id,
                bid: item.selects[indexs],
                desc: item.paragraph_id + items.substring(0, 15),
                children: item.selects_key.length
              }
            })

            this.linkList.push({
              id: 'link' + nodeNum,
              startId: previousNode,
              endId: 'node' + item.paragraph_id + '_' + indexs,
              startAt: [50, 50],
              endAt: [50, 0]
            })
            if (nodeNum >= 11) {
              this.canvasHeight += 80
            }
            console.log(this)
            fetchBranch({ branch_id: item.selects[indexs] }).then(res => { // 获取分支段落
              let startId = 'node' + item.paragraph_id + '_' + indexs
              let paragraphListNum = res.data.paragraph_list.length
              console.log(this)
              let parentCoordinates = this.nodeList.find(item => item.id === startId).coordinate // 选项的坐标
              for (let [indexss, itemss] of res.data.paragraph_list.entries()) {
                if (this.nodeList.every((item) => item.pid !== itemss.paragraph_id)) {
                  if (itemss.type === 0) {
                    this.nodeList.push({ // 添加bad-end分支段落节点
                      id: 'node' + itemss.paragraph_id,
                      width: '100',
                      height: '50',
                      coordinate: [parentCoordinates[0], parentCoordinates[1] + 80 * (indexss + 1)], // 继承选项的x坐标，y坐标+80
                      meta: {
                        prop: 'badend',
                        bid: item.selects[indexs],
                        pid: itemss.paragraph_id,
                        desc: itemss.paragraph_id + itemss.content[0].substring(3, 15),
                        content: itemss.content[0]
                      }
                    })
                  } else {
                    this.nodeList.push({ // 添加分支段落节点
                      id: 'node' + itemss.paragraph_id,
                      width: '100',
                      height: '50',
                      coordinate: [parentCoordinates[0], parentCoordinates[1] + 80 * (indexss + 1)], // 继承选项的x坐标，y坐标+80
                      meta: {
                        prop: 'branch',
                        bid: item.selects[indexs],
                        pid: itemss.paragraph_id,
                        desc: itemss.paragraph_id + itemss.content[0].substring(3, 15),
                        content: itemss.content[0]
                      }
                    })
                  }
                }
                this.linkList.push({
                  id: 'link' + nodeNum,
                  startId: startId,
                  endId: 'node' + itemss.paragraph_id,
                  startAt: [50, 50],
                  endAt: [50, 0]
                })
                if (nodeNum >= 11) {
                  this.canvasHeight += 80
                }
                if (indexss + 1 === paragraphListNum && data[index + 1] !== undefined) { // 分支的最后一段，回归主线
                  console.log(data[index + 1])
                  this.linkList.push({
                    id: 'link' + nodeNum,
                    startId: 'node' + res.data.paragraph_list[paragraphListNum - 1].paragraph_id,
                    endId: 'node' + data[index + 1].paragraph_id,
                    startAt: [50, 50],
                    endAt: [50, 0]
                  })
                }
                startId = 'node' + itemss.paragraph_id
              }
            })
          }
          coordinates[0] = 164
          coordinates[1] = 80 * ++nodeNum
        }
      }
      // console.log(this.nodeList)
      // console.log(this.linkList)
    },
    enterIntercept(formNode, toNode, graph) { // 连线处理事件
      const formType = formNode.meta.prop
      const toType = toNode.meta.prop
      if (formType === 'paragraph') {
        let params = {
          chapter_id: this.chapterId,
          paragraph_list: this.paragraphsList
        }
        console.log(params)
        // modifyChapter(params).then(res => {
        //   if (res.code === 20000) {
        //     this.$message({
        //       type: 'success',
        //       message: res.msg
        //     })
        //   }
        // })
      } else if (formType === 'select') {
        const params = {
          branch_id: formNode.meta.bid,
          paragraph_id: toNode.meta.pid
        }
        console.log(params)
        console.log(formNode)
        modifyBranch(params).then(res => {
          console.log(res)
        })
      } else if (formType === 'branch') { // 分支段落起点
        if (toType === 'branch') {
          const params = {
            branch_id: formNode.meta.bid,
            paragraph_id: toNode.meta.pid
          }
          console.log(formNode)
          modifyBranch(params).then(res => {
            console.log(res)
          })
        } else if (toType === 'paragraph') {
          console.log(toNode)
        }
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
    submitSelect() { // 提交选择方法（7/2：提交选择之后没有连线，y轴坐标有问题）
      this.addBranchs(this.selectForm.selectType).then(value => {
        let branchParams = {
          chapter_id: this.chapterId,
          selectType: this.selectForm.selectType, // 选择支的类型（一般选项、重要抉择、bad-end选项）
          selects_key: value.inputValue,
          selects: value.branchIDArr
        }
        addParagraph(branchParams).then(res => {
          console.log(res)
          const paragraphsListArr = this.paragraphsList.map((val, index) => {
            return val.paragraph_id
          })
          paragraphsListArr.push(res.data.paragraph_id)
          this.selectFormVisible = false
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
    async addBranchs(type) { // 保存分支
      let params = {
        inputValue: [],
        branchIDArr: []
      }
      for (let i in this.selectInputList) {
        params.inputValue[i] = this.selectInputList[i].inputValue
        let paddingLeft = (428 / this.selectInputList.length - 100) / 2
        let coordinate = [paddingLeft + (428 / this.selectInputList.length) * i, this.selectParams.coordinate[1]]
        await addBranch({ type: type }).then(res => {
          params.branchIDArr[i] = res.data.branch_id
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

      return params
    },
    newSelectClose() { // 新增选择弹窗的关闭事件
      this.selectInputList = this.selectInputList.slice(0, 2)
    }
  }
}
</script>

<style>
  .branch-class {
    box-shadow: 0 0 5px #ff0000;
  }
  #left-chart-box {
    width: 450px;
    height: calc(100vh - 70px);
    overflow-y: scroll;
  }
  .super-flow {
    background-color: #fff;
  }
  #left-chart-box::-webkit-scrollbar {
    width: 6px;
    height: 1px;
  }
  #left-chart-box::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    background: skyblue;
    background-image: -webkit-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent
    );
  }
  #left-chart-box::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
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
  .flow-node-branch {
    border-bottom: 5px solid #ff9800;
  }
  .flow-node-badend {
    border-bottom: 5px solid #ff2d5b;
  }
</style>
