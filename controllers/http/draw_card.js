const {drew_card} = require('../../helpers/match_controller');
const {getCard} = require('../../resources/cards');
const {player_number_extractor} = require('../../helpers/data_extractor');
const Consts = require("../../consts");

const draw_card = async (req, res)=>{

    let {user, match, card_number, options} = req.body;

    /*
        options ->
            position : "m" | "r" | "s"
            target_card: "card_number"
    */

    let can_continue = true;

    let card_obj = getCard(card_number);
    if(!card_obj){

        res.json({rc:Consts.NO_SUCH_CARD});

    }else if(card_obj.position == "h"){

        if(!options){options = {}};
        let op = options.position;

        if(op != "m" && (op != "r" && op != "s")){
            
            can_continue = false;
            res.json({rc:Consts.NO_OPTION_POSITION});
        }

    }else if(card_obj.position == "d"){

        if(!options){options = {}};
        let op = options.position;

        if(op != "m" && (op != "r" && op != "s")){
            
            can_continue = false;
            res.json({rc:Consts.NO_OPTION_POSITION});
        
        }else if(!options.target_card){

            can_continue = false;
            res.json({rc:Consts.NO_OPTION_TARGET_CARD});
        
        }else{

            let target_card_obj = getCard(options.target_card);
            if(target_card_obj.position == "d"){

                can_continue = false;
                res.json({rc:Consts.INVALID_OPTION_CHOICE});

            }else{

                let r = match.current_round;
                let p = player_number_extractor(user._id.toString(), match);

                let my_cards_row = match["r"+r+"_"+p+"_"+op+"_cards"];

                if(my_cards_row.indexOf(options.target_card) == -1){
                    can_continue = false;
                    res.json({rc:Consts.INVALID_OPTION_CHOICE});
                }
            }
        }

    }

    if(can_continue){
        drew_card(user._id.toString(), card_number, options, match, res);
    }
}

module.exports = draw_card;