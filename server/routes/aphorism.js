const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AphorismModel = mongoose.model('aphorism');
const CounterModel = mongoose.model('counter');

// 新增名言
router.post('/add', (req, res) => {
  CounterModel.findOneAndUpdate({
    counter_id: 'aphorism'
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
    new AphorismModel({ // 新增名言
      aphorism_id: doc.counter_num,
      text: req.body.text,
      author: req.body.author
    }).save((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      res.json({
        code: 20000,
        msg: '新增名言成功！',
        data: docs
      })
    })
  })
})

// 获取随机的一条名言
router.get('/fetch', (req, res) => {
  AphorismModel.aggregate([
    { $sample: { size: 1 } }
  ], (err, doc) => {
    if (!err && doc) {
      return res.json({ code: 20000, msg: '名言获取成功！', data: doc[0] })
    }
  })
})

// 获取名言列表
router.get('/fetchList', (req, res) => {
  const pageNum = req.query.pageNum,
    pageSize = req.query.pageSize;
  AphorismModel.count({}, (err, count) => {
    AphorismModel.find({}, {
      aphorism_id: 1,
      text: 1,
      author: 1,
      create_time: 1,
      _id: 0
    }).skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .sort({
      chapter_id: 1
    }).exec((err, doc) => {
      if (err) {
        res.json({ code: 20000, msg: err })
      }
      res.json({ code: 20000, msg: '名言获取成功！', data: doc, count: count })
    })
  })
})

// 修改名言
router.post('/modify', (req, res) => {
  console.log(req.body)
  AphorismModel.findOneAndUpdate({ aphorism_id: req.body.aphorism_id }, {
    text: req.body.text,
    author: req.body.author
  }, { new: true }, (err, doc) => {
    if (err) {
      res.json({ code: 20000, msg: err })
    }
    res.json({ code: 20000, msg: '修改名言成功！', data: doc })
  })
})

//删除名言接口
router.delete('/delete', function (req, res) {
  let id = req.body.aphorism_id;
  AphorismModel.findOneAndDelete(id).exec().then(() => {
    return res.json({ code: 20000, msg: '名言删除成功！' })
  }).catch((err) => {
    res.json({ code: 1, message: '后端出错:' + err })
  })
})

module.exports = router;