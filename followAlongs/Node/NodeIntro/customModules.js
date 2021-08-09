const myModule = require("./myOtherFile.js");

console.clear();
console.log("counter = ", myModule.getCounter());

myModule.inc();
myModule.inc();
myModule.inc();
myModule.inc();

console.log("counter = ", myModule.getCounter());