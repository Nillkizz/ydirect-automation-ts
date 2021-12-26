import config from './config.json';

export type bannerType = {
  id: string
  title: string
  companyName: string
}

export type groupType = {
  id: string
  domain: string
  keys: string[]
  banner: bannerType
}

export type companyType = {
  id: string
  groups: groupType[]
}

export type taskType = {
  profileName: string
  campaigns: companyType[]
}

export interface IConfig {
  rucapcha: {
    apiKey: string
  }
  time: {
    general: number
    moderateBg: number
    stage2: number
  }
  tasks: taskType[]
}



export class Config implements IConfig {
  rucapcha: IConfig['rucapcha'];
  time: { general: number; moderateBg: number; stage2: number }
  tasks: taskType[]

  constructor() {
    this.rucapcha = config.rucapcha
    this.time = config.time
    this.tasks = config.tasks
    this.init();
  }

  private init(): void {
    this.time = new Proxy(this.time, {
      get: (t: IConfig['time'], p: keyof typeof t): number => t[p] * 1000
    })
  }
}
