import pw from "playwright";

interface IPage{
  page: pw.Page
  url: string
  navigate: ()=>Promise<void>
}


export class Page implements IPage{
  page: pw.Page;
  protected _urlFormatValues: Record<string, string>  // Values for replace interpolations in url.
  protected _url: string = '';  // Just interpolate values with {key}.

  constructor(page: pw.Page){
    this.page = page;
    this._urlFormatValues = {};
  }

  async navigate(): Promise<void>{
    await this.page.goto(this.url);
  }

  get url(){
    const regexFormatKeys = /\{[\w\d]*\}/g;

    const formatKeys = this._url.match(regexFormatKeys);
    if (formatKeys == undefined) return this._url;

    const formatValues = Object.fromEntries(formatKeys
      .map(k=>k.slice(1,-1))
      .map(k=>[k, this._urlFormatValues[k]]));

    return this._url.format(formatValues);
  }

  setFormatUrlObject(obj: Record<string, string>, assign:boolean=false){
    if (assign) Object.assign(this._urlFormatValues, obj);
    else this._urlFormatValues = obj;
  }

  async reset(){
    await this.page.goto("about:blank");
  }
  
}