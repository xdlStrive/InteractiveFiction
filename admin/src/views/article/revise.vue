<template>
  <article-detail :is-revise="true" />
</template>

<script>
import ArticleDetail from './components/ArticleDetail'

export default {
  name: 'ReviseArticles',
  components: { ArticleDetail }
}
</script>
