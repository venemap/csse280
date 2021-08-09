name = "Peter Venema";

let counter = 0;
inc =() => {
    counter++;
}

dec = (params) => {
    counter--;
}

getCounter = (params) => {
    return counter;
}

module.exports = {
    name,
    inc,
    dec,
    getCounter,
}