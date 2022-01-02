import { campaignType } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick } from "../modules/utils";
import { Page } from "./page";

export class CampaignPage extends Page {
  protected _url: string = "https://direct.yandex.ru/registered/main.pl?cid={campaignId}&cmd=showCamp&tab=all";

  async replaceKeys(keyWords:campaignType['firstStep']['replaceKeys']){
    for (const [oldKey, newKey] of Object.entries(keyWords)){
      const keyWord = this.page.locator(`.b-phrase__content:has-text("${oldKey}")`)
      if (await keyWord.isVisible()){
        await jsClick(keyWord)
        await actionsBetween({ms:"withoutReload", page: this.page})
        console.log(oldKey, newKey);
        
        const popup = this.page.locator('.b-phrase-popup')
        await popup.locator('textarea.input__control').fill(newKey) // Now it works 2021.12.31_09:19:35
        // await refill(popup.locator('textarea.input__control'), newKey) //  Now it not works 2021.12.31_09:19:35
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

