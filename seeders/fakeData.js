const User = require('./models/User');
const Station = require('./models/Station');
const Challenge = require('./models/Challenge');
const fs = require('fs');
const env = require('./env.json');
const Cryptr = require('cryptr');
const Image = require("./models/Image");
const util = require("util");
const readFile_p = util.promisify(fs.readFile);
const writeFile_p = util.promisify(fs.writeFile);

const cryptr = new Cryptr(env.ENCRYPT_KEY);

const nof_users = 20;
const nof_stations = 50;

const fakeData = async ()=>{

    fakeWords = fakeSentence.split(" ");

    await fakeUsers();

    await fakeStations();

    await fakeChallenges();
}

const fakeUsers = async ()=>{

    let n = nof_users;

    let users = await User.find();

    n -= users.length;

    let temp = [];

    for(let i=0; i<n; i++){temp.push({num:i})};

    let fakePhoneNumber = "091180150";

    for(const i of temp){
        
        let user = new User({full_name:createfakeSentence(2), bio:createfakeSentence(10),
            phone_number: cryptr.encrypt(fakePhoneNumber+(i.num+10)),
            phone_number_dcr: fakePhoneNumber+(i.num+10),
            xp:random(5000),
             verified:true
            });

        await createFackeProfilePic(user);
    }
}

const fakeStations = async ()=>{

    let n = nof_stations;

    let stations = await Station.find();

    n -= stations.length;

    let temp = [];

    for(let i=0; i<n; i++){temp.push({num:i})};

    for(const i of temp){

        let title = createfakeSentence(4)

        let short_info = createfakeSentence(7)

        let info = createfakeSentence(800)

        let type = createFackType()

        let pics = [];

        let location = createFakeLocation();
        
        let station = new Station({title, short_info, info, type, pics, location});

        station.nof_likes += Math.floor(Math.random()*50);

        await createFackeStationPic(station._id, station);

        await station.save();
    }
}

const fakeChallenges = async ()=>{

    let challenges = await Challenge.find();
    
    if(challenges.length == 0){
        
        let challenge = new Challenge({title:"اولین شبانه روزی؟", online:true, info:content, xp:1200, location:challengeLoc(), type:"weekly"})
        await challenge.save();
    }
}

const random = (size)=>{

    return Math.floor(Math.random()*(size-0.01));
}

const createfakeSentence = (nof_words)=>{

    let sents = [];

    for(let i=0; i<nof_words; i++){
        
        sents.push(fakeWords[random(fakeWords.length)]);
    }

    return sents.join(" ");
}

const createFackType = ()=>{

    return(types[random(types.length)]);
}

const createFakeLocation = ()=>{

    let location = new Map();
    let rand1 = ((random(35)+1)*0.001) + 37.2599;
    let rand2 = ((random(63)+1)*0.001) + 49.5599;
    location.set("lat",rand1.toString());
    location.set("lng",rand2.toString());
    return(location)
}

const challengeLoc = ()=>{

    let m = new Map();
    m.set("lat","37.2788");
    m.set("lng","49.5847");
    return m;
}

const createFackeProfilePic = async (user)=>{

    try{
        fs.mkdirSync('./store/profiles');
    }catch(e){}

    let newImage = Image({type:"profile", rel_id:user._id});

    let num = random(5)+1;

    let data = await readFile_p("./store/ex/profiles/aex"+num+".jpg");

    if(data){

        await writeFile_p(`./store/profiles/${newImage._id}.jpg`, data);
        await newImage.save();
        user.profile_pic = newImage._id;
        await user.save();
    }
}

const createFackeStationPic = async (id, station)=>{

    try{
        fs.mkdirSync('./store/stations');
    }catch(e){}
    

    let createPic = async ()=>{

        let num = random(10)+1;

        let data = await readFile_p("./store/ex/stations/aex"+num+".jpg");

        let newImage = new Image({type:"station", rel_id:id});

        await writeFile_p("./store/stations/"+newImage._id+".jpg", data);

        await newImage.save();

        station.pics.push(newImage._id);
    }

    await createPic();
    random(10)>5? await createPic() : null;
    random(10)>5? await createPic() : null;
}

const content = "هدف آرسن از افتتاحش این بود که دست واسطه رو کوتاه کنه و می‌خواست محصول رو به همون قیمتی که براش تمام می‌شد بدست مردم برسونه...";
const types = ["walking", "landmark", "sitting", "shopping", "eating"];
const fakeSentence = "امروز انتشار برروی کنسول نینتند سوییچ خبر داد تاریخ دقیق عرضه‌ این بازی نیز مشخص شده است ادامه می‌توانید شاهد جزئیات بیشتری این خصوص باشید";
let fakeWords = [];

module.exports = fakeData;