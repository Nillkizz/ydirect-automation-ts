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

type refillArgs = [
  a:pw.Locator|Array<[string, string]>, 
  b:string|pw.Locator|pw.Page, 
  mode?:0|1
]
export const refill = async (...[a, b, mode=0]: refillArgs)=>{
  const _r = async(el:pw.Locator, text:string)=>{
    switch (mode){
      case 0:
        await el.focus();
        await el.press("Control+Backspace");
        await el.fill(text);
        break
      case 1:
        const _value = text.trim()
        if (_value.length > 0){
          const value = _value == "-" ? "" : _value
          await el.focus();
          await el.press('Control+A')
          await el.press('Control+Backspace')
          await el.fill(value)
        }
        break
    }
  }

  if (a instanceof Array && typeof b != 'string'){
    for (const [selector, value] of a){
      await _r(b.locator(selector), value)
    }
  } else  {
    await _r(a as pw.Locator, b as string)
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