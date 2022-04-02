"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const main = class main {
    constructor() {
        this.iidxVer = 29;
        this.orig12 = [];
        this.orig11 = [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getOrigDef();
            console.log(this.orig11, this.orig12);
            yield this.getWR();
        });
    }
    getWR() {
        return __awaiter(this, void 0, void 0, function* () {
            //0(1st & substream) =< series_id =< 28(CastHour)
            for (let currentVer = 0; currentVer <= 28; ++currentVer) {
                this.iidxVer = currentVer;
                yield this.getWRs();
            }
            console.log(this.orig12, this.orig11);
            this.download(this.orig12, "sp12");
            this.download(this.orig11, "sp11");
        });
    }
    getOrigDef() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`https://proxy.poyashi.me/?type=bpi`);
            if (!r.ok)
                return;
            return (_a = (yield r.json()).body) === null || _a === void 0 ? void 0 : _a.map((item) => {
                if (Number(item.difficultyLevel) === 12 && item.dpLevel === "0") {
                    this.orig12.push(item);
                }
                else if (Number(item.difficultyLevel) === 11 && item.dpLevel === "0") {
                    this.orig11.push(item);
                }
            });
        });
    }
    download(body, name) {
        const res = JSON.stringify(body);
        const blob = new Blob([res], { "type": "text/plain" });
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = name + ".json";
        link.click();
    }
    getWRs() {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`https://p.eagate.573.jp/game/2dx/29/ranking/json/topranker.html?series_id=${this.iidxVer}`);
            if (!r.ok)
                return;
            const arrayBuffer = yield r.arrayBuffer();
            const text = new TextDecoder('shift-jis').decode(arrayBuffer);
            JSON.parse(text).list.map((item) => {
                const check = (body) => {
                    const target = body.filter((orig) => orig.title === item.music);
                    //楽曲名一致
                    if (target.length > 0) {
                        for (let i = 0; i < target.length; ++i) {
                            const targetIdx = body.findIndex((_idx) => _idx.title === target[i].title && _idx.difficulty === target[i].difficulty);
                            if (Number(target[i].difficulty) === 3) { //hyper
                                if (Number(item.score_2) > Number(body[targetIdx].wr)) {
                                    console.log("UPDATED HYPER:", item, body[targetIdx], "OLD:", body[targetIdx].wr, "NEW:", item.score_2);
                                    body[targetIdx].wr = item.score_2;
                                }
                            }
                            if (Number(target[i].difficulty) === 4) { //another
                                if (Number(item.score_3) > Number(body[targetIdx].wr)) {
                                    console.log("UPDATED ANOTHER:", item, body[targetIdx], "OLD:", body[targetIdx].wr, "NEW:", item.score_3);
                                    body[targetIdx].wr = item.score_3;
                                }
                            }
                            if (Number(target[i].difficulty) === 10) { //leggendaria
                                if (Number(item.score_4) > Number(body[targetIdx].wr)) {
                                    console.log("UPDATED LEGGENDARIA:", item, body[targetIdx], "OLD:", body[targetIdx].wr, "NEW:", item.score_4);
                                    body[targetIdx].wr = item.score_4;
                                }
                            }
                        }
                    }
                };
                check(this.orig12);
                check(this.orig11);
            });
        });
    }
};
new main().init();
