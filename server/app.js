require('./db');
const createError = require('http-errors');
const history = require('connect-history-api-fallback');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const alyapiRouter = require('./routes/alyapi');
const volumeRouter = require('./routes/volume');
const chapterRouter = require('./routes/chapter');
const paragraphRouter = require('./routes/paragraph');
const branchRouter = require('./routes/branch');
const selectRouter = require('./routes/select');
const timelineRouter = require('./routes/timeline');

const ejs = require('ejs');

// 创建应用实例
const app = express();

// 设置视图目录和模板引擎
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.use(history({
  index: '/'
}));

app.use(express.static(path.join(__dirname, '../client/dist')));

// 内置中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/api/article/images',express.static(path.join(__dirname, 'public')));

// 路由中间件
// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/alyapi', alyapiRouter);
app.use('/volume', volumeRouter);
app.use('/chapter', chapterRouter);
app.use('/paragraph', paragraphRouter);
app.use('/branch', branchRouter);
app.use('/select', selectRouter);
app.use('/timeline', timelineRouter);

// 404错误处理中间件
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理中间件
app.use(function(err, req, res, next) {
  // 设置局部变量，只在开发模式下报错
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 呈现错误页
  res.status(err.status || 500);
  res.render('error');
});

// 导出app实例对象
module.exports = app;
