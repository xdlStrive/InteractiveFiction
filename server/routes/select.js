const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const selectModel = mongoose.model('select');
const CounterModel = mongoose.model('counter');

// 新增选项
router.post('/newSelect', (req, res) => {
  CounterModel.findOneAndUpdate({ counter_id: 'select' }, {
    $inc: { counter_num: 1 } // $inc使counter_num字段进行+1的操作
  }, {
    upsert: true, // 如果没有就新增
    new: true  // 返回修改后的值
  }, (err, doc) => {
    if (err) throw err;
    new selectModel({
      select_id: doc.counter_num, // 选择支的id
      type: req.body.type, // 选择支的类型（一般选项、重要抉择、bad-end选项）
      note: req.body.note, // 选择支的描述（用于关联选择时的模糊搜索）
      options: req.body.options, // 选择支的选项数组
    }).save((err, docs) => {
      if (err) throw err;
      res.json({ code: 20000, msg: '选择新增成功！', data: docs})
    })
  })
})

// 搜索选项
router.get('/search', (req, res) => {
  const regexp = new RegExp(req.query.note, 'i')
  selectModel.findOne({note: { $regex: regexp }}, (err, docs) => {
    if (err) throw err;
    res.json({ code: 20000, msg: '查询成功！', data: docs })
  })
})

module.exports = router;