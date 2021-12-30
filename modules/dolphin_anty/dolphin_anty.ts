import EventEmitter from "events";

import pw from "playwright";

import { RequestInfo, RequestInit } from "node-fetch";
import { URLSearchParams } from "url";

const fetch = (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(({ default: fetch }) => fetch(url, init));

type DolphinConstrictorArgs = { no_init?: boolean, profileName: string }
type DolphinProfile = { data: Array<{ id: string, name: string }> }

interface IDolphin {
  cache: { [key: string]: any }
  profile_name: string
}

export async function get_context(profileName: string): Promise<pw.BrowserContext> {
  /**
   * @fires logged_in
   * @fires profiles_fetched
   * @fires profiles_received
   * @fires profile_started { port: Number, wsEndpoint: String }
   */
  class Dolphin extends EventEmitter implements IDolphin {
    cache: { [key: string]: any; };
    profile_name: string;

    constructor({ no_init, profileName }: DolphinConstrictorArgs) {
      super();
      this.cache = {};
      this.profile_name = profileName;

      if (!no_init) this.init();
    }

    private async init() {
      const credentials = {
        username: process.env.DOLPHIN_USERNAME || '',
        password: process.env.DOLPHIN_PASSWORD || '',
      }
      this.login(credentials);

      this.on("logged_in", async () => {
        const profiles: DolphinProfile = await this.get_profiles_list();

        const profile_id: string = profiles.data.filter(
          (profile) => profile.name == this.profile_name
        )[0].id;

        await this.start_profile(profile_id);
      });
    }

    private async start_profile(profile_id: string) {
      const url = `http://localhost:3001/v1.0/browser_profiles/${profile_id}/start?automation=1`;
      const data: any = await (await fetch(url)).json();
      if (!data.success) return false;
      this.emit("profile_started", data.automation);
      return data;
    }

    private async login({ username, password }: { username: string, password: string }) {
      let success = false;
      const url = "https://anty-api.com/auth/login",
        body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);
      const response = await fetch(url, { method: "POST", body });

      if (response.ok) {
        const data: any = await response.json();
        this.cache.access_token = data.token;
        this.emit("logged_in");
        success = true;
      } else console.error("Invalid username or password", response.text());

      return success;
    }

    async get_profiles_list() {
      if (!this.cache.profiles_list) {
        const url = "https://anty-api.com/browser_profiles";
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.cache.access_token}` },
        });
        this.cache.profiles_list = await response.json();
        this.emit("profiles_fetched");
      }
      this.emit("profiles_received");
      return this.cache.profiles_list;
    }

    emit(eventName: string, ...args: any[]) {
      console.info("<Dolphin>", "Event", eventName);
      return super.emit(eventName, ...args);
    }
  }

  const dolphin = new Dolphin({ profileName });

  return await new Promise(res => {
    dolphin.once("profile_started", main);

    async function main({ port, wsEndpoint }: { port: string, wsEndpoint: string }) {
      const wsUrl: string = `ws://127.0.0.1:${port}${wsEndpoint}`;
      const browser: pw.Browser = await pw.chromium.connectOverCDP(wsUrl);
      const context: pw.BrowserContext = browser.contexts()[0];
      for (const page of context.pages().slice(1)) await page.close();

      res(context)
    }
  })

}