const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AphorismModel = mongoose.model('aphorism');

// 新增名言
router.post('/add', (req, res) => {
  new AphorismModel({ // 新增分支
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

// 查询名言
router.get('/fetch', (req, res) => {
  AphorismModel.aggregate([
    { $sample: { size: 1 } }
  ], (err, doc) => {
    if (!err && doc) {
      return res.json({ code: 20000, msg: '名言获取成功！', data: doc[0] })
    }
  })
})

module.exports = router;