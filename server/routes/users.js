const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = mongoose.model('users');
const URL = require('url');

// 注册接口
router.post('/register', function (req, res) {
  new UserModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email || ''
  }).save(function (err, user) {
    // res.redirect('/'); //res.redirect和res.send不能同时写，因为这两个方法的后面都不能写其他方法
    if (err) {
      res.json({ code: 500, msg: err })
    }
    res.json({ code: 20000, msg: '注册成功！' });
  });
})

// 登录接口
router.post('/login', function (req, res) {
  UserModel.findOne({
    username: req.body.username
  }, function (err, obj) {
    // console.log(obj)
    if (obj === null) {
      // 返回给前台错误信息
      return res.status(422).json({ msg: "您输入的用户名有误" })
    }
    const isPass = bcrypt.compareSync(req.body.password, obj.password)  //将前端传入的密码和数据库中保存的密码进行比对
    if (!isPass) {  //如果比对不匹配
      return res.status(422).json({ msg: "您输入的密码不正确" })
    }
    const token = jwt.sign({  //比对成功则进行token签名
      id: String(obj._id)  //第一个参数为要签名的字段，最好为唯一的主键
    }, 'secret', {
      expiresIn: '1d'
    })  //第二个参数为秘钥
    res.status(201).json({ code: 20000, msg: '登录成功', token: token })  //返回给前端
  })
})

// 查询用户信息接口
router.get("/profile", async (req, res) => {
  const raw = String(req.headers.authorization) //获取前端请求头中的token
  const { id } = jwt.verify(raw, 'secret', (err, decoded) => {
    if(err) {
      switch(err.name) {
        case 'JsonWebTokenError':
          res.status(403).send({ code: 5008, msg: '无效的token' })
          break
        case 'TokenExpiredError':
          res.status(403).send({ code: 50014, msg: 'token已过期' })
      }
    }
    return decoded // 返回解密token得到的id
  })
  // 根据解密的id去查找对应的用户
  const us = await UserModel.findById(id);
  res.send({ 'code': 20000, 'data': us })
})

// 登出接口
router.get('/logout', (req, res) => {
  res.json({ code: 20000, msg: '成功登出' })
})

// 查询用户列表接口
router.get('/fetchList', function (req, res) {
  const pageNum = req.query.pageNum;
  const pageSize = req.query.pageSize;

  UserModel.count({}, (err, count) => {
    UserModel.find()
      .skip(pageNum - 1)
      .sort('create_time').exec(function (err, docs) {
        res.json({ code: 20000, msg: '用户列表获取成功！', data: docs, count: count })
    })
  })
})

// 获取用户存档接口
router.get('/fetchArchive', function (req, res) {
  const raw = String(req.headers.authorization) //获取前端请求头中的token
  const { id } = jwt.verify(raw, 'secret', (err, decoded) => {
    if(err) {
      switch(err.name) {
        case 'JsonWebTokenError':
          res.status(403).send({ code: 5008, msg: '无效的token' })
          break
        case 'TokenExpiredError':
          res.status(403).send({ code: 50014, msg: 'token已过期' })
      }
    }
    return decoded // 返回解密token得到的id
  })

  UserModel.findById(id, function (err, data) {
    res.json({ code: 20000, msg: '获取成功！', data: data.archive})
  })
})

// 更新接口
router.post('/update', function (req, res) {
  const raw = String(req.headers.authorization) //获取前端请求头中的token
  const { id } = jwt.verify(raw, 'secret', (err, decoded) => {
    if(err) {
      switch(err.name) {
        case 'JsonWebTokenError':
          res.status(403).send({ code: 5008, msg: '无效的token' })
          break
        case 'TokenExpiredError':
          res.status(403).send({ code: 50014, msg: 'token已过期' })
      }
    }
    return decoded // 返回解密token得到的id
  })

  let params = null
  if (req.body.archive) {
    params = { 'archive.0': req.body.archive[0], 'archive.1': req.body.archive[1]}
  }
  UserModel.findByIdAndUpdate(id, {
    $set: params
  }, function (err, doc) {
    if (err) return 'err' + err
    res.json({ code: 20000, msg: '更新用户信息成功！'})
  })
})

// 删除接口
router.get('/delete', function (req, res) {

  var params = URL.parse(req.url, true).query;

  UserModel.findById(params.id, function (err, data) {
    data.remove(function (err, data) {
      res.redirect('/'); //返回首页
    })
  })
})

module.exports = router;
