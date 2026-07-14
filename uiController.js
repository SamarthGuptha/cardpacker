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
    const placed = game.days.reduce((n,d)=>n+d.cards.length, 0);
    $("cards-placed").textContent = `${placed}/${MAXDAYS*SLOTSPERDAY} placements`;
    $("deck-count").textContent = `${game.deck.length} cards left`;
}

export function renderDays(game, onPlace){
    const row = $("days-row");
    row.innerHTML = "";
    game.days.forEach((day, i) => {
        const btn = document.createElement("button");
        btn.className = "day-btn";
        if (day.cards.length >= SLOTSPERDAY) btn.classList.add("full");
        if (day.locked) btn.classList.add("locked");
        const active = game.activeCard;
        if (active && active.type === "activity" && !day.locked && day.cards.length<SLOTSPERDAY){
            const last=day.cards[day.cards.length-1] ||(i>0?game.days[i-1].cards.slice(-1)[0]:null);
            if (last && (last.country === active.country || last.cat === active.cat))btn.classList.add("streak");
        }
        const cats = day.cards.map(c=> shortCat(c.cat)).join(".") || "empty";
        btn.innerHTML = `
        <span class="day-num">D${i+1}</span>
        <span class="day-slots">${day.locked ? "LOCKED" : cats}</span>
            
        `;
        btn.disabled = day.locked || day.cards.length >=SLOTSPERDAY || !active || active.type ==="choice";
        btn.addEventListener("click",() => onPlace(i));
        row.appendChild(btn);
    });
}

function shortCat(c){
    return{
        Food:"🍜",
        Culture:"🏛️",
        Adventure: "🥾",
        Relaxation: "🧘",
        Chaos:"⚡"
    }[c] || ".";
}

export function renderActiveCard(game){
    const card=game.activeCard;
    const el = $("active-card");
    const choice = $("choice-panel");
    if (!card) {el.style.visibility = "hidden";
    choice.classList.add("hidden");
    return;}
    el.style.visibility = "visible";
    el.className = "card cat-" + card.cat;
    $("card-cat").textContent = card.cat.toUpperCase();
    $("card-loc").textContent = card.loc;
    $("card-title").textContent = card.title;
    $("card-art").textContent = card.art;
    $("card-pts").textContent = (card.pts>=0?"+":"")+card.pts;
    $("card-str").textContent = (card.stress>=0?"+":"")+card.stress+"%";
    $("card-note").textContent=card.note;

    if (card.type ==="choice"){
        choice.classList.remove("hidden");
        $("choice-text").textContent = card.prompt;
    } else {
        choice.classList.add("hidden");
    }

    el.classList.remove("drawing");
    void el.offsetWidth;
    el.classList.add("drawing");
}

export function throwCard(direction="left"){
    return new Promise(res => {
        const el = $("active-card");
        el.classList.add(direction ==="left" ? "throw-left" : "throw-right");
        setTimeout(() => {el.classList.remove("throw-left", "throw-right"); res();}, 380);
    });
}

export function toast(msg, kind = ""){
    const t=$("toast");
    t.textContent = msg;
    t.className = "toast" + kind;
    clearTimeout(toast._t);
    toast._t=setTimeout(()=>t.classList.add("hidden"), 1800);
}

export function renderReceipt(game, progress,onNext, onRetry){
    showScreen("receipt");
    $("receipt-region").textContent=game.region.name;
    $("receipt-title").textContent = game.won?"TRIP RECEIPT" : "MELTDOWN RECEIPT";
    const lines = $("receipt-lines");
    lines.innerHTML="";
    game.scoreLog.forEach(l=>{
        const li=document.createElement("li");
        li.innerHTML = `<span>${l.title}</span><span>${l.pts>=0?"+":""}${l.pts}pts</span>`;
        lines.appendChild(li);
        l.bonuses?.forEach(b => {
           const bli=document.createElement("li");
           bli.className = b.penalty?"penalty":"bonus";
           bli.innerHTML = `<span>↳${b.label}</span><span>${b.value >= 0 ? "+":""}${b.value}</span>`;
           lines.appendChild(bli);
        });
    });
    (game.finalBonuses || []).forEach(b=> {
       const li=document.createElement("li");
       li.className = "bonus";
       li.innerHTML=`<span>★${b.label}</span><span>+${b.value}</span>`;
       lines.appendChild(li);
    });
    $("receipt-total").textContent=game.score;
    const verdict=$("receipt-verdict");
    if (game.won){
        verdict.textContent =game.score>120?"LEGENDARY TRIP!":"GLORIOUS TRIP!";
        verdict.classList.remove("lose");
    }else {
        verdict.textContent = "TOTAL MELTDOWN";
        verdict.classList.add("lose");
    }

    const next=$("btn-next");
    const canAdvance = game.won && game.regionId<2;
    next.style.display = canAdvance?"":"none";
    next.onClick = () => onNext(game.regionId+1);
    $("btn-retry").onclick = ()=> onRetry(game.regionId);
    $("receipt-miles").textContent=game.milesEarned ?? game.score;

}


export function renderMenu(progress, onStart, onOpenShop, onBuyRegion){
    showScreen("menu");
    applyTheme(progress.activeTheme);
    $("menu-miles").textContent= progress.miles;
    document.querySelectorAll(".region-btn").forEach(btn =>{
        const rid=Number(btn.dataset.region);
        const unlocked = isRegionUnlocked(progress,rid);
        const cost = REGIONCOSTS[rid]??0;
        btn.disabled = false;
        btn.classList.toggle("locked", !unlocked);
        const lockEl = btn.querySelector(".lock");
        if(lockEl){
            if (unlocked){
                lockEl.textContent = "✓";
                lockEl.className="lock unlocked";
            } else {
                const affordable = progress.miles>=cost;
                lockEl.className = "lock buy"+(affordable?" affordable": "");
                lockEl.textContent = `✈ ${cost}`;
            }
        }
        const oldBuy = btn.querySelector(".region-buy");
        if (oldBuy) oldBuy.remove();
        if (!unlocked && onBuyRegion){
            const buy=document.createElement("span");
            buy.className = "region-buy"+(progress.miles>=cost?"":" poor");
            buy.textContent = progress.miles>=cost?`BUY ✈ ${cost}`:`NEED ✈ ${cost}`;
            buy.onclick = (e) => {
                e.stopPropagation();
                if (progress.miles>=cost) onBuyRegion(rid);
            };
            btn.appendChild(buy);
        }
    })
}
