<template>
  <div class="leftBox">
    <div id="left-tree-box">
      <el-tree
        :props="props"
        :load="fetchChapterListFun"
        :default-expanded-keys="[1]"
        node-key="volume_id"
        lazy
        accordion
        highlight-current
        class="treeBox"
        @node-expand="openNode"
        @node-click="handleNodeClick"
      />
    </div>
  </div>
</template>

<script>
  import { ElTree } from "element-plus"
  import { fetchVolumeList } from '@/api/volume'
  import { fetchVolumesChapterList } from '@/api/chapter'
  import { fetchOneChapter } from '@/api/chapter'

  export default {
    components: {
      ElTree
    },
    data () {
      return {
        props: {
          label: 'title', // 这里设置的值需要与后台传回的值一一对应
          children: '',
          isLeaf: 'leaf'
        },
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
      async fetchChapterListFun(node, resolve) { // 获取章节列表
        if (node.level === 0) {
          this.treeNode = node
          this.treeResolve = resolve
          await this.fetchVolumeListFun()
          return resolve(this.volumeList)
        } else {
          const params = {
            volume_id: node.data.volume_id
          }
          fetchVolumesChapterList(params).then(res => {
            if (res.code === 20000) {
              this.chapterList = res.data
            }
            return resolve(res.data)
          })
        }
      },
      handleNodeClick(data, node) { // 树形节点点击事件
        if (node.level === 2) {
          this.fetchChapter(data.chapter_id)
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
    }
  }
</script>

<style lang="scss" scoped>
  .leftBox {
    display: flex;
    padding: 10px;
    height: calc(100vh - 50px);
    background: #f3f3f3;
    box-sizing: border-box;
    overflow: hidden;
  }
  #left-tree-box {
    width: 190px;
  }
</style>