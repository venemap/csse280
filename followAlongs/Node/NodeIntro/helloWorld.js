// console.log("Hello csse280");

// let hello = "Hello world"

// for(let i = 0; i < 10; i++){
//     setTimeout((event) => {
//         console.log(i, hello)
//     }, 1000*i)
// }

let counter = 0;

setInterval((event) => {
    counter++;
    console.log("counter", counter);
}, 500)