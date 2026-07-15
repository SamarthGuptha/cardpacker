import {REGIONS} from "./deckData.js";
export const MAXDAYS=5;
export const SLOTSPERDAY=2;

export function createGame(regionId){
    const region= REGIONS[regionId];
    const deck = shuffle([...region.deck]);
    return {
      regionId,
      region,
      deck, discard:[],
      days:Array.from({length:MAXDAYS}, ()=> ({cards:[],locked:false})),
      stress:0,score:0,
      activeCard: null,
      scoreLog:[],
      over: false,
      won: false
    };
}

export function drawNext(game){
    if (game.over) return null;
    if (game.deck.length === 0) {
        finalize(game);
        return null;
    }
    game.activeCard=game.deck.shift();
    return game.activeCard;
}

export function canPlace(game, dayIdx){
    const day=game.days[dayIdx];
    if (day.locked) return false;
    return day.cards.length < SLOTSPERDAY;

}

export function placeCard(game, dayIdx){
    const card= game.activeCard;
    if (!card||card.type ==="choice") return null;
    if (!canPlace(game,dayIdx)) return null;

    const events= [];
    const day=game.days[dayIdx];
    let pts=card.pts;
    let stress=card.stress;
    const bonuses = [];

    const prevSameDay= day.cards[day.cards.length- 1];
    const prevDayLast = dayIdx>0 ? game.days[dayIdx-1].cards.slice(-1)[0]:null;

    if (prevSameDay && prevSameDay.cat === card.cat){
        const bonus= Math.round(pts*(game.region.themeStreakMult-1));
        pts+=bonus;
        bonuses.push({label:`Theme combo ${card.cat}`, value:bonus});
    } else if (prevDayLast && prevDayLast.cat===card.cat){
        const bonus = Math.round(pts*(game.region.themeStreakMult-1)*0.6);
        pts+=bonus;
        bonuses.push({label:`Theme carry ${card.cat}`, value:bonus});
    }

    const prevCountries= [
        ...(prevSameDay?[prevSameDay.country]:[]),
        ...(prevDayLast?[prevDayLast.country]:[]),
    ];
    if (card.country !== "-" && prevCountries.includes(card.country)){
        const bonus= Math.round(card.pts *(game.region.countryStreakMult-1));
        pts+=bonus;
        bonuses.push({label:`Geo streak ${card.country}`, value:bonus});
    }

    if (card.needsRest) {
        const prevDay= dayIdx>0?game.days[dayIdx-1]:null;
        const rested= prevDay && prevDay.cards.some(c=> c.cat ==="Relaxation");
        if (rested){
            pts+=card.restBonus||5;
            stress -=8;
            bonuses.push({label:`Rested → ${card.title}`,value:card.restBonus||5});
        } else {
            stress+=10;
            bonuses.push({label:`No rest before ${card.title}`, value:-10, penalty: true});
        }
    }

    day.cards.push({...card, appliedPts:pts, appliedStress:stress});
    game.score+=pts;
    applyStress(game, stress);

    game.scoreLog.push({title: card.title, pts, stress,bonuses});
    events.push({type:"placed", card,dayIdx,pts,stress,bonuses});
    game.activeCard=null;

    const packed=game.days.every(d=>d.cards.length>=1||d.locked);
    const fullyPacked=game.days.every(d=>d.locked||d.cards.length>=1);
    const allSlotsUsed= game.days.reduce((n,d)=> n+d.cards.length, 0);
    if (fullyPacked && allSlotsUsed >=MAXDAYS) finalize(game);
    if (game.stress >=game.region.stressThreshold){
        game.over=true; game.won=false;
        events.push({type:"meltdown"});
    }
    return events;
}

export function discardActive(game){
    if (!game.activeCard) return;
    game.discard.push(game.activeCard);
    game.activeCard=null;
    applyStress(game,8);
}


export function resolveChoice(game, accepted){
    const card=game.activeCard;
    if (!card||card.type !=="choice") return [];
    const events = [];
    if (accepted) {
        const bonus = card.onAcceptBonusPts||0;
        game.score += card.pts+bonus;
        applyStress(game,card.stress);
        game.scoreLog.push({title: `${card.title} (accepted)`,pts: card.pts+bonus, stress:card.stress, bonuses:[]});
        events.push({type:"choice-accept", card});
    } else{
        if (card.onDecline?.lockLastDay){
            game.days[MAXDAYS-1].locked = true;
            events.push({type:"locked", dayIdx:MAXDAYS-1});
        }
        if (card.onDecline?.lockRandom){
            const openIdxs = game.days.map((d,i) =>
                ({d, i})).filter(x=>!x.d.locked && x.d.cards.length === 0).map(x=>x.i);
            if (openIdxs.length){
                const idx = openIdxs[Math.floor(Math.random()*openIdxs.length)];
                game.days[idx].locked = true;
                events.push({type:"locked",dayIdx:idx});
            }
        }
        if (card.onDecline?.lockDays){
            card.onDecline.lockDays.forEach(i=> {if(!game.days[i].locked) {
                game.days[i].locked=true;
                events.push({type:"locked", dayIdx:i});
            }});
        }
        if (card.onDecline?.burnDeck){
            game.deck.splice(0,card.onDecline.burnDeck);
            events.push({type: "burned", n:card.onDecline.burnDeck});
        }
        game.scoreLog.push({title: `${card.title} (declined)`, pts:0, stress: 0, bonuses: []});
        events.push({type:"choice-decline", card});
    }
    game.activeCard = null;
    return events;
}


function applyStress(game,delta){
    game.stress=Math.max(0, Math.min(999,game.stress+delta));
    if (game.stress>=game.region.stressThreshold){
        game.over=true;
        game.won=false;
    }
}


function finalize(game) {
    if (game.over) return;
    const bonuses=[];
    const allCountries = game.days.flatMap(d =>d.cards.map(c=> c.country)).filter(x=> x && x !== "-");
    if (allCountries.length>=3 && allCountries.every(c=> c === allCountries[0])){
        game.score+=25;
        bonuses.push({label: "Single country trip", value:25});
    }
    if (game.stress<30) {
        game.score +=15;
        bonuses.push({label: "Zen traveler (<30% stress)", value:15});
    }
    const cats= new Set(game.days.flatMap(d => d.cards.map(c => c.cat)));
    if (cats.size>=4){
        game.score+=20;
        bonuses.push({label:"Balanced traveler (4+ themes)", value: 20});
    }
    game.finalBonuses = bonuses;
    game.over=true;
    game.won=game.stress<game.region.stressThreshold;
}

function shuffle(arr) {
    for (let i=arr.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]]=[arr[j], arr[i]];
    }
    return arr;
}

const KEY="cardpacker_progress";
const DEFAULTPROGRESS={
    unlocked:1,
    best: [0,0,0],
    miles: 0,
    ownedThemes: ["default"],
    activeTheme: "default",
    purchasedRegions:[]
};

export function loadProgress() {
    try{
        const raw = JSON.parse(localStorage.getItem(KEY));
        return {...DEFAULTPROGRESS, ...(raw||{}),
            ownedThemes: Array.from(new Set(["default", ...((raw && raw.ownedThemes) || [])])),
            purchasedRegions: Array.from(new Set(((raw && raw.purchasedRegions) || []))),

        };

    } catch { return {...DEFAULTPROGRESS};}
}

export function saveProgress(p) {
    try{
        localStorage.setItem(KEY, JSON.stringify(p));
    } catch{}
}

export const THEMES = [
    {id:"default",name:"Cardpacker Classic", cost:0, blurb:"The original deck."},
    {id:"pop-art", name: "Pop Art Panic", cost: 2, blurb: "Comic-book halftones. BAM! POW!"},
    {id: "handheld", name: "Roadtrip Handheld", cost: 3, blurb: "1989 game boy on a family road trip."},
    {id: "jetsetter",name:"Mid-Century Jetsetter", cost: 5, blurb: "Swiss poster meets Pan-Am"}
];

export function purchaseTheme(progress, themeId) {
    const theme = THEMES.find(t=> t.id === themeId);
    if (!theme) return {ok:false, reason: "unknown"};
    if (progress.ownedThemes.includes(themeId)) return {ok: false, reason: "owned"};
    if (progress.miles<theme.cost) return {ok:false,reason:"poor"};
    progress.miles -= theme.cost;
    progress.ownedThemes.push(themeId);
    saveProgress(progress);
    return {ok:true, theme};
}

export function setActiveTheme(progress, themeId){
    if (!progress.ownedThemes.includes(themeId)) return false;
    progress.activeTheme = themeId;
    saveProgress(progress);
    return true;
}

export const REGIONCOSTS=[0, 10, 25];

export function isRegionUnlocked(progress, regionId){
    if (regionId === 0) return true;
    if (regionId<progress.unlocked) return true;
    return (progress.purchasedRegions || []).includes(regionId);
}

export function purchaseRegion(progress, regionId){
    const cost = REGIONCOSTS[regionId] ?? 0;
    if (isRegionUnlocked(progress,regionId)) return {ok:false,reason:"owned"};
    if (progress.miles<cost) return {ok:false, reason: "poor"};
    progress.miles -= cost;
    progress.purchasedRegions= Array.from(new Set([...(progress.purchasedRegions||[]), regionId]));
    saveProgress(progress);
    return {ok:true, cost};
}