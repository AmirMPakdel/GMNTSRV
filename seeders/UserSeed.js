const {User, Deck} = require('../models');


const user_seed = async ()=>{

    fakeWords = fakeSentence.split(" ");

    let users = await User.find();

    let n = 5;

    n -= users.length;

    let temp = [];

    for(let i=0; i<n; i++){temp.push({num:i})};

    for(const i of temp){
        
        let deck = new Deck({});
        let user = new User({name:createfakeSentence(2), deck_id:deck._id});
        deck.user_id = user._id.toString();

        user.password="123456";
        user.email = (Math.floor(Math.random()*99999999)).toString()+"@gmail.com";
        user.username = (Math.floor(Math.random()*99999999)).toString()+"username";
        user.xp = Math.floor(Math.random()*99999)
        await user.save();
        await deck.save();
    }
}



const createfakeSentence = (nof_words)=>{

    let sents = [];

    for(let i=0; i<nof_words; i++){
        
        sents.push(fakeWords[random(fakeWords.length)]);
    }

    return sents.join(" ");
}

const random = (size)=>{

    return Math.floor(Math.random()*(size-0.01));
}


const content = "هدف آرسن از افتتاحش این بود که دست واسطه رو کوتاه کنه و می‌خواست محصول رو به همون قیمتی که براش تمام می‌شد بدست مردم برسونه...";
const types = ["walking", "landmark", "sitting", "shopping", "eating"];
const fakeSentence = "امروز انتشار برروی کنسول نینتند سوییچ خبر داد تاریخ دقیق عرضه‌ این بازی نیز مشخص شده است ادامه می‌توانید شاهد جزئیات بیشتری این خصوص باشید";
let fakeWords = [];

module.exports = {user_seed};