import pw from "playwright";
import { Config } from "../config/config";
import { actionsBetween } from "../helpers";
import { jsClick } from "../modules/utils";
import { Page } from "./page";

export class CampaignsPage extends Page {
  protected _url: string = "https://direct.yandex.ru/dna/grid/campaigns";

  async setTab(tabName: string, filters:{status?: string}={}): Promise<void> {
    const tab = this.page.locator(`.tab-menu-link__link:has-text("${tabName}")`);
    await Promise.all([this.page.waitForNavigation(), jsClick(tab)]);

    if (filters.status!=undefined){
      const statusFilterBtn = this.page.locator('.grid-toolbox__status-filter button')
      await jsClick(statusFilterBtn)
      const filterItemBtn = this.page.locator(`.statuses-filter__menu-item:has-text("${filters.status}")`)
      await jsClick(filterItemBtn)
    }
  }

  async selectCampaign(campaignId: string) {
    await this.navigate();
    await actionsBetween({page: this.page})

    await this.setTab('Кампании', {status: 'Все кампании'})
    await actionsBetween({ms:"withoutReload", page: this.page})

    await this._search(campaignId);
    await actionsBetween({ms:"withoutReload", page: this.page})

    const selector = `.fixedDataTableCellGroupLayout_cellGroup:has(.grid-campaign-name-cell__cid:has-text("${campaignId}")) .select-row-cell input[type=checkbox]`;
    const checkbox = this.page.locator(selector);
    await jsClick(checkbox);
  }

  async getGroupId(){
    await this.setTab('Группы', {status: 'Все, кроме архивных'})
    const groupIdLocator = this.page.locator('.grid-group-name-cell__cid').first()
    return (await groupIdLocator.innerText()).replace('№ ', '')
  }

  async _search(qs:string){
    const search = this.page.locator('.grid-toolbox__search input');
    await search.fill(qs);
    await search.press('Enter')
  }

  async _openActionsMenu(){
    const actionsBtn = this.page.locator('.bulk-actions-panel__buttons button:has-text("Действия")')
    await jsClick(actionsBtn);
  }
  
  banner= {
    el: undefined as undefined | pw.Locator,
    select: async(bannerId: string) =>{
      await this.setTab('Объявления', {status: 'Все объявления'})
      await actionsBetween({ms:"withoutReload", page: this.page})

      await this._search(bannerId);
      await actionsBetween({ms:"withoutReload", page: this.page})

      this.banner.el = this.page.locator(`.fixedDataTableCellGroupLayout_cellGroup:has(.grid-banner-simple-cell__id:has-text("${bannerId}"))`);
      await jsClick(this.banner.el.locator(".select-row-cell input[type=checkbox]"));
    },
    start: async ()=>{
      const stopBtn = this.page.locator('.bulk-actions-panel__buttons button:has-text("Возобновить показы")')
      await jsClick(stopBtn);
    },
    stop: async ()=>{
      const stopBtn = this.page.locator('.bulk-actions-panel__buttons button:has-text("Остановить")')
      await jsClick(stopBtn);
    },
    archive: async()=>{
      await this._openActionsMenu();
      const archiveBtn = this.page.locator('.bulk-actions-panel__menu-item >> text="Архивировать"')
      await jsClick(archiveBtn);
    },
    unarchive: async()=>{
      await this._openActionsMenu();
      const unarchiveBtn = this.page.locator('.bulk-actions-panel__menu-item >> text="Разархивировать"')
      await jsClick(unarchiveBtn);
    },
  }
}

