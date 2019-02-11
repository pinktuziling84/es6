var regex = new RegExp('xyz',`i`)
console.log(regex)//  /xyz/i

let regexps = new RegExp(/abc/ig,'s').flags
console.log(regexps)// i  
// ES6 改变了这种行为。如果RegExp构造函数第一个参数是一个正则对象，
// 那么可以使用第二个参数指定修饰符。
// 而且，返回的正则表达式会忽略原有的正则表达式的修饰符，只使用新指定的修饰符。

