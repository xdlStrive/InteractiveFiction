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
        <div v-for="(item, index) in chapterList" :key="index" v-html="item" :ref="listItemRef" class="list-item-box">
        </div>
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
      <!--  eslint-disable-line vue/no-v-model-argument 忽略eslint报错 -->
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
let currentSelect = reactive({
  select: [],
  content: []
})
let selectVisible = ref(false)
let selectIndex = ref(null)
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
let listItemRefs = reactive([])

const treeRef = ref()
const chapterRef = ref()
const textRef = ref()
const listItemRef = el => {
  if (!listItemRefs.find(item => item === el)) {
    listItemRefs.push(el)
  }
}

onMounted(() => {
  fetchArchive().then(res => { // 获取章节
    if (res.code === 20000) {
      // fetchOneChapterFun(res.data[0])
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

// 加载段落
function loadParagraph() {
  const index = currentParagraphID.value
  const currentData = chapterDataList[index]

  if (index < chapterDataList.length) {
    if (currentData.selects === undefined || currentData?.selects.length === 0) { // 文本段落
      chapterList.push(currentData.content)
      currentParagraphID.value++
      nextTick(() => {
        typerFun(listItemRefs[index])
        // $refs[`listItemBox${index}`].style.display = 'block'
        // $refs[`listItemBox${index}`].scrollTop = 100
        // $refs[`listItemBox${index}`].scrollIntoView({
        //   block: 'end',
        //   behavior: 'smooth'
        // })
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

function fetchOneChapterFun(id: number) { // 获取章节
  if (id) {
    chapterID.value = id
  }
  let chapterList = []
  chapterDataList = []
  currentParagraphID.value = 0
  fetchOneChapter({ chapter_id: chapterID.value }).then(res => {
    const { chapter_id, paragraph_list, title } = res.data
    chapter_id
    chapterTitle.value = title
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
    treeRef.value.setNodeCheacked(res.data[1])
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