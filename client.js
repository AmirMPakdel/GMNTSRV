const io = require('socket.io-client');
const timer = require("timers");

const s =io.connect("http://localhost:4054");

s.on('connect', ()=>{

    // s.emit("join", {id:"5e8c7bc224dc782028f8737e", class_name:"C16"})

    timer.setInterval(()=>{
        s.emit("online", 
        {token:"5e8c7bc224dc782028f8737e",name:"ali", message:"سلام نمشتسیمنتشس مشسنی منشستی؟"});
    }, 2000)
    
})

s.on("mess", ()=>{
    console.log("mess");
})

s.on("step3", (data)=>{

    console.log(data);
})

s.on('disconnect', ()=>{console.log('socket disconnected')});