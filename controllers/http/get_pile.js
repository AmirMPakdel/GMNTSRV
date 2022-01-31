const {getCard} = require('../../resources/cards');
const {player_number_extractor} = require('../../helpers/data_extractor');
const Consts = require("../../consts");

const get_pile = async(req, res)=>{

    let {user, match} = req.body;
    
    let p = player_number_extractor(user._id.toString(), match);

    let pile = match[p+"_pile"];

    res.json({rc:Consts.SUCCESS, pile});
}

module.exports = get_pile;