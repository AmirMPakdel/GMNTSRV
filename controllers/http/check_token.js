const Consts = require('../../consts');
const User = require('../../models/User');

const check_token = async (req, res)=>{

    let token = req.body.token;

    let ans = input_valid(req.body);

    if(ans==Consts.SUCCESS){
        
        let user = await User.findOne({_id:token});

        console.log(user);
        
        if(user){

            if(user.registered){

                res.json({rc:Consts.SUCCESS, data:user});

            }else{

                res.json({rc:Consts.TEMP_USER, data:user});
            }

        }else{
            
            res.json({rc:Consts.INVALID_TOKEN});
        }

    }else{
        
        res.json({rc:ans});
    }
}

function input_valid(body){

    if(typeof(body.token)=="string"){
        if(body.token.length!=24){
            return Consts.INVALID_TOKEN;
        }
    }else{
        return Consts.INVALID_TOKEN;
    }

    return Consts.SUCCESS;
}

module.exports = check_token;