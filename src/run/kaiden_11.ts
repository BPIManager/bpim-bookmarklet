import { Crawler } from "../px";

const main = async () => {
  const init = new Crawler();
  await init.run("kaiden", 10);
  console.log("COMPLETED");
};

main();
