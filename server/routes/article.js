const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ChapterModel = mongoose.model('chapter');
const formidable = require('formidable');

mongoose.set('useFindAndModify', false)

//富文本上传图片接口
router.post('/images', function(req, res) {
    let form = new formidable.IncomingForm();
    // 编码
    form.encoding = 'utf-8';
    // 保留扩展名
    form.keepExtensions = true;
    //文件存储路径 最后要注意加 '/' 否则会被存在public下
    form.uploadDir = './public/images/';
    // 解析 formData 数据
    form.parse(req, (err, fields, files) => {
        if (err) return next(err)
        let imgPath = files.file.path;
        // let imgName = files.file.name;
        // console.log(imgPath)
        //转化图片地址为服务器地址
        imgPath = imgPath.replace(/public/gi, '');
        imgPath = 'http://47.97.230.150:3000' + imgPath;
        // 返回路径和文件名
        res.json({ code: 20000, data: { location: imgPath } });
    })
});

//富文本上传博文接口
router.post('/document', function(req, res) {
    new ChapterModel({
        title: req.body.title,
        tags: req.body.tags,
        coverImg: req.body.coverImg,
        roundup: req.body.roundup,
        content: req.body.content,
        author: req.body.author,
        create_time: Date.now()
    }).save(function (err,article) {
        res.send({'code': 20000, 'data': article});
    })
});

//获取博文列表接口
router.get('/list', function(req, res) {
    let pageNum = req.query.pageNum,
        pageSize = req.query.pageSize;

    ChapterModel.countDocuments((err, count) => { //查询出结果返回
        ChapterModel.find({},{ content: 0 })  //不取content字段
            .populate({ path: 'author', select: { username: 1, avatar: 1 } })  //关联查询user表里的数据
            .skip((pageNum - 1) * pageSize)
            // .limit(pageSize)
            .sort({ '_id': -1 })    //降序
            .exec((err, doc) => {
                try {
                    if (!err && doc) {
                        return res.json({ code: 20000, totalCount: count, msg: '列表获取成功', data: doc })
                    }
                } catch (e) {
                    res.json({ code: 1, message: '后端出错' })
                }
            })
    })
})

//获取博文接口
router.get('/article', function(req, res) {
    function getClientIP(req) { //获取访问用户的IP地址
        return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress;
    };
    console.log(getClientIP(req));
    // function getClientIp(req) {
    //     let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    //     if (ip.indexOf('::ffff:') !== -1) {
    //         ip = ip.substring(7);
    //     }
    //     return ip;
    // }
    // let ipv = getClientIp(req);
    // console.log(ipv);

    let id = req.query.id;
    let updateObj = { $inc: { pageviews: 1 } }; //字段自增
    ChapterModel.findByIdAndUpdate(id, updateObj, function(err, doc) {})
    .populate({ path: 'author', select: { username: 1, avatar: 1 } })
    .exec((err, doc) => {
        try {
            if (!err && doc) {
                return res.json({ code: 20000, msg: '文章获取成功', data: doc })
            }
        } catch (e) {
            res.json({ code: 1, message: '后端出错' })
        }
    });
})

//修改博文接口
router.put('/revise', function (req, res) {
    let id = req.body.id;
    let updateObj = {
        title: req.body.title,
        tags: req.body.tags,
        coverImg: req.body.coverImg,
        roundup: req.body.roundup,
        content: req.body.content,
        author: req.body.author,
     };
    ChapterModel.findByIdAndUpdate(id, updateObj, function(err, doc) {})
        .exec((err, doc) => {
            try {
                if (!err && doc) {
                    return res.json({ code: 20000, msg: '文章修改成功', data: doc })
                }
            } catch (e) {
                res.json({ code: 1, message: '后端出错:' + e })
            }
        });
})

//删除博文接口
router.delete('/delete', function(req, res) {
    let id = req.body.id;
    console.log(id)
    ChapterModel.findByIdAndDelete(id).exec().then(() => {
        return res.json({ code: 20000, msg: '文章删除成功' })
    }).catch((err) => {
        res.json({ code: 1, message: '后端出错:' + err })
    })
})

module.exports = router;