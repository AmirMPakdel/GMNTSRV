const Deck = require("../../models/Deck");
const Consts = require('../../consts');
const {getCard} = require('../../resources/cards');

const MIN_UNITS = 22;

const change_faction = async(req, res)=>{

    let {user, faction} = req.body;

    let valid = valid_input(req.body);

    if(valid == Consts.SUCCESS){

        let d = await Deck.findOne({user_id:user._id.toString()});

        valid = calculate_deck(faction, d);

        if(valid == Consts.SUCCESS){

            d.selected_faction = faction;

            await d.save();
        
            res.json({rc:Consts.SUCCESS});

        }else{

            res.json({rc:valid});
        }

    }else{

        res.json({rc:valid});
    }
}

module.exports = change_faction;

function valid_input(body){

    if(body.faction){

        if(body.faction!="nor"&&(body.faction!="nil"&&(body.faction!="sco"&&(body.faction!="mon")))){
            return Consts.INVALID_FACTION;
        }

    }else{
        return Consts.INVALID_FACTION;
    }

    return Consts.SUCCESS;
}

function calculate_deck(faction, deck){

    let decks = deck["decks"];

    let v = faction;

    let unit = 0;
    decks[v].forEach((v2,i)=>{

        let pos = getCard(v2).position;
        if(pos=="m"||(pos=="r"||pos=="s")){
            unit++;
        }
    });

    if(unit < MIN_UNITS){
        return Consts.INVALID_FACTION;
    }

    return Consts.SUCCESS;
}