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
      selects: req.body.selects,
      selectType: req.body.selectType
    }).save((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      res.json({ code: 20000, msg: '新增段落成功！', data: docs })
    })
  })
})

// 修改段落
router.post('/modify', (req, res) => {
  const contentIndex = 'content.' + req.body.index
  ParagraphModel.findOneAndUpdate({ paragraph_id: req.body.paragraph_id }, {
    $set: {
      [contentIndex] : req.body.content
    } 
  }, { new: true }, (err, doc) => {
    if (err) {
      res.json({ code: 20000, msg: err })
    }
    res.json({ code: 20000, msg: '修改段落成功！', data: doc })
  })
})

module.exports = router;