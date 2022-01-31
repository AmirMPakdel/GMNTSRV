/**
 * 
 * @param {Number} xp 
 */
const BASE_XP = 100;
const ADD_1L = 50;
const ADD_10L = 20;

const xp2Level = (xp)=>{

    let xp_temp = xp;

    let resume = true;

    let level = 0;

    let percent = 0;
    
    while(resume){

        let cost = BASE_XP + ((level)*ADD_1L) + (Math.floor(level/10)*ADD_10L);
        
        if(cost <= xp_temp){

            xp_temp -= cost;
            level+=1;
        
        }else{

            percent = (xp_temp*100)/cost;
            resume = false;
        }
    }

    return level;
}

const xp2LevelInfo = (xp)=>{

    let xp_temp = xp;

    let resume = true;

    let level = 0;

    let percent = 0;

    let left = 0;
    
    while(resume){

        let cost = BASE_XP + ((level)*ADD_1L) + (Math.floor(level/10)*ADD_10L);
        
        if(cost <= xp_temp){

            xp_temp -= cost;
            level+=1;
        
        }else{

            percent = (xp_temp*100)/cost;
            left = cost - xp_temp;
            resume = false;
        }
    }


    return {level, percent, left};
}

module.exports = {xp2Level, xp2LevelInfo};