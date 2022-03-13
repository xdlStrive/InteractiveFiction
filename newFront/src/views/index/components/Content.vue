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
  let chapterTitle = ref('')
  let chapterDataList = reactive([])
  let chapterList = reactive([])
  let currentParagraphID = ref(0)
  let	currentSelect = reactive({
    select: [],
    content: []
  })
  let	selectVisible = ref(false)
  let selectIndex = ref(null)
  let paragraphHeight = ref(0)
  let textBox = reactive({
    screenWidth: document.body.clientWidth,
    screenHeight: document.body.clientHeight,
    width: null,
    height: null,
    top: null,
    left: null ,
  })
  let pargaraphType = ref(null)
  let maskVisible = ref(false)
  let aphorism = reactive({
    text: '',
    author: ''
  })
  let archiveID = ref(null)

  // 加载段落
  function loadParagraph() {
    const index = currentParagraphID.value
    const currentData = chapterDataList[index]

    if (index < chapterDataList.length) {
      if (currentData.selects === undefined || currentData.selects.length === 0) { // 文本段落
        chapterList.push(currentData.content)
        currentParagraphID.value++
        $nextTick(() => {
          typerFun($refs[`listItemBox${index}`])
          // $refs[`listItemBox${index}`].style.display = 'block'
          $refs[`listItemBox${index}`].scrollTop = 100
          $refs[`listItemBox${index}`].scrollIntoView({
            block: 'end',
            behavior: 'smooth'
          })
        })
        if (currentData.type === 0) { // bad-end结局
          pargaraphType.value = 0
          const params = {
            archive: [chapterID, chapterID]
          }
          saveArchive(params).then(res => { // bad-end 存档
            console.log(res)
          })
        }
      } else if (currentData.selects.length > 1) { // 选择
        currentSelect = {
          select: currentData.selects,
          content: currentData.selects_key
        }
        selectVisible.value = true // 显示选择弹框
        // 根据选择的结果加载对应的段落
        currentParagraphID.value++
      }
    } else {
      if (pargaraphType.value === 0) {
        currentParagraphID.value = 0
        fetchAphorism().then(res => { // 获取名言
          console.log(res)
          aphorism.text = res.data.text
          aphorism.author = res.data.author
          maskVisible.value = true
          pargaraphType.value = null
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

  function fetchOneChapterFun(id:number) { // 获取章节
    if (id) {
      chapterID.value = id
    }
    chapterList = []
    chapterDataList = []
    currentParagraphID.value = 0
    fetchOneChapter({ chapter_id: chapterID }).then(res => {
      const { chapter_id, paragraph_list, title } = res.data
      chapter_id
      chapterTitle = title
      chapterDataList = paragraph_list
      chapterDataList.forEach((item) => {
        if (item.content.length === 1) { // 普通段落
          chapterList.push(item.content)
        } else if (item.selects.length > 1) { // 带选项的段落
          currentSelect = {
            select: item.selects,
            content: item.selects_key
          }
          chapterList = chapterList.concat(item.content) // 合并数组
        }
      })
      loadParagraph() // 自动加载第一段
      const params = {
        archive: [chapterID]
      }
      saveArchive(params).then(res => {
        // console.log(res)
        res
      })
    })
  }

  function closeMask() { // 关闭名言事件
    maskVisible.value = false
    fetchArchive().then(res => { // 获取章节
      fetchOneChapterFun(res.data[1])
      $refs.tree.setNodeCheacked(res.data[1])
    })
  }

  function calculateReadingAreaSize() { // 计算阅读区大小
    $nextTick(() => {
      textBox.width = $refs.chapterBox.offsetWidth * 0.5989583
      textBox.height = $refs.chapterBox.offsetWidth * 0.46875 * 0.622222
      textBox.top = $refs.chapterBox.offsetWidth * 0.46875 * 0.088888 + ($refs.chapterBox.offsetHeight - $refs.chapterBox.offsetWidth * 0.46875)
      textBox.left = $refs.chapterBox.offsetWidth * 0.2135416
    })
  }

  async function typerFun(target) { // 打字机效果
    for (let [index, value] of Object.entries(target.children)) {
      await loadTyperText(target, index, value)
    }
  }

  function loadTyperText(target, index, value) { // 加载打字文字
    return new Promise(resolve => {
      const textArr = value.innerHTML.split('')
      let indexs = 0
      let text = ''
        
      value.innerHTML = 0
      target.children[index].style.display = 'block'

      const timer = setInterval(() => {
        text += textArr[indexs]
        value.innerHTML = text
        indexs++
        if (indexs >= textArr.length) {
          clearInterval(timer)
          resolve(timer)
        }
      }, 50) // 文字加载延迟
      return timer
    })
  }

// 
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
//       return textBox.screenWidth
//     }
//   },
// 	watch: {
// 		selectIndex(val) {
//       const currentParagraphIndex = currentParagraphID

//       fetchBranch({branch_id: val}).then((res) => {
//         res.data.paragraph_list.forEach((item, index) => {
//           chapterList.splice(currentParagraphIndex + index, 0, item.content[0])
//           chapterDataList.push(item)
//         })
//         loadParagraph()
//       })
//       currentParagraphID++
//       $nextTick(() => {
//         $refs[`listItemBox${currentParagraphIndex}`].style.display = 'block'
//         $refs[`listItemBox${currentParagraphIndex}`].scrollTop = 200
//         $refs[`listItemBox${currentParagraphIndex}`].scrollIntoView({
//           block: 'end',
//           behavior: 'smooth'
//         })
//       })
//       selectVisible = false
      
// 		},
//     screenWidth: {
//       handler() {
//         calculateReadingAreaSize() // 重计算阅读区大小
//       },
//       immediate: true
//     },
//     // chapterList(value) {
//     //   // console.log(value)
//     //   // console.log(value.length)
//     //   // typerFun(value[value.length - 1])
//     // }
// 	},
//   created() {
//     fetchArchive().then(res => { // 获取章节
//       fetchOneChapterFun(res.data[0])
//       archiveID = res.data[0]
//     })
//     window.onresize = () => { // 监听窗口大小变化
//       textBox.screenWidth = document.body.clientWidth
//     }
//   },
//   methods: {
//     // 加载段落
//     loadParagraph() {
//       const index = currentParagraphID
//       const currentData = chapterDataList[index]

//       if (index < chapterDataList.length) {
//         if (currentData.selects === undefined || currentData.selects.length === 0) { // 文本段落
//           chapterList.push(currentData.content)
//           currentParagraphID++
//           $nextTick(() => {
//             typerFun($refs[`listItemBox${index}`])
//             // $refs[`listItemBox${index}`].style.display = 'block'
//             $refs[`listItemBox${index}`].scrollTop = 100
//             $refs[`listItemBox${index}`].scrollIntoView({
//               block: 'end',
//               behavior: 'smooth'
//             })
//           })
//           if (currentData.type === 0) { // bad-end结局
//             pargaraphType = 0
//             const params = {
//               archive: [chapterID, chapterID]
//             }
//             saveArchive(params).then(res => { // bad-end 存档
//               console.log(res)
//             })
//           }
//         } else if (currentData.selects.length > 1) { // 选择
//           currentSelect = {
//             select: currentData.selects,
//             content: currentData.selects_key
//           }
//           selectVisible = true // 显示选择弹框
//           // 根据选择的结果加载对应的段落
//           currentParagraphID++
//         }
//       } else {
//         if (pargaraphType === 0) {
//           currentParagraphID = 0
//           fetchAphorism().then(res => { // 获取名言
//             console.log(res)
//             aphorism.text = res.data.text
//             aphorism.author = res.data.author
//             maskVisible = true
//             pargaraphType = null
//           })
//         } else {
//           $message({
//             message: '本章已结束',
//             type: 'warning',
//             duration: 1000
//           })
//         }
//       }
//     },
//     fetchOneChapterFun(id) { // 获取章节
//       if (id) {
//         chapterID = id
//       }
//       chapterList = []
//       chapterDataList = []
//       currentParagraphID = 0
//       fetchOneChapter({ chapter_id: chapterID }).then(res => {
//         const { chapter_id, paragraph_list, title } = res.data
//         chapter_id
//         chapterTitle = title
//         chapterDataList = paragraph_list
// 				chapterDataList.forEach((item) => {
// 					if (item.content.length === 1) { // 普通段落
// 						chapterList.push(item.content)
// 					} else if (item.selects.length > 1) { // 带选项的段落
// 						currentSelect = {
// 							select: item.selects,
// 							content: item.selects_key
// 						}
//             chapterList = chapterList.concat(item.content) // 合并数组
// 					}
// 				})
//         loadParagraph() // 自动加载第一段
//         const params = {
//           archive: [chapterID]
//         }
//         saveArchive(params).then(res => {
//           // console.log(res)
//           res
//         })
//       })
//     },
//     closeMask() { // 关闭名言事件
//       maskVisible = false
//       fetchArchive().then(res => { // 获取章节
//         fetchOneChapterFun(res.data[1])
//         $refs.tree.setNodeCheacked(res.data[1])
//       })
//     },
//     calculateReadingAreaSize() { // 计算阅读区大小
//       $nextTick(() => {
//         textBox.width = $refs.chapterBox.offsetWidth * 0.5989583
//         textBox.height = $refs.chapterBox.offsetWidth * 0.46875 * 0.622222
//         textBox.top = $refs.chapterBox.offsetWidth * 0.46875 * 0.088888 + ($refs.chapterBox.offsetHeight - $refs.chapterBox.offsetWidth * 0.46875)
//         textBox.left = $refs.chapterBox.offsetWidth * 0.2135416
//       })
//     },
//     async typerFun(target) { // 打字机效果
//       for (let [index, value] of Object.entries(target.children)) {
//         await loadTyperText(target, index, value)
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

<style>
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