<template>
  <el-container>
    <el-aside width="660px" class="leftBox">
      <div>
        <el-tree
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
        </div>
      </div>
      <TreeChart ref="treeChart" :paragraphs-list="paragraphList" :chapter-id="chapterID" />
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
        <el-form-item label="" class="articleTitleInput">
          <el-input v-model="chapterTitle" />
        </el-form-item>
        <el-form-item label="" class="textAreaBox">
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
        <el-form-item label="" class="editArea">
          <tinymce ref="tinymce" v-model="currentParagraph" :height="200" />
        </el-form-item>
        <el-form-item class="articleBtnGroup">
          <el-button type="danger" @click="relationFormVisible = true">关联选择</el-button>
          <!-- <el-button type="warning" @click="selectFormVisible = true">新增选择</el-button> -->
          <el-button v-if="submitType" type="primary" @click="nextParagraph">下一段</el-button>
          <el-button v-if="!submitType" type="primary" @click="modifyParagraphFun()">提交修改</el-button>
          <el-button type="success" @click="submitChapter">提交本章</el-button>
        </el-form-item>
      </el-form>
      <!-- <el-dialog title="" :visible.sync="relationFormVisible" width="40%" @close="relationSelectClose">
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
      </el-dialog> -->
      <!-- <el-dialog :title="dialogTitle" :visible.sync="addFormVisible" width="50%" @close="addRelationClose">
        <tinymce ref="tinymce" v-model="relationParagraph" :height="200" />
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitSelectText">提交</el-button>
        </span>
      </el-dialog> -->
      <!-- <el-dialog title="新增选择" :visible.sync="selectFormVisible" width="40%" @close="newSelectClose">
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
      </el-dialog> -->
    </el-main>
  </el-container>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import TreeChart from './TreeChart'
import { fetchVolumeList } from '@/api/volume'
import { addVolume } from '@/api/volume'
import { fetchVolumesChapterList } from '@/api/chapter'
import { fetchOneChapter } from '@/api/chapter'
import { addChapter } from '@/api/chapter'
import { modifyChapter } from '@/api/chapter'
import { addParagraph } from '@/api/paragraph'
import { modifyParagraph } from '@/api/paragraph'
// import { newSelect } from '@/api/select'
// import { searchSelect } from '@/api/select'

export default {
  name: 'NewChapter',
  components: { Tinymce, TreeChart },
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
      chapterID: 0,
      chapterList: [],
      // 段落部分
      paragraphList: [],
      paragraphIDList: [],
      currentParagraph: '',
      currentParagraphID: 0,
      currentParagraphIndex: 0,
      currentParagraphList: [],
      submitType: true
      // 关联选项弹窗
      // relationFormVisible: false,
      // relationForm: {
      //   searchTerms: ''
      // },
      // relationBtnStatus: 0,
      // 新增关联选项的段落弹窗
      // addFormVisible: false,
      // dialogTitle: '',
      // selectIndex: 0,
      // relationParagraph: '',
      // 新增选项弹窗
      // selectFormVisible: false,
      // selectForm: {
      //   note: '',
      //   selectType: 0
      // },
      // inputValue: '',
      // selectInputList: [{
      //   labelName: '选项一',
      //   inputValue: ''
      // },
      // {
      //   labelName: '选项二',
      //   inputValue: ''
      // }]
      // 关联选择
      // relationList: [],
      // selectID: 0,
      // relationNote: ''
    }
  },
  created() {
    this.tempRoute = Object.assign({}, this.$route)
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
          this.$refs.treeChart.initChart(this.paragraphList)
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
    // searchSelect() { // 搜索选项
    //   const searchTerms = this.relationForm.searchTerms
    //   searchSelect(searchTerms).then(res => {
    //     if (res.code === 20000) {
    //       if (res.data !== null) {
    //         this.relationNote = res.data.note
    //         this.relationList = res.data.options
    //         this.selectID = res.data.select_id
    //       } else {
    //         this.$message({
    //           type: 'warning',
    //           message: res.msg
    //         })
    //       }
    //     }
    //   })
    // },
    // addRelatedParagraphs(titleText, index) { // 新增选项关联的段落
    //   this.$refs['btnStatus' + index][0].$el.innerText = '修改关联段落'
    //   this.dialogTitle = titleText
    //   this.addFormVisible = true
    //   this.selectIndex = index
    //   this.$refs.tinymce.setContent(this.currentParagraphList[index] ? this.currentParagraphList[index] : '')
    // },
    // submitSelectText() { // 提交关联选项的段落
    //   this.currentParagraphList[this.selectIndex] = this.relationParagraph
    //   console.log(this.currentParagraphList)
    //   this.addFormVisible = false
    // },
    // addRelationClose() { // 新增关联段落弹窗关闭事件
    //   this.$refs.tinymce.setContent('')
    // },
    // relationSelectClose() { // 关联选择弹窗的关闭事件
    //   this.relationList = []
    // },
    // addSelectInput() { // 增加选项方法
    //   const selectInputNum = this.selectInputList.length
    //   if (selectInputNum === 2) {
    //     this.selectInputList.push({
    //       labelName: '选项三',
    //       inputValue: ''
    //     })
    //   } else if (selectInputNum === 3) {
    //     this.selectInputList.push({
    //       labelName: '选项四',
    //       inputValue: ''
    //     })
    //   } else if (selectInputNum === 4) {
    //     this.selectInputList.push({
    //       labelName: '选项五',
    //       inputValue: ''
    //     })
    //   }
    // },
    // submitSelect() { // 新增选择方法
    //   const selectParams = {
    //     note: this.selectForm.note, // 选择支的描述（用于关联选择时的模糊搜索）
    //     type: this.selectForm.selectType, // 选择支的类型（一般选项、重要抉择、bad-end选项）
    //     options: this.selectInputList
    //   }
    //   newSelect(selectParams).then(res => {
    //     console.log(res.data)
    //     if (res.code === 20000) {
    //       this.selectFormVisible = false
    //       this.$message({
    //         type: 'success',
    //         message: '新增选项成功！'
    //       })
    //     }
    //   })
    // },
    // newSelectClose() { // 新增选择弹窗的关闭事件
    //   this.selectInputList = this.selectInputList.slice(0, 2)
    // },
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
    }
  }
}
</script>

<style lang="scss">
  .leftBox {
    display: flex;
    padding: 10px;
    height: calc(100vh - 50px);
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
    margin-left: 0!important;
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
    width: 88%;
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
</style>
