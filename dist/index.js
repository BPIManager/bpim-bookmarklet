"use strict";
//import cheerio from 'cheerio';
const iidx_ver = "29";
class Main {
    constructor() {
        this.mode = 0;
        this.getter = new Getter();
        this.scraper = new Scraper();
        this.result = [];
        this.wait = (msec) => new Promise((resolve, _reject) => setTimeout(resolve, msec));
    }
    async exec() {
        if (document.domain.indexOf("eagate.573.jp") === -1) {
            return alert("対応外のページです。");
        }
        console.log("v0.0.1");
        const dani = await this.getter.getKaidenList();
        this.getter.setDiff(10); // 10:☆11、11:☆12
        const list = dani.list;
        let songsList = {};
        for (let i = 0; i < list.length; ++i) {
            this.getter.setRivalId(list[i]["rival"]);
            console.log(i + " of " + list.length, list[i]["rival"]);
            for (let j = 0; j < 13; ++j) {
                this.getter.setOffset(j);
                //await this.wait(200);
                const body = await this.getter.get();
                const b = this.scraper.setRawBody(body).exec();
                if (j === 0 && Object.keys(b).length === 0) {
                    console.log("NO LENGTH", j, b, list[i]["id"]);
                    break;
                } //非公開ユーザー
                Object.keys(b).map((item) => {
                    if (!songsList[item]) {
                        songsList[item] = b[item];
                    }
                    else {
                        songsList[item] = b[item];
                    }
                });
            }
            const res = JSON.stringify(songsList);
            const blob = new Blob([res], { type: "text/plain" });
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = list[i]["id"] + ".json";
            link.click();
            songsList = {};
        }
    }
    showResult() {
        document.body.innerHTML = JSON.stringify(this.result);
    }
}
class Getter {
    constructor() {
        this.diff = 10;
        this.offset = 0;
        this.rivalId = "";
    }
    setDiff(val) {
        this.diff = val;
    }
    setOffset(val) {
        this.offset = val * 50;
    }
    setRivalId(val) {
        this.rivalId = val;
    }
    parseBlob(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsText(blob);
        });
    }
    async get() {
        try {
            const res = await fetch(`https://p.eagate.573.jp/game/2dx/${iidx_ver}/djdata/music/difficulty_rival.html?rival=${this.rivalId}&difficult=${this.diff}&style=0&disp=1&offset=${this.offset}`, {
                method: "GET",
                credentials: "same-origin",
            });
            if (!res.ok || res.status !== 200) {
                throw new Error(`statuscode:${res.status}`);
            }
            const text = await this.parseBlob(await res.blob());
            return text;
        }
        catch (e) {
            console.log(e);
            alert("error!");
        }
    }
    async getKaidenList() {
        try {
            const obj = {
                grade_id: "18",
                play_style: "0",
                page: "0",
                limit: "10000",
                release_9_10_kaiden: "2",
            };
            let res = await fetch(`https://p.eagate.573.jp/game/2dx/${iidx_ver}/ranking/json/dani.html?grade_id=${obj["grade_id"]}&play_style=${obj["play_style"]}&page=${obj["page"]}&limit=${obj["limit"]}`, {
                method: "POST",
                credentials: "same-origin",
            });
            if (!res.ok || res.status !== 200) {
                throw new Error(`statuscode:${res.status}`);
            }
            const json = JSON.parse(await this.parseBlob(await res.blob()));
            return json;
        }
        catch (e) {
            console.log(e);
        }
    }
    async getArenaList() {
        try {
            const obj = {
                grade_id: "0",
                play_style: "0",
                page: "0",
                limit: "5000",
            };
            let res = await fetch(`https://p.eagate.573.jp/game/2dx/${iidx_ver}/ranking/json/arena_class.html?grade_id=${obj["grade_id"]}&play_style=${obj["play_style"]}&page=${obj["page"]}&limit=${obj["limit"]}`, {
                method: "POST",
                credentials: "same-origin",
            });
            if (!res.ok || res.status !== 200) {
                throw new Error(`statuscode:${res.status}`);
            }
            const json = JSON.parse(await this.parseBlob(await res.blob()));
            return json;
        }
        catch (e) {
            console.log(e);
        }
    }
}
class Scraper {
    constructor() {
        this.rawBody = "";
    }
    setRawBody(input) {
        this.rawBody = input;
        return this;
    }
    exec() {
        this.getTable();
        return this.getEachSongs();
    }
    getTable() {
        const matcher = this.rawBody.match(/<div class="series-difficulty">.*?<div id="page-top">/);
        if (matcher) {
            this.setRawBody(!matcher || matcher.length === 0 ? "" : matcher[0]);
        }
        return this;
    }
    getEachSongs() {
        if (!this.rawBody) {
            console.log("NO RAWBODY");
            return {};
        }
        let res = {};
        const matcher = this.rawBody.match(/<tr>.*?<\/tr>/g);
        if (!matcher) {
            return {};
        }
        for (let key in matcher) {
            const eachSong = matcher[key];
            const _matcher = eachSong.match(/(?<=<td>).*?(?=<\/td>)/g);
            if (_matcher) {
                const songName = _matcher[0].match(/(?<=\"music_win\">).*?(?=<\/a>)/);
                let difficulty = eachSong.match(/<\/a><\/td>.*?<\/td>/);
                if (!difficulty) {
                    continue;
                }
                const suffix = difficulty[0].indexOf("ANOTHER") > -1
                    ? "[A]"
                    : difficulty[0].indexOf("HYPER") > -1
                        ? "[H]"
                        : "[L]";
                if (songName) {
                    const score = _matcher[3].split(/<br>/);
                    if (score && score[0] !== "0") {
                        res[songName[0] + suffix] = Number(score[0]);
                    }
                }
            }
        }
        return res;
    }
}
const init = new Main();
init.exec();
