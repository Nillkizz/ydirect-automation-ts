import pw from 'playwright';
import { baseIdValues } from "..";
import { campaignType } from "../config/config";
import { actionsBetween } from '../helpers';
import { CampaignsPage, EditGroupPage } from '../models';
import { EditBannerPage } from '../models/edit_banner-page';

type secondStepArgs = [page: pw.Page, idValues:baseIdValues, campaign:campaignType]
export async function secondStep(...[page, idValues, campaign]: secondStepArgs){
  const ebpage = new EditBannerPage(page)
  ebpage.setFormatUrlObject(idValues);
  await ebpage.navigate()
  await actionsBetween({page})
  await ebpage.changeDataSecondStep(campaign)
  await actionsBetween({page})
  
  const egpage = new EditGroupPage(page)
  egpage.setFormatUrlObject(idValues)
  await egpage.navigate()
  await actionsBetween({page})
  await egpage.updateKeywords(campaign.secondStep.keys)
  await actionsBetween({page})

  const cpage = new CampaignsPage(page)
  await cpage.selectCampaign(campaign.id)
  await actionsBetween({page})
  await cpage.banner.select(idValues.bannerId)
  await actionsBetween({page})
  await cpage.banner.stop()
  await actionsBetween({page})
  await cpage.banner.archive()
  await actionsBetween({page})

  page.close()
}


