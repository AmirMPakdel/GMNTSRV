const Deck = require("../../models/Deck");
const Consts = require('../../consts');
const {level2cards} = require("../../resources/CardLevel");
const {xp2Level} = require("../../helpers/utils");

const set_decks = async(req, res)=>{

    let {user, faction, in_deck} = req.body;

    let ans = validInput(req.body);

    if(ans == Consts.SUCCESS){

        let deck = await Deck.findOne({user_id:user._id.toString()});

        let user_level = xp2Level(user.xp); 
        let all_cards = level2cards(user_level)[faction];
        
        let new_f_deck = [];
        let new_f_coll = [];
        all_cards.forEach((v)=>{

            let inx = in_deck.indexOf(v);
            if(inx != -1){
                new_f_deck.push(v);
            }else{
                new_f_coll.push(v);
            }
        })

        deck.decks[faction] = new_f_deck;
        deck.collections[faction] = new_f_coll;

        deck.markModified("decks."+faction);
        deck.markModified("collections."+faction);

        await deck.save();

        res.json({rc:Consts.SUCCESS, data:deck});

    }else{

        res.json({rc:ans});
    }
}

module.exports = set_decks;

function validInput(body){

    if(typeof(body.in_deck)!="object"){
        return Consts.INVALID_DECK;
    }

    if(typeof(body.faction)!="string"){
        return Consts.INVALID_FACTION;
    }

    let f = body.faction;

    if(f=="nor"||(f=="nil"||(f=="sco"||f=="mon"))){
        return Consts.SUCCESS;
    }else{
        return Consts.INVALID_FACTION;
    }
}