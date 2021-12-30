import pw from 'playwright';
import { baseIdValues } from "..";
import { campaignType } from "../config/config";

type secondtStepArgs = [page: pw.Page, idValues:baseIdValues, campaign:campaignType]
export async function secondStep(...[pages, idValues, campaign]: secondtStepArgs){
  
}