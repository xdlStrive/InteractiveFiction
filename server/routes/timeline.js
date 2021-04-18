const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TimelineModel = mongoose.model('timeline');
const CounterModel = mongoose.model('counter');

router.post('/create', (req, res) => { // 新增时间轴
  console.log(req.body.title)

  CounterModel.findOneAndUpdate({ counter_id: 'timeline' },{
    $inc: { counter_num: 1 }
  },{
    'new': true
  },(err, doc) => {
    if(err) {
      console.log(err);
      return;
    }
    new TimelineModel({
      timeline_id: doc.counter_num,
      title: req.body.title,
      desc: req.body.desc,
      creator_id: req.body.creator_id
    }).save((err, doc) => {
      res.send({ code: 20000, msg: '新增成功！' });
    })
  })
  
})

router.get('/fetchList', (req, res) => {
  TimelineModel.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'creator_id', // 待插入数据的集合，也就是上面的Timeline集合
        foreignField: '_id', // 数据来源的集合，也就是users集合。value里的方法是转化object_id的方法
        as: 'creator'
      }
    },{
      $project: {
        creator_id: 0,
        __v: 0,
        _id: 0
      }
    }
  ], (err, docs) => {
    if(err) {
      console.log(err)
      res.json({ code: 1, msg: err })
      return;
    }
    res.json({ code: 20000, data: docs })
  })
})

module.exports = router;