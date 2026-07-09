export const REGIONS =[
    {
        id:0,
        name: "Southeast Asia",
        stressThreshold: 100,
        countryStreakMult: 1.5,
        themeStreakMult: 1.4,
        difficultyNote:"Loose vibes",
        deck: buildDeck([
            c("Ramen Crawl", "Food", "Tokyo, JP",8,5, "🍜", "Slurp responsibly!"),
            c("Street Food Night", "Food","Bangkok, TH", 9,6,"🍢", "Chili count: high."),
            c("Temple Visit", "Culture", "Kyoto, JP", 7, 3, "🏯", "Silence is key."),
            c("Night Market", "Culture", "Taipei, TW", 8, 5, "🏮", "NEONN!!!!"),
            c("Beach Day", "Relaxation", "Bali, ID", 6,-4, "🏖️","Stress go WHEEEEEEEE(reducing if ya didnt know)"),
            c("Spa Retreat","Relaxation","Ubud, ID",5,-6, "💆","Reduces stress :D"),
            c("Jungle Trek","Adventure", "Chiang Mai, TH", 12,10,"🌴","Big pts, big sweat.",{needsRest: true, restBonus: 8}),
            c("Scuba Dive", "Adventure","Palawan, PH", 11, 9, "🤿", "Watch the pressure.", {needsRest: true, restBonus:6}),
            c("Cooking class","Food", "hanoi, VN",7,2,"🥘","Learn a recipe."),
            c("Museum Hop", "Culture", "Singapore, SG", 6, 3, "🖼️", "Air-conditioned bliss."),
            c("Sunset Cruise", "Relaxation", "Halong Bay, VN", 8, -3, "🛥️", "Reduces stress!"),
            c("Motorbike Tour", "Adventure", "Hoi An, VN", 10, 8, "🏍️", "Honk hello.", { needsRest: true, restBonus: 5 }),
            c("Ramen Crawl 2", "Food", "Tokyo, JP", 8, 5, "🍥", "Round two."),
            c("Tea Ceremony", "Culture", "Kyoto, JP", 6, 2, "🍵", "Whisk it."),
            choice("Missed connection","Chaos","-",20,25,"✈️", "Flight got bumped.",
                "Accept a chaotic 20pt overnight (+25% stress) or Decline & lock Day 5?",
                {onDecline: {lockLastDay: true}}
            ),
            choice("Food poisoning", "Chaos", "-", 0,15,"🤢", "You ate what??", "Accept 15% stress hit for +12 pts, or decline & burn 2 cards from deck?",
                {onAcceptBonusPts: 12, onDecline:{burnDeck: 2}}
                )
        ]),
    },
    {
        id:1,
        name:"Western Europe",
        stressThreshold:80,
        countryStreakMult:1.8,
        themeStreakMult:1.3,
        difficultyNote:"Strict country matching",
        deck: buildDeck([
            c("Louvre Visit","Culture","Paris, FR",9,5, "🖼️", "Crowd stress."),
            c("Croissant Run", "Food", "Paris, FR",7,3,"🥐", "Butter dream!!"),
            c("Wine Tasting", "Food", "Bordeaux, FR",10,6,"🍷", "Swirl, sniff."),
            c("Colosseum Tour", "Culture","Rome, IT",10,6,"🏛️","Gladiator Vibes."),
            c("Pasta Night", "Food", "Rome, IT", 8, 4,  "🍝", "Al dente only lol"),
            c("Gondola Ride", "Relaxation","Venice, IT",7,-3, "🚣", " some stress gone."),
            c("Alpine Hike", "Adventure", "Interlaken, CH", 13,12,"⛰️", "Watch them knees", {needsRest: true, restBonus: 9})
        ])
    }
];
function c(title, cat,loc, pts,stress,art,note, extra={}){
    const country= loc.includes(",")?loc.split(",").pop().trim():loc;
    return{type:"activity", title,cat,loc,country, pts,stress,art, note, ...extra};
}

function choice(title,cat,loc,pts,stress, art, note,prompt, opts={}){
return {type:"choice",title,cat,loc,country:"-",pts,stress,art, note,prompt,...opts};
}

function buildDeck(cards){
    const extras= cards.filter(c=>c.type ==="activity").slice(0,6);
    return [...cards,...extras];
}