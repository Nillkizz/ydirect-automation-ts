import { campaignType } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick, refill } from "../modules/utils";
import { Page } from "./page";

export class CampaignPage extends Page {
  protected _url: string = "https://direct.yandex.ru/registered/main.pl?cid={campaignId}&cmd=showCamp&tab=all";

  async replaceKeys(keyWords:campaignType['firstStep']['replaceKeys']){
    for (const [oldKey, newKey] of Object.entries(keyWords)){
      const keyWord = this.page.locator(`.b-phrase__content:has-text("${oldKey}")`)
      if (await keyWord.isVisible()){
        await jsClick(keyWord)
        await actionsBetween({ms:"withoutReload", page: this.page})
        
        const popup = this.page.locator('.b-phrase-popup')
        await refill(popup.locator('textarea.input__control'), newKey)
        await popup.locator('button.b-phrase-popup__ok-button').press('Enter')
        await actionsBetween({ms:"withoutReload", page: this.page})
      }
    }
    await this.save()
  }
  async save(){
    const btn = this.page.locator('.b-campaign-edit-panel__save button');
    jsClick(btn);
  }
}

