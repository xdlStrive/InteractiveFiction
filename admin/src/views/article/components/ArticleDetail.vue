<template>
  <el-container>
    <el-aside width="660px" class="leftBox">
      <div id="left-tree-box">
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
                  <div class="textBox" v-html="items" />
                  <el-button type="primary" class="itemEditBtn" @click="modifyParagraphBtn(item.content[indexs], index, indexs)">修改</el-button>
                </div>
                <div v-for="(items, indexs) in item.selects_key" :key="indexs" class="itemTextBox">
                  <el-tag style="margin-right: 10px;">{{ '选项 ' + (indexs + 1) }}</el-tag>
                  <div class="textBox" v-html="items" />
                  <el-button type="primary" class="itemEditBtn" @click="modifyParagraphBtn(item.content[indexs], index, indexs)">修改</el-button>
                </div>
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="" class="editArea">
          <tinymce ref="tinymce" v-model="currentParagraph" :height="260" />
        </el-form-item>
        <el-form-item class="articleBtnGroup">
          <el-button v-if="submitType" type="primary" @click="nextParagraph">下一段</el-button>
          <el-button v-if="!submitType" type="primary" @click="modifyParagraphFun()">提交修改</el-button>
          <el-button v-if="submitBranch" type="info" @click="submitBranchParagraphFun()">提交分支</el-button>
          <el-button type="success" @click="submitChapter">提交本章</el-button>
        </el-form-item>
      </el-form>
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

export default {
  name: 'NewChapter',
  components: { Tinymce, TreeChart },
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
      submitType: true,
      submitBranch: false,
      submitBranchID: 0
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
    addParagraphFun() { // 新增段落
      const paragraphParams = {
        chapter_id: this.chapterID,
        content: this.currentParagraph
      }
      addParagraph(paragraphParams).then(res => { // 新增段落
        if (res.code === 20000) {
          this.paragraphList.push(res.data)
          this.$refs.tinymce.setContent('')
          this.paragraphIDList.push(res.data.paragraph_id)
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
            this.fetchChapter(res.data.chapter_id)
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
    submitBranchParagraphFun() { // 提交分支段落
      if (this.submitBranchID !== 0 && this.submitBranchID !== null) {
        const params = {
          paragraph_id: this.submitBranchID,
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
        this.submitBranch = false
      }
    },
    nextParagraph() { // 下一段按钮处理事件
      this.addParagraphFun()
    },
    submitChapter() { // 提交本章
      if (this.$refs.tinymce.value !== '') { // 如果富文本编辑器还有未提交的内容，则先提交段落
        this.addParagraphFun()
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
  .left-tree-box {
    width: 190px;
  }
  .treeBtnGroup {
    margin-top: 20px;
    display: flex;
    justify-content: space-evenly;
  }
  .treeBtnGroup > .el-button {
    padding: 8px;
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
    height: 550px;
    padding: 10px;
    border: 1px solid #C0C4CC;
    overflow-y: scroll;
  }
  .textListBox::-webkit-scrollbar {
    width: 6px;
    height: 1px;
  }
  .textListBox::-webkit-scrollbar-thumb {
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
  .textListBox::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
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
    margin-left: 19px;
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
