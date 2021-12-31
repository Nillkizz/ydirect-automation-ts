import pw from "playwright"
import { exit } from "process";


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


export const refill = async (a:pw.Locator|Array<[string, string]>, b:string|pw.Locator|pw.Page)=>{
  const _r = async(el:pw.Locator, text:string)=>{
    await el.focus();
    await el.press("Control+Backspace");
    await el.fill(text);
  }

  if (a instanceof Array && typeof b != 'string'){
    for (const [selector, value] of a){
      _r(b.locator(selector), value)
    }
  } else  {
    _r(a as pw.Locator, b as string)
  }
}

export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}