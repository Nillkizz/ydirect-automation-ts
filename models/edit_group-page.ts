import { jsClick } from "../modules/utils";
import { Page } from "./page";

export class EditGroupPage extends Page{
  campaignId:string|undefined
  groupId: string|undefined
  protected _url: string = 'https://direct.yandex.ru/dna/groups-edit?campaigns-ids={campaignId}&groups-ids={groupId}';

  async getMainBannerId(){
    const rawIdString = await this.page.locator('.grid-banner-text-adv-cell__info').innerText()
    const matched = rawIdString.match(/\d*/);
    if (matched == null) throw Error('Campaign ' + this.campaignId + ' Has no banners!')
    return matched[0]
  }

  async updateKeywords(keywords:string[]){
    await jsClick(this.page.locator('.group-keywords-editor__button button:has-text("Ключевые фразы")'));
    await this.page.fill(".keywords-editor-body__textarea textarea", keywords.join("\n"));
    const saveBtn = this.page.locator('.groups-screen__footer button:has-text("Сохранить")');
    await Promise.all([this.page.waitForNavigation(), jsClick(saveBtn)]);
    await this.reset();
  }
}