const mongoose = require("mongoose"); // 引入mongoose
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt"); // 引入bcrypt
const moment = require('moment'); // 引入moment

// 连接到mongoDB的InteractiveFiction数据库
// 该地址格式：mongodb://[username:password@]host:port/database[?options]
// 默认port为27017
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://root:198300@47.97.230.150/IF?authSource=admin', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
  }); 

// mongoose.set('useCreateIndex', true);
// mongoose.connect('mongodb://localhost/WAG', {
//   useNewUrlParser: true, 
//   useUnifiedTopology: true 
// }); 

const db = mongoose.connection;
db.on('error', () => { // 监听是否有异常
  console.log("连接失败！");
});
db.once('open', () => { // 监听一次打开
  console.log('成功连接数据库!');
});

// 用户模型
const UserSchema = new mongoose.Schema({  
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  roles: String,  // 权限（必须）
  nickname: String, // 昵称
  avatar: String, // 头像
  archive: String,  // 存档
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 创建用户时加密密码
UserSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// 选择支模型
const SelectSchema = new mongoose.Schema({ 
  select_id: { type: Number, index: true, unique: true }, // 选择支的id
  type: String, // 选择支的类型（一般选项、重要抉择、bad-end选项）
  options: [], // 选择支的选项数组
  next_content: Number,
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// model的第一个参数加上s是默认链接的集合名，第二个参数是建立的Schema名，第三个可选参数可直接指定连接的集合
let testModel = mongoose.model('select', SelectSchema, 'selects');

// 段落模型
const paragraphSchema = new mongoose.Schema({ 
  paragraph_id: { type: Number, index: true, unique: true }, // 段落ID
  chapter_id: Number, // 所属章节的ID
  content: String,  // 段落内容
  select_id: Number, // 段落后关联选项id数组
  bulletComment: [], // 关联弹幕的id数组
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 章节模型
const ChapterSchema = new mongoose.Schema({
  chapter_id: { type: Number, index: true, unique: true }, // 章节id
  volume_id: Number, // 所属的卷的id
  title: String, // 章节标题
  paragraph_list: [], // 章节所有段落id数组
  author: { type: Schema.Types.ObjectId },  // 作者，与UserSchema模型进行关联
  chapter_comment: [], // 章节评论id
  pageviews: { type: Number, default: 0 }, // 默认值为0
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 弹幕模型
const bulletCommentSchema = new mongoose.Schema({
  select_id: { type: Number, index: true, unique: true },
  options: [],
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 章节评论模型
const chapterCommentSchema = new mongoose.Schema({
  select_id: { type: Number, index: true, unique: true },
  options: [],
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 分卷模型
const VolumeSchema = new mongoose.Schema({ 
  volume_id: { type: Number, index: true, unique: true }, // 卷id
  title: String, // 卷名
  chapter_list: [], // 该卷所有的章节id数组
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// ChapterSchema.set('toJSON', { getters: true })

// 时间轴模型
const TimelineSchema = new mongoose.Schema({  
  timeline_id: Number,
  title: String,
  desc: String,
  creator_id: Schema.Types.ObjectId,
  create_time: { type: Date, default: Date.now, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

// 计数器模型
const CounterSchema = new mongoose.Schema({  
  counter_id: String,
  counter_num: Number,
  create_time: { type: Date, default: Date.now, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
});

module.exports = mongoose.model('users', UserSchema, 'users');
module.exports = mongoose.model('volume', VolumeSchema, 'volumes');
module.exports = mongoose.model('chapter', ChapterSchema, 'chapters');
module.exports = mongoose.model('paragraphs', paragraphSchema, 'paragraphs');
module.exports = mongoose.model('timeline', TimelineSchema, 'timeline');
module.exports = mongoose.model('counter', CounterSchema, 'counters');


// let testData = new testModel({
//   select_id: 11,
//   options: [ { 'action': '快打' }, { 'action': '偷袭' }, {'action': '跑'} ]
// });

// testData.save((err) => {
//   testModel.find({ select_id: 11 }, (err, doc) => {
//     //console.log(doc[0].options[2].action);
//   })
// })



// let ParagraphModle = mongoose.model('paragraphs', paragraphSchema, 'paragraphs');
// let ParagraphData = new ParagraphModle({
//   paragraph_id: 0,
//   content: '这是测试的第一自然段',
//   select_id: 6
// });

// ParagraphData.save((err) => {
//   // testModel.find({ select_id: 11 }, (err, doc) => {
//   //   //console.log(doc[0].options[2].action);
//   // })
// })

// ParagraphModle.aggregate([  // 聚合管道查询
//   {
//     $lookup: {
//       from: 'selectdatas',
//       localField: 'select_id',
//       foreignField: 'select_id',
//       as: 'select_branch'
//     }
//   },{
//     $project: {
//       __v: 0,
//       select_id: 0,
//       create_time: 0
//     }
//   }

// ], (err, docs) => {
//   console.log(JSON.stringify(docs));
// })
