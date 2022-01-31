
async function a(){

    let g = new Promise((resolve, reject)=>{

        while(1){
            console.log("555");
        }
        resolve();
    })

    g.then();
}

(async()=>{

    a();

    for(let i=0; i<5000000; i++){
        console.log("booooooooooooooob");
    }
})();
