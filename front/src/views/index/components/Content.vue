<!-- 主页 -->
<template>
  <div class="content-box">
    <List @fetchOneChapter="fetchOneChapterFun" />
    <div class="chapter-box" ref="chapterBox">
      <!-- <h3>{{chapterTitle}}</h3> -->
      <!-- <vue-typed-js :strings="['First text', 'Second Text']">
        <h1 class="typing">这是测试打字机文字</h1>
      </vue-typed-js> -->
      <div class="abc">{{ obj.output }}</div>
      <el-scrollbar v-if="!maskVisible" @click="loadParagraph()" ref="textBox" class="text-box" :style="{width: textBox.width + 'px', height: textBox.height + 'px', top: textBox.top + 'px', left: textBox.left + 'px'}">
          <div class="list-placeholder-box" style="display: block"></div>
          <div class="list-placeholder-box chapter-title" style="display: block">{{chapterTitle}}</div>
          <div class="list-placeholder-box" style="display: block"></div>
          <div class="list-placeholder-box" style="display: block"></div>
          <div v-for="(item, index) in chapterList" :key="index" v-html="item" class="list-item-box" :ref="`listItemBox${index}`"></div>
      </el-scrollbar>
      
      <transition name="mask">
        <div class="mask-layer" v-if="maskVisible" @click="closeMask">
          <transition name="mask">
            <div class="aphorism-box">
              <p class="aphorism-text">{{aphorism.text}}</p>
              <p class="aphorism-author">—— {{aphorism.author}}</p>
            </div>
          </transition>
        </div>
      </transition>
      
      <SelectLayer :selectItem="currentSelect" v-if="selectVisible" v-model:selectIndex="selectIndex" />
    </div>
  </div>
</template>

<script>
import List from './List'
import SelectLayer from './SelectLayer'
import { fetchOneChapter } from '@/api/chapter'
import { fetchBranch } from '@/api/branch'
import { fetchAphorism } from '@/api/aphorism'


export default {
	components: {
    List, SelectLayer
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
      chapterID: 1,
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
      },
      textBox: {
        width: 1150,
        height: 570,
        top: 22,
        left: 30 ,
      },
      pargaraphType: null,
      maskVisible: false,
      aphorism: {
        text: '',
        author: ''
      }
    };
  },
	watch: {
		selectIndex(val) {
      const currentParagraphIndex = this.currentParagraphID
      // const currentData = this.chapterDataList[currentParagraphIndex]

      fetchBranch({branch_id: val}).then((res) => {
        console.log(res)
        res.data.paragraph_list.forEach((item, index) => {
          this.chapterList.splice(currentParagraphIndex + index, 0, item.content[0])
          this.chapterDataList.push(item)
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
		},
	},
  created() {
    this.initLoad()
  },
  methods: {
    // 获取章节
    initLoad() {
      this.fetchOneChapterFun()
    },
    // 加载段落
    loadParagraph() {
      this.textBox.width = this.$refs.chapterBox.offsetWidth * 0.5989583
      this.textBox.height = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.622222
      this.textBox.top = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.088888 + (this.$refs.chapterBox.offsetHeight - this.$refs.chapterBox.offsetWidth * 0.46875)
      this.textBox.left = this.$refs.chapterBox.offsetWidth * 0.2135416

      const index = this.currentParagraphID
      const currentData = this.chapterDataList[index]
      
      if (index < this.chapterDataList.length) {
        if (currentData.selects === undefined || currentData.selects.length === 0) { // 文本段落
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
          if (currentData.type === 0) { // bad-end结局
            this.pargaraphType = 0
          }
        } else if (currentData.selects.length > 1) { // 选择
          this.currentSelect = {
            select: currentData.selects,
            content: currentData.selects_key
          }
          this.selectVisible = true // 显示选择弹框
          // 根据选择的结果加载对应的段落
          this.currentParagraphID += 1
        }
      } else {
        if (this.pargaraphType === 0) {
          this.currentParagraphID = 0
          fetchAphorism().then(res => { // 获取名言
            console.log(res)
            this.aphorism.text = res.data.text
            this.aphorism.author = res.data.author
            this.maskVisible = true
            this.pargaraphType = null
          })
        } else {
          this.$message({
            message: '本章已结束',
            type: 'warning',
            duration: 1000
          })
        }
      }
    },
    fetchOneChapterFun(id) { // 获取章节
      if (id) {
        this.chapterID = id
      }
      this.chapterList = []
      this.chapterDataList = []
      this.currentParagraphID = 0
      fetchOneChapter({ chapter_id: this.chapterID }).then(res => {
        const { chapter_id, paragraph_list, title } = res.data
        console.log(chapter_id)
        this.chapterTitle = title
        this.chapterDataList = paragraph_list
				this.chapterDataList.forEach((item) => {
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
    closeMask() {
      this.maskVisible = false
    }
  }
}
</script>

<style lang='scss'>
  @font-face {
    font-family: fzWzmxk;
    src: url('../../../assets/fonts/fz-wzmxk.TTF');
  }
  .content-box {
    width: 100%;
    display: flex;
    align-items: flex-end;
  }
  .chapter-box {
    width: calc(100% - 210px);
    height: 100%;
    background: url('../../../assets/typewriter.png') no-repeat bottom;
    position: relative;
    background-size: contain;
  }
  .text-box {
    padding: 10px 30px;
    position: absolute;
    box-sizing: border-box;
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
  .list-item-box > p {
    text-indent: 2rem;
    letter-spacing: .5px;
    user-select: none;
  }
  .current-text {
    position: absolute;
    top: 50%;
    left: 32%;
    width: 666px;
    z-index: 9999;
  }
  .mask-layer {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    background-color: #000;
  }
  .aphorism-box {
    width: 60%;
    margin: 0 auto;
  }
  .aphorism-box > p {
    margin: 15px 0 30px;
    color: #ff4141;
    user-select: none;
  }
  .aphorism-text {
    text-align: center;
    font-size: 50px;
    font-family: fzWzmxk;
  }
  .aphorism-author {
    font-size: 22px;
    text-align: right;
  }
  .mask-enter-active, .mask-leave-active {
    transition: opacity .8s ease;
    transition-delay: .1s;
  }
  .mask-enter-from, .mask-leave-to {
    opacity: 0;
  }
</style>