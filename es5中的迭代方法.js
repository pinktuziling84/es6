
        //every()对数组中的每一项运行给定函数,如果该函数对每一项返回true,则返回true
        let arr = [1,2,3,4,5];
        let every = arr.every((item,index,array)=>item > 1)    
        console.log(every)//false
        //--------------------------
        let every1 = arr.every((item,index,array)=>item > 0)    
        console.log(every1)//true
        //some()对数组中的每一项运行给定函数,如果该函数对任一项返回true,则返回true
        let some = arr.some((item,index,array)=>item > 2)
        console.log(some)//true
        //filter()对数组中的每一项运行给定函数,返回该函数会返回true的的项组成的数组
        let filter = arr.filter((item,index,array)=>item > 2)
        console.log(filter)//[ 3, 4, 5 ]
        //forEach()对数组中的每一项执行函数,没有返回值.
        let forEach = arr.forEach((item,index,array)=>item)
        console.log(forEach)//undefined
        //map()对数组中的每一项运行给定函数，返回每次函数调用的结果组成的数组
        let map = arr.map((item,index,array)=>item > 2)
        console.log(map)//[ false, false, true, true, true ]
       
 