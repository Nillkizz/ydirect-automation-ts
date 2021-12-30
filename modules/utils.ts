import pw from "playwright"


export const sleep = (ms: number): Promise<void> =>new Promise(res=>setTimeout(res, ms))

export async function checkForCaptcha(pageInstance: pw.Page): Promise<boolean>{
  return false
}

export async function jsClick(locator:pw.Locator, all?:boolean) {
  // Browser Click
  function click(el: HTMLElement | SVGElement){
    if (!(el instanceof HTMLElement)) throw Error('Element of locator - must be instance of HTMLElement');
    el.click()
  }
  if (!(await locator.isVisible())) await locator.waitFor();

  if (all) await locator.evaluateAll((els)=>els.forEach(click));
  else await locator.evaluate(click);
}


export const refill = async (el:pw.Locator, text:string)=>{
  await el.press("Control+A");
  await el.press("Backspace");
  await el.fill(text);
}
