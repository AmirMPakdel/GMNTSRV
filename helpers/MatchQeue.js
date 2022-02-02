const {setInterval, clearInterval} = require('timers');
const match_starter = require("./match_starter");
let {socketPool} = require("../helpers/SocketPool");
const Consts = require("../consts");

//Singleton Design Pattern
class MatchQueue{

    /**
     * @param {SocketIO.Socket} socket
     */
    constructor(socket){
        this._QueueMap = new Map();
        this._Queue = [];
        this.socket = socket;
    }

    /**
     * @param {MatchQueue} _matchQueue
     */
    // done 100%
    static getMatchQueue (){
        if(this._matchQueue === undefined){
            this._matchQueue = new MatchQueue();
        }
        return this._matchQueue;
    }

    /**
     * @param {String} socket_id
     * @param {QueueItem} queueItem
     */
    // done 100%
    add(user_id, queueItem){

        if(socketPool.get(user_id)){

            const index = this._Queue.indexOf(user_id);
            if (index == -1) {
                this._QueueMap.set(user_id, queueItem);
                this._Queue.push(user_id);
                console.log("adding user");

                return Consts.SUCCESS;
            }else{
                //TODO: save errors in db
                console.log("wtf - user is already in Queue");
                return Consts.PLAYER_ALREADY_IN_QUEUE;
            }

        }else{
            //TODO: save errors in db
            console.log("wtf - user is not connected with socket");
            return Consts.PLAYER_NOT_CONNECTED_WITH_SOCKET;
        }
    }

    // done 100%
    remove(user_id){

        const index = this._Queue.indexOf(user_id);
        if (index != -1) {

            this._QueueMap.delete(user_id);
            this._Queue.splice(index, 1);
            
            return Consts.SUCCESS;

        }else{
            return Consts.PLAYER_NOT_INQUEUE;
        }
    }
}

class QueueItem{

    /**
     * @param {Number} level 
     */
    constructor(level){

        this.level = level;
        this.waiting_seconds = 0;
    }

    get_waiting_seconds(){
        return this.waiting_seconds;
    }

    add_waiting_seconds(seconds){
        this.waiting_seconds += seconds;
    }

    get_level(){
        return this.level;
    }
}

module.exports = {MatchQueue,QueueItem};