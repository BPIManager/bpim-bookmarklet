import { Crawler } from "../px";

const main = async () => {
  const init = new Crawler();
  await init.run("arena", 10);
  console.log("COMPLETED");
};

main();
