const mongoose = require('mongoose');
const {user_seed} = require('./seeders/UserSeed');
const env = require('./env');

const setupDB = async ()=>{

    // use .env for connectiong to mongodb
    
    await mongoose.connect(env.DB, {useNewUrlParser: true, useUnifiedTopology: true});
    
}

const Setup = async (app, socket_server)=>{

    await setupDB();

    if(env.FAKE_DATA){
        
        await user_seed();
    }

    // app.listen(env.PORT, ()=>{

    //     console.log("Server online on port "+(env.PORT))
    // });

    socket_server.listen(env.PORT, ()=>{
    
        console.log("Socket Online on port "+env.PORT);
    });
}

module.exports = Setup;