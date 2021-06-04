const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const branchModel = mongoose.model('branch');
const CounterModel = mongoose.model('counter');

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
    new branchModel({ // 新增分支
      branch_id: doc.counter_num,
      type: req.body.type,
      note: req.body.note,
      members: req.body.members, // 与user进行关联
    }).save((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      res.json({
        code: 20000,
        msg: '新增章节成功！',
        data: docs
      })
    })
  })
})