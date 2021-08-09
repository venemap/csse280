console.log("todo: learn to use NPM");

var figlet = require("figlet");

figlet('hello world!!', (err, data) => {
    if(err){
        console.log("something went wrong");
        console.dir(err);
        return;
    }
    console.log(data);
})