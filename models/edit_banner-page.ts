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

  async changeDataFirstStep(campaign:campaignType){
    const cData = campaign.firstStep
    const domain = (cData.domain == '-') ? '' : cData.domain
    this.refillDomainTitleDescription(domain, cData.title, cData.description)

    if (cData.company.name.length > 0){
      await jsClick(this.page.locator('.edit-block-header__title:has-text("Организация")'));
      await jsClick(this.page.locator('.organizations-editor__expanded-content button:has-text("Заменить организацию")'))

      const orgsPopup = this.page.locator('.organizations-editor-modal__iframe-container').frameLocator('iframe').locator('.DirectOrgs')
      await orgsPopup.locator('form.DirectOrgs-SearchControls input.Textinput-Control').fill([cData.company.name, cData.company.address].join(' '))
      await jsClick(orgsPopup.locator('button[type=submit]:has-text("Найти")'))
      await actionsBetween({ms:"withoutReload", page:this.page})
      
      await jsClick(orgsPopup.locator('.DirectOrgs-Company').first())
      await jsClick(orgsPopup.locator('button:has-text("Подтвердить выбор")'))
    } 
    await this.save()
  }

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
      const vcard = this.page.locator('.vcard-editor__content')
      refill(vcard.locator('.vcard-editor__field_name:has(.vcard-editor__field-title:has-text("Название организации или ФИО")) .Textinput input'), cData.vbc.name)
      refill(vcard.locator('.phone-number__field_country .Textinput input'), cData.vbc.phone.cc)
      refill(vcard.locator('.phone-number__field_region .Textinput input'), cData.vbc.phone.cr)
      refill(vcard.locator('.phone-number__field_phone .Textinput input'), cData.vbc.phone.p)
    }
    await this.save()
  }

  async refillDomainTitleDescription(domain:string,title:string,description:string){
    if (domain.length>0) await refill(this.page.locator('.banner-link-form__link-container input'), domain)
    if (title.length>0) await refill(this.page.locator('.banners-base-info-editor__main-title-field input'), title)
    if (description.length>0) await refill(this.page.locator('.banners-base-info-editor__description-field textarea'), description)
  }

  async save(){
    return  await Promise.all([
      this.page.waitForNavigation(),
      jsClick(this.page.locator('.banners-screen__footer button:has-text("Сохранить")'))
    ])
  }
}