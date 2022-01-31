const mongoose = require("mongoose");
const Deck = require('./Deck');
const icons = require("../resources/icons.json");

const UserSchema = new mongoose.Schema({

    status:{type:String, default:"online"},//online in-match offline

    //required
    last_online:{type:String},// set by Date.now().toString() every time user is online

    registered:{type:Boolean, default:false},// user is temp or not

    current_match:{type:String, default:"none"},// its none if he is not in match anymore

    username: {type:String, default:""},// only if he is registered

    email: {type:String, default:""},// only if he is registered

    password: {type:String, default:""},// only if he is registered
    
    xp: {type:Number, default:0},

    icon: {type:String, default:icons[1].url},

    //required
    deck_id: {type:mongoose.Types.ObjectId},

    friends: {type:Array, default:[]},
});

const User = mongoose.model("User", UserSchema);

module.exports = User;