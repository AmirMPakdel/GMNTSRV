const User = require("../../models").User;
const Deck = require('../../models').Deck;
const Consts = require("../../consts");
const xregexp = require("xregexp");

const engWord = xregexp('[_a-zA-Z0-9]+$');
const MAX_XP_ALLOWED = 300;

const register = async (req, res)=>{

    // input-> is_temp:Boolean, email, password, token:_id

    if(req.body.is_temp){
        // create a temp user and deck

        let newDeck = new Deck({});

        await newDeck.save();

        let newUser = new User({deck_id:newDeck._id, last_online:Date.now().toString()});

        newDeck.user_id = newUser._id.toString();
        
        await newUser.save();

        await newDeck.save();
        
        res.json({rc:Consts.SUCCESS, data:newUser});


    }else{

        // temp user converting to User
        let valid = input_valid(req.body);

        if(valid == Consts.SUCCESS){

            let {token, email, password} = req.body;

            let u = await User.findOne({email});

            if(u){

                res.json({rc:Consts.REPETITIVE_EMAIL});

            }else{

                let user = await User.findOne({_id:token.toString()});

                if(!user.registered){

                    let username= await createUsername(email);

                    user.username = username;

                    user.email = email;

                    user.password = password;

                    user.registered = true;

                    await user.save();

                    res.json({rc:Consts.SUCCESS, data:user});
                    // outout-> rc, User

                }else{

                    res.json({rc:Consts.USER_ALREADY_REGISTERED});
                }
            }

        }else{
            res.json({rc:valid});
        }
    }
}

module.exports = register;

function input_valid(body){

    if(typeof(body.token)=="string"){
        if(body.token.length!=24){
            return Consts.INVALID_TOKEN;
        }
    }else{
        return Consts.INVALID_TOKEN;
    }

    if(typeof(body.email)=="string"){
        if(body.email.length<6 || body.password.length>100){
            return Consts.INVALID_EMAIL;
        }
    }else{
        return Consts.INVALID_EMAIL;
    }

    if(typeof(body.password)=="string"){
        if(body.password.length < 6 || body.password.length>200){
            return Consts.INVALID_PASSWORD;
        }
    }else{
        return Consts.INVALID_PASSWORD;
    }

    return Consts.SUCCESS;
}

async function createUsername(email){

    let arr = email.split("");
    let username = "";
    for(let i=0; i<arr.length; i++){

        if(arr[i]=="@" || i==9){
            break;
        }

        if(engWord.test(arr[i])){
            username+=arr[i];
        }
    }

    let random = Math.floor(Math.random()*9999);
    username+=random;

    let others = await User.find({username:username});

    if(others[0]){
        return await createUsername(email);
    }else{
        return username;
    }
}