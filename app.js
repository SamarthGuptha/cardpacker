import {
    createGame, drawNext, placeCard,discardActive,resolveChoice, loadProgress, saveProgress,purchaseTheme, setActiveTheme, THEMES, purchaseRegion,
    REGIONCOSTS
} from "./gameEngine.js";
import * as UI from "./uiController.js";

let game=null;
let progress = loadProgress();

function startGame(regionId){
    game = createGame(regionId);
    UI.showScreen("game");
    UI.renderRegionPill(game.region);
    UI.renderStress(game);
    UI.renderScore(game);
    drawNext(game);
    UI.renderActiveCard(game);
    UI.renderDays(game,handlePlace);
}

async function handlePlace(dayIdx){
    const prevStress = game.stress;
    const events=placeCard(game,dayIdx);
    if (!events) return;
    await UI.throwCard(dayIdx <2?"left" : "right");

    const bonusEvent = events.find(e =>e.type ==="placed" && e.bonuses.length >0);
    if (bonusEvent){
        const b=bonusEvent.bonuses[0];
        UI.toast(`${b.label} ${b.value>=0?"+":""}${b.value}`, b.penalty ? "bad":"bonus");
    }

    const stressJump = game.stress - prevStress>=15;
    UI.renderStress(game, {shake:stressJump});
    UI.renderScore(game);

    if(game.over) return finishRound();
    drawNext(game);
    if (!game.activeCard) return finishRound();
    UI.renderActiveCard(game);
    UI.renderDays(game,handlePlace);
}

async function handleDiscard(){
    if (!game.activeCard) return;
    await UI.throwCard("left");
    discardActive(game);
    UI.renderStress(game,{shake:true});
    UI.renderScore(game);
    if (game.over) return finishRound();
    drawNext(game);
    if (!game.activeCard) return finishRound();
    UI.renderActiveCard(game);
    UI.renderDays(game,handlePlace);
}


async function handleChoice(accepted){
    const prev=game.stress;
    resolveChoice(game,accepted);
    await UI.throwCard(accepted ? "right":"left");
    const jump = game.stress-prev>=15;
    UI.renderStress(game,{shake:jump});
    UI.renderScore(game);
    UI.toast(accepted ? "Chaos accepted." : "Chaos declined.", accepted ? "bad" : "bonus");
    if (game.over) return finishRound();
    drawNext(game);
    if (!game.activeCard) return finishRound();
    UI.renderActiveCard(game);
    UI.renderDays(game,handlePlace);
}

function finishRound(){
    if (game.won){
        progress.unlocked = Math.max(progress.unlocked, game.regionId+2);
        progress.best[game.regionId] = Math.max(progress.best[game.regionId]||0, game.score);
    }
    const earned = Math.max(0, Math.floor(game.score));
    game.milesEarned=earned;
    progress.miles = (progress.miles ||0)+earned;
    saveProgress(progress);
    UI.renderReceipt(game, progress, (nextId)=>startGame(nextId), (retryId)=>startGame(retryId));

}

function openMenu() {
    UI.renderMenu(progress, startGame, openShop, (rid)=>{
        const res = purchaseRegion(progress, rid);
        if (res.ok) UI.toast(`Region unlocked! ✈ -${res.cost}`, "bonus");
        else if (res.reason === "poor") UI.toast("Not enough Sky Miles.", "bad");
        openMenu();
    });
}

function openShop(){
    UI.renderShop(progress,
        (id) => {
        const res = purchaseTheme(progress, id);
        if (res.ok) {UI.toast(`Unlocked ${res.theme.name}!`,"bonus");
        setActiveTheme(progress,id); UI.applyTheme(id);
        }
        else if(res.reason ==="poor") UI.toast("Not enough Sky Miles.", "bad");
        openShop();
        },
        (id) => {
            setActiveTheme(progress, id);
            UI.applyTheme(id);
            openShop();
        },
        () => openMenu(),
        );
}


UI.applyTheme(progress.activeTheme);
