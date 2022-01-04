import config from './config.json';

export type campaignType = {
  id: string
  firstStep: {
    keys: string[]
    replaceKeys: Record<string, string> | {}
  }
  secondStep:{
    domain: string,
    title: string,
    description: string,
    vbc: {
      name: string,
      phone:{cc: string, cr:string, p:string},
      country: string,
      city: string
    }
    keys: string[]
  }
}

export type profileType = {
  name: string
  campaigns: campaignType[]
}

export interface IConfig {
  time: {
    general: number
    moderateBg: number
    withoutReload: number
    moderationTimeout: number,
    stage2: number
  }
  profiles: profileType[]
}



export class Config implements IConfig {
  time: { general: number; moderateBg: number; withoutReload: number; moderationTimeout: number; stage2: number; };
  profiles: profileType[]

  constructor() {
    this.time = config.time
    this.profiles = config.profiles
    this.init();
  }

  private init(): void {
    this.time = new Proxy(this.time, {
      get: (t: IConfig['time'], p: keyof typeof t): number => t[p] * 1000
    })
  }
}
