import pw from "playwright";
import { pages } from "./index";
import { Config } from "../config/config";
import { Beats } from "../modules/beats";
import { baseIdValues } from "../index";
import { Queues } from "../modules/queues";
import { jsClick } from "../modules/utils";
import { actionsBetween } from "../helpers";

type campaignToCheck = {ts: number, idValues: baseIdValues}
type toCheck = {main: {interval?: number, items: Record<string, campaignToCheck>}, bg: {interval?: number, items: Record<string, campaignToCheck>}}

export class Moderation extends Beats{
  page: pw.Page;
  pages: pages|undefined;
  toCheck: toCheck = {main: {items:{}}, bg: {items:{}}};
  conf: Readonly<Config>
  queues: Queues
  currentCampaignId: string

  constructor(interval: number, page:pw.Page, conf: Readonly<Config>){
    super(interval);
    page.goto('about:blank')
    this.conf = conf;
    this.page = page;
    this.toCheck.bg.interval = conf.time.moderateBg
    this.queues = new Queues()
    this.currentCampaignId = ''

    for (const [beatName, beat] of Object.entries(this.toCheck)){
      this.registerBeat(beatName, beat.interval || interval);
      this.addTask(beatName, {name: 'check', cb: ()=>this._check(beatName as keyof toCheck)})
      this.runBeat(beatName);
    }
  }
  setPages(pages:pages){
    this.pages = pages;
  }

  getSortedItems(beatName: keyof toCheck){
    const items = Object.values(this.toCheck[beatName].items)
    return items.sort((a:campaignToCheck,b:campaignToCheck)=>{
      return parseInt(a.idValues.campaignId) - parseInt(b.idValues.campaignId)
    })
  }

  async _check(beatName: keyof toCheck){
    const rmItem = (campaignId:string)=>{
      delete(this.toCheck[beatName].items[campaignId])
      this.queues.unenqueue('checkM' + campaignId)
    }
    for (const item of this.getSortedItems(beatName) ){
      const {ts, idValues} = item;

      const cb = async()=>{
        let isPassed = false;

        await this.gotoKeywordsPage(idValues.campaignId);
        const status = (await this.page.locator('.ess-status__status').first().innerText());
        console.log(this.currentCampaignId, 'Current status:', status)
        isPassed =  ('Идут показы') == status;


        if (isPassed) {
          rmItem(idValues.campaignId)
          console.log(idValues.campaignId + ' Moderation passed!');
        }
        return true;
      };

      if (beatName == 'main' && Date.now() - ts > this.conf.time.moderationTimeout){
        rmItem(idValues.campaignId)
        this.toCheck['bg'].items[idValues.campaignId] = item;
      }

      this.queues.enqueue({cb, taskName: 'checkM'+idValues.campaignId })
    }
  }

  async gotoKeywordsPage(campaignId:string){
    if (this.currentCampaignId == campaignId) return this.page.reload();
    this.currentCampaignId = campaignId;
    await this.page.goto('https://direct.yandex.ru/dna/grid/campaigns?filter=%D0%A1%D1%82%D0%B0%D1%82%D1%83%D1%81%20%3D%20%D0%92%D1%81%D0%B5%20%D0%BA%D0%B0%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8%7Cdim%20%3D%20CPC');
    await actionsBetween({page: this.page})
    const searchInput= this.page.locator('.grid-toolbox__search input');
    await searchInput.fill(campaignId);
    await searchInput.press('Enter');
    await actionsBetween({ms: 'withoutReload',page: this.page})
    
    const campaignCell = this.page.locator(`.fixedDataTableCellGroupLayout_cellGroup:has(.grid-campaign-name-cell__cid:has-text("${campaignId}"))`)
    await jsClick(campaignCell.locator('.select-row-cell .Checkbox input[type=checkbox]'))
    await actionsBetween({ms: 'withoutReload',page: this.page})
    const tab = this.page.locator(`.tab-menu-link__link:has-text("Ставки и фразы")`);
    await Promise.all([this.page.waitForNavigation(), jsClick(tab)]);
    await actionsBetween({page: this.page})
  }

  addToCheck(idValues:baseIdValues){
    this.toCheck.main.items[idValues.campaignId] = {ts: Date.now(), idValues}
    console.log(`Group №${idValues.groupId} watched for moderation`)
  }
}