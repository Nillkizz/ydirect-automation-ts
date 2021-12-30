import { CampaignPage } from "./campaign-page"
import { CampaignsPage } from "./campaigns-page"
import { EditBannerPage } from "./edit_banner-page"
import { EditGroupPage } from "./edit_group-page"
import { Moderation } from "./moderation"

export {CampaignsPage, EditGroupPage, Moderation}

export type pages = {
  moderation : Moderation,
  campaigns : CampaignsPage,
  campaign: CampaignPage,
  editGroup : EditGroupPage,
  editBanner: EditBannerPage
} 