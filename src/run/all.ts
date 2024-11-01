import { Crawler } from "../px";

const main = async () => {
  const init = new Crawler();
  await Promise.all([
    init.run("kaiden", 10),
    init.run("kaiden", 11),
    init.run("arena", 10),
    init.run("arena", 11),
  ]);
  console.log("COMPLETED");
};

main();
