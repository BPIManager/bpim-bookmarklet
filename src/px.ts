import puppeteer from "puppeteer";
import auth from "./config/auth";

const iidx_ver = "31";
const fs = require("fs").promises;
const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export class Crawler {
  private browser?: puppeteer.Browser;
  private mainPage?: puppeteer.Page;
  private scraper = new Scraper();

  async run(
    mode: "arena" | "kaiden" = "arena",
    diff: 10 | 11 = 10
  ): Promise<void> {
    this.browser = await puppeteer.connect({
      browserURL: "http://127.0.0.1:9222",
      defaultViewport: {
        width: 1000,
        height: 1000,
      },
    });

    const _page = await this.browser.newPage();
    //_page.setUserAgent(ua);
    //await this.signIn(_page);
    const dani =
      mode === "arena" ? await this.getArenaList() : await this.getKaidenList();
    const list = dani.list;
    let songsList: { [key: string]: number } = {};
    const s = await this.browser.newPage();
    s.setUserAgent(ua);
    for (let i = 0; i < list.length; ++i) {
      const hour = new Date().getHours();
      const minute = new Date().getMinutes();
      if (
        (hour > 4 && hour < 7) ||
        (hour === 4 && minute > 55) ||
        (hour === 7 && minute < 5)
      ) {
        // 5時~7時の間はメンテナンス中なのでループを中断する
        // 大事を取って4時55分~7時5分まで待機する
        console.log(
          "IIDXサイトがメンテナンス中のため、メンテナンス終了まで待機しています"
        );
        await sleep(1000 * 60); //1分待つ
        --i;
        continue;
      }
      this.setRivalId(list[i]["rival"]);
      console.log(i + " of " + list.length, list[i]["rival"]);
      for (let j = 0; j < 13; ++j) {
        this.setOffset(j);
        const body = await this.getScorePage(s, diff);
        const b = this.scraper.setRawBody(body).exec();
        if (j === 0 && Object.keys(b).length === 0) {
          console.log("NO LENGTH", j, b, list[i]["id"]);
          break;
        } //非公開ユーザー
        Object.keys(b).map((item) => {
          if (!songsList[item]) {
            songsList[item] = b[item];
          } else {
            songsList[item] = b[item];
          }
        });
        if (Object.keys(b).length === 0) {
          break;
        }
      }
      const res = JSON.stringify(songsList);
      const fileName = `../savedata/${mode}/${diff === 10 ? "11" : "12"}/${
        list[i]["id"]
      }.json`;
      await this.saveJson(fileName, res);
      songsList = {};
    }
  }

  async saveJson(fileName: string, body: string) {
    return await fs.writeFile(fileName, body);
  }

  async getScorePage(s: puppeteer.Page, diff: number): Promise<any> {
    try {
      await s.goto(
        `https://p.eagate.573.jp/game/2dx/${iidx_ver}/djdata/music/difficulty_rival.html?rival=${this.rivalId}&difficult=${diff}&style=0&disp=1&offset=${this.offset}`,
        { waitUntil: "domcontentloaded" }
      );
      return await s.content();
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  async waitEvent(page: puppeteer.Page) {
    return new Promise(async (resolve) => {
      await page.exposeFunction("fc", () => {
        resolve("ログインできた");
      });

      await page.evaluate(() => {
        document
          .getElementById("login-form-login-button-id")!
          .addEventListener("click", () => {
            eval("window.fc();");
          });
      });
    });
  }

  async signIn(_page: puppeteer.Page) {
    await _page.goto(
      "https://p.eagate.573.jp/gate/p/login.html?path=http%3A%2F%2Fp.eagate.573.jp%2Fgame%2F2dx%2F31%2Fdjdata%2Fstatus.html",
      {
        waitUntil: "domcontentloaded",
      }
    );
    //await _page.type("#login-select-form-id", auth.id as string);
    //await _page.type("#login-form-password", auth.password as string);
    await this.waitEvent(_page);
    await Promise.all([_page.waitForNavigation({ waitUntil: "networkidle0" })]);
  }

  private offset: number = 0;
  private rivalId: string = "";

  setOffset(val: number) {
    this.offset = val * 50;
  }

  setRivalId(val: string) {
    this.rivalId = val;
  }

  async getKaidenList(): Promise<any> {
    if (!this.browser) return ["!"];
    const s = await this.browser.newPage();
    s.setUserAgent(ua);
    await s.goto("https://p.eagate.573.jp/game/2dx/31/djdata/status.html", {
      waitUntil: "domcontentloaded",
    });

    const res = await s.evaluate(
      async ({ iidx_ver }) => {
        async function parseBlob(blob: any): Promise<string> {
          return new Promise((resolve) => {
            const reader = new window.FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.readAsText(blob, "shift-jis");
          });
        }
        try {
          const obj: { [key: string]: string } = {
            grade_id: "18",
            play_style: "0",
            page: "0",
            limit: "10000",
            release_9_10_kaiden: "2",
          };
          let res = await fetch(
            `https://p.eagate.573.jp/game/2dx/${iidx_ver}/ranking/json/dani.html?grade_id=${obj["grade_id"]}&play_style=${obj["play_style"]}&page=${obj["page"]}&limit=${obj["limit"]}`,
            {
              method: "POST",
              credentials: "same-origin",
            }
          );
          if (!res.ok || res.status !== 200) {
            throw new Error(`statuscode:${res.status}`);
          }
          const json = JSON.parse(await parseBlob(await res.blob()));
          return json;
        } catch (e) {
          console.log(e);
          return [];
        }
      },
      { iidx_ver }
    );
    await s.close();
    return res;
  }

  async getArenaList(): Promise<any> {
    try {
      if (!this.browser) return ["!"];
      console.log("ARENA");
      const s = await this.browser.newPage();
      s.setUserAgent(ua);
      await s.goto(
        "https://p.eagate.573.jp/game/2dx/31/ranking/arena/top_ranking.html",
        {
          waitUntil: "domcontentloaded",
        }
      );

      const res = await s.evaluate(
        async ({ iidx_ver }) => {
          async function parseBlob(blob: any): Promise<string> {
            return new Promise((resolve) => {
              const reader = new window.FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.readAsText(blob, "utf-8");
            });
          }
          const fetchData = async (page: number) => {
            const obj: { [key: string]: string } = {
              grade_id: "0",
              play_style: "0",
              page: String(page),
              limit: "1000",
            };

            let body = Object.keys(obj)
              .map((key) => {
                return (
                  encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
                );
              })
              .join("&");
            console.log("test", body);
            let res = await fetch(
              `https://p.eagate.573.jp/game/2dx/${iidx_ver}/ranking/json/arena_class.html`,
              //?
              {
                method: "POST",
                credentials: "same-origin",
                headers: {
                  "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                },
                body: body,
              }
            );
            if (!res.ok || res.status !== 200) {
              throw new Error(`statuscode:${res.status}`);
            }
            const json = JSON.parse(await parseBlob(await res.blob()));
            console.log(res.status, json);
            return json;
          };
          let res: any[] = [];
          for (let i = 0; i < 5; ++i) {
            const f = await fetchData(i);
            res = res.concat(f.list);
          }
          return { list: res };
        },
        { iidx_ver }
      );
      s.close();
      console.log(res);
      return res;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}

interface songs {
  [key: string]: number;
}

class Scraper {
  private rawBody: string = "";

  setRawBody(input: string) {
    this.rawBody = input;
    return this;
  }

  exec() {
    this.getTable();
    return this.getEachSongs();
  }

  getTable() {
    const matcher = this.rawBody.match(
      /<div class="series-difficulty">.*?<div id="page-top">/
    );
    if (matcher) {
      this.setRawBody(!matcher || matcher.length === 0 ? "" : matcher[0]);
    }
    return this;
  }

  getEachSongs(): songs {
    if (!this.rawBody) {
      console.log("NO RAWBODY");
      return {};
    }
    let res: songs = {};
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
        const suffix =
          difficulty[0].indexOf("ANOTHER") > -1
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
