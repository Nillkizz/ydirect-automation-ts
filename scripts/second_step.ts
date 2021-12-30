import pw from 'playwright';
import { baseIdValues } from "..";
import { campaignType } from "../config/config";
import { actionsBetween } from '../helpers';
import { EditBannerPage } from '../models/edit_banner-page';

type secondStepArgs = [page: pw.Page, idValues:baseIdValues, campaign:campaignType]
export async function secondStep(...[page, idValues, campaign]: secondStepArgs){
  const ebpage = new EditBannerPage(page)
  ebpage.setFormatUrlObject(idValues);
  await ebpage.navigate()
  await actionsBetween({page: page})
  await ebpage.changeDataSecondStep(campaign)
  await actionsBetween({page: page})
  ebpage.page.close()
}


