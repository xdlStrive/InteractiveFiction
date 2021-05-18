<!-- 主页 -->
<template>
  <div class="content-box">
    <!-- <h3>{{chapterTitle}}</h3> -->
    <el-scrollbar @click="loadParagraph()" ref="textBox" class="text-box">
        <div class="list-placeholder-box" style="display: block"></div>
        <div class="list-placeholder-box chapter-title" style="display: block">{{chapterTitle}}</div>
        <div class="list-placeholder-box" style="display: block"></div>
        <div class="list-placeholder-box" style="display: block"></div>
        <div v-for="(item, index) in chapterList" :key="index" v-html="item" class="list-item-box" :ref="`listItemBox${index}`"></div>
    </el-scrollbar>
		<SelectLayer :selectItem="currentSelect" v-if="selectVisible" v-model:selectIndex="selectIndex" />
  </div>
</template>

<script>
import { ElScrollbar, ElMessage } from 'element-plus'
// import EasyTyper from 'easy-typer-js'
import { fetchOneChapter } from '@/api/chapter'
import SelectLayer from './SelectLayer'
// import { h } from 'vue';

export default {
	components: {
    ElScrollbar, SelectLayer
  },
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
      chapterDataList: [],
      chapterList: [],
      currentParagraphID: 0,
			currentSelect: {
				select: [],
				content: []
			},
			selectVisible: false,
			selectIndex: null,
      paragraphHeight: 0,
    };
  },
	watch: {
		selectIndex(val) {
      const index = this.currentParagraphID,
        currentData = this.chapterDataList[index]

      this.chapterList.push(currentData.content[val])
      this.currentParagraphID += 1
      this.$nextTick(() => {
        this.$refs[`listItemBox${index}`].style.display = 'block'
        this.$refs[`listItemBox${index}`].scrollTop = 100
        this.$refs[`listItemBox${index}`].scrollIntoView({
          block: 'end',
          behavior: 'smooth'
        })
      })
      this.selectVisible = false
		}
	},
  created() {
    this.initLoad()
  },
  methods: {
    // 获取章节
    initLoad() {
      fetchOneChapter({ chapter_id: '2' }).then(res => {
        const { chapter_id, paragraph_list, title } = res.data
        this.chapterTitle = title
        this.chapterDataList = paragraph_list
				// this.chapterDataList.forEach((item, index) => {
        // this.chapterList.push(item.content)
				// 	// if (item.content.length === 1) { // 普通段落
				// 	// 	this.chapterList.push(item.content)
				// 	// } else if (item.content.length > 1) { // 带选项的段落
				// 	// 	this.currentSelect = {
				// 	// 		select: item.select_id,
				// 	// 		content: item.content
				// 	// 	}
        //   //   this.chapterList = this.chapterList.concat(item.content) // 合并数组
				// 	// }
				// })
        // console.log(this.chapterList)
        this.loadParagraph()
      })
    },
    // 加载段落
    loadParagraph() {
      const index = this.currentParagraphID,
        currentData = this.chapterDataList[index]
      
      if (index < this.chapterDataList.length) {
        if (currentData.content.length === 1) {
          this.chapterList.push(currentData.content)
          this.currentParagraphID += 1
          this.$nextTick(() => {
            this.$refs[`listItemBox${index}`].style.display = 'block'
            this.$refs[`listItemBox${index}`].scrollTop = 100
            this.$refs[`listItemBox${index}`].scrollIntoView({
              block: 'end',
              behavior: 'smooth'
            })
          })
        } else if (currentData.content.length > 1) {
          this.currentSelect = {
            select: currentData.select_id,
            content: currentData.content
          }
          console.log(this.currentSelect)
          this.selectVisible = true // 显示选择弹框
          // 根据选择的结果加载对应的段落
        }
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
  .content-box {
    height: 100%;
    background-image: url('../../../assets/typewriter.png');
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