<template>
  <el-container>
    <el-aside class="leftBox">
      <el-tree
        :data="volumeList"
        node-key="volume_id"
        lazy
        :load="fetchChapterListFun"
        :render-content="treeAction"
        class="treeBox"
      />
      <div class="treeBtnGroup">
        <el-button type="primary" icon="el-icon-plus" @click="addVolumeFormVisible= true">新增卷</el-button>
        <el-button type="success" icon="el-icon-plus" @click="addChapterFun">新增章节</el-button>
      </div>
      <el-dialog title="新增卷" :visible.sync="addVolumeFormVisible" width="25%">
        <el-form label-width="80px">
          <el-form-item label="卷名">
            <el-input v-model="volumeTitle" />
          </el-form-item>
          <el-form-item class="addSelectBox">
            <el-button type="primary" @click="addVolumeFun">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-aside>
    <el-main>
      <el-form class="articleForm" label-width="80px">
        <el-form-item label="章节标题" class="articleTitleInput">
          <el-input v-model="chapterTitle" />
        </el-form-item>
        <el-form-item label="正文" class="textArea">
          <div class="textListBox">
            <ul>
              <li v-for="(item, index) in paragraphList" :key="index">
                <div v-html="item.item" />
                <el-button type="primary" @click="modifyParagraph">修改</el-button>
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="当前段落" class="editArea">
          <tinymce ref="tinymce" v-model="currentParagraph" :height="200" />
        </el-form-item>
        <el-form-item class="articleBtnGroup">
          <el-button type="warning" @click="selectFormVisible = true">新增选项</el-button>
          <el-button type="primary" @click="nextParagraph">下一段</el-button>
          <el-button type="success" @click="submitChapter">提交本章</el-button>
        </el-form-item>
      </el-form>
      <el-dialog title="新增选项" :visible.sync="selectFormVisible" width="30%">
        <el-form label-width="80px">
          <el-form-item label="选择类型">
            <el-radio-group v-model="selectForm.selectType">
              <el-radio label="普通选择" />
              <el-radio label="重要选择" />
              <el-radio label="badend选择" />
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
            <el-button type="primary" @click="addSelectInput">增加选项</el-button>
            <el-button type="success" @click="submitSelect">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { fetchVolumeList } from '@/api/volume'
import { addVolume } from '@/api/volume'
import { fetchChapterList } from '@/api/chapter'
import { addChapter } from '@/api/chapter'
import { addParagraph } from '@/api/paragraph'

const defaultData = {
  title: '',
  tags: [],
  roundup: '',
  coverImg: '',
  content: ''
}

export default {
  name: 'NewChapter',
  components: { Tinymce },
  props: {
    isRevise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: '',
      postData: Object.assign({}, defaultData),
      reviseID: '',
      dialogVisible: false,
      temRoute: {},
      // 卷部分
      volumeList: [],
      addVolumeFormVisible: false,
      volumeTitle: '',
      currentVolumeID: 0,
      // 章节部分
      chapterTitle: '',
      chapterID: '',
      chapterList: [],
      // 段落部分
      paragraphList: [],
      paragraphIDList: [],
      currentParagraph: '',
      paragraphText: '',

      selectFormVisible: false,
      selectForm: {
        selectType: '普通选择'
      },
      selectInputList: [{
        labelName: '选项一',
        inputValue: ''
      },
      {
        labelName: '选项二',
        inputValue: ''
      }],
      selectID: []
    }
  },
  created() {
    if (this.isRevise) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
      this.reviseID = id
      this.btnState = { upload: false, revise: true }
    }
    this.tempRoute = Object.assign({}, this.$route)

    this.fetchVolumeListFun()
    this.fetchChapter()
  },
  methods: {
    fetchChapterListFun(node, resolve) { // 获取章节列表
      let params = {
        volume_id: node.data.volume_id
      }
      fetchChapterList(params).then(res => {
        console.log(res.code)
        if (res.code === 20000) {
          this.chapterList = res.data
        }
      })
    },
    treeAction(h, { node, data, store }) {
      return (
        <div class='custom-tree-node'>
          <span>{ data.title }</span>
        </div>
      )
    },
    fetchVolumeListFun() { // 获取卷列表
      const params = {
        volume_id: 1
      }
      fetchVolumeList(params).then(res => {
        if (res.code === 20000) {
          this.volumeList = res.data
          console.log(this.volumeList)
        }
      })
    },
    addVolumeFun() { // 新增卷方法
      const params = {
        title: this.volumeTitle
      }
      addVolume(params).then(res => {
        console.log(res.code)
        if (res.code === 20000) {
          this.$message({
            type: 'success',
            message: res.msg
          })
        }
      })
    },
    fetchChapter(chapterID) { // 获取章节

    },
    addChapterFun() { // 新增章节
      const chapterParams = {
        volume_id: this.currentVolumeID,
        creator_id: this.$store.state.user.id
      }
      addChapter(chapterParams).then(res => {
        console.log(res.data)
        if (res.code === 20000) {
          this.chapterID = res.data.chapter_id
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
        content: this.currentParagraph,
        select_id: this.selectID
      }
      console.log(this.chapterID)

      addParagraph(paragraphParams).then(res => { // 新增段落
        console.log(res.data)
        if (res.code === 20000) {
          const newParagraphItem = {
            item: this.currentParagraph + ``
          }
          this.paragraphList.push(newParagraphItem)
          this.$refs.tinymce.setContent('')
          this.paragraphIDList.push(res.data.paragraph_id)
          console.log(this.paragraphIDList)
          this.$message({
            type: 'success',
            message: '新增段落成功！'
          })
        }
      })
    },
    modifyParagraph() { // 修改段落

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
    submitSelect() { // 提交选择

    },
    nextParagraph() { // 下一段按钮处理事件
      this.addParagraphFun()

      // if (this.chapterID === '') {
      //   const chapterParams = {
      //     creator_id: this.$store.state.user.id
      //   }
      //   addChapter(chapterParams).then(res => {
      //     console.log(res.data)
      //     if (res.code === 20000) {
      //       this.chapterID = res.data.chapter_id
      //       this.addParagraphFun()
      //       this.$message({
      //         type: 'success',
      //         message: '新增章节成功！'
      //       })
      //     }
      //   })
      // } else if (this.chapterID !== null && this.chapterID !== undefined) {
      //   this.addParagraphFun()
      // }
    },
    submitChapter() { // 提交本章

    },
    handleClose(tag) {
      this.postData.tags.splice(this.postData.tags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.postData.tags.push(inputValue)
      }
      console.log(this.postData.tags)
      this.inputVisible = false
      this.inputValue = ''
    },
    handlePictureCardPreview() {
      this.dialogVisible = true
    }
    // upload() {
    //   const params = {
    //     title: this.postData.title,
    //     tags: this.postData.tags,
    //     coverImg: this.postData.coverImg,
    //     roundup: this.postData.roundup,
    //     content: this.postData.content,
    //     author: store.state.user.id
    //   }
    //   postArticle(params).then(res => {
    //     console.log(res.data)
    //     this.$notify({
    //       title: '提交成功',
    //       message: '发布文章成功！',
    //       type: 'success',
    //       duration: 2000
    //     })
    //   })
    // },
    // fetchData(id) { // 获取当前修改的博文的数据
    //   const params = { id: id }
    //   fetchArticle(params).then(res => {
    //     console.log(res.data)
    //     this.postData = res.data
    //   })
    // },
    // revise() {
    //   const params = {
    //     id: this.reviseID,
    //     title: this.postData.title,
    //     tags: this.postData.tags,
    //     coverImg: this.postData.coverImg,
    //     roundup: this.postData.roundup,
    //     content: this.postData.content,
    //     author: store.state.user.id
    //   }
    //   reviseArticle(params).then(res => {
    //     console.log(res.data)
    //     this.$notify({
    //       title: '修改成功',
    //       message: '修改文章成功！',
    //       type: 'success',
    //       duration: 2000
    //     })
    //   })
    // }
  }
}
</script>

<style lang="scss">
  .leftBox {
    margin: 15px;
    padding: 20px 10px;
    background: #fbfbfb;
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
  .textArea {
    width: 98%;
  }
  .textListBox {
    height: 470px;
    padding: 20px;
    border: 1px solid #C0C4CC;
  }
  .textListBox li {
    margin-bottom: 10px;
    padding-right: 10px;
    border-right: 1px solid #C0C4CC;
  }
  .textListBox p {
    line-height: 24px;
    text-indent: 2rem;
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
</style>
