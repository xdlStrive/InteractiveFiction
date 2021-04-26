const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TimelineModel = mongoose.model('timeline');
const CounterModel = mongoose.model('counter');

router.post('/create', (req, res) => { // 新增时间轴
  CounterModel.findOneAndUpdate({ counter_id: 'timeline' },{
    $inc: { counter_num: 1 }
  },{
    upsert: true,
    new: true
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
      res.json({ code: 20000, msg: '新增成功！' });
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
        title: 1,
        creator: 1,
        desc: 1,
        create_time: {
          $dateToString: { format: '%Y-%m-%d', date: '$create_time' }
        },
        detailTime: {
          $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$create_time', timezone: "+08:00" } // timezone调整时区+8小时
        }
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