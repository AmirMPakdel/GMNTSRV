const {drew_card, round_call_off} = require('./match_controller');
const {xp2Level} = require("./utils");
const Match = require("../models/Match");
const {level2cards} = require("../resources/CardLevel");
const icons = require("../resources/icons.json");
const {getCard} = require("../resources/cards");

/** @typedef Card *@property {string} faction*@property {string} name*@property {string} position
 * @property {number} point*@property {string} effect*@property {boolean} is_royal
 * @property {string} number*@typedef decision *@property {Boolean} lock *@property {Card} card_object 
 * @property {Options} options *@typedef Options *@property {"m"|"r"|"s"} position *@property {string} target_card*/

const MIN_WAIT_SEC = 4;
const MAX_WAIT_SEC = 8;

function create_bot(player_xp){

    let bot = {};
    bot._id = "bot";
    bot.xp = player_xp;
    bot.level = xp2Level(player_xp);
    bot.selected_faction = "nor";//TODO:
    bot.deck = level2cards(bot.level)[bot.selected_faction]//TODO:
    bot.icon = icons[5].url;//TODO:

    return bot;
}

function bot_move(match_id){

    let waiting_time = Math.floor((MAX_WAIT_SEC-MIN_WAIT_SEC) * Math.random()) * 1000;
    waiting_time+= MIN_WAIT_SEC*1000;

    setTimeout(async(match_id)=>{

        await bot_decision(match_id);

    }, waiting_time, match_id)
}

async function bot_decision(match_id){

    let match = await Match.findOne({_id:match_id.toString()});

    let current_round = match.current_round;
    let my_won_rounds = match.p2_won_round;
    let opp_won_rounds = match.p1_won_round;

    if(current_round == 1){

        await bot_decision_roundOne(match);

    }else if(current_round == 2 && opp_won_rounds == 0){

        await bot_decision_roundTrap(match);
    
    }else{

        await bot_decision_have2win(match);
    }
}

async function bot_decision_roundOne(match){

    let left_cards = cards_left(match);

    if(left_cards < 5){

        await round_call_off("bot", match, null);

    }else{

        let {card_object, options} = draw_lowest_normal_card(match);

        if(card_object){
    
            await drew_card("bot", card_object.number, options, match, null);
    
        }else{
    
            await round_call_off("bot", match, null);
        }
    }
}

async function bot_decision_roundTrap(match){

    let left_cards = cards_left(match);

    if(left_cards < 5){

        await round_call_off("bot", match);

    }else{

        let {card_object, options} = draw_lowest_normal_card(match);

        if(card_object){
    
            drew_card("bot", card_object.number, options, match);
    
        }else{
    
            await round_call_off("bot", match);
        }
    }
}

async function bot_decision_have2win(match){

    let {card_object, options} = draw_for_win(match);

    if(card_object){

        await drew_card("bot", card_object.number, options, match);

    }else{

        await round_call_off("bot", match);
    }
}

function cards_left(match){

    return match.p2_cards.length;
}

function draw_spy_card(match){

    let cards = match.p2_cards;

    let selected_c_obj = null;

    cards.forEach(v=>{
        let c_obj = getCard(v);

        if(c_obj.effect == "spy"){

            selected_c_obj = c_obj;
        }
    });

    return selected_c_obj;
}

function draw_lowest_normal_card(match){

    let cards = match.p2_cards;

    let selected_c_obj = null;

    cards.forEach(v=>{
        let c_obj = getCard(v);

        if(c_obj.effect == "normal" && !c_obj.is_royal){

            if(!selected_c_obj){
                selected_c_obj = c_obj;
            }else if(selected_c_obj.point >= c_obj.point){
                selected_c_obj = c_obj;
            }
        }
    });

    return {card_object:selected_c_obj, options:{}};
}

function draw_for_win(match){
    let cards = match.p2_cards;

    let selected_c_obj = null;

    cards.forEach(v=>{
        let c_obj = getCard(v);

        if(c_obj.position !== "w" || (c_obj.position !== "z" || c_obj.position !== "d")){

            if(!selected_c_obj){
                selected_c_obj = c_obj;
            }else if(selected_c_obj.point >= c_obj.point){
                selected_c_obj = c_obj;
            }
        }
    });

    return {card_object:selected_c_obj, options:{}};
}

function draw_anything_unharmful(match){

}

function is_weather_card_helpful(card_object, match){

}

function is_scorch_card_helpful(match){

}

function use_decoy(match){

}

module.exports = {create_bot, bot_move}