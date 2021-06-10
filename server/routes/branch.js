const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const branchModel = mongoose.model('branch');
const CounterModel = mongoose.model('counter');

// 新增分支
router.post('/add', (req, res) => {
  CounterModel.findOneAndUpdate({
    counter_id: 'branch'
  }, {
    $inc: {
      counter_num: 1
    }
  }, {
    upsert: true,
    new: true // 返回更新后的数据，否则返回的是更新前的数据
  }, (err, doc) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(doc.counter_num)
    new branchModel({ // 新增分支
      branch_id: doc.counter_num,
      // type: req.body.type,
      // members: req.body.members, // 分支包含段落数组
    }).save((err, docs) => {
      if (err) {
        console.log('abc')
        console.log(err)
        return
      }
      res.json({
        code: 20000,
        msg: '新增分支成功！',
        data: docs
      })
    })
  })
})

// 修改分支
router.post('/modify', (req, res) => {
  const contentIndex = 'content.' + req.body.index
  branchModel.findOneAndUpdate({ paragraph_id: req.body.branch_id }, {
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