import { selectors } from "playwright";
import { campaignType } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick } from "../modules/utils";
import { Page } from "./page";
import { refill } from "../modules/utils";

export class EditBannerPage extends Page{
  campaignId:string|undefined
  bannerId: string|undefined
  protected _url: string = 'https://direct.yandex.ru/dna/banners-edit?campaigns-ids={campaignId}&banners-ids={bannerId}';

  async changeData(campaign:campaignType){
    const url = (campaign.url == '-') ? '' : campaign.url
    if (campaign.url.length>0) await refill(this.page.locator('.banner-link-form__link-container input'), url)
    if (campaign.title.length>0) await refill(this.page.locator('.banners-base-info-editor__main-title-field input'), campaign.title)
    if (campaign.description.length>0) await refill(this.page.locator('.banners-base-info-editor__description-field textarea'), campaign.description)
    if (campaign.company.name.length > 0){
      await jsClick(this.page.locator('.edit-block-header__title:has-text("Организация")'));
      await jsClick(this.page.locator('.organizations-editor__expanded-content button:has-text("Заменить организацию")'))

      const orgsPopup = this.page.locator('.organizations-editor-modal__iframe-container').frameLocator('iframe').locator('.DirectOrgs')
      await orgsPopup.locator('form.DirectOrgs-SearchControls input.Textinput-Control').fill([campaign.company.name, campaign.company.address].join(' '))
      await jsClick(orgsPopup.locator('button[type=submit]:has-text("Найти")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
      
      await jsClick(orgsPopup.locator('.DirectOrgs-Company').first())
      await jsClick(orgsPopup.locator('button:has-text("Подтвердить выбор")'))
    } 
    await jsClick(this.page.locator('.banners-screen__footer button:has-text("Сохранить")'));
  }
}