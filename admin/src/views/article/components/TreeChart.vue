<template>
  <div style="height: calc(100vh - 55px);">
    <RelationGraph ref="relationGraph" :options="graphOptions" :on-node-click="onNodeClick" :on-line-click="onLineClick" />
  </div>
</template>

<script>
import RelationGraph from 'relation-graph'
export default {
  name: 'TreeChart',
  components: { RelationGraph },
  data() {
    return {
      graphOptions: {
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultJunctionPoint: 'tb'
      }
    }
  },
  mounted() {
    this.showGraph()
  },
  methods: {
    showGraph() {
      let jsonData = {
        rootId: 'a',
        nodes: [
          { id: 'a', text: 'A', borderColor: 'yellow' },
          { id: 'b', text: 'B', color: '#43a2f1', fontColor: 'yellow' },
          { id: 'c', text: 'C', nodeShape: 1, width: 80, height: 60 },
          { id: 'e', text: 'E', nodeShape: 0, width: 150, height: 150 }
        ],
        links: [
          // link配置选项：http://relation-graph.com/#/docs/link
          { from: 'a', to: 'b', text: '关系1', color: '#43a2f1' },
          { from: 'a', to: 'c', text: '关系2' },
          { from: 'a', to: 'e', text: '关系3' },
          { from: 'b', to: 'e', color: '#67C23A' }
        ]
      }
      this.$refs.relationGraph.setJsonData(jsonData, (seeksRGGraph) => {
        // 图形完成回调
      })
    }
  }
}
</script>

<style>

</style>
