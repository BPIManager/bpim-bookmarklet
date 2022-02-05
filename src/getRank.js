const p = {};

const rank = ["1","2.2","4.84","10.64","23.39","51.43","113.1","248.72","547.95","1202.78","1771"];
const kaiden = 5290;
let song = {};
Object.keys(p).map((item)=>{
  const songLen = p[item].length;
  p[item] = p[item].sort((a,b)=> b-a)
  let newRank = {};
  let lastRank = -88;
  let lastScore = -1;
  let avg = 0;
  rank.map((r,index)=>{
    let _newRank = Math.ceil(Number(r) * (songLen / kaiden)) - 1;
    if(_newRank < 0){
      _newRank = 0;
    }
    if(index !== 0){
      do{
        _newRank++;
      }while(_newRank <= lastRank || p[item][_newRank] >= lastScore);
    }
    newRank["BPI" + (10-index)*10] = p[item][_newRank];
    lastRank = _newRank;
    lastScore = p[item][_newRank];
  });
  p[item].map(each=>{avg += each});
  newRank["avg"] = Math.round(avg / songLen);
  song[item] = newRank;
})

document.write(JSON.stringify(song));
