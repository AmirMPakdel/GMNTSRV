const Deck = require("../../models/Deck");
const Consts = require('../../consts');

const get_decks = async(req, res)=>{

    let {user} = req.body;

    let deck = await Deck.findOne({user_id:user._id.toString()});
    console.log(deck);
    

    if(deck){
        res.json({rc:Consts.SUCCESS, data:deck});
    }else{
        res.json({rc:Consts.INVALID_TOKEN});
    }
}

module.exports = get_decks;