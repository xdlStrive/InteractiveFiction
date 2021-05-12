const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const VolumeModel = mongoose.model('volume');
const CounterModel = mongoose.model('counter');

// 新增卷
router.post('/add', (req, res) => {
  CounterModel.findOneAndUpdate({
    counter_id: 'volume'
  }, {
    $inc: { counter_num: 1 }
  }, {
    upsert: true, // 如果没有就新增
    new: true // 返回更新后的数据，否则返回的是更新前的数据
  }, (err, doc) => {
    if (err) {
      console.log(err);
      return;
    }
    new VolumeModel({ // 新增卷
      volume_id: doc.counter_num,
      title: req.body.title
    }).save((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      res.json({
        code: 20000,
        msg: '新增卷成功！',
        data: docs
      })
    })
  })
})

// 获取卷列表
router.get('/list', (req, res) => {
  // VolumeModel.find({}, {
  //   volume_id: 1,
  //   title: 1
  // }).sort({
  //   volume_id: 1
  // }).exec((err, doc) => {
  //   try {
  //     if (!err && doc) {
  //       return res.json({
  //         code: 20000,
  //         msg: '章节列表获取成功！',
  //         data: doc
  //       })
  //     }
  //   } catch (err) {
  //     res.json({
  //       code: 1,
  //       msg: '后端出错',
  //       data: err
  //     })
  //   }
  // })

  VolumeModel.aggregate([
    // {
    //   $match: {
    //       volume_id: Number(req.query.volume_id) // req的数据类型都是string，所以需要转换为number类型才能查询
    //   }
    // },
    // { $unwind: '$chapter_list' },
    // {
    //   $lookup: {
    //       from: 'chapters',
    //       localField: 'chapter_list',
    //       foreignField: 'chapter_id',
    //       as: 'chapter_list'
    //   }
    // },
    {
      $project: {
          _id: 0,
          volume_id: 1,
          title: 1
      }
    },
    {
      $addFields: {
        isLeaf: true
      }
    }
  ], (err, docs) => {
      console.log(err)
      if (!err && docs) {
        return res.json({ code: 20000, msg: '分卷列表获取成功！', data: docs })
      }
  })
})

module.exports = router;