<template>
  <el-table
    :data="dataList"
    border
    stripe
    :header-cell-style="{'text-align':'center'}"
    style="width: 100%">
    <el-table-column prop="select_id" label="ID" width="80" align="center" />
    <el-table-column prop="type" label="类型" width="160"
    align="center"
    :filters="[{ text: '重要抉择', value: '1' }, { text: 'bad-end 结局', value: '2' }, { text: '普通选择', value: '0' }]"
    :filter-method="filterType"
    >
      <template slot-scope="scope">
        <el-tag
          :type="scope.row.type === '0' ? 'primary' : (scope.row.type === '1' ? 'warning' : 'danger')"
          disable-transitions
          >
          {{ scope.row.type === '0' ? '普通选择' : (scope.row.type === '1' ? '重要抉择' : 'bad-end 结局') }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="note" label="描述" width="500" />
    <el-table-column prop="options" label="选项" width="785">
      <template slot-scope="scope">
        <div v-for="(item, index) in scope.row.options" :key="index">
          <span v-for="(item, index) in scope.row.options[index]" :key="index">{{ index === 'labelName' ? item + '： &nbsp;' : item }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="create_time" label="创建时间" width="180" align="center" />
  </el-table>
</template>

<script>
import { fetchListData } from '@/api/select'
export default {
  name: 'SelectList',
  data() {
    return {
      dataList: []
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    fetchList() { // 获取选择列表数据
      console.log(1)
      fetchListData().then(res => {
        console.log(2)
        if (res.code === 20000) {
          console.log(res.data)
          this.dataList = res.data
        }
      })
    },
    filterType(value, row) {
      return row.type === value;
    }
  }
}
</script>

<style lang="">

</style>
