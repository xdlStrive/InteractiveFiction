<!-- 主页 -->
<template>
  <div class="pageBox">
    <div ref="textBox" class="textBox">{{obj.output}}</div>
  </div>
</template>

<script>
import EasyTyper from 'easy-typer-js'
export default {
  data () {
    return {
      obj: {
        output: '',
        type: 'rollback',
        isEnd: false,
        speed: 200,
        backSpeed: 40,
        sleep: 100,
        singleBack: false
      }
    };
  },
  components: {
    
  },
  mounted() {
    new EasyTyper(this.obj, `我将要被打字机输出`)
  },
  methods: {
    
  }
}

</script>
<style lang='scss' scoped>
  .pageBox {
    height: 100%;
    background-image: url('../../assets/typewriter.png');
  }
</style>