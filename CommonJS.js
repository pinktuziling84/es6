let ms = {};
function getItem(key) {
    return key in ms ? ms[key] :null;
}
function setItem(key,value){
    ms[key] = value;
}
function clear () {
    ms = {}
}
modules.export = {getItem,setItem,clear};
// setItem('name','张三')
// console.log(getItem('name'))