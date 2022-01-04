import pw from "playwright";
import { campaignType } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick, sleep } from "../modules/utils";
import { Page } from "./page";
import { refill } from "../modules/utils";

export class EditBannerPage extends Page{
  campaignId:string|undefined
  bannerId: string|undefined
  protected _url: string = 'https://direct.yandex.ru/dna/banners-edit?campaigns-ids={campaignId}&banners-ids={bannerId}';

  async changeDataSecondStep(campaign:campaignType){
    const cData = campaign.secondStep
    this.refillDomainTitleDescription(cData.domain, cData.title, cData.description)
    
    await jsClick(this.page.locator('.expanded-edit-block__header:has-text("Виртуальная визитка")'))
    await actionsBetween({ms:"withoutReload", page:this.page})
    const domain = (cData.domain.trim() == '-') ? '' : cData.domain
    const vcard = this.page.locator('.vcard-editor')
    if (domain.length > 0){
      await jsClick(vcard.locator('.vcard-editor button:has-text("Очистить поля")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
      await jsClick(vcard.locator('.editor-controls button:has-text("Готово")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
    } else {
      await this.refillVCard(cData, vcard);
      await jsClick(vcard.locator('.editor-controls button:has-text("Готово")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
    }
    await sleep(3000)
    await this.save()
  }

  async refillDomainTitleDescription(domain:string,title:string,description:string){
    const data: Array<[string, string]> = [
      ['.banner-link-form__link-container input', domain],
      ['.banners-base-info-editor__main-title-field input', title],
      ['.banners-base-info-editor__description-field textarea', description]
    ]
    await refill(data, this.page, 1) 
  }
  async refillVCard(cData:campaignType['secondStep'], vcard:pw.Locator){
      const data: Array<[string, string]> = [
        ['.vcard-editor__field_name .Textinput input', cData.vbc.name],
        ['.phone-number__field_country .Textinput input', cData.vbc.phone.cc],
        ['.phone-number__field_region .Textinput input', cData.vbc.phone.cr],
        ['.phone-number__field_phone .Textinput input', cData.vbc.phone.p],
        ['.address-input:has(.address-input__title:has-text("Страна")) .Textinput input', cData.vbc.country],
        ['.address-input:has(.address-input__title:has-text("Город")) .Textinput input', cData.vbc.city],
      ]
      await refill(data, vcard, 1)
      await actionsBetween({ms:"withoutReload", page:this.page})
  }

  async save(){
    const btn = this.page.locator('.banners-screen__footer button:has-text("Сохранить")')
    await Promise.all([this.page.waitForNavigation(), jsClick(btn)])
  }
}