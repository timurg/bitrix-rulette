# Prize Wheel Library

Встраиваемая библиотека адаптивной рулетки для сайта с callback для CRM.

## Сборка

```bash
npm install
npm run build
```

После сборки доступны:

- `dist/index.js` для ESM
- `dist/index.cjs` для CommonJS
- `dist/index.global.js` для прямого подключения через `<script>`
- `dist/prize-wheel.js` переносимая браузерная сборка
- `dist/prize-wheel.min.js` минифицированная браузерная сборка

## Важно

Компонент не использует тексты, тему, правила и призы по умолчанию при инициализации.
Все пользовательские надписи, тему, правила и призы нужно передавать явно.
Если обязательных данных не хватает, `createPrizeWheel(...)` выбросит ошибку при старте.

Назначение ответственного в Bitrix теперь настраивается только на PHP-стороне через `assigned_by_id` в конфиге обработчика. Во фронтенд этот параметр больше не передается.

## Использование

```ts
import { createPrizeWheel } from "@proznanie/prize-wheel";

createPrizeWheel({
  target: "#lead-wheel",
  theme: {
    background: "linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)",
    cardBackground: "rgba(255, 255, 255, 0.92)",
    cardBorderColor: "rgba(91, 23, 208, 0.45)",
    textColor: "#020202",
    textSoftColor: "rgba(2, 2, 2, 0.7)",
    accentColor: "#5B17D0",
    accentStrongColor: "#5856FF",
    shadowColor: "0 20px 38px rgba(91, 23, 208, 0.1)",
    widgetBorderColor: "rgba(91, 23, 208, 0.12)",
    backdropPrimaryColor: "rgba(91, 23, 208, 0.05)",
    backdropSecondaryColor: "rgba(88, 153, 226, 0.06)",
    agreementBackground: "rgba(91, 23, 208, 0.04)",
    agreementBorderColor: "rgba(91, 23, 208, 0.12)",
    inputBorderColor: "rgba(91, 23, 208, 0.14)",
    inputFocusBorderColor: "rgba(91, 23, 208, 0.95)",
    inputFocusRingColor: "rgba(91, 23, 208, 0.08)",
    stageBorderColor: "rgba(91, 23, 208, 0.5)",
    stageGradientStart: "#5B17D0",
    stageGradientMid: "#6620DB",
    stageGradientEnd: "#5856FF",
    stageGlowColor: "rgba(255, 255, 255, 0.18)",
    pointerColor: "#FFFFFF",
    hubBackground: "rgba(255, 255, 255, 0.96)",
    hubBorderColor: "rgba(91, 23, 208, 0.88)",
    hubTextColor: "#5B17D0",
    hubSubtextColor: "rgba(91, 23, 208, 0.82)",
    claimBackground: "rgba(255, 255, 255, 0.96)",
    claimBorderColor: "rgba(91, 23, 208, 0.18)",
    claimShadowColor: "rgba(91, 23, 208, 0.12)",
    claimTitleColor: "rgba(91, 23, 208, 0.72)",
    wheelBaseFill: "rgba(255,255,255,0.2)",
    wheelOuterStrokeColor: "rgba(91,23,208,0.12)",
    wheelCenterFill: "rgba(2, 2, 2, 0.9)",
    wheelDiscShadowColor: "rgba(91, 23, 208, 0.2)",
    sectorColors: ["#5B17D0", "#5856FF", "#5899E2"]
  },
  texts: {
    title: "Колесо подарков «ПроЗнание»",
    agreementPrefix: "Согласен с",
    agreementLinkText: "правилами акции",
    phoneLabel: "Номер телефона участника",
    phonePlaceholder: "+7 (999) 123-45-67",
    hint: "Кнопка запуска станет активной после согласия с правилами акции и ввода корректного номера телефона.",
    startButtonLabel: "Крутить",
    legalTitle: "Правила акции",
    claimTitle: "Ваш подарок",
    claimText: "Нажмите кнопку ниже, чтобы зафиксировать выигрыш и передать данные для связи.",
    claimButtonLabel: "Забрать приз",
    claimSentButtonLabel: "Заявка отправлена",
    sessionCompleteTitle: "Розыгрыш уже завершен",
    sessionCompleteText: "В рамках текущего посещения сайта приз уже был разыгран.",
    sessionCompleteUnknownPrize: "Приз уже разыгран",
    hubTitle: "Крутите",
    hubSubtitle: "и забирайте подарок",
    invalidPhoneMessage: "Введите корректный российский номер телефона.",
    agreementRequiredMessage: "Подтвердите согласие с правилами акции.",
    readyMessage: "Номер принят. Колесо можно запускать.",
    leadName: "Участник"
  },
  rules: [
    {
      id: "citizenship",
      text: "Акция действует только для граждан Российской Федерации."
    }
  ],
  prizes: [
    {
      id: "discount-20",
      fullLabel: "Скидка 20% на оплату 1 семестра обучения",
      wheelLabel: "Скидка 20%",
      hint: "Максимальная скидка в рамках акции на оплату первого семестра обучения.",
      crmComment: "Скидка 20% на оплату 1 семестра обучения"
    }
  ],
  yandexMetrika: {
    counterId: 12345678,
    goals: {
      view: "wheel_view",
      agreementCheck: "wheel_agreement_check",
      phoneInputStart: "wheel_phone_input_start",
      spinStart: "wheel_spin_start",
      claim: "wheel_claim"
    }
  },
  onLead: async (payload) => {
    await $.ajax({
      url: "/php/bitrix-lead-handler.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload)
    });
  }
});
```

## Поля призов

Полное название приза можно передавать через:

- `label`
- `fullLabel`
- `title`
- `name`
- `text`

Короткую подпись на колесе можно передавать через:

- `shortLabel`
- `wheelLabel`
- `short`
- `shortTitle`
- `shortText`
- `displayLabel`
- `displayName`

Подсказку с условиями по призу можно передавать через:

- `hint`
- `details`
- `description`

## Правила акции

Для обычного пункта используйте `text`.

Если внутри пункта нужна ссылка или другое HTML-оформление, можно передать:

- `text` для совместимости
- `html` для вывода разметки без экранирования

Пример:

```ts
rules: [
  {
    id: "agreement",
    text: "",
    html: "Нажимая кнопку Крутить... Ознакомьтесь с <a href='/privacy/'>Соглашением</a>."
  }
]
```

## Yandex Metrika

Если передать `yandexMetrika`, виджет будет отправлять цели в Яндекс Метрику:

- `view` при показе компонента
- `agreementCheck` при первом нажатии на чекбокс согласия
- `phoneInputStart` при первом начале ввода номера телефона
- `spinStart` при фактическом запуске колеса
- `claim` после успешного нажатия `Забрать приз`

## Поведение

- одна попытка на сессию хранится через `sessionStorage`
- callback `onLead` вызывается только после нажатия кнопки `Забрать приз`
- callback `onResult` вызывается сразу после остановки колеса
- если в текущей сессии приз уже разыгран, повторно форма розыгрыша не показывается
- блок `Правила акции` скрыт по умолчанию и раскрывается по нажатию на ссылку в чекбоксе согласия

## Theme

`theme` обязателен. Через него задаются основные цвета виджета, градиент сцены, цвета центральной кнопки и массив `sectorColors` для сегментов колеса.
