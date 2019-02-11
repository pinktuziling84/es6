const foo = 'bar'
const baz = {foo:foo};
//可以简写成 const baz = {foo};
console.log(baz)
// 上面代码表明，ES6 允许在对象之中，
// 直接写变量。这时，属性名为变量名,
//  属性值为变量的值。下面是另一个例子。
function f (x,y) {
    return{x,y}
}
f(1,2)
console.log(f(1,2))
//方法也可以简写
const o = {
    methods() {
        return "hello";
    }
}
console.log(o.methods())
console.log(`-------------------------------------`)
let birth = '2000/01/01';

const Person = {

  name: '张三',

  //等同于birth: birth
  birth,

  // 等同于hello: function ()...
  hello() { console.log('我的名字是', this.name); }

};
console.log(Person)
console.log(Person.hello())