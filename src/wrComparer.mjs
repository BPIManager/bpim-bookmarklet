import fs from "fs";
import fetch from "node-fetch";
const fss = fs.promises;

const main = class {
  loadFile = async (path) => {
    try {
      const buff = await fss.readFile(path, "utf-8");
      return await this.splitSongs(buff);
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  def;
  newDef;
  temp;

  loadDef = async () => {
    this.def = {};
    const t = await (
      await fetch(
        "https://raw.githubusercontent.com/BPIManager/BPIM-Scores/598115f6ee50105c1ffa9e9746326f0c8a012851/output/release.json"
      )
    ).json();
    //this.newDef = t.body;
    t.body
      .filter((item) => item.difficultyLevel == "12" && item.dpLevel == "0")
      .map((item) => {
        const suffix = () => {
          return item.difficulty === "3"
            ? "[H]"
            : item.difficulty === "4"
            ? ""
            : "[L]";
        };
        if (!this.temp) this.temp = {};
        this.temp[item.title + suffix()] = item;
        this.def[item.title + suffix()] = item.wr;
      });
    return this;
  };

  async splitSongs(text) {
    const df = {
      '"Anisakis -somatic mutation type ""Forza""[L]"':
        'Anisakis -somatic mutation type"Forza"-',
      "ASIAN VIRTUAL REALITIES(MELTING TOGETHER IN DAZZLING DARKNESS)":
        "ASIAN VIRTUAL REALITIES (MELTING TOGETHER IN DAZZLING DARKNESS)",
      "Colors(radio edit)": "Colors (radio edit)",
      "DEATH†ZIGOQ～怒りの高速爆走野郎～": "DEATH†ZIGOQ ～怒りの高速爆走野郎～",
      "Dr.Chemical & Killing Machine": "Dr. Chemical & Killing Machine",
      "ganymede[L]": "Ganymede[L]",
      "gigadelic[A]": "gigadelic",
      "Innocent Walls[A]": "Innocent Walls",
      '"Life Is A Game ft.DD""ナカタ""Metal"':
        'Life Is A Game ft.DD"ナカタ"Metal',
      "Marie Antoinette": "Marie Antoinette[L]",
      "NEW GENERATION -もう、お前しか見えない-[L]":
        "NEW GENERATION -もう、お前しか見えない-[L]", //定義データにないよ！
      "Rave*it!! Rave*it!!": "Rave*it!! Rave*it!! ",
      "Session 9-Chronicles-": "Session 9 -Chronicles-",
      "thunder HOUSE NATION Remix(L)": "thunder HOUSE NATION Remix[L]",
      "Timepiece phase II(CN Ver.)": "Timepiece phase II (CN Ver.)",
      "We're so Happy(P*Light Remix) IIDX ver.":
        "We're so Happy (P*Light Remix) IIDX ver.",
      "3!dolon forc3": "3!dolon Forc3",
      '"ピアノ協奏曲第１番""蠍火"""': "ピアノ協奏曲第１番”蠍火”",
      '"ワルツ第17番 ト短調""大犬のワルツ"""':
        "ワルツ第17番 ト短調”大犬のワルツ”",
      "恋する☆宇宙戦争っ!!": "恋する☆宇宙戦争っ！！",
      "表裏一体!?怪盗いいんちょの悩み": "表裏一体！？怪盗いいんちょの悩み",
      Ⅸ: "IX",
    };
    return text.split("\n").reduce((group, song) => {
      if (!group) group = [];
      const sm = song.split(",");
      let _new = 0;
      if (sm[2] && sm[2].split("/")) {
        _new = sm[2].split("/")[0];
      }
      let title = sm[1];
      if (!this.def[sm[1]]) {
        title = df[sm[1]];
        if (!df[sm[1]]) {
          console.warn("NOT FOUND", sm[1]);
        }
      }
      group.push({
        title: title,
        new: Number(_new),
        old: Number(this.def[title]),
        updated: _new - this.def[sm[1]] > 0,
        error: !sm[2] || sm[2].indexOf("/") === -1 || !this.def[sm[1]],
      });
      if (!this.newDef) this.newDef = [];
      let newItem = this.temp[title];
      if (newItem) {
        newItem.wr = Number(_new);
      } else {
        //console.log(title)
      }
      this.newDef.push(newItem);
      return group;
    }, []);
  }

  async init() {
    await this.loadDef();
    const wr = await this.loadFile("./test.csv");
    console.log(wr);
    fs.writeFileSync(
      "../result/result_zen1_12.json",
      JSON.stringify(this.newDef)
    );
  }
};

new main().init();
