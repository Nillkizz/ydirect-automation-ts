import pw from "playwright";
import { pages } from "./index";
import { campaignType, Config } from "../config/config";
import { Beats } from "../modules/beats";
import { baseIdValues } from "../index";
import { Queues } from "../modules/queues";
import { applyMixins, jsClick } from "../modules/utils";
import { actionsBetween } from "../helpers";
import { secondStep } from "../scripts";
import { EventEmitter } from "stream";

type campaignToCheck = {ts: number, idValues: baseIdValues, campaign:campaignType}
type toCheck = {main: {interval?: number, items: Record<string, campaignToCheck>}, bg: {interval?: number, items: Record<string, campaignToCheck>}}

interface Moderation extends EventEmitter{}

class Moderation extends Beats{
  page: pw.Page;
  pages: pages|undefined;
  toCheck: toCheck = {main: {items:{}}, bg: {items:{}}};
  conf: Readonly<Config>
  queues: Queues
  currentCampaignId: string
  ctx: pw.BrowserContext

  constructor(interval: number, page:pw.Page, conf: Readonly<Config>, ctx: pw.BrowserContext){
    super(interval);
    page.goto('about:blank')
    this.conf = conf;
    this.page = page;
    this.queues = new Queues()
    this.currentCampaignId = ''
    this.ctx = ctx

    for (const [beatName, beat] of Object.entries(this.toCheck)){
      // Создает два бита, которые вызывают check, который ставит таску в глобальную очередь.
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
      const {ts, idValues, campaign} = item;

      const cb = async(): Promise<boolean> =>{
        let isPassed = false;

        await this.gotoKeywordsPage(idValues.campaignId);
        const status = (await this.page.locator('.ess-status__status').first().innerText());
        console.log(this.currentCampaignId, 'Current status:', status)
        isPassed =  ('Идут показы') == status;


        if (isPassed) {
          rmItem(idValues.campaignId)
          await this.removeRejectedKeys(idValues.campaignId)
          const doSecondStep = async ()=>{ secondStep(await this.ctx.newPage(), idValues, campaign); return true }
          setTimeout(()=>{
            this.queues.enqueue({cb:doSecondStep, taskName: 'secondStep'+idValues.campaignId })
          }, this.conf.time.stage2)
          
          console.log(idValues.campaignId + ' Moderation passed!');
          this.emit('done');
        }
        return true;
      };

      if (beatName == 'main' && Date.now() - ts > this.conf.time.moderationTimeout){
        rmItem(idValues.campaignId)
        this.toCheck['bg'].items[idValues.campaignId] = item;
        this.emit('done')
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

  async removeRejectedKeys(campaignId: string){
    const page = await this.ctx.newPage();
    console.log('removeRejectedKeys')
    await page.goto(`https://direct.yandex.ru/registered/main.pl?cid=${campaignId}&cmd=showCamp`)
    await actionsBetween({page})
    const inactiveList = page.locator('.b-phrases-list-group_inactive_yes')
    const inactiveBtn = inactiveList.locator('button:has-text("Показать отключенные и отклонённые")')

    await actionsBetween({ms:'withoutReload', page})
    const hasInactiveKeys = await inactiveBtn.isVisible()
    if (hasInactiveKeys){
        await jsClick(inactiveBtn)
        await actionsBetween({ms:'withoutReload', page})
        const inactiveKeys = inactiveList.locator('.b-group-phrase')
        const keysCount = await inactiveKeys.count();
        let ii = 0
        for (let i=0; i<keysCount; i++){
          let phrase = inactiveKeys.nth(ii)

          await jsClick(phrase.locator('.b-phrase__content'))
          await actionsBetween({ms:'withoutReload', page})
          await jsClick(page.locator('.b-phrase-popup__content button:has-text("Удалить фразу")'))
          await actionsBetween({ms:'withoutReload', page})
          const msg = await phrase.locator('.b-phrase-key-words').innerText() + "  :  " + await phrase.locator('.b-group-phrase__info').innerText()

          ii+=2
          console.info(i, msg)
        }
        await jsClick(page.locator('.b-campaign-edit-panel__save button:has-text("Сохранить")'))
        await actionsBetween({ms:'withoutReload', page})
        console.log('ok')
    } else {
        console.log('Отклоненных ключей нет')
    }
    await page.close()
  }

  сheck(idValues:baseIdValues, campaign:campaignType){
    this.toCheck.main.items[idValues.campaignId] = {ts: Date.now(), idValues, campaign}
    console.log(`Group №${idValues.groupId} watched for moderation`)
    return new Promise((res)=>this.on('done', res))
  }
}

applyMixins(Moderation, [EventEmitter])
export {Moderation}