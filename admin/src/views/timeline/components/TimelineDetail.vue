<template>
  <div id="timelineBox">
    <el-row>
      <el-button v-permission="'audience'" type="primary" icon="el-icon-plus" circle @click="dialogTableVisible = true" />
    </el-row>
    <el-dialog title="新增时间轴节点" width="40%" :visible.sync="dialogTableVisible">
      <el-form :model="form">
        <el-form-item label="节点标题">
          <el-input v-model="form.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="详细内容">
          <el-input v-model="form.desc" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitTimelineItem">确 定</el-button>
        <el-button @click="dialogTableVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-timeline v-infinite-scroll="load" style="overflow:auto">
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :timestamp="activity.create_time"
        placement="top"
      >
        <el-card>
          <h4>{{ activity.title }}</h4>
          <p class="timeline_details">{{ activity.desc }}</p>
          <p class="timeline_info">by: {{ activity.creator[0].nickname }}  提交于 {{ activity.detailTime }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { postTimelineItem } from '@/api/timeline'
import { fetchTimelineList } from '@/api/timeline'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  name: 'Timeline',
  directives: {
    permission
  },
  props: {
    isRevise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activities: [],
      count: 0,
      dialogTableVisible: false,
      form: {
        title: '',
        desc: ''
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      fetchTimelineList().then(res => {
        console.log(res.data)
        this.activities = res.data
        // this.activities.push(res.data)
      })
    },
    load() {
      this.count += 2
    },
    submitTimelineItem() {
      this.dialogTableVisible = false
      const params = {
        title: this.form.title,
        desc: this.form.desc,
        creator_id: this.$store.state.user.id
      }
      postTimelineItem(params).then(res => {
        this.fetchList()
      })
    }
  }
}
</script>

<style>
  #timelineBox {
    padding: 60px 20% 50px 6%;
    display: flex;
    justify-content: space-between;
  }
  .el-row {
    margin-top: 30px;
  }
  .el-button.is-circle {
    padding: 12px;
  }
  .el-icon-plus {
    font-size: 26px!important;
    font-weight: 700;
  }
  .el-timeline {
    width: 75%;
    padding-left: 5px;
  }
  .el-timeline-item__wrapper {
    padding-left: 60px;
  }
  .el-timeline-item__timestamp {
    font-size: 15px;
  }
  .el-card__body {
    padding: 10px 20px;
  }
  .el-card__body > h4 {
    margin: 10px 0 20px;
    font-size: 16px;
  }
  .timeline_details {
    margin-bottom: 20px;
  }
  .timeline_info {
    color: #888;
  }
  .dialog-footer {
    text-align: center;
  }
</style>
