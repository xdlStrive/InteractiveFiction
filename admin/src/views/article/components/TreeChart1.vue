<template>
  <div style="height: calc(100vh - 70px);">
    <RelationGraph ref="relationGraph" :options="graphOptions" :on-node-click="onNodeClick" />
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
        layouts: [{
          label: '中心',
          layoutName: 'tree',
          from: 'top',
          centerOffset_x: -20,
          min_per_width: 120,
          max_per_width: 200,
          min_per_height: 200
        }],
        defaultNodeWidth: 80,
        defaultNodeHeight: 40,
        defaultJunctionPoint: 'tb',
        defaultNodeShape: 1,
        defaultLineShape: 4,
        allowShowMiniToolBar: false,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultFocusRootNode: false,
        defaultNodeBorderWidth: 3
      }
    }
  },
  mounted() {
    this.showGraph()
  },
  methods: {
    showGraph() {
      const jsonData = {
        rootId: 'a',
        nodes: [
          { id: 'a', text: '开始节点' },
          { id: 'b', text: 'B', fontColor: 'yellow' },
          { id: 'c', text: 'C' },
          { id: 'd', text: 'E' }
        ],
        links: [
          // link配置选项：http://relation-graph.com/#/docs/link
          { from: 'a', to: 'b', text: '', lineShape: 4 },
          { from: 'b', to: 'c', text: '', lineShape: 4 },
          { from: 'c', to: 'd', text: '', lineShape: 4 }
        ]
      }
      this.$refs.relationGraph.setJsonData(jsonData, (seeksRGGraph) => {
        // 图形完成回调
        console.log(seeksRGGraph)
      })
    },
    onNodeClick(node, event) {
      console.log(node)
      console.log(event)
    }
  }
}
</script>

<style>

</style>
