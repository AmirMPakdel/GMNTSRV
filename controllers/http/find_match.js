const User = require('../../models/User');
const Match = require('../../models/Match');
const Consts = require('../../consts');
const Validate = require("../../helpers/Validate");
let socketPool = require('../../helpers/SocketPool');
const match_maker = require('../../helpers/match_maker');
const match_controller = require("../../helpers/match_controller");

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const find_match = async (req, res)=>{

    let {user} = req.body;

    if(user.current_match != "none"){
        
        let match = await Match.findOne({_id:user.current_match});
        if(match){
            await match_controller.player_abandoned(user._id.toString(), match);
        }
        user.current_match = "none";
        user.status = "online";
        await user.save();
    }

    if(Validate.http_id(user.id, res)){

        match_maker.add_user_to_matchQueue(user.id, user.xp, res);
    }
}

module.exports = find_match;