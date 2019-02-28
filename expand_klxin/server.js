const express = require('express')
const app = express()
// 引入第三方库
let axios = require('axios')
// 1. 引入token
let jwt = require('jsonwebtoken')

app.use(express.static('./public'))

app.get('/', (req, res) => {
    res.send('服务启动了')
})
app.get('/api/v1/test', (req, res) => {
    res.send({err: 0, data: '成功'})
})
app.get('/api/v1/proxy', (req, res) => {
    // 代理是axios解决的吗？？？ axios只是一个请求的库 
    // 我们这里可以用任何的请求库都可以完成  所以当前反向代理和axios没有关系
    axios.get(`http://v.juhe.cn/toutiao/index?type=top&key=e1c242e4a5516a6cced459a4a7e73f83`)
    .then(result => {
        res.send({msg: result.data})
    })
})
app.get('/api/v1/login', (req, res) => {
    // 2. 生成token
    // jwt.sign(用户信息, 加密的随机字符串, 生成token的回调函数)
    jwt.sign({ user: '张三', pwd: '123456', exp: Math.floor(Date.now() / 1000) + 3000000000}, '霸气霸气霸气霸气霸气', function(err, token) {
        if (err) return res.send({err: 1, msg: '登录失败'})
        res.send({err: 0, msg: token})
    })
})
app.get('/api/v1/getuser', (req, res) => {
    var token = req.query.token
    // 通过token获取用户信息
    // jwt.verify(token, secretOrPublicKey, [options, callback])
    jwt.verify(token, '霸气霸气霸气霸气霸气',(err, data) => {
        if (err) return res.send({err: 2, msg: '获取用户信息失败'})
        // 这里只做演示  工作中一定不会这样使用的
        res.send({err: 0, msg: data})
    })
    
})
app.listen(3000, () => {
    console.log(`http://127.0.0.1:3000 is running`)
})