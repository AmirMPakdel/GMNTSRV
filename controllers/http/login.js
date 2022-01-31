const User = require("../../models").User;
const Deck = require("../../models").Deck;
const Consts = require("../../consts");

const login = async (req, res)=>{
    // input-> email, password, temp_token

    let {email, password, temp_token} = req.body;

    let valid = input_valid(req.body);

    if(valid == Consts.SUCCESS){

        let user = await User.findOne({email, password});

        if(user){

            let deck = await Deck.findOne({user_id:user._id.toString()});

            await res.json({rc:Consts.SUCCESS, data:user, faction:deck.selected_faction});

            if(typeof(temp_token)=="string"){
                await User.deleteOne({_id:temp_token, registered:false});
            }
            
            // outout-> rc, User, faction
        }else{
            res.json({rc:Consts.WRONG_PASSWORD});
        }
    }else{
        res.json({rc:valid});
    }
}

module.exports = login;

function input_valid(body){

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