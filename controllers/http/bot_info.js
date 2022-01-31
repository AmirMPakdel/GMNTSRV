const {Match} = require("../../models");
const Consts = require("../../consts");

const bot_info = async(req, res)=>{

    let {user} = req.body;

    let match_id = user.current_match;

    if(match_id !== "none"){

        let match = await Match.findOne({_id:match_id});

        if(match){

            let bot_cards = match.p2_cards;
        
            res.json({rc:Consts.SUCCESS, bot_cards});
        
        }else{
        
            res.json({rc:Consts.INVALID_MATCH_ID});
        }
        
    }else{
        res.json({rc:Consts.INVALID_MATCH_ID});
    }
}

module.exports = bot_info;