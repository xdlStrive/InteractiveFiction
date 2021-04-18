const express = require('express');
const router = express.Router();
const Core = require('@alicloud/pop-core');

//查询CPU利用率接口 GET方法
router.get('/cpuutilization', function (req, res) {

    var client = new Core({
        accessKeyId: 'LTAI4FsY52AA9xukHXzk8WEQ',
        accessKeySecret: '4NHeJmfm5yb6yf9EEpMNgi1VrnV8FT',
        endpoint: 'http://metrics.cn-hangzhou.aliyuncs.com',
        apiVersion: '2019-01-01'
    });

    var params = {
        "RegionId": "cn-hangzhou",
        "Namespace": "acs_ecs_dashboard",
        "MetricName": "CPUUtilization",
        "Period": "60",
        "StartTime": req.query.StartTime,
        "EndTime": req.query.EndTime
    }

    client.request(req.query.QueryItems, params).then((result) => {
        // console.log(JSON.stringify(result));
        res.send({ 'code': 20000, 'data': JSON.stringify(result) });
    }, (ex) => {
        // console.log(ex);
    })

});

//查询CPU利用率接口 POST方法
router.post('/cpuutilization1', function (req, res) {

    var client = new Core({
        accessKeyId: 'LTAI4FsY52AA9xukHXzk8WEQ',
        accessKeySecret: '4NHeJmfm5yb6yf9EEpMNgi1VrnV8FT',
        endpoint: 'http://metrics.cn-hangzhou.aliyuncs.com',
        apiVersion: '2019-01-01'
    });

    var params = {
        "RegionId": "cn-hangzhou",
        "Namespace": "acs_ecs_dashboard",
        "MetricName": "CPUUtilization",
        "Period": "60",
        "StartTime": req.body.StartTime,
        "EndTime": req.body.EndTime
    }
    // var requestOption = {
    //   method: 'POST'
    // };

    client.request(req.body.QueryItems, params).then((result) => {
        // console.log(JSON.stringify(result));
        res.send({ 'code': 20000, 'data': JSON.stringify(result) });
    }, (ex) => {
        // console.log(ex);
    })

});

module.exports = router;