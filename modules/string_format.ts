declare global {
  interface String {
    format(arg1:string|Record<string, string>, ...args:string[]): string;
  }
}
export function addStringFormat(){
  String.prototype.format = function(arg1, ...args) {
    let a = this;
    const isObject =typeof arg1 == 'object'
    if (isObject){
      const isStrings: boolean = Object.values(arg1).map(v=>(typeof v == 'string')).reduce((a,b) => a&&b)
      if (!isStrings) throw Error('Values of object - must be strings.')
      for (let [k, v] of Object.entries(arg1)) {
        a = a.split("{" + k + "}").join( v);
      }
    } else {
      for (let k in arguments) {
        a = a.split("{" + k + "}").join( arguments[k]);
      }
    }
    return a as string;
  }
}