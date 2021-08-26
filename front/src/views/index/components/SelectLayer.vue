<template>
  <div>
    <el-dialog
    v-model="dialogVisible"
    width="30%"
    custom-class="dialog-box"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    >
      <el-button v-for="(item, index) in selectItem.content" :key="index" class="select-item" @click="handleSelect(index)">{{item}}</el-button>
    </el-dialog>
  </div>
</template>

<script>
import { ElDialog, ElButton } from 'element-plus'
import { h } from 'vue'
export default {
  components: {
    ElDialog, ElButton, h
  },
  props: ['selectItem', 'selectIndex'],
  data() {
    return {
      dialogVisible: true
    }
  },
  created () {
    console.log(this.selectItem)
  },
  methods: {
    handleSelect(index) {
      this.$emit('update:selectIndex', this.selectItem.select[index])
    }
  }
}
</script>

<style>
  .dialog-box > .el-dialog__body {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    box-sizing: border-box;
  }
  .select-item {
    width: 70%;
    margin: 0 0 30px 0!important;
  }
</style>