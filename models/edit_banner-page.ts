import { campaignType } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick } from "../modules/utils";
import { Page } from "./page";
import { refill } from "../modules/utils";

export class EditBannerPage extends Page{
  campaignId:string|undefined
  bannerId: string|undefined
  protected _url: string = 'https://direct.yandex.ru/dna/banners-edit?campaigns-ids={campaignId}&banners-ids={bannerId}';

  async changeDataSecondStep(campaign:campaignType){
    const cData = campaign.secondStep
    const domain = (cData.domain == '-') ? '' : cData.domain
    this.refillDomainTitleDescription(domain, cData.title, cData.description)

    await jsClick(this.page.locator('.expanded-edit-block__header:has-text("Виртуальная визитка")'))
    await actionsBetween({ms:"withoutReload", page:this.page})
    if (domain.length > 0){
      await jsClick(this.page.locator('.vcard-editor button:has-text("Очистить поля")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
    } else {
      this.refillVCard(cData);
    }
    await this.save()
  }

  async refillDomainTitleDescription(domain:string,title:string,description:string){
    const data: Array<[string, string]> = [
    ['.banner-link-form__link-container input', domain],
    ['.banners-base-info-editor__main-title-field input', title],
    ['.banners-base-info-editor__description-field textarea', description]
    ]
    await refill(data, this.page)
  }
  async refillVCard(cData:campaignType['secondStep']){
      const vcard = this.page.locator('.vcard-editor__content')
      const data: Array<[string, string]> = [
        ['.vcard-editor__field_name:has(.vcard-editor__field-title:has-text("Название организации или ФИО")) .Textinput input', cData.vbc.name],
        ['.phone-number__field_country .Textinput input', cData.vbc.phone.cc],
        ['.phone-number__field_region .Textinput input', cData.vbc.phone.cr],
        ['.phone-number__field_phone .Textinput input', cData.vbc.phone.p]
      ]
      await refill(data, vcard)
  }

  async save(){
    return  await Promise.all([
      this.page.waitForNavigation(),
      jsClick(this.page.locator('.banners-screen__footer button:has-text("Сохранить")'))
    ])
  }
}