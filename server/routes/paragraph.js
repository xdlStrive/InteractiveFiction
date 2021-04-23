const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ParagraphModel = mongoose.model('paragraphs');
const CounterModel = mongoose.model('counter');

// 新增段落接口
router.post('/add', (req, res) => {
  CounterModel.findOneAndUpdate({ counter_id: 'paragraph' }, {
    $inc: { counter_num: 1 }
  }, {
    'upsert': true,
    'new': true
  }, (err, doc) => {
    if (err) {
      console.log(err);
      return;
    }
    new ParagraphModel({    // 新增段落
      paragraph_id: doc.counter_num,
      chapter_id: req.body.chapter_id,
      content: req.body.content,
      select_id: req.body.select_id
    }).save((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      res.json({ code: 20000, msg: '新增段落成功！', data: docs })
    })
  })
})

module.exports = router;