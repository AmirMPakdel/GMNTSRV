const Consts = require('../consts');
const {MatchQueue, QueueItem} = require('./MatchQeue');
const {xp2Level} = require('./utils');
const User = require('../models/User');
const {create_match_db, create_bot_match_db} = require('../helpers/match_starter');

const INTERVAL = 4300;
const WAITING_SEC_F1 = 1;
const WAITING_SEC_F2 = 2;
const WAITING_SEC_F3 = 3;
const WAITING_SEC_F4 = 4;

const LEVEL_DIFF = 6;
const LEVEL_DIFF_F1 = 9;
const LEVEL_DIFF_F2 = 12;
const LEVEL_DIFF_F3 = 15;

// in-progress 50%
let match_maker_interval = setInterval(() => {

    let mq = MatchQueue.getMatchQueue();

    // if there are atleast 2 player in queue
    if(mq._Queue.length > 1){

        // v-> token of the user
        mq._Queue.forEach((v,i)=>{

            let user_qItem = mq._QueueMap.get(v);
            user_qItem.add_waiting_seconds(INTERVAL/1000);
            mq._QueueMap.set(v, user_qItem);
            let user_level = user_qItem.get_level();

            mq._Queue.every((v2, i2)=>{

                if(v != v2){

                    let opp_qItem = mq._QueueMap.get(v2);
                    let opp_level = opp_qItem.get_level();

                    // good match found
                    if(Math.abs(user_level - opp_level) <= LEVEL_DIFF){
                        
                        match_maker.make_match(v, v2);
                        return true;
                    
                    }else{

                        let u_w_s = user_qItem.get_waiting_seconds();

                        if((u_w_s >= WAITING_SEC_F1) && (u_w_s <= WAITING_SEC_F2)){

                            if(Math.abs(user_level - opp_level) <= LEVEL_DIFF_F1){
                                match_maker.make_match(v, v2);
                                return true;
                            }

                        }else if((u_w_s >= WAITING_SEC_F2) && (u_w_s <= WAITING_SEC_F3)){

                            if(Math.abs(user_level - opp_level) <= LEVEL_DIFF_F2){
                                match_maker.make_match(v, v2);
                                return true;
                            }

                        }else if((u_w_s >= WAITING_SEC_F3) && (u_w_s <= WAITING_SEC_F4)){

                            if(Math.abs(user_level - opp_level) <= LEVEL_DIFF_F3){
                                match_maker.make_match(v, v2);
                                return true;
                            }
                            
                        }else{

                            if(Math.random() > 0.95){//0.5
                                match_maker.play_with_bot(v);
                                return true;
                            }
                        }
                    }
                }
            });
        });

    }else if(mq._Queue.length === 1){

        let user_qItem = mq._QueueMap.get(mq._Queue[0]);
        user_qItem.add_waiting_seconds(INTERVAL/1000);
        mq._QueueMap.set(mq._Queue[0], user_qItem);
        console.log(user_qItem.get_waiting_seconds());
        if(user_qItem.get_waiting_seconds() > WAITING_SEC_F4){

            let random = Math.random();
            console.log("random->"+random);
            if(random > 0.95){//0.5
                match_maker.play_with_bot(mq._Queue[0]);
            }
        }
    }
    
}, INTERVAL);

/**
 * @param {SocketIO.Socket} socket
 */
const match_maker = {
    
    // done 100%
    add_user_to_matchQueue : (user_id, user_xp, res)=>{

        let mq =  MatchQueue.getMatchQueue();

        let user_level = xp2Level(user_xp);

        let rc = mq.add(user_id, new QueueItem(user_level));

        res.json({rc});
    },

    // done 50%
    remove_user_matchQueue : (user_id, res)=>{

        let mq =  MatchQueue.getMatchQueue();

        return mq.remove(user_id);
    },

    // in-progress 0%
    make_match : (p1_id, p2_id)=>{

        match_maker.remove_user_matchQueue(p1_id);
        match_maker.remove_user_matchQueue(p2_id);

        create_match_db(p1_id, p2_id);
    },

    play_with_bot: (p1_id)=>{

        match_maker.remove_user_matchQueue(p1_id);

        create_bot_match_db(p1_id);
    }
}

module.exports = match_maker;