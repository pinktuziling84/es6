const fs = require("fs")
const path = require('path')

function myreadFile(mypath){
    return new Promise(function (resolve,reject){
        fs.readFile(path.join(__dirname,mypath),function(error,data){
            if(error) return reject(error)
            resolve(data.toString())
        })
    })
}
myreadFile('1.txt')
.then(data =>{
    console.log(data)
    return myreadFile('2.txt')
})
.then(data =>{
    console.log(data)
    return myreadFile("3.txt")
})
.then(data=>{
    console.log(data)
}).finally(()=>{
    console.log('不管出不出异常,最终都会执行')
})
.catch(error =>{
    console.log(error.message+'异常执行')
})
