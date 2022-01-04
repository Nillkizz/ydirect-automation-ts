import pw from "playwright";
import { Config } from "./config/config";
import { checkForCaptcha, sleep } from "./modules/utils";

export async function newPage(ctx:pw.BrowserContext, page: pw.Page){
  return page || await ctx.newPage()
}

export async function actionsBetween({ms, page}: {ms?: undefined | keyof Config['time'], page: pw.Page}){
  let msVal = (typeof ms == 'string') ? new Config().time[ms] : ms ? ms : new Config().time['general'];
  const time = new Date().toLocaleTimeString()
  console.log(`${time} -> Sleep for ${msVal/1000}s on ${await page.title() || 'about:blank'}`)
  await sleep(msVal)

  await checkForCaptcha(page)

  if (typeof ms == 'string' && ms == "general"){
    if (await page.locator('#nojquery').isVisible()) {
      await page.reload()
      await actionsBetween({page})
    }
  }
}