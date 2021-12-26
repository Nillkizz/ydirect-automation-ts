import { resolve } from 'path';
import { load } from 'ts-dotenv';

export const env = Object.assign(
  process.env,
  load({
    DOLPHIN_USERNAME: String,
    DOLPHIN_PASSWORD: String,
    RUCAPCHA_API_KEY: String,
  }, {
    path: resolve(__dirname, '../.env'),
    overrideProcessEnv: true
  })
)
