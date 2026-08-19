export type ThemePack={id:string;name:string;icon:string;description:string;scenes:string[];accent:string;nav:string;recommendedAppearance:"light"|"dark";category?:"core"|"immersive";plainBackground?:string;motion?:"rain"|"code"|"stars"|"drift"};
const four=(folder:string)=>[0,1,2,3].map(index=>`/themes/${folder}/scene-${index}.jpg`);
const fourPng=(folder:string)=>[0,1,2,3].map(index=>`/themes/${folder}/scene-${index}.png`);
export const themePacks:ThemePack[]=[
  {id:"classic",name:"Orbit Classic",icon:"○",description:"Cream, navy, and coral",scenes:four("focus"),accent:"#f4774e",nav:"#111b34",recommendedAppearance:"light",category:"core",motion:"drift",plainBackground:"#f7f5ef"},
  {id:"coastal",name:"Coastal Blue",icon:"≈",description:"White, blue, and sea glass",scenes:four("focus"),accent:"#287f91",nav:"#17384a",recommendedAppearance:"light",category:"core",motion:"drift",plainBackground:"#edf6f7"},
  {id:"graphite",name:"Graphite",icon:"◇",description:"Charcoal, silver, and cobalt",scenes:four("focus"),accent:"#7597ff",nav:"#111622",recommendedAppearance:"dark",category:"core",motion:"drift",plainBackground:"#171c25"},
  {id:"focus",name:"Studio Light",icon:"⌁",description:"Clean, quiet, and minimal",scenes:four("focus"),accent:"#a36c35",nav:"#27313d",recommendedAppearance:"light",motion:"drift"},
  {id:"rain",name:"Rainy Library",icon:"☂",description:"Rain-lit reading rooms",scenes:four("rain"),accent:"#4f91a7",nav:"#142932",recommendedAppearance:"light",motion:"rain"},
  {id:"spiderman",name:"Spider-Man",icon:"◉",description:"New York and story rooms",scenes:["/themes/spiderman-daily-bugle.jpg","/themes/spiderman-breakout-room.png","/themes/spiderman-osborn-penthouse.png","/themes/city/scene-0.jpg"],accent:"#d6232f",nav:"#071b34",recommendedAppearance:"dark",motion:"drift"},
  {id:"batman",name:"Batman",icon:"◆",description:"Gotham and the Batcave",scenes:["/themes/batcave.jpg","/themes/batman/scene-1.png","/themes/batman/scene-2.png","/themes/batman/scene-3.png"],accent:"#e0b83f",nav:"#05070a",recommendedAppearance:"dark",motion:"rain"},
  {id:"harrypotter",name:"Harry Potter",icon:"✦",description:"Hogwarts classrooms and towers",scenes:["/themes/hogwarts-great-hall.jpg","/themes/harry-potter/scene-1.png","/themes/harry-potter/scene-2.png","/themes/harry-potter/scene-3.png"],accent:"#c99b4e",nav:"#241812",recommendedAppearance:"dark",motion:"stars"},
  {id:"starwars",name:"Star Wars",icon:"◇",description:"Starships, bases, and hangars",scenes:["/themes/starwars-hangar.jpg","/themes/star-wars/scene-1.png","/themes/star-wars/scene-2.png","/themes/star-wars/scene-3.png"],accent:"#e0b84f",nav:"#0b1119",recommendedAppearance:"dark",motion:"stars"},
  {id:"block",name:"Minecraft",icon:"▦",description:"Block-built biomes and bases",scenes:fourPng("minecraft"),accent:"#68a34f",nav:"#263b2b",recommendedAppearance:"light",motion:"drift"},
  {id:"space",name:"Deep Space",icon:"✦",description:"Futuristic orbital station",scenes:fourPng("deep-space"),accent:"#6fa9e8",nav:"#0a1424",recommendedAppearance:"dark",motion:"stars"},
  {id:"comic",name:"Comic Universe",icon:"◆",description:"Bold heroic energy",scenes:["/themes/spiderman-daily-bugle.jpg","/themes/batcave.jpg",...four("city").slice(0,2)],accent:"#d8463f",nav:"#172647",recommendedAppearance:"light",motion:"drift"},
  {id:"castle",name:"Fantasy Castle",icon:"♜",description:"Warm scholarly magic",scenes:["/themes/hogwarts-great-hall.jpg",...four("focus").slice(1)],accent:"#a8743f",nav:"#30233a",recommendedAppearance:"dark",motion:"stars"},
  {id:"cyber",name:"Cyberpunk",icon:"⌁",description:"Neon and Matrix-inspired rooms",scenes:four("cyberpunk"),accent:"#31d0b2",nav:"#07110d",recommendedAppearance:"dark",motion:"code"},
  {id:"forest",name:"Nature",icon:"♧",description:"Forest, lake, and greenhouse",scenes:four("nature"),accent:"#629b70",nav:"#1d3228",recommendedAppearance:"light",motion:"rain"},
  {id:"city",name:"Cityscape",icon:"▤",description:"Global skyline concentration",scenes:four("city"),accent:"#d9774c",nav:"#202b3a",recommendedAppearance:"light",motion:"drift"},
  {id:"desert",name:"Desert Worlds",icon:"◇",description:"Golden open calm",scenes:four("worlds").slice(2).concat(["/themes/city/scene-0.jpg","/themes/worlds/scene-0.jpg"]),accent:"#c2673f",nav:"#392b28",recommendedAppearance:"light",motion:"stars"}
];
export const getThemePack=(id:string)=>themePacks.find(pack=>pack.id===id)||themePacks[0];
export function getThemeScene(id:string,variant:number,breakout=false){const pack=getThemePack(id);const offset=breakout&&pack.scenes.length>1?1:0;return pack.scenes[(variant+offset)%pack.scenes.length]}
