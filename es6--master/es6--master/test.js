
//多变量的输出
export var a='你好';



// 这里声明了3个变量，
// 需要把这3个变量都进行模块化输出，
// 这时候我们给他们包装成对象就可以了。


var  aa='你好好';
var bb="很伤心";
var cc='aaa';
export {a,b,c};


// 函数的模块化输出
export function add(a,b){
    return a+b;
}





