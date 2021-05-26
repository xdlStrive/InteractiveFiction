<template>
  <el-container>
    <el-aside class="leftBox">
      <super-flow
        ref="superFlow"
        :node-list="nodeList"
        :link-list="linkList"
        :origin="origin"
        :graph-menu="graphMenuList"
        :node-menu="nodeMenuList"
        :link-menu="linkMenuList"
        :enter-intercept="enterIntercept"
        :output-intercept="outputIntercept"
        :link-desc="linkDesc"
      >
        <template #node="{ meta }">
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
      <!-- <el-tree
        :props="props"
        :load="fetchChapterListFun"
        :default-expanded-keys="[1]"
        node-key="volume_id"
        lazy
        accordion
        highlight-current
        class="treeBox"
        @node-expand="openNode"
        @node-click="handleNodeClick"
      />
      <div class="treeBtnGroup">
        <el-button type="primary" icon="el-icon-plus" @click="addVolumeFormVisible = true">新增卷</el-button>
        <el-button type="success" icon="el-icon-plus" @click="addChapterFormVisible = true">新增章节</el-button>
      </div> -->
      <el-dialog title="新增卷" :visible.sync="addVolumeFormVisible" width="25%">
        <el-form label-width="80px">
          <el-form-item label="卷名">
            <el-input v-model="newVolumeTitle" />
          </el-form-item>
          <el-form-item class="addSelectBox">
            <el-button type="primary" @click="addVolumeFun">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog title="新增章节" :visible.sync="addChapterFormVisible" width="25%">
        <el-form label-width="80px">
          <el-form-item label="章节名">
            <el-input v-model="newChapterTitle" />
          </el-form-item>
          <el-form-item class="addSelectBox">
            <el-button type="primary" @click="addChapterFun">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-aside>
    <el-main v-if="editTextVisible">
      <el-form class="articleForm" label-width="80px">
        <el-form-item label="章节标题" class="articleTitleInput">
          <el-input v-model="chapterTitle" />
        </el-form-item>
        <el-form-item label="正文" class="textAreaBox">
          <div class="textListBox">
            <ul>
              <li v-for="(item, index) in paragraphList" :key="index" class="previewItems">
                <div v-for="(items, indexs) in item.content" :key="indexs" class="itemTextBox">
                  <el-tag v-if="item.content.length > 1">{{ '选项 ' + (indexs + 1) }}</el-tag>
                  <div class="textBox" v-html="items" />
                  <el-button type="primary" class="itemEditBtn" @click="modifyParagraphBtn(item.content[indexs], index, indexs)">修改</el-button>
                </div>
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="当前段落" class="editArea">
          <tinymce ref="tinymce" v-model="currentParagraph" :height="200" />
        </el-form-item>
        <el-form-item class="articleBtnGroup">
          <el-button type="danger" @click="relationFormVisible = true">关联选择</el-button>
          <el-button type="warning" @click="selectFormVisible = true">新增选择</el-button>
          <el-button v-if="submitType" type="primary" @click="nextParagraph">下一段</el-button>
          <el-button v-if="!submitType" type="primary" @click="modifyParagraphFun()">提交修改</el-button>
          <el-button type="success" @click="submitChapter">提交本章</el-button>
        </el-form-item>
      </el-form>
      <el-dialog title="关联选择" :visible.sync="relationFormVisible" width="40%" @close="relationSelectClose">
        <el-form label-width="80px">
          <el-form-item label="搜索选择">
            <el-input v-model="relationForm.searchTerms" placeholder="请输入关键字" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="searchSelect" />
            </el-input>
          </el-form-item>
          <el-form-item label="选择描述">
            <div v-html="relationNote" />
          </el-form-item>
          <ul>
            <li v-for="(item, index) in relationList" :key="index">
              <el-form-item :label="item.labelName">
                <span>{{ item.inputValue }}</span>
                <el-button :ref="'btnStatus' + index" type="primary" style="margin-left: 20px;" @click="addRelatedParagraphs(item.inputValue, index)">新增关联段落</el-button>
              </el-form-item>
            </li>
          </ul>
          <el-form-item class="addSelectBox">
            <el-button type="primary" @click="addParagraphFun('plural')">提交关联段落</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog :title="dialogTitle" :visible.sync="addFormVisible" width="50%" @close="addRelationClose">
        <tinymce ref="tinymce" v-model="relationParagraph" :height="200" />
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitSelectText">提交</el-button>
        </span>
      </el-dialog>
      <el-dialog title="新增选择" :visible.sync="selectFormVisible" width="40%" @close="newSelectClose">
        <el-form label-width="80px">
          <el-form-item label="选择描述">
            <el-input v-model="selectForm.note" placeholder="用于关联选择时模糊搜索" />
          </el-form-item>
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
    </el-main>
  </el-container>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import SuperFlow from 'vue-super-flow'
import 'vue-super-flow/lib/index.css'
import { fetchVolumeList } from '@/api/volume'
import { addVolume } from '@/api/volume'
import { fetchVolumesChapterList } from '@/api/chapter'
import { fetchOneChapter } from '@/api/chapter'
import { addChapter } from '@/api/chapter'
import { modifyChapter } from '@/api/chapter'
import { addParagraph } from '@/api/paragraph'
import { modifyParagraph } from '@/api/paragraph'
import { newSelect } from '@/api/select'
import { searchSelect } from '@/api/select'

const drawerType = {
  node: 0,
  link: 1
}

export default {
  name: 'NewChapter',
  components: { Tinymce, SuperFlow },
  props: {
    isRevise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 树部分
      props: {
        label: 'title', // 这里设置的值需要与后台传回的值一一对应
        children: '',
        isLeaf: 'leaf'
      },
      // 流程图
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
        name: '',
        desc: ''
      },

      origin: [50, 210],
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
                  width: 80,
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
            label: '审批节点',
            disable: false,
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 80,
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
            label: '结束节点',
            disable(graph) {
              return !!graph.nodeList.find(point => point.meta.prop === 'end')
            },
            selected: (graph, coordinate) => {
              graph.addNode({
                width: 80,
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
      ],
      linkMenuList: [
        [
          {
            label: '删除',
            disable: false,
            selected: (link, coordinate) => {
              link.remove()
            }
          }
        ],
        [
          {
            label: '编辑',
            disable: false,
            selected: (link, coordinate) => {
              this.drawerConf.open(drawerType.link, link)
            }
          }
        ]
      ],
      editTextVisible: false,
      treeNode: {},
      treeResolve: {},
      // 卷部分
      volumeList: [],
      addVolumeFormVisible: false,
      addChapterFormVisible: false,
      newVolumeTitle: '',
      newChapterTitle: '',
      currentVolumeID: 1,
      // 章节部分
      chapterTitle: '',
      chapterID: '',
      chapterList: [],
      // 段落部分
      paragraphList: [],
      paragraphIDList: [],
      currentParagraph: '',
      currentParagraphID: 0,
      currentParagraphIndex: 0,
      currentParagraphList: [],
      submitType: true,
      tagArr: [],
      // 关联选项弹窗
      relationFormVisible: false,
      relationForm: {
        searchTerms: ''
      },
      relationBtnStatus: 0,
      // 新增关联选项的段落弹窗
      addFormVisible: false,
      dialogTitle: '',
      selectIndex: 0,
      relationParagraph: '',
      // 新增选项弹窗
      selectFormVisible: false,
      selectForm: {
        note: '',
        selectType: 0
      },
      inputValue: '',
      selectInputList: [{
        labelName: '选项一',
        inputValue: ''
      },
      {
        labelName: '选项二',
        inputValue: ''
      }],
      // 关联选择
      relationList: [],
      selectID: 0,
      relationNote: ''
    }
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route)
    const nodeList = [
      {
        'id': 'nodeS3WgFnzCI15X58Qw',
        'width': 80,
        'height': 50,
        'coordinate': [-50, -200],
        'meta': {
          'prop': 'start',
          'name': '开始节点'
        }
      },
      {
        'id': 'nodefHsy9uJObPtdHZv1',
        'width': 80,
        'height': 50,
        'coordinate': [40, 0],
        'meta': {
          'prop': 'approval',
          'name': '审批节点',
          'desc': '111111'
        }
      },
      {
        'id': 'nodeni9QOqT3mI7hsMau',
        'width': 80,
        'height': 50,
        'coordinate': [80, 0],
        'meta': {
          'prop': 'condition',
          'name': '条件节点'
        }
      }]
    const linkList = [
      {
        'id': 'linkcs9ZhumWeTHrtUy8',
        'startId': 'nodeS3WgFnzCI15X58Qw',
        'endId': 'nodeni9QOqT3mI7hsMau',
        'startAt': [50, 80],
        'endAt': [0, 40],
        'meta': null
      }]
    setTimeout(() => {
      this.nodeList = nodeList
      this.linkList = linkList
    }, 100)
  },
  methods: {
    openNode(data) { // 绑定树形卷的展开事件
      this.currentVolumeID = data.volume_id
      console.log(this.currentVolumeID)
    },
    handleNodeClick(data, node) { // 树形节点点击事件
      if (node.level === 2) {
        this.fetchChapter(data.chapter_id)
      }
    },
    fetchVolumeListFun() { // 获取卷列表
      return new Promise(resolve => {
        fetchVolumeList().then(res => {
          if (res.code === 20000) {
            this.volumeList = res.data
            resolve()
          }
        })
      })
    },
    addVolumeFun() { // 新增卷方法
      const params = {
        title: this.newVolumeTitle
      }
      addVolume(params).then(res => {
        if (res.code === 20000) {
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.fetchVolumeListFun() // 刷新卷列表
          this.addVolumeFormVisible = false

          this.treeNode.childNodes = [] // 刷新左侧树（连下一句一起）
          this.fetchChapterListFun(this.treeNode, this.treeResolve)
        }
      })
    },
    async fetchChapterListFun(node, resolve) { // 获取章节列表
      if (node.level === 0) {
        this.treeNode = node
        this.treeResolve = resolve
        await this.fetchVolumeListFun()
        return resolve(this.volumeList)
      } else {
        const params = {
          volume_id: node.data.volume_id
        }
        fetchVolumesChapterList(params).then(res => {
          if (res.code === 20000) {
            this.chapterList = res.data
          }
          return resolve(res.data)
        })
      }
    },
    fetchChapter(chapterID) { // 获取章节
      this.chapterID = chapterID
      const params = {
        chapter_id: chapterID
      }
      fetchOneChapter(params).then(res => {
        if (res.code === 20000) {
          this.editTextVisible = true
          this.chapterTitle = res.data.title
          this.paragraphList = res.data.paragraph_list
          console.log(this.paragraphList)
        }
      })
    },
    addChapterFun() { // 新增章节
      const chapterParams = {
        volume_id: this.currentVolumeID,
        creator_id: this.$store.state.user.id,
        title: this.newChapterTitle
      }
      addChapter(chapterParams).then(res => {
        if (res.code === 20000) {
          this.chapterID = res.data.chapter_id
          this.addChapterFormVisible = false
          this.editTextVisible = true
          this.chapterTitle = res.data.title
          this.treeNode.childNodes = [] // 刷新左侧树（连下一句一起）
          this.fetchChapterListFun(this.treeNode, this.treeResolve)
          this.$message({
            type: 'success',
            message: '新增章节成功！'
          })
        }
      })
    },
    addParagraphFun(type) { // 新增段落
      const paragraphParams = {
        chapter_id: this.chapterID,
        content: this.currentParagraph
      }
      if (type === 'plural') {
        paragraphParams.content = this.currentParagraphList
        paragraphParams.select_id = this.selectID
      }
      addParagraph(paragraphParams).then(res => { // 新增段落
        if (res.code === 20000) {
          this.paragraphList.push(res.data)
          this.$refs.tinymce.setContent('')
          this.paragraphIDList.push(res.data.paragraph_id)
          this.fetchChapter(res.data.chapter_id)
          this.$message({
            type: 'success',
            message: '新增段落成功！'
          })
          return [res.data.chapter_id, res.data.paragraph_id] // 返回段落id给下面的then方法
        }
      }).then(value => { // 新增段落后将该段落的id插入所属的章节的段落id数组里
        const params = {
          chapter_id: value[0],
          paragraph_list: [value[1]]
        }
        modifyChapter(params).then(res => {
          if (res.code === 20000) {
            this.$message({
              type: 'success',
              message: res.msg
            })
          }
        })
      })
    },
    modifyParagraphBtn(content, index, indexs) { // 段落的修改按钮事件
      console.log(content)
      this.currentParagraphID = this.paragraphList[index].paragraph_id // 修改的段落的id
      this.currentParagraphIndex = indexs // 修改的段落内容数组的下标
      this.$refs.tinymce.setContent(content)
      this.submitType = false
    },
    modifyParagraphFun() { // 提交修改后的段落
      const params = {
        paragraph_id: this.currentParagraphID,
        index: this.currentParagraphIndex,
        content: this.$refs.tinymce.value
      }
      modifyParagraph(params).then(res => {
        if (res.code === 20000) {
          console.log(res)
          this.submitType = true
          this.$refs.tinymce.setContent('')
          this.fetchChapter(res.data.chapter_id) // 刷新章节预览列表
          this.$message({
            type: 'success',
            message: res.msg
          })
        }
      })
    },
    searchSelect() { // 搜索选项
      const searchTerms = this.relationForm.searchTerms
      searchSelect(searchTerms).then(res => {
        if (res.code === 20000) {
          if (res.data !== null) {
            this.relationNote = res.data.note
            this.relationList = res.data.options
            this.selectID = res.data.select_id
          } else {
            this.$message({
              type: 'warning',
              message: res.msg
            })
          }
        }
      })
    },
    addRelatedParagraphs(titleText, index) { // 新增选项关联的段落
      this.$refs['btnStatus' + index][0].$el.innerText = '修改关联段落'
      this.dialogTitle = titleText
      this.addFormVisible = true
      this.selectIndex = index
      this.$refs.tinymce.setContent(this.currentParagraphList[index] ? this.currentParagraphList[index] : '')
    },
    submitSelectText() { // 提交关联选项的段落
      this.currentParagraphList[this.selectIndex] = this.relationParagraph
      console.log(this.currentParagraphList)
      this.addFormVisible = false
    },
    addRelationClose() { // 新增关联段落弹窗关闭事件
      this.$refs.tinymce.setContent('')
    },
    relationSelectClose() { // 关联选择弹窗的关闭事件
      this.relationList = []
    },
    addSelectInput() { // 增加选项方法
      const selectInputNum = this.selectInputList.length
      if (selectInputNum === 2) {
        this.selectInputList.push({
          labelName: '选项三',
          inputValue: ''
        })
      } else if (selectInputNum === 3) {
        this.selectInputList.push({
          labelName: '选项四',
          inputValue: ''
        })
      } else if (selectInputNum === 4) {
        this.selectInputList.push({
          labelName: '选项五',
          inputValue: ''
        })
      }
    },
    submitSelect() { // 新增选择方法
      const selectParams = {
        note: this.selectForm.note, // 选择支的描述（用于关联选择时的模糊搜索）
        type: this.selectForm.selectType, // 选择支的类型（一般选项、重要抉择、bad-end选项）
        options: this.selectInputList
      }
      newSelect(selectParams).then(res => {
        console.log(res.data)
        if (res.code === 20000) {
          this.selectFormVisible = false
          this.$message({
            type: 'success',
            message: '新增选项成功！'
          })
        }
      })
    },
    newSelectClose() { // 新增选择弹窗的关闭事件
      this.selectInputList = this.selectInputList.slice(0, 2)
    },
    nextParagraph() { // 下一段按钮处理事件
      this.addParagraphFun('single')
    },
    submitChapter() { // 提交本章
      if (this.$refs.tinymce.value !== '') { // 如果富文本编辑器还有未提交的内容，则先提交段落
        this.addParagraphFun('single')
      } else {
        console.log(this.chapterID)
        const params = {
          chapter_id: this.chapterID,
          title: this.chapterTitle
        }
        this.editTextVisible = false // 隐藏右侧编辑区
        modifyChapter(params).then(res => {
          if (res.code === 20000) {
            this.treeNode.childNodes = [] // 刷新左侧树（连下一句一起）
            this.fetchChapterListFun(this.treeNode, this.treeResolve)
            this.$message({
              type: 'success',
              message: res.msg
            })
          }
        })
      }
    },
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

<style lang="scss">
  .leftBox {
    margin: 15px;
    padding: 20px 10px;
    height: 800px;
    background: #f3f3f3;
    box-sizing: border-box;
  }
  .treeBtnGroup {
    margin-top: 20px;
    display: flex;
    justify-content: space-evenly;
  }
  .treeBtnGroup > .el-button {
    padding: 8px 18px;
  }
  .articleForm {
    display: flex;
    flex-wrap: wrap;
  }
  .el-form-item__content {
    margin-left: 100px!important;
  }
  .articleTitleInput {
    width: 60%;
  }
  .textAreaBox {
    width: 100%;
  }
  .textListBox {
    height: 470px;
    padding: 10px;
    border: 1px solid #C0C4CC;
    overflow-y: scroll;
  }
  .previewItems {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    background: #f7f7f7;
  }
  .itemTextBox {
    padding: 10px 5px;
    width: 100%;
    display: flex;
    align-items: center;
  }
  .textBox {
    width: 95%;
  }
  .textListBox p {
    padding: 0 5px;
    line-height: 24px;
    text-indent: 2rem;
    font-size: 15px;
  }
  .itemEditBtn {
    padding: 8px 15px;
  }
  .editArea {
    width: 90%;
  }
  .articleBtnGroup {
    width: 20%;
    max-width: 100px;
    margin-left: 20px;
    display: flex;
    align-items: flex-end;
  }
  .articleBtnGroup > .el-form-item__content {
    margin-left: 0!important;
  }
  .articleBtnGroup button {
    margin-top: 20px;
  }
  .addSelectBox {
    text-align: center;
  }
  .addSelectBox > .el-form-item__content {
    margin-left: 0!important;
  }
  .el-button+.el-button {
    margin-left: 0;
  }

  .ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-wrap: break-word;
  }

  .super-flow-base-demo {
    width            : 100%;
    height           : 800px;
    margin           : 0 auto;
    background-color : #f5f5f5;

    .super-flow__node {
      .flow-node {
        > header {
          font-size   : 14px;
          height      : 32px;
          line-height : 32px;
          padding     : 0 12px;
          color       : #ffffff;
        }

        > section {
          text-align  : center;
          line-height : 20px;
          overflow    : hidden;
          padding     : 6px 12px;
          word-break  : break-all;
        }

        &.flow-node-start {
          > header {
            background-color : #55abfc;
          }
        }

        &.flow-node-condition {
          > header {
            background-color : #BC1D16;
          }
        }

        &.flow-node-approval {
          > header {
            background-color : rgba(188, 181, 58, 0.76);
          }
        }

        &.flow-node-cc {
          > header {
            background-color : #30b95c;
          }
        }

        &.flow-node-end {
          > header {
            height           : 50px;
            line-height      : 50px;
            background-color : rgb(0, 0, 0);
          }
        }
      }
    }
  }
</style>
