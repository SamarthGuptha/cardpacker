import {MAXDAYS, SLOTSPERDAY, THEMES, REGIONCOSTS,isRegionUnlocked} from "./gameEngine.js";

const $ = (id) => document.getElementById(id);

export function applyTheme(themeId){document.body.setAttribute("data-theme", themeId||"default");}

export function showScreen(name){
    ["menu","game","receipt", "shop"].forEach(n => {
       $(`screen-${n}`).classList.toggle("hidden",n!==name);
    });
}

export function renderRegionPill(region){$("region-pill").textContent = region.name; }
export function renderStress(game, opts={}){
    const pct = Math.min(100, (game.stress/game.region.stressThreshold)*100);
    $("stress-value").textContent=`${Math.round(game.stress)}% / ${game.region.stressThreshold}%`;
    $("stress-fill").style.width = pct+"%";
    if (opts.shake) {
        const bar = $("stress-bar");
        bar.classList.remove("shake"); void bar.offsetWidth;
        bar.classList.add("shake");
        const fill = $("stress-fill");
        fill.classList.add("flash");
        setTimeout(()=> fill.classList.remove("flash"), 120);
    }
}

export function renderScore(game){
    $("score-value").textContent=game.score;
    const placed = game.days.reduce
}