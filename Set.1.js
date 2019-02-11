const s = new Set([1,2,3,4,4,5,'张三','张三']);
//Set本身就是一个构造函数,用来生成Set数据结构
[...s]
console.log([...s])// [1,2,3,4,5] 他可以用来去重
//size
const items = new Set([1,2,3,4,5,5,5,7,8,6]);
items.size
console.log(items.size)//8 //重复的数 不会计算
