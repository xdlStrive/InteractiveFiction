<!-- 主页 -->
<template>
  <div class="content-box">
    <!-- <h3>{{chapterTitle}}</h3> -->
    <vue-typed-js :strings="['First text', 'Second Text']">
      <h1 class="typing">这是测试打字机文字</h1>
    </vue-typed-js>
    <div class="abc">{{ obj.output }}</div>
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
import { fetchOneChapter } from '@/api/chapter'
import { fetchBranch } from '@/api/branch'
import SelectLayer from './SelectLayer'

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
      obj: {
        output: '',
        type: 'normal',
        isEnd: true,
        speed: 800,
        backSpeed: 800,
        sleep: 500,
        singleBack: false,
        sentencePause: false
      }
    };
  },
  mounted() {
    console.log(213)
  },
	watch: {
		selectIndex(val) {
      const currentParagraphIndex = this.currentParagraphID,
        currentData = this.chapterDataList[currentParagraphIndex]

      fetchBranch({branch_id: val}).then((res) => {
        console.log(res)
        res.data.paragraph_list.forEach((item, index) => {
          console.log(item.content[0])
          this.chapterList.splice(currentParagraphIndex + index, 0, item.content[0])
        })
        
        // console.log(this.chapterList)
      })

      // this.chapterList.push(currentData.content[val])
      this.currentParagraphID += 1
      this.$nextTick(() => {
        this.$refs[`listItemBox${currentParagraphIndex}`].style.display = 'block'
        this.$refs[`listItemBox${currentParagraphIndex}`].scrollTop = 100
        this.$refs[`listItemBox${currentParagraphIndex}`].scrollIntoView({
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
        console.log(paragraph_list)
        this.chapterTitle = title
        this.chapterDataList = paragraph_list
				this.chapterDataList.forEach((item, index) => {
					if (item.content.length === 1) { // 普通段落
						this.chapterList.push(item.content)
					} else if (item.selects.length > 1) { // 带选项的段落
						this.currentSelect = {
							select: item.selects,
							content: item.selects_key
						}
            this.chapterList = this.chapterList.concat(item.content) // 合并数组
					}
				})
        console.log(this.chapterList)
        this.loadParagraph() // 自动加载第一段
      })
    },
    // 加载段落
    loadParagraph() {
      const index = this.currentParagraphID,
        currentData = this.chapterDataList[index]
      
      if (index < this.chapterDataList.length) {
        if (currentData.selects.length === 0) { // 普通段落
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
        } else if (currentData.selects.length > 1) { // 选择
          this.currentSelect = {
            select: currentData.selects,
            content: currentData.selects_key
          }
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