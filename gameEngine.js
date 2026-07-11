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
      stress:0,scoreL0,
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
        const bonus= Math.round(card*pts *(game.region.countryStreakMult-1));
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
}