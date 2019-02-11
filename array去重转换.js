//Array.from方法可以将 Set 结构转为数组。
const items = new Set([1,2,3,4,5,5]);
const array = Array.from(items);
console.log(array)//[ 1, 2, 3, 4, 5 ]

function dedupe(array){
    return Array.from(new Set(array))
}
dedupe([1,1,2,3,4,4])
console.log(dedupe([1,1,2,3,4,4]))//[1,2,3,4]