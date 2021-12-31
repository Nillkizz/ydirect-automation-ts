import { actionsBetween } from "../helpers";

import {  pages } from "../models";
import { campaignType } from "../config/config";
import { baseIdValues } from "..";

type firstStepArgs = [pages: pages, idValues:baseIdValues, campaign:campaignType]
export async function firstStep(...[pages, idValues, campaign]: firstStepArgs){
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

  pages.campaigns.banner.unarchive()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})

  pages.campaign.setFormatUrlObject({campaignId})
  await pages.campaign.navigate();
  await actionsBetween({page: pages.campaigns.page})
  await pages.campaign.replaceKeys(campaignData.replaceKeys)
  await actionsBetween({ms:"withoutReload", page: pages.campaign.page})

  pages.editBanner.setFormatUrlObject(idValues)
  await pages.editBanner.navigate()
  await actionsBetween({page: pages.editBanner.page})
  
  pages.campaigns.banner.start()
  await actionsBetween({ms: "withoutReload", page: pages.campaigns.page})
}