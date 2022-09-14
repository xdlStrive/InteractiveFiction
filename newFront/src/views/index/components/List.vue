<template>
  <transition name="list">
    <div v-if="listVisible" class="aside-box">
      <div id="left-tree-box">
        <el-tree
          :props="treeProps"
          :load="fetchChapterListFun"
          :default-expanded-keys="[1.1]"
          node-key="n_id"
          lazy
          accordion ref="treeRef"
          highlight-current
          class="treeBox"
          @node-expand="openNode"
          @node-click="handleNodeClick"
        />
        <div class="list-visible-btn" @click="handelAsideHidden">
          <el-icon>
            <CaretLeft v-if="listVisible" />
            <CaretRight v-if="!listVisible" />
          </el-icon>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, reactive, watchEffect } from 'vue'
import { ElTree } from 'element-plus'
import { fetchVolumeList } from '@/api/volume'
import { fetchVolumesChapterList } from '@/api/chapter'
import { fetchOneChapter } from '@/api/chapter'
import 'element-plus/es/components/tree/style/css'


const props = defineProps(['archiveId'])
const emit = defineEmits(['fetchOneChapter'])

// watchEffect(() => {
//   console.log('props: ', props)
// })

const treeProps = reactive({
  label: 'title', // 这里设置的值需要与后台传回的值一一对应
  children: '',
  isLeaf: 'leaf'
})

const listVisible = ref(true)
let currentVolumeID = ref(1)
let volumeList = reactive([])
let chapterList = reactive([])
let treeNode = reactive({})
let treeResolve = reactive({})

const treeRef = ref<InstanceType<typeof ElTree>>()

function openNode(data) { // 绑定树形卷的展开事件
  currentVolumeID.value = data.volume_id
  console.log(currentVolumeID.value)
}

function fetchVolumeListFun() { // 获取卷列表
  return new Promise(resolve => {
    fetchVolumeList().then(res => {
      if (res.code === 20000) {
        volumeList = res.data
        resolve()
      }
    })
  })
}

async function fetchChapterListFun(node, resolve) { // 获取列表
  if (node.level === 0) { // 卷列表
    treeNode = node
    treeResolve = resolve
    await fetchVolumeListFun()
    resolve(volumeList)
  } else { // 章节列表
    const params = {
      volume_id: node.data.n_id
    }
    fetchVolumesChapterList(params).then(res => {
      if (res.code === 20000) {
        chapterList = res.data
      }
      resolve(res.data)
      setNodeCheacked(0)
    })
  }
}

function handleNodeClick(data, node) { // 树形节点点击事件
  if (node.level === 2) {
    emit('fetchOneChapter', data.n_id)
  }
}

function fetchChapter(chapterID) { // 获取章节
  chapterID.value = chapterID
  const params = {
    chapter_id: chapterID
  }
  fetchOneChapter(params).then(res => {
    if (res.code === 20000) {
      editTextVisible = true
      chapterTitle = res.data.title
      paragraphList = res.data.paragraph_list
    }
  })
}
function handelAsideHidden() { // 章节列表显示隐藏
  listVisible.value = false
}

function setNodeCheacked(id: number) { // 设置树节点选中状态
  if (id) {
    console.log('id', id)
    treeRef.value!.setCurrentKey(id)
  } else {
    // treeRef.value!.setCurrentKey(archiveId)
  }
}

defineExpose({ // 使用了<script setup>的子组件必须defineExpose导出属性/方法之后，才能被父组件调用到
  setNodeCheacked
})
</script>

<style lang="scss" scoped>
.aside-box {
  display: flex;
  padding: 10px;
  height: calc(100vh - 61px);
  background: #f3f3f3;
  box-sizing: border-box;
  overflow: hidden;
}

#left-tree-box {
  width: 190px;
  position: relative;
}

.list-enter-active,
.list-leave-active {
  width: 190px;
  transition: .8s ease;
}

.list-enter-from,
.list-leave-to {
  width: 10px;
}

.list-visible-btn {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 10px;
  background: #cacaca;
  height: 60px;
  display: flex;
  align-items: center;
  border-radius: 8px 0 0 8px;
}
</style>