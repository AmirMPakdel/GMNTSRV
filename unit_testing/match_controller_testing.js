const Consts = require('../consts');
const IO = require('socket.io');
const {MatchQueue, QueueItem} = require('./MatchQeue');
const {xp2Level} = require('./utils');
const {Card, User, Deck, Match} = require('../models');
let {socketPool, get_socket} = require('./SocketPool');
const {match_start_detail_extractor, card_extractor, xp_calculator,
     player_number_extractor} = require('./data_extractor');
const {give_match_detail} = require('../helpers/match_controller');

function give_match_detail_testing(){

    /*
        ->  socket, match_id
    */
    
    
    let match = await Match.findById(match_id);

    match = await match_controller.flipe_the_coin(match);

    match = await match_controller.give_10cards_each(match);

    await match.save();

    let p1_detail = match_start_detail_extractor("p1", match);

    let p2_detail = match_start_detail_extractor("p2", match);

    let p1_sid = socketPool.get(match.p1_id);

    let p2_sid = socketPool.get(match.p2_id);

    socket.to(p1_sid).emit("match_detail", p1_detail);

    socket.to(p2_sid).emit("match_detail", p2_detail);

    setTimeout(()=>{

        match.change_card_time = false;
        match.save();

        match_controller.turn(socket, match_id);
    }, 10000)
}

async function createMatch(){

    let user1 = await createUser();
    let user2 = await createUser();

    let newMatch = new Match({
        p1_id:user1.id,
        p2_id:user2.id,
    });

}

async function createUser(){
    let user = new User({name:"testUser -"+Math.random()*100});
    await user.save();
    return user;
}