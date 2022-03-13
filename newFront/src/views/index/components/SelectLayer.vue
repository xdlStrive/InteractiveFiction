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
      <el-button
        v-for="(item, index) in props.selectItem.content"
        :key="index"
        class="select-item"
        @click="handleSelect(index)"
      >{{ item }}</el-button>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const props = defineProps<{
    selectItem: string
  }>()

  const emits = defineEmits<{
    (e: 'update:selectIndex', data: string): void
  }>()

  let dialogVisible = ref(true)

  console.log(props.selectItem)

  function handleSelect(index:number) {
    emits('update:selectIndex', props.selectItem.select[index])
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
  margin: 0 0 30px 0 !important;
}
</style>