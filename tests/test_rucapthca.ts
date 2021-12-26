import { Rucaptcha } from 'rucaptcha-client';
import "../env"


(async () => {
  if (typeof process.env.RUCAPCHA_API_KEY == 'undefined') throw Error('Has no RUCAPCHA_API_KEY');
  const rucaptcha = new Rucaptcha(process.env.RUCAPCHA_API_KEY);

  // Если хотите использовать 2captcha в качестве endpoint
  // По умолчанию будет использоваться rucaptcha.com
  // rucaptcha.baseUrl = 'https://2captcha.com';

  // Если ключ API был указан неверно, выбросит RucaptchaError с кодом
  // ERROR_KEY_DOES_NOT_EXIST. Полезно вызывать этот метод сразу после
  // инициализации, чтобы убедиться, что ключ API указан верно.
  const balance = await rucaptcha.getBalance();

  const imageUrl =
    'https://raw.githubusercontent.com/ivan-podgornov/rucaptcha-client/master/src/rucaptcha/images/captcha.jpg';
  const answer = await rucaptcha.solve(imageUrl);
  console.log({ balance, answer: answer.text });
})();