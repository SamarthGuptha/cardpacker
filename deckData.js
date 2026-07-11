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
            c("Alpine Hike", "Adventure", "Interlaken, CH", 13,12,"⛰️", "Watch them knees", {needsRest: true, restBonus: 9}),
            c("Ski Run", "Adventure", "Zermatt, CH", 12, 11, "⛷️", "Cold fast.", { needsRest: true, restBonus: 9 }),
            c("Tapas Crawl", "Food", "Barcelona, ES", 9, 5, "🍤", "Small plates, big bill."),
            c("Sagrada Familia", "Culture", "Barcelona, ES", 9, 4, "⛪", "Look up."),
            c("Beach Siesta", "Relaxation", "Ibiza, ES", 6, -5, "🌞", "Reduces stress!"),
            c("Pub Crawl", "Food", "Dublin, IE", 8, 7, "🍺", "Pace yourself."),
            c("Castle Tour", "Culture", "Edinburgh, UK", 8, 4, "🏰", "Rain likely."),
            c("Van Gogh Museum", "Culture", "Amsterdam, NL", 8, 4, "🎨", "Yellow everywhere."),
            choice("Train Strike", "Chaos", "—", 18, 22, "🚆", "SNCF says non.",
                "Accept 18pts w/ +22% stress or Decline & lock a random middle day?",
                { onDecline: { lockRandom: true } }),
            choice("Pickpocketed", "Chaos", "—", 0, 20, "💸", "Rookie mistake.",
                "Accept 20% stress + 10pts sympathy, or Decline & burn 3 cards?",
                { onAcceptBonusPts: 10, onDecline: { burnDeck: 3 } }),
        ]),
    },
    {
        id: 2,
        name: "South American Expedition",
        stressThreshold: 65,
        countryStreakMult: 2.0,
        themeStreakMult:1.2,
        difficultyNote:"Aggressive pacing",
        deck:buildDeck([
          c("Machu Picchu Sunrise", "Adventure","Cusco, PE",16,15, "🗿", "Altitude bites", {needsRest: true, restBonus:14}),
          c("Inca Trail", "Adventure", "Cusco, PE",15,14, "🥾", "4 in 1",{needsRest:true, restBonus: 12}),
          c("Ceviche Feast","Food", "Lima, PE",9,5, "🍋", "Fresh catch."),
            c("Amazon Boat", "Adventure", "Iquitos, PE", 13, 12, "🛶", "Mosquitos plentiful.", { needsRest: true, restBonus: 10 }),
            c("Salt Flats", "Culture", "Uyuni, BO", 12, 8, "🧂", "Mirror world."),
            c("Tango Night", "Culture", "Buenos Aires, AR", 10, 6, "💃", "Learn 4 steps."),
            c("Steak Dinner", "Food", "Buenos Aires, AR", 9, 5, "🥩", "Medium rare."),
            c("Iguazu Falls", "Adventure", "Iguazu, AR", 14, 11, "🌊", "You will get wet.", { needsRest: true, restBonus: 10 }),
            c("Wine Cellar", "Food", "Mendoza, AR", 9, 6, "🍇", "Malbec forever."),
            c("Rainforest Lodge", "Relaxation", "Manaus, BR", 7, -4, "🌳", "Reduces stress!"),
            c("Carnival Parade", "Culture", "Rio, BR", 12, 10, "🎭", "Sensory overload."),
            c("Beach Volleyball", "Relaxation", "Rio, BR", 7, -3, "🏐", "Reduces stress!"),
            c("Patagonia Trek", "Adventure", "El Chalten, AR", 16, 15, "⛰️", "Wind wall.", { needsRest: true, restBonus: 13 }),
            c("Coffee Farm", "Food", "Medellin, CO", 8, 3, "☕", "Perfect roast."),
            choice("Altitude Sickness", "Chaos", "—", 0, 25, "😵", "Head spins.",
                "Accept 25% stress for +15 pts, or Decline & lock Day 1 & 2?",
                { onAcceptBonusPts: 15, onDecline: { lockDays: [0,1] } }),
            choice("Border Delay", "Chaos", "—", 22, 28, "🛃", "Stamp roulette.",
                "Accept 22pt bonus at +28% stress, or Decline & burn 4 cards?",
                { onDecline: { burnDeck: 4 } }),
        ]),
    },
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