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
      .filter((item) => item.difficultyLevel == "11" && item.dpLevel == "0")
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
    const df = {};
    return text.split("\n").reduce((group, song) => {
      if (!group) group = [];
      const sm = song.split(",");
      let _new = 0;
      if (sm[1]) {
        _new = Number(sm[1]);
      }
      let title = sm[0];
      if (!this.def[sm[0]]) {
        title = df[sm[0]];
        if (!df[sm[0]]) {
          console.warn("NOT FOUND", sm[0]);
        }
      }
      group.push({
        title: title,
        new: Number(_new),
        old: Number(this.def[title]),
        updated: _new - this.def[sm[0]] > 0,
        error: !sm[1] || sm[1].indexOf("/") === -1 || !this.def[sm[1]],
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
    const wr = await this.loadFile("./epolis11.csv");
    console.log(wr);
    fs.writeFileSync(
      "../result/result_zen1_11.json",
      JSON.stringify(this.newDef)
    );
  }
};

new main().init();
