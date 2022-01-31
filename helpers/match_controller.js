const Consts = require('../consts');
const {MatchQueue, QueueItem} = require('./MatchQeue');
const {xp2Level, xp2LevelInfo} = require('./utils');
const {Card, User, Deck, Match} = require('../models');
let {user_emit, setTurnTimeout, getTurnTimeout, deleteTurnTimeout} = require('./SocketPool');
const {match_start_detail_extractor, xp_calculator, 
    opponent_number_extractor,row_scores_extractor,
    player_number_extractor, match_result_extractor} = require('./data_extractor');
const {getCard} = require('../resources/cards');
const {calculate_row_score, setHorn, create_random_options, 
    spy_effect, setDecoy, select_random_card,
    scorchCard, cards_to_pile, heal_effect, scorch_effect,
    place_agile, muster_effect } = require('./card_effection');
const {level2cards} = require('../resources/CardLevel');

const NUMBER_OF_STARTING_CARDS = 10;
const CHANGE_CARD_TIME = 500;// 0.5s
const TURN_TIME = 16000;// 16s
const CHANGE_ROUND_BREAK = 2000;// 2s

const match_controller = {

    give_match_detail: async(match_id)=>{

        let match = await Match.findOne({_id:match_id.toString()});

        let user1 = await User.findOne({_id:match.p1_id});
        user1.status = "in-match";
        user1.current_match = match_id.toString();
        await user1.save();

        console.log(match.p2_id !== "bot");

        if(match.p2_id !== "bot"){
            let user2 = await User.findOne({_id:match.p2_id});
            user2.status = "in-match";
            user2.current_match = match_id.toString();
            await user2.save();
        }

        console.log(1);
        match = match_controller.flip_coin(match)
        console.log(2);
        match = match_controller.give_cards(match);
        console.log(3);
        await match.save();
        console.log(4);
        let resume = true;

        let p1_detail = await match_start_detail_extractor("p1", match);
        user_emit(match.p1_id, "match_detail", p1_detail, ()=>{
            resume = false;
            match_controller.player_abandoned(match.p1_id, match, false);
        });

        console.log(match.p2_id !== "bot");

        if(match.p2_id !== "bot"){

            let p2_detail = await match_start_detail_extractor("p2", match);
            user_emit(match.p2_id, "match_detail", p2_detail, ()=>{
                resume = false;
                match_controller.player_abandoned(match.p2_id, match, false);
            });
        }

        if(resume){
            match_controller.change_card_timeout(match_id);
        }
    },

    flip_coin: (match)=>{

        let rand = Math.random();
        if(rand > 0.5){
            match.turn = match.p1_id;
        }else{
            match.turn = match.p2_id;
        }

        return match;
    },

    round_started_decide: (match)=>{

        let r = match.current_round;

        let winner = match["r"+r+"_winner"];

        if(winner == "tie"){
            
            let rand = Math.random();
            if(rand > 0.5){
                match.turn = match.p1_id;
            }else{
                match.turn = match.p2_id;
            }
            
        }else{

            let player_id = match[winner+"_id"];

            let opp = opponent_number_extractor(player_id, match);

            // decide_whose_turn is going to change this turn - so it will be ok
            match.turn = match[opp+"_id"];
        }

        return match;
    },

    give_cards: (match)=>{

        let nos = NUMBER_OF_STARTING_CARDS;
        let p1_deck = match.p1_deck;

        let p1_cards = [];

        for(let i=0; i<nos; i++){

            let rand = Math.floor(Math.random()*p1_deck.length);
            p1_cards.push(p1_deck.splice(rand, 1)[0]);
        }

        let p2_deck = match.p2_deck;
        let p2_cards = [];

        for(let i=0; i<nos; i++){

            let rand = Math.floor(Math.random()*p2_deck.length);
            p2_cards.push(p2_deck.splice(rand, 1)[0]);
        }
        
        match.p1_deck = p1_deck;
        match.p1_deck = p2_deck;

        p1_cards.pop();
        p2_cards.pop();
        p1_cards.pop();
        p2_cards.pop();
        p1_cards.pop();
        p2_cards.pop();

        p1_cards.push("72");
        p2_cards.push("72");
        p1_cards.push("18");
        p2_cards.push("18");
        p1_cards.push("7");
        p2_cards.push("7");

        match.p1_cards = p1_cards;
        match.p2_cards = p2_cards;

        return match;
    },

    change_card_helper: async(user, match_id, card_number, res)=>{

        let match = await Match.findById(match_id);

        if(match.change_card_time){
            let p = "";
            if(match.p1_id == user._id){
                p = "p1"     
            }else if(match.p2_id == user._id){
                p = "p2"
            }

            if(match[p+"_change_card_left"] != 0){
                let deck = match[p+"_deck"];
                let cards = match[p+"_cards"];
        
                let card_index = cards.indexOf(card_number);
        
                let random_index = Math.floor(Math.random() * deck.length);
        
                let new_card_from_deck = deck.splice(random_index, 1)[0];
        
                let card_from_cards = cards.splice(card_index, 1)[0];
        
                deck.push(card_from_cards);
        
                cards.push(new_card_from_deck);
        
                match[p+"_deck"] = deck;
        
                match[p+"_cards"] = cards;
    
                match[p+"_change_card_left"]--;
        
                await match.save();
        
                res.json({rc:Consts.SUCCESS, data:{card:new_card_from_deck}});
            
            }else{

                res.json({rc:Consts.NO_MORE_CHANGE_LEFT});
            }            

        }else{

            res.json({rc:Consts.CHANGE_CARD_TIME_OVER});
        }
    },
    
    change_card_timeout : (match_id)=>{

        setTimeout(async()=>{

            let match = await Match.findOne({_id:match_id.toString()});

            match.change_card_time = false;

            await match.save();

            match_controller.whose_turn_decide(match);
            //match_controller.turn(match_id);

        }, CHANGE_CARD_TIME);
    },

    turn: async(match_id)=>{
        
        let match = await Match.findOne({_id:match_id.toString()});

        let p_id = match.turn.toString();

        let p_number = player_number_extractor(p_id, match);

        match[p_number+"_did_turn"] = false;

        await match.save();

        if(p_id === "bot"){

            require("./bot").bot_move(match_id);

        }else{

            let resume = true;
            user_emit(p_id, "your_turn", null, ()=>{
                resume = false;
                match_controller.player_abandoned(p_id, match, false);
            });

            if(resume){
                match_controller.turn_timout(p_number, match_id);
            }
        }
    },

    turn_timout : (p_number, match_id)=>{

        let timeout = setTimeout(async(p_number, match_id)=>{

            let match = await Match.findOne({_id:match_id.toString()});
            
            match[p_number+"_did_turn"] = true;

            await match.save();
                
            match_controller.draw_random_card(p_number, match);
            
        }, TURN_TIME, p_number, match_id);

        setTurnTimeout(match_id, timeout.ref());
    },

    draw_random_card: async(p, match)=>{

        let opp_num = opponent_number_extractor(match[p+"_id"], match);

        let cards = match[p+"_cards"];

        let selected_card = select_random_card(cards);

        if(selected_card){

            let random_options = create_random_options(selected_card);

            match = match_controller.drew_card_effect(p, selected_card, match, random_options);

            let my_rows_scores = row_scores_extractor(p, match);

            let opp_rows_scores = row_scores_extractor(opp_num, match);

            let resume = true;
            if(match[p+"_id"] !== "bot"){
                user_emit(match[p+"_id"], "my_random_drew", 
                {card:selected_card, rows_scores:my_rows_scores, options:random_options}, ()=>{
                    resume = false;
                    match_controller.player_abandoned(match[p+"_id"], match);
                })
            }
            
            if(match[opp_num+"_id"] !== "bot"){
                user_emit(match[opp_num+"_id"], "opp_random_drew", 
                {card:selected_card, rows_scores:opp_rows_scores, options:random_options}, ()=>{
                    resume = false;
                    match_controller.player_abandoned(match[opp_num+"_id"], match);
                })
            }
            
            match[p+"_did_turn"] = true;

            if(resume){
                await match_controller.whose_turn_decide(match);
            }

        }else{

            // calling player off because he has decoy or scorsh left only
            await match_controller.round_call_off(match[p+"_id"], match, false);
        }
    },

    drew_card: async(user_id, card_number, options, match, res)=>{

        if(match.game_finished){
            res.json({rc:"game is finished!"});
            return;
        }
        
        let p = player_number_extractor(user_id, match);

        let cards = match[p+"_cards"];
        if(cards.indexOf(card_number) == -1){
            res.json({rc:"u dont have this card!"});
            return;
        }

        let r = match.current_round;

        if(!match[p+"_did_turn"] && !match[p+"_round_calloff"]["r"+r]){

            let timeout = getTurnTimeout(match.id);

            clearTimeout(timeout);

            let opp = opponent_number_extractor(user_id, match);
    
            match[p+"_did_turn"] = true;

            match = await match.save();
    
            match = match_controller.drew_card_effect(p, card_number, match, options);

            let resume = true;

            if(match[opp+"_id"] !== "bot"){
                let opp_rows_scores = row_scores_extractor(opp, match);
                user_emit(match[opp+"_id"], "opponent_drew", 
                {card:card_number, rows_scores:opp_rows_scores, options}, ()=>{
                    resume = false;
                    match_controller.player_abandoned(match[opp+"_id"], match, false);
                })
            }
            
            if(match[p+"_id"] !== "bot"){
                let my_rows_scores = row_scores_extractor(p, match);
                res.json({rc:Consts.SUCCESS, rows_scores:my_rows_scores});
            }

            if(resume){
                await match_controller.whose_turn_decide(match);
            }

        }else{

            if(res){
                res.json({rc:"draw card time is out!"});
            }
        }
        
    },

    round_call_off: async(user_id, match, res)=>{

        if(match.game_finished){return};

        let p = player_number_extractor(user_id, match);
        let opp = opponent_number_extractor(user_id, match);
        let r = match.current_round;

        // calloff lock
        if(match.turn == user_id && !match[p+"_round_calloff"]["r"+r]){

            match[p+"_round_calloff"]["r"+r] = true;
            match[p+"_did_turn"] = true;
            match.markModified(p+"_round_calloff");

            await match.save();

            let timeout = getTurnTimeout(match._id);
            clearTimeout(timeout);

            let resume = true;
            if(match[opp+"_id"] !== "bot"){
                user_emit(match[opp+"_id"], "opponent_calloff", null, ()=>{
                    resume=false;
                    match_controller.player_abandoned(match[opp+"_id"], match, false);
                })
            }
            
            if(user_id !== "bot"){
                user_emit(user_id, "I_calloff", null, ()=>{
                    resume=false;
                    match_controller.player_abandoned(user_id, match, false);
                });

                if(res){res.json({rc:Consts.SUCCESS})}
            }

            if(resume){
                match_controller.whose_turn_decide(match);
            }

        }else{

            if(res){
                res.json({rc:Consts.CANT_CALL_OFF});
            }
        }
    },

    next_round: async(match)=>{

        let r = match.current_round;

        let p1_score = 0;
        let p2_score = 0;

        p1_score += match["r"+r+"_p1_score"]["m"];
        p1_score += match["r"+r+"_p1_score"]["r"];
        p1_score += match["r"+r+"_p1_score"]["s"];
        p2_score += match["r"+r+"_p2_score"]["m"];
        p2_score += match["r"+r+"_p2_score"]["r"];
        p2_score += match["r"+r+"_p2_score"]["s"];

        if(p1_score > p2_score){

            match["r"+r+"_winner"] = "p1";
            match.p1_won_round++;

        }else if(p1_score < p2_score){

            match["r"+r+"_winner"] = "p2";
            match.p2_won_round++;

        }else{

            match["r"+r+"_winner"] = "tie";
            match.p1_won_round++;
            match.p2_won_round++;
        }

        //check if there is a next round?!
        if(match.p1_won_round == 2 || match.p2_won_round == 2){

            await match.save();

            await match_controller.game_finished(match);

        }else{

            //add the cards on board to players pile
            match = cards_to_pile(match);

            match = match_controller.round_started_decide(match);

            match.current_round += 1;

            let resume = true;
            user_emit(match.p1_id, "round_started", {round:match.current_round}, ()=>{
                resume=false;
                match_controller.player_abandoned(match.p1_id, match, false);
            })

            if(match.p2_id !== "bot"){
                user_emit(match.p2_id, "round_started", {round:match.current_round}, ()=>{
                    resume=false;
                    match_controller.player_abandoned(match.p2_id, match, false);
                })
            }

            await match.save();

            if(resume){
                setTimeout(()=>{
                    match_controller.whose_turn_decide(match);
                }, CHANGE_ROUND_BREAK);
            }
        }

    },

    player_abandoned: async(user_id, match, res)=>{

        if(!match.game_finished){

            let p = player_number_extractor(user_id, match);

            let timeout = getTurnTimeout(match.id);
    
            clearTimeout(timeout);
            
            match[p+"_abandoned"] = true;
    
            if(res){
                await res.json({rc:Consts.SUCCESS});
            }
    
            await match_controller.game_finished(match);
        
        }else{

            if(res){
                await res.json({rc:Consts.GAME_ALREADY_FINISHED});
            }
        }
    },

    game_finished: async(match)=>{

        match.game_finished = true;
        deleteTurnTimeout(match._id);
        
        let {gain_xp:p1_gain_xp , level_diff_bounce:p1_level_diff_bounce,
            unused_cards_bonuce:p1_unused_cards_bonuce} = xp_calculator("p1", match);

        let {gain_xp:p2_gain_xp , level_diff_bounce:p2_level_diff_bounce,
            unused_cards_bonuce:p2_unused_cards_bonuce} = xp_calculator("p2", match);

        let user1 = await User.findOne({_id:match.p1_id});
        if(user1.xp == 0){
            p1_gain_xp = 120
        }
        match.p1_xp_gain = p1_gain_xp;
        let p1_result = match_result_extractor(match.p1_id, match);
        p1_result.level_diff_bounce = p1_level_diff_bounce;
        p1_result.unused_cards_bonuce = p1_unused_cards_bonuce;
        user_emit(match.p1_id, "game_finished", p1_result);
        await match_controller.modify_decks(user1._id, user1.xp, p1_gain_xp);
        //adding xp to user
        user1.xp += p1_gain_xp;
        user1.status = "online";
        user1.current_match = "none";
        await user1.save();

        if(match.p2_id !== "bot"){
            let user2 = await User.findOne({_id:match.p2_id});
            if(user2.xp == 0){
                p2_gain_xp = 120
            }
            match.p2_xp_gain = p2_gain_xp;
            let p2_result = match_result_extractor(match.p2_id, match);
            p2_result.level_diff_bounce = p2_level_diff_bounce;
            p2_result.unused_cards_bonuce = p2_unused_cards_bonuce;
            user_emit(match.p2_id, "game_finished", p2_result);
            await match_controller.modify_decks(user2._id, user2.xp, p2_gain_xp);
            //adding xp to user
            user2.xp += p2_gain_xp;
            user2.status = "online";
            user1.current_match = "none";
            await user2.save();
        }
        
        await match.save();
    },

    modify_decks: async(user_id, current_xp, gained_xp)=>{

        let {left, level} = xp2LevelInfo(current_xp);

        if(left <= gained_xp){

            let cards = level2cards(level+1);

            let d = await Deck.findOne({user_id:user_id.toString()});

            let factions = ["nor","nil","sco","mon"];

            factions.forEach(v=>{

                let in_deck = d.decks[v];
                let all_cards = cards[v];
                let new_f_deck = [];
                let new_f_coll = [];

                all_cards.forEach((v2)=>{

                    if(getCard(v2).position!="l"){
                        let inx = in_deck.indexOf(v2);
                        if(inx != -1){
                            new_f_deck.push(v2);
                        }else{
                            new_f_coll.push(v2);
                        }
                    }
                })

                d.decks[v] = new_f_deck;
                d.collections[v] = new_f_coll;

                d.markModified("decks."+v);
                d.markModified("collections."+v);
            });

            await d.save();
        }
    },

    whose_turn_decide: async(match)=>{
        // this fucntion should atleast save the match doc

        if(match.game_finished)return;

        let r = match.current_round;
        let current_turn = match.turn;
        let player = player_number_extractor(current_turn, match);
        let opp = opponent_number_extractor(current_turn, match);
        
        // check if opp did called off
        if(match[opp+"_round_calloff"]["r"+r]){

            // check if I called off too
            if(match[player+"_round_calloff"]["r"+r]){

                console.log("S1 happened");
                
                match = await match.save();

                await match_controller.next_round(match);

            }else{

                let my_cards = match[player+"_cards"];

                // and I have no card
                if(my_cards.length == 0){
    
                    console.log("S2 happened");
                    match = await match.save();
                    // call me off
                    await match_controller.round_call_off(match[player+"_id"], match, null);
    
                }else{
    
                    console.log("S3 happened");

                    //this line is useless
                    match.turn = current_turn;

                    match = await match.save();
                    
                    await match_controller.turn(match._id.toString());
                }
            }
            
        }else{

            let opp_cards = match[opp+"_cards"];

            if(opp_cards.length == 0){
                console.log("S4 happened");

                match.turn = match[opp+"_id"];
                // opp hasn't call off and he has no card so...
                await match_controller.round_call_off(match[opp+"_id"], match, null);
            
            }else{

                console.log("S5 happened");
                // set turn to opp turn
                match.turn = match[opp+"_id"];

                match = await match.save();

                await match_controller.turn(match._id.toString());
                
            }
        }
    },

    drew_card_effect: (p, selected_card, match, options)=>{

        let card_obj = getCard(selected_card);
        let opp = opponent_number_extractor(match[p+"_id"], match);
        let r = match.current_round;

        if(card_obj.position=="m" ||(card_obj.position=="r" || card_obj.position=="s")){
        
            if(card_obj.effect == "spy"){
                
                let cards_onboard = match["r"+r+"_"+opp+"_"+card_obj.position+"_cards"];
                cards_onboard.push(selected_card);
                match["r"+r+"_"+opp+"_"+card_obj.position+"_cards"] = cards_onboard;
                
                match = spy_effect(p, match);
                match = calculate_row_score(opp, "m", match);
                match = calculate_row_score(opp, "r", match);
                match = calculate_row_score(opp, "s", match);

            }else if(card_obj.effect == "heal"){

                match = heal_effect(p, opp, selected_card, options, match);

            }else if(card_obj.effect == "scorch"){

                match = scorch_effect(p, opp, selected_card, match);

            }else if(card_obj.effect == "agile"){

                match = place_agile(p, selected_card, options, match);

            }else if(card_obj.effect == "muster"){

                match = muster_effect(p, selected_card, match);

            }else{
                let cards_onboard = match["r"+r+"_"+p+"_"+card_obj.position+"_cards"];
                cards_onboard.push(selected_card);
                match["r"+r+"_"+p+"_"+card_obj.position+"_cards"] = cards_onboard;

                match = calculate_row_score(p, "m", match);
                match = calculate_row_score(p, "r", match);
                match = calculate_row_score(p, "s", match);       
            }

        }else if(card_obj.position=="w"){

            if(card_obj.effect == "freeze"){

                match["r"+r+"_snowy"] = true;
                match = calculate_row_score("p1", "m", match);
                match = calculate_row_score("p2", "m", match);

            }else if(card_obj.effect == "fog"){

                match["r"+r+"_foggy"] = true;
                match = calculate_row_score("p1", "r", match);
                match = calculate_row_score("p2", "r", match);

            }else if(card_obj.effect == "rain"){

                match["r"+r+"_rainy"] = true;
                match = calculate_row_score("p1", "s", match);
                match = calculate_row_score("p2", "s", match);

            }else if(card_obj.effect == "clear"){

                match["r"+r+"_snowy"] = false;
                match["r"+r+"_foggy"] = false;
                match["r"+r+"_rainy"] = false;

                match = calculate_row_score("p1", "m", match);
                match = calculate_row_score("p1", "r", match);
                match = calculate_row_score("p1", "s", match);
                match = calculate_row_score("p2", "m", match);
                match = calculate_row_score("p2", "r", match);
                match = calculate_row_score("p2", "s", match);

            }else{
                throw new Error("wtf - position w ->"+card_obj.effect+" !!!")
            }
        
        }else if(card_obj.position == "h"){
        
            match = setHorn(p, options, match);
        
        }else if(card_obj.position == "d"){

            match = setDecoy(p, selected_card, options, match);

        }else if(card_obj.position=="z"){

            match = scorchCard(p, selected_card, match);

        }else{
            
            throw new Error("wtf - position == "+card_obj.position);
        }

        let cards = match[p+"_cards"];
        let i = cards.indexOf(selected_card);
        cards.splice(i, 1);
        match[p+"_cards"] = cards;

        match.markModified("r"+r+"_p1_score");
        match.markModified("r"+r+"_p2_score");

        return match;
    },

    ali:"mehdi",
}

module.exports = match_controller;