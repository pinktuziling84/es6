let set = new Set();
set.add({});
set.size //1
set.add({});
set.size 
console.log(set.size)
//另外，两个对象总是不相等的。 
//上面代码表示,由于两个空对象不相等,所以它们被视为两个值
