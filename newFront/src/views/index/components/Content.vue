<!-- 主页 -->
<template>
  <div class="content-box">
    <List ref="tree" :archive-id="archiveID" @fetchOneChapter="fetchOneChapterFun" />
    <div class="chapter-box" ref="chapterBox">
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

      <SelectLayer :selectItem="currentSelect" v-if="selectVisible" v-model:selectIndex="selectIndex" /><!--  eslint-disable-line vue/no-v-model-argument 忽略eslint报错 -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import List from './List.vue'
import SelectLayer from './SelectLayer.vue'
import { fetchOneChapter } from '@/api/chapter'
import { fetchBranch } from '@/api/branch'
import { fetchAphorism } from '@/api/aphorism'
import { saveArchive, fetchArchive } from '@/api/user'

const typerOptions = reactive({
  output: '',
  type: 'normal',
  isEnd: false,
  speed: 10,
  backSpeed: 40,
  sleep: 100,
  singleBack: false,
  sentencePause: false
})

let chapterID = ref(1)
let chapterTitle = ''
let chapterDataList = []
let chapterList = []
let currentParagraphID = 0
let	currentSelect = reactive({
  select: [],
  content: []
})
let	selectVisible = false
let selectIndex = null
let paragraphHeight = 0
let textBox = reactive({
  screenWidth: document.body.clientWidth,
  screenHeight: document.body.clientHeight,
  width: null,
  height: null,
  top: null,
  left: null ,
})
let pargaraphType = null
let maskVisible = false
let aphorism = reactive({
  text: '',
  author: ''
})
let archiveID = null

// 加载段落
//     loadParagraph() {
//       const index = this.currentParagraphID
//       const currentData = this.chapterDataList[index]

//       if (index < this.chapterDataList.length) {
//         if (currentData.selects === undefined || currentData.selects.length === 0) { // 文本段落
//           this.chapterList.push(currentData.content)
//           this.currentParagraphID++
//           this.$nextTick(() => {
//             this.typerFun(this.$refs[`listItemBox${index}`])
//             // this.$refs[`listItemBox${index}`].style.display = 'block'
//             this.$refs[`listItemBox${index}`].scrollTop = 100
//             this.$refs[`listItemBox${index}`].scrollIntoView({
//               block: 'end',
//               behavior: 'smooth'
//             })
//           })
//           if (currentData.type === 0) { // bad-end结局
//             this.pargaraphType = 0
//             const params = {
//               archive: [this.chapterID, this.chapterID]
//             }
//             saveArchive(params).then(res => { // bad-end 存档
//               console.log(res)
//             })
//           }
//         } else if (currentData.selects.length > 1) { // 选择
//           this.currentSelect = {
//             select: currentData.selects,
//             content: currentData.selects_key
//           }
//           this.selectVisible = true // 显示选择弹框
//           // 根据选择的结果加载对应的段落
//           this.currentParagraphID++
//         }
//       } else {
//         if (this.pargaraphType === 0) {
//           this.currentParagraphID = 0
//           fetchAphorism().then(res => { // 获取名言
//             console.log(res)
//             this.aphorism.text = res.data.text
//             this.aphorism.author = res.data.author
//             this.maskVisible = true
//             this.pargaraphType = null
//           })
//         } else {
//           this.$message({
//             message: '本章已结束',
//             type: 'warning',
//             duration: 1000
//           })
//         }
//       }
//     },
//     fetchOneChapterFun(id) { // 获取章节
//       if (id) {
//         this.chapterID = id
//       }
//       this.chapterList = []
//       this.chapterDataList = []
//       this.currentParagraphID = 0
//       fetchOneChapter({ chapter_id: this.chapterID }).then(res => {
//         const { chapter_id, paragraph_list, title } = res.data
//         chapter_id
//         this.chapterTitle = title
//         this.chapterDataList = paragraph_list
// 				this.chapterDataList.forEach((item) => {
// 					if (item.content.length === 1) { // 普通段落
// 						this.chapterList.push(item.content)
// 					} else if (item.selects.length > 1) { // 带选项的段落
// 						this.currentSelect = {
// 							select: item.selects,
// 							content: item.selects_key
// 						}
//             this.chapterList = this.chapterList.concat(item.content) // 合并数组
// 					}
// 				})
//         this.loadParagraph() // 自动加载第一段
//         const params = {
//           archive: [this.chapterID]
//         }
//         saveArchive(params).then(res => {
//           // console.log(res)
//           res
//         })
//       })
//     },
//     closeMask() { // 关闭名言事件
//       this.maskVisible = false
//       fetchArchive().then(res => { // 获取章节
//         this.fetchOneChapterFun(res.data[1])
//         this.$refs.tree.setNodeCheacked(res.data[1])
//       })
//     },
//     calculateReadingAreaSize() { // 计算阅读区大小
//       this.$nextTick(() => {
//         this.textBox.width = this.$refs.chapterBox.offsetWidth * 0.5989583
//         this.textBox.height = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.622222
//         this.textBox.top = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.088888 + (this.$refs.chapterBox.offsetHeight - this.$refs.chapterBox.offsetWidth * 0.46875)
//         this.textBox.left = this.$refs.chapterBox.offsetWidth * 0.2135416
//       })
//     },
//     async typerFun(target) { // 打字机效果
//       for (let [index, value] of Object.entries(target.children)) {
//         await this.loadTyperText(target, index, value)
//       }
//     },
//     loadTyperText(target, index, value) { // 加载打字文字
//       return new Promise(resolve => {
//         const textArr = value.innerHTML.split('')
//         let indexs = 0
//         let text = ''
          
//         value.innerHTML = 0
//         target.children[index].style.display = 'block'

//         const timer = setInterval(() => {
//           text += textArr[indexs]
//           value.innerHTML = text
//           indexs++
//           if (indexs >= textArr.length) {
//             clearInterval(timer)
//             resolve(timer)
//           }
//         }, 50) // 文字加载延迟
//         return timer
//       })

// export default {
// 	components: {
//     List, SelectLayer
//   },
//   data () {
//     return {
//       typerOptions: {
//         output: '',
//         type: 'normal',
//         isEnd: false,
//         speed: 10,
//         backSpeed: 40,
//         sleep: 100,
//         singleBack: false,
//         sentencePause: false
//       },
//       chapterID: 1,
//       chapterTitle: '',
//       chapterDataList: [],
//       chapterList: [],
//       currentParagraphID: 0,
// 			currentSelect: {
// 				select: [],
// 				content: []
// 			},
// 			selectVisible: false,
// 			selectIndex: null,
//       paragraphHeight: 0,
//       textBox: {
//         screenWidth: document.body.clientWidth,
//         screenHeight: document.body.clientHeight,
//         width: null,
//         height: null,
//         top: null,
//         left: null ,
//       },
//       pargaraphType: null,
//       maskVisible: false,
//       aphorism: {
//         text: '',
//         author: ''
//       },
//       archiveID: null
//     };
//   },
//   computed: {
//     screenWidth() { // 监听screenWidth这个属性
//       return this.textBox.screenWidth
//     }
//   },
// 	watch: {
// 		selectIndex(val) {
//       const currentParagraphIndex = this.currentParagraphID

//       fetchBranch({branch_id: val}).then((res) => {
//         res.data.paragraph_list.forEach((item, index) => {
//           this.chapterList.splice(currentParagraphIndex + index, 0, item.content[0])
//           this.chapterDataList.push(item)
//         })
//         this.loadParagraph()
//       })
//       this.currentParagraphID++
//       this.$nextTick(() => {
//         this.$refs[`listItemBox${currentParagraphIndex}`].style.display = 'block'
//         this.$refs[`listItemBox${currentParagraphIndex}`].scrollTop = 200
//         this.$refs[`listItemBox${currentParagraphIndex}`].scrollIntoView({
//           block: 'end',
//           behavior: 'smooth'
//         })
//       })
//       this.selectVisible = false
      
// 		},
//     screenWidth: {
//       handler() {
//         this.calculateReadingAreaSize() // 重计算阅读区大小
//       },
//       immediate: true
//     },
//     // chapterList(value) {
//     //   // console.log(value)
//     //   // console.log(value.length)
//     //   // this.typerFun(value[value.length - 1])
//     // }
// 	},
//   created() {
//     fetchArchive().then(res => { // 获取章节
//       this.fetchOneChapterFun(res.data[0])
//       this.archiveID = res.data[0]
//     })
//     window.onresize = () => { // 监听窗口大小变化
//       this.textBox.screenWidth = document.body.clientWidth
//     }
//   },
//   methods: {
//     // 加载段落
//     loadParagraph() {
//       const index = this.currentParagraphID
//       const currentData = this.chapterDataList[index]

//       if (index < this.chapterDataList.length) {
//         if (currentData.selects === undefined || currentData.selects.length === 0) { // 文本段落
//           this.chapterList.push(currentData.content)
//           this.currentParagraphID++
//           this.$nextTick(() => {
//             this.typerFun(this.$refs[`listItemBox${index}`])
//             // this.$refs[`listItemBox${index}`].style.display = 'block'
//             this.$refs[`listItemBox${index}`].scrollTop = 100
//             this.$refs[`listItemBox${index}`].scrollIntoView({
//               block: 'end',
//               behavior: 'smooth'
//             })
//           })
//           if (currentData.type === 0) { // bad-end结局
//             this.pargaraphType = 0
//             const params = {
//               archive: [this.chapterID, this.chapterID]
//             }
//             saveArchive(params).then(res => { // bad-end 存档
//               console.log(res)
//             })
//           }
//         } else if (currentData.selects.length > 1) { // 选择
//           this.currentSelect = {
//             select: currentData.selects,
//             content: currentData.selects_key
//           }
//           this.selectVisible = true // 显示选择弹框
//           // 根据选择的结果加载对应的段落
//           this.currentParagraphID++
//         }
//       } else {
//         if (this.pargaraphType === 0) {
//           this.currentParagraphID = 0
//           fetchAphorism().then(res => { // 获取名言
//             console.log(res)
//             this.aphorism.text = res.data.text
//             this.aphorism.author = res.data.author
//             this.maskVisible = true
//             this.pargaraphType = null
//           })
//         } else {
//           this.$message({
//             message: '本章已结束',
//             type: 'warning',
//             duration: 1000
//           })
//         }
//       }
//     },
//     fetchOneChapterFun(id) { // 获取章节
//       if (id) {
//         this.chapterID = id
//       }
//       this.chapterList = []
//       this.chapterDataList = []
//       this.currentParagraphID = 0
//       fetchOneChapter({ chapter_id: this.chapterID }).then(res => {
//         const { chapter_id, paragraph_list, title } = res.data
//         chapter_id
//         this.chapterTitle = title
//         this.chapterDataList = paragraph_list
// 				this.chapterDataList.forEach((item) => {
// 					if (item.content.length === 1) { // 普通段落
// 						this.chapterList.push(item.content)
// 					} else if (item.selects.length > 1) { // 带选项的段落
// 						this.currentSelect = {
// 							select: item.selects,
// 							content: item.selects_key
// 						}
//             this.chapterList = this.chapterList.concat(item.content) // 合并数组
// 					}
// 				})
//         this.loadParagraph() // 自动加载第一段
//         const params = {
//           archive: [this.chapterID]
//         }
//         saveArchive(params).then(res => {
//           // console.log(res)
//           res
//         })
//       })
//     },
//     closeMask() { // 关闭名言事件
//       this.maskVisible = false
//       fetchArchive().then(res => { // 获取章节
//         this.fetchOneChapterFun(res.data[1])
//         this.$refs.tree.setNodeCheacked(res.data[1])
//       })
//     },
//     calculateReadingAreaSize() { // 计算阅读区大小
//       this.$nextTick(() => {
//         this.textBox.width = this.$refs.chapterBox.offsetWidth * 0.5989583
//         this.textBox.height = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.622222
//         this.textBox.top = this.$refs.chapterBox.offsetWidth * 0.46875 * 0.088888 + (this.$refs.chapterBox.offsetHeight - this.$refs.chapterBox.offsetWidth * 0.46875)
//         this.textBox.left = this.$refs.chapterBox.offsetWidth * 0.2135416
//       })
//     },
//     async typerFun(target) { // 打字机效果
//       for (let [index, value] of Object.entries(target.children)) {
//         await this.loadTyperText(target, index, value)
//       }
//     },
//     loadTyperText(target, index, value) { // 加载打字文字
//       return new Promise(resolve => {
//         const textArr = value.innerHTML.split('')
//         let indexs = 0
//         let text = ''
          
//         value.innerHTML = 0
//         target.children[index].style.display = 'block'

//         const timer = setInterval(() => {
//           text += textArr[indexs]
//           value.innerHTML = text
//           indexs++
//           if (indexs >= textArr.length) {
//             clearInterval(timer)
//             resolve(timer)
//           }
//         }, 50) // 文字加载延迟
//         return timer
//       })
//     }
//   }
// }
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
    transition: all 0.7s ease;
  }
  .list-item-box > p {
    display: none;
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
    transition: opacity 1s ease;
    transition-delay: .1s;
  }
  .mask-enter-from, .mask-leave-to {
    opacity: 0;
  }
</style>