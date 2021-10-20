const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const formidable = require('formidable');
const ChapterModel = mongoose.model('chapter');
const selectModel = mongoose.model('select');
const CounterModel = mongoose.model('counter');

mongoose.set('useFindAndModify', false)

// 新增章节接口
router.post('/add', (req, res) => {
  CounterModel.findOneAndUpdate({
    counter_id: 'chapter'
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
    new ChapterModel({ // 新增章节
      chapter_id: doc.counter_num,
      volume_id: req.body.volume_id,
      title: req.body.title,
      author: req.body.creator_id, // 与user进行关联
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

// 修改文章接口
router.post('/modify', (req, res) => {
  let options = {}
  if (req.body.paragraph_list !== undefined) {
    options.$addToSet = {
      paragraph_list: {
        $each: req.body.paragraph_list
      }
    }
  }
  if (req.body.title !== undefined) {
    options.title = req.body.title
  }
  if (req.body.chapter_comment !== undefined) {
    options.$addToSet = {
      chapter_comment: {
        $each: req.body.chapter_comment
      }
    }
  }
  console.log(options)
  ChapterModel.findOneAndUpdate({
    chapter_id: req.body.chapter_id
  }, options, {
    new: true,
    fields: 'chapter_id paragraph_list title volume_id -_id'
  }, (err, doc) => {
    if (err) throw err
    res.json({ code: 20000, msg: '章节修改成功！', data: doc })
  })
})

// 查询全部文章列表接口
router.get('/allChapterList', (req, res) => {
  const pageNum = req.query.pageNum,
    pageSize = req.query.pageSize;
  ChapterModel.find({}, {
    chapter_id: 1,
    title: 1,
    pageviews: 1,
    create_time: 1,
    _id: 0
  }).skip((pageNum - 1) * pageSize)
    // .limit(pageSize)
    .sort({
    chapter_id: 1
  }).exec((err, doc) => {
    if (err) {
      res.json({ code: 20000, msg: err })
    }
    res.json({ code: 20000, msg: '章节列表获取成功！', data: doc })
  })
})

// 查询单卷文章列表接口
router.get('/volumesList', (req, res) => {
  ChapterModel.aggregate([ // 管道聚合函数
    {
      $match: {
        volume_id: Number(req.query.volume_id) // req的数据类型都是string，所以需要转换为number类型才能查询
      }
    }, {
      $project: {
          _id: 0,
          n_id: '$chapter_id',
          title: 1
      }
    }, {
      $addFields: { // 往查询结果里新增字段
        leaf: true
      }
    }
  ], (err, docs) => {
    if (!err && docs) {
      // console.log(docs)
      return res.json({ code: 20000, msg: '章节列表获取成功！', data: docs })
    }
  })
})

// 查询一章文章接口
router.get('/oneChapter', (req, res) => {
  ChapterModel.aggregate([
    {
      $match: {
        chapter_id: Number(req.query.chapter_id)
      }
    }, {
      $lookup: {
        from: 'paragraphs',
        localField: 'paragraph_list',
        foreignField: 'paragraph_id',
        as: 'paragraph_list'
      }
    }, {
      $project: {
        _id: 0,
        chapter_id: 1,
        title: 1,
        paragraph_list: 1
      }
    }
  ], (err, doc) => {
    if (!err && doc) {
      return res.json({ code: 20000, msg: '章节获取成功！', data: doc[0] })
      
      const lengths = doc[0].paragraph_list.length
      new Promise((resolve, reject) => {
        async function getSelect(index, length) {
          const item = doc[0].paragraph_list[index]
          if (item.select_id !== undefined) {
            await selectModel.findOne({
              select_id: item.select_id
            }, (err, doc) => {
              item.select_id = doc.options
              console.log(doc.options)
            })
          }
          if (++index < length) {
            getSelect(index, length)
          } else {
            // 最后一个还没查出来就已经下一步了，怀疑和最后一个的位置有关
            setTimeout(() => {
              resolve()
            })
          }
        }
        getSelect(0, lengths)
      }).then(val => {
        return res.json({ code: 20000, msg: '章节获取成功！', data: doc[0] })
      })
    }
  })
})

//#region 
// //富文本上传图片接口
// router.post('/images', function (req, res) {
//   let form = new formidable.IncomingForm();
//   // 编码
//   form.encoding = 'utf-8';
//   // 保留扩展名
//   form.keepExtensions = true;
//   //文件存储路径 最后要注意加 '/' 否则会被存在public下
//   form.uploadDir = './public/images/';
//   // 解析 formData 数据
//   form.parse(req, (err, fields, files) => {
//     if (err) return next(err)
//     let imgPath = files.file.path;
//     // let imgName = files.file.name;
//     // console.log(imgPath)
//     //转化图片地址为服务器地址
//     imgPath = imgPath.replace(/public/gi, '');
//     imgPath = 'http://47.97.230.150:3000' + imgPath;
//     // 返回路径和文件名
//     res.json({
//       code: 20000,
//       data: {
//         location: imgPath
//       }
//     });
//   })
// });

// //富文本上传博文接口
// router.post('/document', function (req, res) {
//   new ChapterModel({
//     title: req.body.title,
//     tags: req.body.tags,
//     coverImg: req.body.coverImg,
//     roundup: req.body.roundup,
//     content: req.body.content,
//     author: req.body.author,
//     create_time: Date.now()
//   }).save(function (err, article) {
//     res.send({
//       'code': 20000,
//       'data': article
//     });
//   })
// });

// // 获取章节列表接口
// router.get('/list', function (req, res) {
//   let pageNum = req.query.pageNum,
//     pageSize = req.query.pageSize;

//   ChapterModel.countDocuments((err, count) => { // 查询出结果返回
//     ChapterModel.find({}, {
//         content: 0
//       }) // 不取content字段
//       .populate({
//         path: 'author',
//         select: {
//           username: 1,
//           avatar: 1
//         }
//       }) // 关联查询user表里的数据
//       .skip((pageNum - 1) * pageSize)
//       // .limit(pageSize)
//       .sort({ '_id': -1 }) // 降序
//       .exec((err, doc) => {
//         try {
//           if (!err && doc) {
//             return res.json({
//               code: 20000,
//               totalCount: count,
//               msg: '列表获取成功',
//               data: doc
//             })
//           }
//         } catch (err) {
//           res.json({
//             code: 1,
//             message: '后端出错'
//           })
//         }
//       })
//   })
// })

// //获取博文接口
// router.get('/article', function (req, res) {
//   function getClientIP(req) { //获取访问用户的IP地址
//     return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
//       req.connection.remoteAddress || // 判断 connection 的远程 IP
//       req.socket.remoteAddress || // 判断后端的 socket 的 IP
//       req.connection.socket.remoteAddress;
//   };
//   console.log(getClientIP(req));
//   // function getClientIp(req) {
//   //     let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
//   //     if (ip.indexOf('::ffff:') !== -1) {
//   //         ip = ip.substring(7);
//   //     }
//   //     return ip;
//   // }
//   // let ipv = getClientIp(req);
//   // console.log(ipv);

//   let id = req.query.id;
//   let updateObj = {
//     $inc: {
//       pageviews: 1
//     }
//   }; //字段自增
//   ChapterModel.findByIdAndUpdate(id, updateObj, function (err, doc) {})
//     .populate({
//       path: 'author',
//       select: {
//         username: 1,
//         avatar: 1
//       }
//     })
//     .exec((err, doc) => {
//       try {
//         if (!err && doc) {
//           return res.json({
//             code: 20000,
//             msg: '文章获取成功',
//             data: doc
//           })
//         }
//       } catch (e) {
//         res.json({
//           code: 1,
//           message: '后端出错'
//         })
//       }
//     });
// })

// //修改博文接口
// router.put('/revise', function (req, res) {
//   let id = req.body.id;
//   let updateObj = {
//     title: req.body.title,
//     tags: req.body.tags,
//     coverImg: req.body.coverImg,
//     roundup: req.body.roundup,
//     content: req.body.content,
//     author: req.body.author,
//   };
//   ChapterModel.findByIdAndUpdate(id, updateObj, function (err, doc) {})
//     .exec((err, doc) => {
//       try {
//         if (!err && doc) {
//           return res.json({
//             code: 20000,
//             msg: '文章修改成功',
//             data: doc
//           })
//         }
//       } catch (e) {
//         res.json({
//           code: 1,
//           message: '后端出错:' + e
//         })
//       }
//     });
// })

// //删除博文接口
// router.delete('/delete', function (req, res) {
//   let id = req.body.id;
//   console.log(id)
//   ChapterModel.findByIdAndDelete(id).exec().then(() => {
//     return res.json({
//       code: 20000,
//       msg: '文章删除成功'
//     })
//   }).catch((err) => {
//     res.json({
//       code: 1,
//       message: '后端出错:' + err
//     })
//   })
// })
//#endregion

module.exports = router;