const s = new Set();
//Set本身就是一个构造函数,用来生成Set数据结构
[2,3,5,4,5,2,2,1,6].forEach(x => s.add(x));
for(let i of s){
   // console.log(i)
}
//上面代码通过add()方法向 Set 结构加入成员，结果表明 Set 结构不会添加重复的值。