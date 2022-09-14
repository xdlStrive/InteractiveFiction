<!-- 主页 -->
<template>
  <div class="content-box">
    <List ref="treeRef" :archive-id="archiveId" @fetchOneChapter="fetchOneChapterFun" />
    <div class="chapter-box" ref="chapterRef">
      <el-scrollbar v-if="!maskVisible" @click="loadParagraph()" ref="textRef" class="text-box"
        :style="{ width: textBox.width + 'px', height: textBox.height + 'px', top: textBox.top + 'px', left: textBox.left + 'px' }">
        <div class="list-placeholder-box"></div>
        <div class="list-placeholder-box chapter-title">{{ chapterTitle }}</div>
        <div class="list-placeholder-box"></div>
        <div class="list-placeholder-box"></div>
        <div v-for="(item, index) in chapterList" :key="index" v-html="item" :ref="listItemRef" class="list-item-box" />
      </el-scrollbar>
      <transition name="mask">
        <div class="mask-layer" v-if="maskVisible" @click="closeMask">
          <transition name="mask">
            <div class="aphorism-box">
              <p class="aphorism-text">{{ aphorism.text }}</p>
              <p class="aphorism-author">—— {{ aphorism.author }}</p>
            </div>
          </transition>
        </div>
      </transition>
      <SelectLayer :selectItem="currentSelect" v-if="selectVisible" v-model:selectIndex="selectIndex" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import List from './List.vue'
import SelectLayer from './SelectLayer.vue'
import { fetchOneChapter } from '@/api/chapter'
import { fetchBranch } from '@/api/branch'
import { fetchAphorism } from '@/api/aphorism'
import { saveArchive, fetchArchive } from '@/api/user'

interface TextBox {
  screenWidth: number
  screenHeight: number
  width: number
  height: number
  top: number
  left: number
}

interface PervParagraph {
  timer: number
  value: HTMLDivElement | null
  valueCopy: string
}

interface ChapterDataListItem {
  chapter_id: number
  paragraph_id: number
  content: Array<string>
  create_time: string
  selects: undefined | Array<string>
  selects_key: undefined | Array<string>
}

interface CurrentSelect {
  select: Array<string>
  content: Array<string>
}

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
let chapterDataList: Array<ChapterDataListItem> = reactive([])
let chapterList: Array<Array<string>> = reactive([])
let currentParagraphID = ref(0)
let currentSelect: CurrentSelect = reactive({
  select: [],
  content: []
})
let selectVisible = ref(false)
let selectIndex = ref(0)
let paragraphHeight = ref(0)
let textBox: TextBox = reactive({
  screenWidth: document.body.clientWidth,
  screenHeight: document.body.clientHeight,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
})
let pargaraphType = ref(null)
let maskVisible = ref(false)
let aphorism = reactive({
  text: '',
  author: ''
})
let archiveId = ref(null)
let listItemRefs: Array<HTMLDivElement> = reactive([])
let typerFlag = ref(false)
const pervParagraph: PervParagraph = reactive({
  timer: 0,
  value: null,
  valueCopy: '',
})

const treeRef = ref()
const chapterRef = ref()
const textRef = ref()
const listItemRef = (el: HTMLDivElement) => {
  // console.log('el: ', el)
  if (el && !listItemRefs.find(item => item === el)) {
    listItemRefs.push(el)
  }
  return undefined
}

onMounted(() => {
  fetchArchive().then(res => { // 获取章节
    if (res.code === 20000) {
      fetchOneChapterFun(res.data[0]) // 默认加载第一章
      archiveId.value = res.data[0]
      // console.log('archiveId: ', archiveId.value)
    }
  })
  window.onresize = () => { // 监听窗口大小变化（要加个节流）
    textBox.screenWidth = document.body.clientWidth
  }
})

const screenWidth = computed(() => textBox.screenWidth)

watch(screenWidth, () => {
  calculateReadingAreaSize()
}, {
  immediate: true
})
watch(selectIndex, () => {
  if (selectIndex.value) {
    let currentParagraphIndex = currentParagraphID.value
    fetchBranch({ branch_id: selectIndex.value }).then((res) => {
      // console.log('res: ', res)
      res.data.paragraph_list.forEach((item, index) => {
        chapterList.splice(currentParagraphIndex + index, 0, item.content[0])
        chapterDataList.push(item)
      })
      loadParagraph()
      currentParagraphID.value = currentParagraphIndex++
      nextTick(() => {
        // listItemRefs[currentParagraphIndex].style.display = 'block'
        console.log('listItemRefs: ', listItemRefs, currentParagraphIndex, listItemRefs[currentParagraphIndex])
        // debugger
        listItemRefs[currentParagraphIndex].scrollTop = 100
        listItemRefs[currentParagraphIndex].scrollIntoView({
          block: 'end',
          behavior: 'smooth'
        })
      })
    })
    selectVisible.value = false
  }
})

// 加载段落
function loadParagraph() {
  const index = currentParagraphID.value
  const currentData = chapterDataList[index]
  // console.log('currentData: ', currentData)

  // 先判断如果上一段还在加载，将上一段替换成完整的段落，然后接着加载当前段落
  // if (listItemRefs[index - 1] && typerFlag.value) {
  //   const parentNode = listItemRefs[index - 1].parentElement
  //   if (parentNode) {
  //     const fullTextNode = listItemRefs[index - 1]
  //     // 上一段未加载完的文字替换成完整的段落
  //     fullTextNode.innerHTML = chapterDataList[index - 1].content[0]
  //     fullTextNode.children[0].style.display = 'block'
  //     // 将完整的段落替换掉还未加载完的段落
  //     parentNode.replaceChild(fullTextNode, parentNode.children[index + 3])
  //   }
  // }

  if (listItemRefs[index - 1] && typerFlag.value && pervParagraph.timer) {
    clearTimeout(pervParagraph.timer);
    const { value, valueCopy } = pervParagraph
    value!.innerHTML = valueCopy
  }

  if (index < chapterDataList.length) {
    if (currentData.selects === undefined || currentData?.selects.length === 0) { // 文本段落
      chapterList.push(currentData.content)
      currentParagraphID.value++
      nextTick(() => {
        // console.log('listItemRefs[index]: ', listItemRefs, listItemRefs[index], index)
        typerFun(listItemRefs[index])
        listItemRefs[index].scrollTop = 100
        listItemRefs[index].scrollIntoView({
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
      // currentSelect = {
      //   select: currentData.selects,
      //   content: currentData.selects_key
      // }
      currentSelect.select = currentData.selects
      currentSelect.content = currentData.selects_key
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

function fetchOneChapterFun(id: number) { // 获取章节
  selectIndex.value = 0 // 重置选项，否则无法二次触发watch
  if (id) {
    chapterID.value = id
  }
  const loadingInstance = ElLoading.service({})
  listItemRefs.forEach(item => {
    item.remove()
  })
  listItemRefs.length = 0
  chapterList.length = 0 // 加载章节时先置空之前章节的段落
  currentParagraphID.value = 0 // 重置当前段落ID
  fetchOneChapter({ chapter_id: chapterID.value }).then(res => {
    const { chapter_id, paragraph_list, title } = res.data
    chapter_id
    chapterTitle.value = title
    chapterDataList = paragraph_list
    // chapterDataList.forEach((item) => {
    //   console.log('itemssss: ', item)
    //   if (item.content.length === 1) { // 普通段落
    //     // chapterList.push(item.content)
    //   } else if (item.selects.length > 1) { // 带选项的段落
    //     currentSelect = {
    //       select: item.selects,
    //       content: item.selects_key
    //     }
    //     // chapterList = chapterList.concat(item.content) // 合并数组
    //   }
    // })
    loadParagraph() // 自动加载第一段
      loadingInstance.close()
    const params = {
      archive: [chapterID]
    }
    saveArchive(params).then(res => { // 存档
      // console.log(res)
      res
    })
  })
}

function closeMask() { // 关闭名言事件
  maskVisible.value = false
  fetchArchive().then(res => { // 获取章节
    fetchOneChapterFun(res.data[0])
    treeRef.value.setNodeCheacked(res.data[0]) // 调用List子组件的方法设置树的节点选中
  })
}

function calculateReadingAreaSize() { // 计算阅读区大小
  nextTick(() => {
    textBox.width = chapterRef.value.offsetWidth * 0.5989583
    textBox.height = chapterRef.value.offsetWidth * 0.46875 * 0.622222
    textBox.top = chapterRef.value.offsetWidth * 0.46875 * 0.088888 + (chapterRef.value.offsetHeight - chapterRef.value.offsetWidth * 0.46875)
    textBox.left = chapterRef.value.offsetWidth * 0.2135416
  })
}

function typerFun(target: HTMLDivElement) { // 打字机效果
  for (let [index, value] of Object.entries(target.children)) { // 只写一段的话，不需要这个for of循环
    const valueCopy = value.innerHTML
    const textArr = value.innerHTML.split('')
    let indexs = 0
    let text = ''

    value.innerHTML = ''
    target.children[Number(index)].style.display = 'block'

    const timer = setInterval(() => {
      typerFlag.value = true
      text += textArr[indexs]
      value.innerHTML = text
      indexs++
      if (indexs >= textArr.length) {
        clearInterval(timer)
        // resolve(timer)
        typerFlag.value = false
      }
    }, 50) // 文字加载延迟
    pervParagraph.timer = timer as unknown as number
    pervParagraph.value = value as HTMLDivElement
    pervParagraph.valueCopy = valueCopy
  }
}

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
  display: block;
  min-height: 40px;
}

.list-item-box {
  margin-bottom: 20px;
  transition: all 0.7s ease;
}

.list-item-box>p {
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

.aphorism-box>p {
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

.mask-enter-active,
.mask-leave-active {
  transition: opacity 1s ease;
  transition-delay: .1s;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}
</style>