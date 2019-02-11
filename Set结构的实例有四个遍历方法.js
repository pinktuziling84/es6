// Set 结构的实例有四个遍历方法，可以用于遍历成员。

// keys()：返回键名的遍历器
// values()：返回键值的遍历器
// entries()：返回键值对的遍历器
// forEach()：使用回调函数遍历每个成员
//需要特别指出的是，Set的遍历顺序就是插入顺序。这个特性有时非常有用，
//比如使用 Set 保存一个回调函数列表，调用时就能保证按照添加顺序调用。
// （1）keys()，values()，entries()

// keys方法、values方法、entries方法返回的都是遍历器对象（详见《Iterator 对象》一章）。由于 Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以keys方法和values方法的行为完全一致。
let set = new Set(['red','green','blue']);
for(let item of set.keys()){
    console.log(item)
}
// red
// green
// blue
for(let item of set.values()){
    console.log(item)
}
// red
// green
// blue
console.log(`----------------------------------`)
for(let item of set.entries()){
    console.log(item)
}
//[ 'red', 'red' ]
//[ 'green', 'green' ]
//[ 'blue', 'blue' ]
// 上面代码中，entries方法返回的遍历器，同时包括键名和键值，所以每次输出一个数组，它的两个成员完全相等