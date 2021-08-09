

function colorShow(colorList) {
   console.log("The color show is starting!");
   // TODO: Add your modifications here
   let index = 0;

   setInterval((event) => {
      document.querySelector(".circle").style.backgroundColor = colorList[index];
      index++;
      if(index > colorList.length) index = 0;
   }, 1500);
}

// Do not modify the code below

window.addEventListener("DOMContentLoaded", function () {
   document.querySelector("#colorShowButton").addEventListener("click", () => {
      colorShow(["#ff0000", "#ffa500", "#ffff00", "#008000", "#0000ff", "#4b0082", "#ee82ee"])
   });
   showCircle(160, 180, 120);
});

let timerId = null;

function showCircle(cx, cy, radius) {

   // Only allow one div to exist at a time
   let div = document.querySelector("div");
   if (div !== null) {
      div.parentNode.removeChild(div);
   }

   // Create new div and add to DOM
   div = document.createElement("div");
   div.style.width = 0;
   div.style.height = 0;
   div.style.left = cx + "px";
   div.style.top = cy + "px";
   div.className = "circle";
   document.body.append(div);

   // Set width and height after showCircle() completes so transition kicks in
   setTimeout(() => {
      div.style.width = radius * 2 + 'px';
      div.style.height = radius * 2 + 'px';
      
   }, 10);

   let promise = new Promise(function(resolve, reject) {
      // Reject if showCircle() is called before timer finishes
      if (timerId !== null) {
         clearTimeout(timerId);
         timerId = null;
         div.parentNode.removeChild(div);
         reject("showCircle called too soon");
      }
      else {
         timerId = setTimeout(() => {
            resolve(div);
            timerId = null;
         }, 1000);
      }
   });

   return promise;
}
