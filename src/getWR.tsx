const main = class main {

  private iidxVer = 29;
  private orig12: any[] = [];
  private orig11: any[] = [];

  async init() {
    await this.getOrigDef();
    console.log(this.orig11, this.orig12);
    await this.getWR();
  }

  async getWR() {
    //0(1st & substream) =< series_id =< 28(CastHour)
    for (let currentVer = 0; currentVer <= 28; ++currentVer) {
      this.iidxVer = currentVer;
      await this.getWRs();
    }
    console.log(this.orig12,this.orig11)
    this.download(this.orig12,"sp12");
    this.download(this.orig11,"sp11");
  }

  async getOrigDef() {
    const r = await fetch(`https://proxy.poyashi.me/?type=bpi`);
    if (!r.ok) return;
    return (await r.json()).body ?.map((item: any) => {
      if (Number(item.difficultyLevel) === 12 && item.dpLevel === "0") {
        this.orig12.push(item);
      } else if (Number(item.difficultyLevel) === 11 && item.dpLevel === "0") {
        this.orig11.push(item);
      }
    });
  }

  download(body:any,name:string){
    const res = JSON.stringify(body);
    const blob = new Blob([ res ], { "type" : "text/plain" });
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = name + ".json";
    link.click()
  }

  async getWRs() {
    const r = await fetch(`https://p.eagate.573.jp/game/2dx/29/ranking/json/topranker.html?series_id=${this.iidxVer}`);
    if (!r.ok) return;
    const arrayBuffer = await r.arrayBuffer();
    const text = new TextDecoder('shift-jis').decode(arrayBuffer);
    JSON.parse(text).list.map((item: any) => {
      const check = (body: any) => {
        const target = body.filter((orig: any) => orig.title === item.music);
        //楽曲名一致
        if (target.length > 0) {
          for (let i = 0; i < target.length; ++i) {
            const targetIdx = body.findIndex((_idx:any)=>_idx.title === target[i].title && _idx.difficulty === target[i].difficulty);
            if(Number(target[i].difficulty) === 3){ //hyper
              if(Number(item.score_2) > Number(body[targetIdx].wr)){
                console.log("UPDATED HYPER:",item,body[targetIdx],"OLD:",body[targetIdx].wr,"NEW:",item.score_2);
                body[targetIdx].wr = item.score_2;
              }
            }
            if(Number(target[i].difficulty) === 4){ //another
              if(Number(item.score_3) > Number(body[targetIdx].wr)){
                console.log("UPDATED ANOTHER:",item,body[targetIdx],"OLD:",body[targetIdx].wr,"NEW:",item.score_3);
                body[targetIdx].wr = item.score_3;
              }
            }
            if(Number(target[i].difficulty) === 10){ //leggendaria
              if(Number(item.score_4) > Number(body[targetIdx].wr)){
                console.log("UPDATED LEGGENDARIA:",item,body[targetIdx],"OLD:",body[targetIdx].wr,"NEW:",item.score_4);
                body[targetIdx].wr = item.score_4;
              }
            }
          }
        }
      }
      check(this.orig12);
      check(this.orig11);
    });
  }

}


new main().init();
