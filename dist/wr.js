var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class WRGetter {
    constructor() {
    }
    createURLSearchParams(data) {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => params.append(key, data[key]));
        return params;
    }
    getCurrentDefFile() {
        return fetch("https://proxy.poyashi.me/?type=bpi");
    }
    getWR(version) {
        return fetch("https://p.eagate.573.jp/game/2dx/27/ranking/json/topranker.html", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: this.createURLSearchParams({
                pref_id: "0",
                play_style: "0",
                page: "0",
                limit: "5000",
                series_id: version
            })
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("b");
            this.def = (yield (yield this.getCurrentDefFile()).json()).body;
            console.log(yield (yield this.getWR("25")).json());
        });
    }
}
