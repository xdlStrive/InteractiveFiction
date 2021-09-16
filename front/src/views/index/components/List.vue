<template>
  <transition name="list">
    <div v-if="listVisible" class="aside-box">
      <div id="left-tree-box">
        <el-tree
          :props="props"
          :load="fetchChapterListFun"
          :default-expanded-keys="[1.1]"
          node-key="n_id"
          lazy
          accordion
          ref="tree"
          highlight-current
          class="treeBox"
          @node-expand="openNode"
          @node-click="handleNodeClick"
        />
        <div class="list-visible-btn" @click="handelAsideHidden">
          <el-icon>
            <caret-left v-if="listVisible" />
            <caret-right v-if="!listVisible" />
          </el-icon>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import { fetchVolumeList } from '@/api/volume'
  import { fetchVolumesChapterList } from '@/api/chapter'
  import { fetchOneChapter } from '@/api/chapter'
  import { CaretLeft } from '@element-plus/icons'
  import { CaretRight } from '@element-plus/icons'

  export default {
    components: {
      CaretLeft, CaretRight
    },
    props: [
      'archiveId'
    ],
    data () {
      return {
        props: {
          label: 'title', // 这里设置的值需要与后台传回的值一一对应
          children: '',
          isLeaf: 'leaf'
        },
        listVisible: true,
        currentVolumeID: 1,
        volumeList: [],
        chapterList: [],
        treeNode: {},
        treeResolve: {},
      }
    },
    methods: {
      openNode(data) { // 绑定树形卷的展开事件
        this.currentVolumeID = data.volume_id
        console.log(this.currentVolumeID)
      },
      fetchVolumeListFun() { // 获取卷列表
        return new Promise(resolve => {
          fetchVolumeList().then(res => {
            if (res.code === 20000) {
              this.volumeList = res.data
              resolve()
            }
          })
        })
      },
      async fetchChapterListFun(node, resolve) { // 获取列表
        if (node.level === 0) { // 卷列表
          this.treeNode = node
          this.treeResolve = resolve
          await this.fetchVolumeListFun()
          resolve(this.volumeList)
        } else { // 章节列表
          const params = {
            volume_id: node.data.n_id
          }
          fetchVolumesChapterList(params).then(res => {
            if (res.code === 20000) {
              this.chapterList = res.data
            }
            resolve(res.data)
            this.setNodeCheacked()
          })
        }
      },
      handleNodeClick(data, node) { // 树形节点点击事件
        if (node.level === 2) {
          this.$emit('fetchOneChapter', data.n_id)
        }
      },
      fetchChapter(chapterID) { // 获取章节
        this.chapterID = chapterID
        const params = {
          chapter_id: chapterID
        }
        fetchOneChapter(params).then(res => {
          if (res.code === 20000) {
            this.editTextVisible = true
            this.chapterTitle = res.data.title
            this.paragraphList = res.data.paragraph_list
          }
        })
      },
      handelAsideHidden() { // 章节列表显示隐藏
        this.listVisible = false
      },
      setNodeCheacked(id) { // 设置树节点选中状态
        if (id) {
          console.log('id')
          this.$refs.tree.setCurrentKey(id)
        } else {
          this.$refs.tree.setCurrentKey(this.archiveId)
        }
      }
    }
  }
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
  .list-enter-active, .list-leave-active {
    width: 190px;
    transition: .8s ease;
  }
  .list-enter-from, .list-leave-to {
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