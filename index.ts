import pw from 'playwright'

import "./env"

import { Config } from "./config/config";
import { get_context } from "./modules/dolphin_anty/dolphin_anty";
import { actionsBetween } from './helpers';
import { addStringFormat } from './modules/string_format';
import { EditGroupPage, CampaignsPage, pages} from "./models";
import { firstStep } from './scripts';
import { Moderation } from './models/moderation';
import { CampaignPage } from './models/campaign-page';
import { EditBannerPage } from './models/edit_banner-page';
import { secondStep } from './scripts/second_step';

const conf:Readonly<Config> = new Config();
addStringFormat();


export type baseIdValues = {campaignId:string, groupId:string, bannerId:string}
type cacheType = {
  contexts: {
    values: Record<string, pw.BrowserContext>
    getOrCreate: (key:string)=>Promise<pw.BrowserContext>
  }
}


(async () => {
  const cache: cacheType = {
      contexts: {
        values: {},
        async getOrCreate(key){
          let context;
          if ((context=this.values[key])==undefined){
            context = await get_context(key); 
            this.values[key] = context;
          }
          return context; 
        }
      } 
    }

  for (const profile of conf.profiles){
    const ctx:pw.BrowserContext = await cache.contexts.getOrCreate(profile.name);
    const pages: pages = {
      moderation : new Moderation(conf.time.moderateBg, ctx.pages()[0], conf, ctx),
      campaigns : new CampaignsPage(await ctx.newPage()),
      campaign : new CampaignPage(await ctx.newPage()),
      editGroup : new EditGroupPage(await ctx.newPage()),
      editBanner : new EditBannerPage(await ctx.newPage()),
    } as const
    pages.moderation.setPages(pages);

    for (const campaign of profile.campaigns){
      const idValues = await getBaseIdValuesOfCampaign(campaign.id, pages)
      await firstStep(pages, idValues, campaign)

      await pages.moderation.сheck(idValues, campaign)
    }
  }
  console.log('Done.')
})()

async function getBaseIdValuesOfCampaign(campaignId:string, pages:pages){
      await pages.campaigns.selectCampaign(campaignId)
      await actionsBetween({page: pages.campaigns.page})

      const groupId = await pages.campaigns.getGroupId()
      await actionsBetween({ms:"withoutReload", page: pages.campaigns.page})
      
      pages.editGroup.setFormatUrlObject({campaignId: campaignId, groupId})
      await pages.editGroup.navigate()
      const bannerId = await pages.editGroup.getMainBannerId()
      await actionsBetween({page: pages.campaigns.page})
  return {campaignId, groupId, bannerId} as baseIdValues
}