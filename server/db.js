const mongoose = require("mongoose"); // 引入mongoose
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt"); // 引入bcrypt
const moment = require('moment'); // 引入moment

// 连接到在线服务器的mongoDB的InteractiveFiction数据库
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
  state: { // 账号状态
    type: String,
    default: 'valid' // 默认有效状态
  },
  email: String,
  roles: { // 权限（必须）
    type:String,
    default: 'readers' // 用户角色默认为读者
  },
  nickname: String, // 昵称
  avatar: { // 头像
    type: String,
    default: 'public/images/default.gif'
  },
  archive: [],  // 存档
  create_time: { 
    type: Date, 
    default: new Date,
    get: v => moment(v).format('YYYY-MM-DD HH:mm:ss') 
  }
}).set('toJSON', { getters: true });

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
  note: String, // 选择支的描述（用于关联选择时的模糊搜索）
  options: [], // 选择支的选项数组
  create_time: {
    type: Date, 
    default: new Date, 
    get: v => moment(v).format('YYYY-MM-DD HH:mm') 
  }
}).set('toJSON', { getters: true });

// 分支模型
const BranchSchema = new mongoose.Schema({
  branch_id: { type: Number, index: true, unique: true }, // 分支的id
  type: Number, // 分支的类型（一般选项、重要抉择、bad-end选项）
  members: [], // 分支包含的段落数组
  create_time: {
    type: Date,
    default: new Date,
    get: v => moment(v).format('YYYY-MM-DD HH:mm')
  }
}).set('toJSON', { getters: true });


// 段落模型
const paragraphSchema = new mongoose.Schema({
  paragraph_id: { type: Number, index: true, unique: true }, // 段落ID
  chapter_id: Number, // 所属章节的ID
  type: String, // 是否bad-end段落
  select_id: String, // 段落关联的选项的id数组
  branch_id: String, // 关联的分支的id
  content: [],  // 段落内容
  selects_key: [], // 选项描述
  selects: [], // 分支id组成的数组
  selectType: String,
  bulletComment: [], // 关联弹幕的id数组
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

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
}).set('toJSON', { getters: true });

// 弹幕模型
const bulletCommentSchema = new mongoose.Schema({
  select_id: { type: Number, index: true, unique: true },
  options: [],
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

// 章节评论模型
const chapterCommentSchema = new mongoose.Schema({
  select_id: { type: Number, index: true, unique: true },
  options: [],
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

// 分卷模型
const VolumeSchema = new mongoose.Schema({ 
  volume_id: { type: Number, index: true, unique: true }, // 卷id
  title: String, // 卷名
  chapter_list: [], // 该卷所有的章节id数组
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

// 时间轴模型
const TimelineSchema = new mongoose.Schema({  
  timeline_id: Number,
  title: String,
  desc: String,
  creator_id: Schema.Types.ObjectId,
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

// 计数器模型
const CounterSchema = new mongoose.Schema({  
  counter_id: String,
  counter_num: Number,
  create_time: { type: Date, default: new Date, get: v => moment(v).format('YYYY-MM-DD HH:mm') }
}).set('toJSON', { getters: true });

// 名言模型
const AphorismSchema = new mongoose.Schema({
  aphorism_id: { type: Number, index: true, unique: true }, // 名言id
  text: String,
  author: String,
  create_time: {
    type: Date,
    default: new Date,
    get: v => moment(v).format('YYYY-MM-DD HH:mm')
  }
}).set('toJSON', { getters: true });

// model的第一个参数加上s是默认链接的集合名，第二个参数是建立的Schema名，第三个可选参数可直接指定连接的集合
module.exports = mongoose.model('users', UserSchema, 'users');
module.exports = mongoose.model('volume', VolumeSchema, 'volumes');
module.exports = mongoose.model('chapter', ChapterSchema, 'chapters');
module.exports = mongoose.model('paragraphs', paragraphSchema, 'paragraphs');
module.exports = mongoose.model('branch', BranchSchema, 'branchs');
module.exports = mongoose.model('select', SelectSchema, 'selects');
module.exports = mongoose.model('timeline', TimelineSchema, 'timeline');
module.exports = mongoose.model('counter', CounterSchema, 'counters');
module.exports = mongoose.model('aphorism', AphorismSchema, 'aphorisms');


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
