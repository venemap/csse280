var counter = 0;

function main(){
    console.log("Ready");

    document.querySelector("#decButton").onclick = (event) => {
        counter -= 1;
        updateView()
      };
    document.querySelector("#incButton").onclick = (event) => {
        console.log("dec");  
        counter += 1;
        updateView()
      };
    document.querySelector("#resetButton").onclick = (event) => {
        counter = 0;
        updateView();
      };

}

function updateView(){
    // document.querySelector("#counter").innerHTML = "Count = " + counter;
    document.querySelector("#counter").innerHTML = `Count = ${counter};`
    
}

main()