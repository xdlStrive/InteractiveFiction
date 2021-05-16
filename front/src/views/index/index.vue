<!-- 主页 -->
<template>
  <div class="page-box">
    <!-- <h3>{{chapterTitle}}</h3> -->
    <el-scrollbar @click="loadParagraph()" ref="textBox" class="text-box">
        <div class="list-placeholder-box" style="display: block"></div>
        <div class="list-placeholder-box chapter-title" style="display: block">{{chapterTitle}}</div>
        <div class="list-placeholder-box" style="display: block"></div>
        <div class="list-placeholder-box" style="display: block"></div>
        <div v-for="(item, index) in chapterDataList" :key="index" v-html="item.content" class="list-item-box" :ref="`listItemBox${index}`" />
    </el-scrollbar>
    <!-- <ul class="text-box" ref="textBox" v-if="chapterList.length > 1">
      <li v-for="(item, index) in chapterList" :key="index" ref="listitme" class="list-itme">{{item}}</li>
    </ul> -->
    <div class="current-text" @click="loadParagraph()" ref="currentText">{{typerOptions.output}}</div>
  </div>
</template>

<script>
import { ElScrollbar, ElMessage } from 'element-plus'
import EasyTyper from 'easy-typer-js'
import { fetchOneChapter } from '@/api/chapter'
import { h } from 'vue';

export default {
  data () {
    return {
      typerOptions: {
        output: '',
        type: 'normal',
        isEnd: false,
        speed: 10,
        backSpeed: 40,
        sleep: 100,
        singleBack: false,
        sentencePause: false
      },
      chapterTitle: '',
      chapterDataList: ['','',''],
      chapterList: ['','',''],
      currentParagraphID: 0,
      paragraphHeight: 0
    };
  },
  components: {
    ElScrollbar
  },
  created() {
    this.initLoad()
  },
  methods: {
    // 获取章节
    initLoad() {
      fetchOneChapter({ chapter_id: '1' }).then(res => {
        const { chapter_id, paragraph_list, title } = res.data
        this.chapterTitle = title
        this.chapterDataList = paragraph_list
        this.loadParagraph()
      })
    },
    // 段落列表上移
    // moveParagraph(height, text) {
    //   let cumulativeHeight
    //   cumulativeHeight += height
    //   this.chapterList.push(text)
    //   if (this.chapterList.length > 1 ) {
    //     this.$refs.textBox.style.transform = `translateY(-${cumulativeHeight}px)`
    //   }
    // },
    // 加载段落
    loadParagraph() {
      const index = this.currentParagraphID
      if (index < this.chapterDataList.length) {
        this.chapterList.push(this.chapterDataList[index].content[0])
        
        this.currentParagraphID += 1
        this.$nextTick(() => {
          this.$refs[`listItemBox${index}`].style.display = 'block'
          this.$refs[`listItemBox${index}`].scrollTop = 100
          this.$refs[`listItemBox${index}`].scrollIntoView({
            block: 'end',
            behavior: 'smooth'
          })
        })
      } else {
        ElMessage({
          message: '本章已结束',
          type: 'warning',
          duration: 1000
        })
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  .page-box {
    height: 100%;
    background-image: url('../../assets/typewriter.png');
  }
  .text-box {
    position: absolute;
    left: 32%;
    width: 666px;
    height: 300px;
    transition: all 0.8s ease;
  }
  .chapter-title {
    font-size: 22px;
    font-weight: bold;
    text-align: center;
  }
  .list-itme {
    transition: all 0.8s ease;
  }
  .list-placeholder-box {
    min-height: 40px;
  }
  .list-item-box {
    margin-bottom: 20px;
    display: none;
    transition: all 0.7s ease;
  }
  .current-text {
    position: absolute;
    top: 50%;
    left: 32%;
    width: 666px;
    z-index: 9999;
  }
</style>