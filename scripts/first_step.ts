import pw from "playwright";
import { actionsBetween } from "../helpers";

import { pages } from "../models";
import { campaignType } from "../config/config";
import { baseIdValues } from "..";
import { jsClick } from "../modules/utils";

type firstStepArgs = [pages: pages, idValues:baseIdValues, campaign:campaignType, ctx:pw.BrowserContext]
export async function firstStep(...[pages, idValues, campaign, ctx]: firstStepArgs){
  const {campaignId, groupId, bannerId}= idValues;
  const campaignData = campaign.firstStep

  pages.editGroup.setFormatUrlObject({campaignId, groupId})
  await pages.editGroup.navigate()
  await actionsBetween({page: pages.editGroup.page})

  await pages.campaigns.banner.select(bannerId)
  await actionsBetween({page: pages.campaigns.page})

  pages.campaigns.banner.stop()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})

  pages.campaigns.banner.archive()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})

  await pages.editGroup.updateKeywords(campaignData.keys)
  await actionsBetween({page: pages.campaigns.page})

  await unarchive(ctx, campaign, idValues)

  pages.campaign.setFormatUrlObject({campaignId})
  await pages.campaign.navigate();
  await actionsBetween({page: pages.campaigns.page})
  pages.campaigns.banner.archive()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})
  await pages.campaign.replaceKeys(campaignData.replaceKeys)
  await actionsBetween({ms:"withoutReload", page: pages.campaign.page})
  await unarchive(ctx, campaign, idValues)

  pages.editBanner.setFormatUrlObject(idValues)
  await pages.editBanner.navigate()
  await actionsBetween({page: pages.editBanner.page})
  
  pages.campaigns.banner.start()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})
}

async function unarchive(ctx: pw.BrowserContext, campaign:campaignType, idValues: baseIdValues){
  const shCampPage = await ctx.newPage();
  await shCampPage.goto(`https://direct.yandex.ru/registered/main.pl?cid=${campaign.id}&cmd=showCamp&tab=all`)
  await actionsBetween({page: shCampPage})
  const group = shCampPage.locator(`.b-campaign-group__panel:has(.b-campaign-group__group-number:has-text("${idValues.groupId}"))`)
  await jsClick(group.locator('.b-campaign-group__group-toggle button'))
  await actionsBetween({ms: "withoutReload", page: shCampPage})
  await jsClick(shCampPage.locator('.popup__body .b-group-preview2__controls-row button:has-text("Разархивировать")'))
  await actionsBetween({ms: "withoutReload", page: shCampPage})
  await jsClick(shCampPage.locator('.popup .popup__content button:has-text("Да")'))
  await actionsBetween({ms: "withoutReload", page: shCampPage})
  shCampPage.close();
}