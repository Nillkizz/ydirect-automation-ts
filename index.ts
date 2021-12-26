import "./env"

import { Config } from "./config/config";
import { get_context } from "./modules/dolphin_anty/dolphin_anty";

const conf = new Config();

(async () => {
  await get_context(conf.tasks[0])
  console.log('ok');

})()

