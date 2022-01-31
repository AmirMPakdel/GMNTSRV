const {getCard} = require('../resources/cards');
let {user_emit} = require('./SocketPool');
const {opponent_number_extractor, scorch_data_extractor} = require('./data_extractor');

/**
 * @param {"p1"|"p2"} player_number 
 * @param {"m"|"r"|"s"} position
 * @param {Match} match
 */
function calculate_row_score(player_number, position, match){

    let r = match.current_round;
    let p = player_number;
    let pos = position;
    let weather_effect = "";

    switch(pos){
        case "m": weather_effect="snowy"; break;
        case "r": weather_effect="foggy"; break;
        case "s": weather_effect="rainy";break;
        default: throw new Error("wtf - weather_effect="+weather_effect);
    }

    let cards = match["r"+r+"_"+player_number+"_"+pos+"_cards"];
    
    let row_score = 0;

    let bad_weather = match["r"+r+"_"+weather_effect];

    let tide_bonds = {};

    let moral_boost = 0;

    let horn = match["r"+r+"_horns"][p+"_"+pos];

    let ability_horn = false;

    cards.forEach((v,i)=>{
        let card_obj = getCard(v);
        if(card_obj.effect == "horn"){
            ability_horn = true;
        }else
        if(card_obj.effect == "plus"){
            moral_boost += 1;
        }else
        if(card_obj.effect == "team"){

            let team_name = card_obj.name.slice(0,-1);
            if(tide_bonds[team_name] === undefined){
                tide_bonds[team_name] = [];
            }
            tide_bonds[team_name].push({name:team_name});
        }
    });

    cards.forEach((v,i)=>{

        row_score += calculate_card_score(v, bad_weather, tide_bonds, moral_boost, horn, ability_horn);
    });

    match["r"+r+"_"+p+"_score"][pos] = row_score;
    return match;
}

function calculate_card_score(card_number, bad_weather, tide_bonds, moral_boost, horn, ability_horn){
    
    let v = card_number;

    let card_obj = getCard(v);

    if(card_obj.is_royal){
        //TODO: what if royal has ability like moral boost!!!
        return card_obj.point;

    }else{

        let adding_score = 0;

        if(bad_weather){
            if(card_obj.point != 0){
                adding_score = 1;
            }
        }else{
            adding_score = card_obj.point;
        }

        if(card_obj.effect == "team"){

            let team_name = card_obj.name.slice(0,-1);

            let num = tide_bonds[team_name].length;
            let base_str = adding_score;

            adding_score = num*base_str;
        }

        if(card_obj.effect == "plus"){
            // add str excluding him self
            adding_score += moral_boost-1;

        }else{
            adding_score += moral_boost;
        }

        if(horn){
            adding_score *=2;
        }else if(card_obj.effect != "horn" && ability_horn){
            adding_score *=2;
        }

        return adding_score;
    }
}

/**
 * @param {"p1"|"p2"} player_number
 * @param {"m"|"r"|"s" | "random"} pos
 * @param {Match} match 
 */
function setHorn(player_number, options, match){

    let p = player_number;
    let r = match.current_round;
    
    let pos = options.position;

    match["r"+r+"_horns"][p+"_"+pos] = true;

    match.markModified("r"+r+"_horns");

    return calculate_row_score(p, pos, match);
}

function create_random_options(card_number){

    let card_obj = getCard(card_number);

    if(card_obj.position == "h"){

        let pos = "s";
        let rand = Math.random();
        if(rand > 0.66){
            pos = "m";
        }else if( rand > 0.33){
            pos = "r";
        }

        return {position:pos, target_card:null}

    }else if(card_obj.effect == "agile"){

        return {position:"r", target_card:null}
        
    }else{

        return {position:null, target_card:null}
    }
}

function select_random_card(cards){
    // input -> list of players cards

    let card_list = [];

    // removing decoy, scorch and weather card
    cards.forEach((v,i)=>{
        let c_obj = getCard(v);
        let pos = c_obj.position;
        if(pos!="w" && (pos!="d" && pos!="z")){
            card_list.push(v);
        }
    });

    console.log("card_list->"+card_list);
    
    if(card_list.length == 0){

        return null;
    
    }else{

        let random_index = Math.floor(Math.random() * card_list.length);

        let selected_card = card_list[random_index];
        
        let idx = cards.indexOf(selected_card);

        console.log("selected_card->"+selected_card+" cards[idx]="+cards[idx]);
        
        return cards[idx];
    }
    // output -> null or random card number
}

function spy_effect(p, match){

    let my_deck = match[p+"_deck"];

    if(my_deck.length < 2){
        throw new Error("WTF - my_deck.length="+my_deck.length+". it spy needs 2 card form deck");
    }

    let my_deck_len = my_deck.length;
    let selected_cards = [];

    for(let i=0; i<2; i++){

        let random = Math.random()*my_deck_len;
        random = Math.floor(random);

        selected_cards.push(my_deck[random]);

        match[p+"_cards"].push(my_deck[random]);

        my_deck.splice(random, 1);

        my_deck_len = my_deck.length;
    }
    
    if(match[p+"_id"] !== "bot"){
        user_emit(match[p+"_id"], "spy_cards", {cards:selected_cards});
    }
    
    let opp = opponent_number_extractor(match[p+"_id"], match);
    
    if(match[opp+"_id"] !== "bot"){
        user_emit(match[opp+"_id"], "opp_got_spy", {cards_length:selected_cards.length});
    }

    match[p+"_deck"] = my_deck;

    match.markModified(p+"_deck");
    match.markModified(p+"_cards");

    return match;
}

function setDecoy(p, decoy_card_number, options, match){

    let target_card = options.target_card;
    let pos = options.position;
    let r = match.current_round;

    let cards_onboard = match["r"+r+"_"+p+"_"+pos+"_cards"];
    cards_onboard.push(decoy_card_number);
    
    let index = cards_onboard.indexOf(target_card);

    if(index == -1){
        throw new Error("WTF - target card not found in row!!! \n"+
        "cards->"+cards_onboard+"\n target="+target_card);
    }

    cards_onboard.splice(index, 1);

    match[r+"_"+p+"_"+pos+"_cards"] = cards_onboard;

    match[p+"_cards"].push(target_card);

    match = calculate_row_score(p, pos, match);

    match.markModified(p+"_cards");
    match.markModified(r+"_"+p+"_"+pos+"_cards");

    return match;
}

function scorchCard(p, scorch_card_number, match){

    let opp = opponent_number_extractor(match[p+"_id"], match);
    let r = match.current_round;
    let scorching_cards = [];

    let all_rows = [
        {p_num:opp, pos:"s"},{p_num:opp, pos:"r"},{p_num:opp, pos:"m"},
        {p_num:p, pos:"s"},{p_num:p, pos:"r"},{p_num:p, pos:"m"}]

    // choosing scorching cards
    all_rows.forEach((v)=>{

        let cards = match["r"+r+"_"+v.p_num+"_"+v.pos+"_cards"];

        let weather_effect;
        switch(v.pos){
            case "m": weather_effect="snowy"; break;
            case "r": weather_effect="foggy"; break;
            case "s": weather_effect="rainy";break;
            default: throw new Error("wtf - weather_effect="+weather_effect);
        }
        
        let bad_weather = match["r"+r+"_"+weather_effect];
    
        let tide_bonds = {};
    
        let moral_boost = 0;
    
        let horn = match["r"+r+"_horns"][v.p_num+"_"+v.pos];
    
        let ability_horn = false;
    
        cards.forEach((v,i)=>{
            let card_obj = getCard(v);
            if(card_obj.effect == "horn"){
                ability_horn = true;
            }else if(card_obj.effect == "plus"){
                moral_boost += 1;
            }else if(card_obj.effect == "team"){
                let team_name = card_obj.name.slice(0,-1);
                if(tide_bonds[team_name] === undefined){
                    tide_bonds[team_name] = [];
                }
                tide_bonds[team_name].push({name:team_name});
            }
        });

        cards.forEach((v2)=>{

            let card_score = 
            calculate_card_score(v2, bad_weather, tide_bonds, moral_boost, horn, ability_horn);
            let card_pos = v.pos;
            let player_number = v.p_num;

            let card_obj = getCard(v2);

            if(card_obj.is_royal || card_score == 0){
                return;
            }

            if(scorching_cards.length == 0){

                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:card_pos,
                    player_number,
                });

            }else if(scorching_cards[0].score == card_score){

                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:card_pos,
                    player_number,
                });

            }else if(scorching_cards[0].score < card_score){
                
                scorching_cards = [];
                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:card_pos,
                    player_number,
                });
            }
        });
    });

    let changed_row = {};
    // burning scorching cards
    scorching_cards.forEach((v)=>{

        let cards = match["r"+r+"_"+v.player_number+"_"+v.position+"_cards"];

        let idx = cards.indexOf(v.number);

        if(idx==-1){throw new Error("WTF - card dont exist in the row?! c.num->"+v.number+" cards=>"+cards)}

        let burnt_card = cards.splice(idx, 1)[0];

        match["r"+r+"_"+v.player_number+"_"+v.position+"_cards"] = cards;

        //add the scorched cards to player's pile
        match[v.player_number+"_pile"].push(burnt_card);

        match.markModified("r"+r+"_"+v.player_number+"_"+v.position+"_cards");
        
        changed_row["r"+r+"_"+v.player_number+"_"+v.position+"_cards"] = {player_number:v.player_number, position:v.position};
    });

    match.markModified("p1_pile");
    match.markModified("p2_pile");

    // sending data to players
    let {player_data, opp_data} = scorch_data_extractor(p,scorching_cards);

    if(match[p+"_id"] !== "bot"){
        user_emit(match[p+"_id"], "scorching_cards", player_data);
    }
    if(match[opp+"_id"] !== "bot"){
        user_emit(match[opp+"_id"], "scorching_cards", opp_data);
    }

    // calculating scores in effected rows
    Object.keys(changed_row).forEach((v)=>{

        match = calculate_row_score(changed_row[v].player_number, changed_row[v].position, match);
    });

    return match;
}

function cards_to_pile(match){

    let r = match.current_round;
    let players = ["p1", "p2"];
    let positions = ["m", "r", "s"];

    players.forEach((ply)=>{

        positions.forEach((pos)=>{

            match["r"+r+"_"+ply+"_"+pos+"_cards"].forEach((card_num)=>{

                let card_obj = getCard(card_num);
                if(card_obj.is_royal){return};
                if(card_obj.position=="m"||card_obj.position=="r"||card_obj.position=="s"){
                    match[ply+"_pile"].push(card_num);
                }
            });
        });
    });

    match.markModified("p1_pile");
    match.markModified("p2_pile");

    return match;
}

function heal_effect(p, opp, heal_card_number, options, match){

    if(!options){options={target_card:false}};

    let target_card = options.target_card;

    let valid_target = false;

    let pile = match[p+"_pile"];

    if(target_card){
        if(pile.indexOf(target_card) != -1){
            valid_target = true;
        }
    }

    let r = match.current_round;

    if(valid_target){
        let card_obj = getCard(target_card);

        let owns = p;

        if(card_obj.effect == "spy"){
            owns = opp;
            //TODO: if spy then set spy effect
        }else if(card_obj.effect == "heal"){
            //TODO: if heal then set heal effect
        }else if(card_obj.effect == "scorch"){
            //TODO: if scorch then set scorch effect
        }

        let cards_onboard = match["r"+r+"_"+owns+"_"+card_obj.position+"_cards"];

        cards_onboard.push(target_card);

        match["r"+r+"_"+owns+"_"+card_obj.position+"_cards"] = cards_onboard;

        match.markModified("r"+r+"_"+owns+"_"+card_obj.position+"_cards");

        match = calculate_row_score(owns, card_obj.position, match);

        if(match[p+"_id"] !== "bot"){
            user_emit(match[opp+"_id"], "opp_heal", {target_card});
        }
        if(match[opp+"_id"] !== "bot"){
            user_emit(match[p+"_id"], "my_heal", {target_card});
        }

        // removing it from the pile
        let p_idx = pile.indexOf(target_card);
        pile.splice(p_idx, 1);
        match[p+"_pile"] = pile;
        match.markModified(p+"_pile");
    }

    let heal_card_obj = getCard(heal_card_number);

    let cards_onboard = match["r"+r+"_"+p+"_"+heal_card_obj.position+"_cards"];

    cards_onboard.push(heal_card_number);

    match["r"+r+"_"+p+"_"+heal_card_obj.position+"_cards"] = cards_onboard;

    match.markModified("r"+r+"_"+p+"_"+heal_card_obj.position+"_cards");

    match = calculate_row_score(p, heal_card_obj.position, match);

    return match;
}

function scorch_effect(p, opp, card_number, match){

    let sc_card_obj = getCard(card_number);
    let r = match.current_round;
    let pos = sc_card_obj.position;

    let opp_row_score = match["r"+r+"_"+opp+"_score"][pos];

    if(opp_row_score >= 10){

        let scorching_cards = [];
        let opp_row_cards = match["r"+r+"_"+opp+"_"+pos+"_cards"];
        let weather_effect;
        switch(pos){
            case "m": weather_effect="snowy"; break;
            case "r": weather_effect="foggy"; break;
            case "s": weather_effect="rainy"; break;
            default: throw new Error("wtf - weather_effect="+weather_effect);
        }
        
        let bad_weather = match["r"+r+"_"+weather_effect];
        let tide_bonds = {};
        let moral_boost = 0;
        let horn = match["r"+r+"_horns"][opp+"_"+pos];
        let ability_horn = false;
    
        opp_row_cards.forEach((v,i)=>{
            let card_obj = getCard(v);
            if(card_obj.effect == "horn"){
                ability_horn = true;
            }else if(card_obj.effect == "plus"){
                moral_boost += 1;
            }else if(card_obj.effect == "team"){
                let team_name = card_obj.name.slice(0,-1);
                if(tide_bonds[team_name] === undefined){
                    tide_bonds[team_name] = [];
                }
                tide_bonds[team_name].push({name:team_name});
            }
        });

        opp_row_cards.forEach((v2)=>{
            let card_score = 
            calculate_card_score(v2, bad_weather, tide_bonds, moral_boost, horn, ability_horn);
            let player_number = opp;
            let card_obj = getCard(v2);

            if(card_obj.is_royal || card_score == 0){
                return;
            }
            if(scorching_cards.length == 0){
                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:pos,
                    player_number,
                });
            }else if(scorching_cards[0].score == card_score){
                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:pos,
                    player_number,
                });
            }else if(scorching_cards[0].score < card_score){
                scorching_cards = [];
                scorching_cards.push({
                    number:v2,
                    score:card_score,
                    position:pos,
                    player_number,
                });
            }
        });

        // burning scorching cards
        scorching_cards.forEach((v)=>{

            let cards = match["r"+r+"_"+v.player_number+"_"+v.position+"_cards"];

            let idx = cards.indexOf(v.number);

            if(idx==-1){throw new Error("WTF - card dont exist in the row?! c.num->"+v.number+" cards=>"+cards)}

            let burnt_card = cards.splice(idx, 1)[0];

            match["r"+r+"_"+v.player_number+"_"+v.position+"_cards"] = cards;

            //add the scorched cards to player's pile
            match[v.player_number+"_pile"].push(burnt_card);

            match.markModified("r"+r+"_"+v.player_number+"_"+v.position+"_cards");
        });

        match.markModified(opp+"_pile");

        // sending data to players
        let {player_data, opp_data} = scorch_data_extractor(p,scorching_cards);

        if(match[p+"_id"] !== "bot"){
            user_emit(match[p+"_id"], "scorching_cards", player_data);
        }
        if(match[opp+"_id"] !== "bot"){
            user_emit(match[opp+"_id"], "scorching_cards", opp_data);
        }

        // calculating scores in effected rows
        match = calculate_row_score(opp, pos, match);
    }

    match["r"+r+"_"+p+"_"+pos+"_cards"].push(card_number);
    match.markModified("r"+r+"_"+p+"_"+pos+"_cards");

    match = calculate_row_score(p, pos, match);

    return match;
}

function place_agile(p, card_number, options, match){

    let pos = "r";

    if(options){
        if(options.position){
            if(options.position == "m"){pos = "m"};
        }
    }

    let r = match.current_round;

    match["r"+r+"_"+p+"_"+pos+"_cards"].push(card_number);

    match.markModified("r"+r+"_"+p+"_"+pos+"_cards");

    match = calculate_row_score(p, pos, match);

    return match;
}

function muster_effect(p, card_number, match){

    let r = match.current_round;
    let muster_c_obj = getCard(card_number);
    let muster_name = muster_c_obj.name.slice(0,-1);
    let deck = match[p+"_deck"];
    let hand_cards = match[p+"_cards"];

    let deck_remove = [];
    let hand_remove = [];

    deck.forEach((v,i)=>{
        let card_obj = getCard(v);
        if(card_obj.name.slice(0,-1) == muster_name &&
            v != card_number){
            deck_remove.push(v);
        }
    });

    hand_cards.forEach((v,i)=>{
        let card_obj = getCard(v);
        if(card_obj.name.slice(0,-1) == muster_name &&
        v != card_number){
            hand_remove.push(v);
        }
    });

    deck_remove.forEach((v)=>{
        let idx = deck.indexOf(v);
        if(idx == -1){
            throw new Error("WTF - card not in the deck!!!");
        }
        deck.splice(idx, 1);

        let pos = getCard(v).position
        match["r"+r+"_"+p+"_"+pos+"_cards"].push(v);
        match.markModified("r"+r+"_"+p+"_"+pos+"_cards");
    });

    hand_remove.forEach((v)=>{
        let idx = hand_cards.indexOf(v);
        if(idx == -1){
            throw new Error("WTF - card not in the deck!!!");
        }
        hand_cards.splice(idx, 1);

        let pos = getCard(v).position
        match["r"+r+"_"+p+"_"+pos+"_cards"].push(v);
        match.markModified("r"+r+"_"+p+"_"+pos+"_cards");
    });

    match[p+"_cards"] = hand_cards;
    match[p+"_deck"] = deck;

    match.markModified(p+"_cards");
    match.markModified(p+"_deck");

    // tell players what following muster cards will be add
    let p_id = match[p+"_id"];
    let opp = opponent_number_extractor(p_id, match);

    if(match[p+"_id"] !== "bot"){
        user_emit(match[p+"_id"], "muster_effect", {owns:"my", hand_remove, deck_remove});
    }
    if(match[opp+"_id"] !== "bot"){
        user_emit(match[opp+"_id"], "muster_effect", {owns:"opp", hand_remove, deck_remove});
    }

    // adding the selected card to row
    let pos = getCard(card_number).position
    match["r"+r+"_"+p+"_"+pos+"_cards"].push(card_number);
    match.markModified("r"+r+"_"+p+"_"+pos+"_cards");

    match = calculate_row_score(p, "m", match);
    match = calculate_row_score(p, "r", match);
    match = calculate_row_score(p, "s", match);

    return match;
}

module.exports = {
    calculate_row_score, 
    setHorn, 
    create_random_options,
    select_random_card,
    spy_effect,
    setDecoy,
    scorchCard,
    cards_to_pile,
    heal_effect,
    scorch_effect,
    place_agile,
    muster_effect,
};