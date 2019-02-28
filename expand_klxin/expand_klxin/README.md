# 补充说明
- `yarn init`或`npm init -y`
- `yarn add jquery axios jsonwebtoken ws express`或`npm i jquery axios jsonwebtoken ws express -S`
- `备注`不要用中文目录

## promise的封装
```javascript
// 1. 用promise封装
function promiseAjax (obj = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: obj.url,
            type: obj.type,
            data: obj.data,
            dataType: 'json',
            success: function(res) {
                resolve(res)
            },
            error: function (err) {
                reject(err)
            }
        })
    })
}
// 2. 调用
promiseAjax({
    url: '/api/v1/test',
    type: 'get',
    data: {}
})
.then(result => {
    console.log(result)
})
.then(() => {

})
.then(() => {}) // ....
```
## 跨域之反向代理
> 跨域的本质是浏览器的同源策略，服务端到服务端不通过浏览器 所以不存在跨域问题。所以按照下面的方式来实现
1. 找自己的服务器
2. 服务器发送请求给第三方
3. 第三方返回数据 --> 自己服务器 --> 客户端
## Token验证

<!-- 组件 从ui的角度每一个独立的小界面就是一个组件 我们通常把 html css 和js单独抽出来就是小界面 在小程序中 pages中每一个文件都是一个组件
指令 类似于wx:for这种都叫指令 v-开头 ng-开头的都是指令 就是框架给你提供的一些快速帮助你开发的 webapi
生命周期 页面从无到渲染到dom然后在消失 钩子 简单来说就是一个回调函数
路由  路由就是一些对应规则 hash history
请求  $.ajax()  window.fetch()兼容 wx.request() this.$http() vue-resource  axios
如何定义全局的属性和方法 小程序 app.js 有一个globalData   其他页面 getApp().globalData. 
mvvm 数据层 视图层 控制层 -->

## 备用接口
- `·周公解梦·`
  + 请求地址 `http://v.juhe.cn/dream/query?key=a3bad6b379879791d5de72c98ea9e88d&q=%E9%BB%84%E9%87%91`