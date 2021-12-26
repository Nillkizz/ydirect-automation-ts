import { prompt } from "enquirer";

export default class {
  static async get_credentials() {
    const creds = {
      username:
        process.env.DOLPHIN_USERNAME ||
        (await prompt({
          type: "input",
          name: "username",
          message: "Dolphin Anty Username: ",
        })),
      password:
        process.env.DOLPHIN_PASSWORD ||
        (await prompt({
          type: 'password',
          name: "password",
          message: "Dolphin Anty Password: ",
        })),
    };

    return creds;
  }
}
