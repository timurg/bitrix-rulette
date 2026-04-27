import type {
  CreatePrizeWheelOptions,
  PrizeWheelInstance,
  PrizeWheelLeadPayload,
  PrizeWheelPrize,
  PrizeWheelPrizeInput,
  PrizeWheelResult,
  PrizeWheelRule,
  PrizeWheelTexts,
  PrizeWheelTheme,
  PrizeWheelUtmData
} from "./types";

const STYLE_ID = "proznanie-prize-wheel-styles";
const DEFAULT_ATTEMPT_STORAGE_KEY = "proznanie-prize-wheel-attempt";
const DEFAULT_UTM_STORAGE_KEY = "proznanie-prize-wheel-utm";
const DEFAULT_SPIN_DURATION_MS = 4600;
const DEFAULT_SCROLL_TOP_OFFSET = 96;
const fallbackAttemptStorage = new Map<string, string>();
const OPTIONAL_NAME_LABEL = "Имя участника";
const OPTIONAL_NAME_PLACEHOLDER = "Как к вам обращаться";

const REQUIRED_TEXT_KEYS: Array<keyof PrizeWheelTexts> = [
  "title",
  "agreementPrefix",
  "agreementLinkText",
  "phoneLabel",
  "phonePlaceholder",
  "hint",
  "startButtonLabel",
  "legalTitle",
  "claimTitle",
  "claimText",
  "claimButtonLabel",
  "claimSentButtonLabel",
  "sessionCompleteTitle",
  "sessionCompleteText",
  "sessionCompleteUnknownPrize",
  "hubTitle",
  "hubSubtitle",
  "invalidPhoneMessage",
  "agreementRequiredMessage",
  "readyMessage",
  "leadName"
];

const REQUIRED_THEME_KEYS: Array<Exclude<keyof PrizeWheelTheme, "sectorColors">> = [
  "background",
  "cardBackground",
  "cardBorderColor",
  "textColor",
  "textSoftColor",
  "accentColor",
  "accentStrongColor",
  "shadowColor",
  "widgetBorderColor",
  "backdropPrimaryColor",
  "backdropSecondaryColor",
  "agreementBackground",
  "agreementBorderColor",
  "inputBorderColor",
  "inputFocusBorderColor",
  "inputFocusRingColor",
  "stageBorderColor",
  "stageGradientStart",
  "stageGradientMid",
  "stageGradientEnd",
  "stageGlowColor",
  "pointerColor",
  "hubBackground",
  "hubBorderColor",
  "hubTextColor",
  "hubSubtextColor",
  "claimBackground",
  "claimBorderColor",
  "claimShadowColor",
  "claimTitleColor",
  "wheelBaseFill",
  "wheelOuterStrokeColor",
  "wheelCenterFill",
  "wheelDiscShadowColor"
];

export const defaultRules: PrizeWheelRule[] = [
  {
    id: "citizenship",
    text: "Акция действует только для граждан Российской Федерации."
  },
  {
    id: "eligibility",
    text: "Результаты учитываются только для участников, которые не являются абитуриентами или студентами вузов-партнеров онлайн-университета «ПроЗнание» или слушателями его курсов."
  },
  {
    id: "prizes",
    text: "Призы: скидка на первый семестр, монеты в кошелек «ПроБонус», сертификат на курс профессиональной переподготовки и бесплатный курс ДПО «Упрощаем жизнь с помощью ИИ»."
  },
  {
    id: "attempts",
    text: "Количество попыток ограничено: одна попытка за посещение сайта. Для новой попытки нужно открыть сайт заново после закрытия браузера."
  }
];

export const defaultPrizes: PrizeWheelPrize[] = [
  {
    id: "discount-10",
    label: "Скидка 10% на оплату 1 семестра обучения",
    crmComment: "Скидка 10% на оплату 1 семестра обучения",
    weight: 1,
    accentColor: "#5B17D0"
  },
  {
    id: "discount-20",
    label: "Скидка 20% на оплату 1 семестра обучения",
    crmComment: "Скидка 20% на оплату 1 семестра обучения",
    weight: 1,
    accentColor: "#5856FF"
  },
  {
    id: "bonus-3000",
    label: "3000 монет в кошелек «ПроБонус»",
    crmComment: "3000 монет в кошелек «ПроБонус»",
    weight: 1,
    accentColor: "#5899E2"
  },
  {
    id: "bonus-5000",
    label: "5000 монет в кошелек «ПроБонус»",
    crmComment: "5000 монет в кошелек «ПроБонус»",
    weight: 1,
    accentColor: "#5B17D0"
  },
  {
    id: "certificate-1000",
    label: "Сертификат на 1000 руб. на оплату курса профессиональной переподготовки",
    crmComment: "Сертификат на 1000 руб. на оплату курса профессиональной переподготовки",
    weight: 1,
    accentColor: "#5856FF"
  },
  {
    id: "certificate-2000",
    label: "Сертификат на 2000 руб. на оплату курса профессиональной переподготовки",
    crmComment: "Сертификат на 2000 руб. на оплату курса профессиональной переподготовки",
    weight: 1,
    accentColor: "#5899E2"
  },
  {
    id: "free-course",
    label: "Бесплатный курс ДПО «Упрощаем жизнь с помощью ИИ»",
    crmComment: "Бесплатный курс ДПО «Упрощаем жизнь с помощью ИИ»",
    weight: 1,
    accentColor: "#5B17D0"
  }
];

export function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  if (digits.length > 0 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : "";
}

function formatPhoneDisplay(value: string): string {
  const digits = normalizePhoneNumber(value).replace(/\D/g, "");

  if (digits.length < 11) {
    return value;
  }

  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function isPhoneValid(value: string): boolean {
  return normalizePhoneNumber(value).replace(/\D/g, "").length === 11;
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.pz-wheel {
  --pz-bg: linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%);
  --pz-card: rgba(255, 255, 255, 0.92);
  --pz-card-border: rgba(91, 23, 208, 0.45);
  --pz-text: #020202;
  --pz-text-soft: rgba(2, 2, 2, 0.7);
  --pz-accent: #5b17d0;
  --pz-accent-strong: #5856ff;
  --pz-shadow: 0 20px 38px rgba(91, 23, 208, 0.1);
  --pz-widget-border: rgba(91, 23, 208, 0.12);
  --pz-backdrop-primary: rgba(91, 23, 208, 0.05);
  --pz-backdrop-secondary: rgba(88, 153, 226, 0.06);
  --pz-agreement-bg: rgba(91, 23, 208, 0.04);
  --pz-agreement-border: rgba(91, 23, 208, 0.12);
  --pz-input-border: rgba(91, 23, 208, 0.14);
  --pz-input-focus-border: rgba(91, 23, 208, 0.95);
  --pz-input-focus-ring: rgba(91, 23, 208, 0.08);
  --pz-stage-border: rgba(91, 23, 208, 0.5);
  --pz-stage-start: #5b17d0;
  --pz-stage-mid: #6620db;
  --pz-stage-end: #5856ff;
  --pz-stage-glow: rgba(255, 255, 255, 0.18);
  --pz-pointer: #ffffff;
  --pz-hub-bg: rgba(255, 255, 255, 0.96);
  --pz-hub-border: rgba(91, 23, 208, 0.88);
  --pz-hub-text: #5b17d0;
  --pz-hub-subtext: rgba(91, 23, 208, 0.82);
  --pz-claim-bg: rgba(255, 255, 255, 0.96);
  --pz-claim-border: rgba(91, 23, 208, 0.18);
  --pz-claim-shadow: rgba(91, 23, 208, 0.12);
  --pz-claim-title: rgba(91, 23, 208, 0.72);
  --pz-wheel-base: rgba(255,255,255,0.2);
  --pz-wheel-stroke: rgba(91,23,208,0.12);
  --pz-wheel-center: rgba(2, 2, 2, 0.9);
  --pz-wheel-disc-shadow: rgba(91, 23, 208, 0.2);
  --pz-radius: 26px;
  position: relative;
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  color: var(--pz-text);
  background: var(--pz-bg);
  border-radius: var(--pz-radius);
  box-shadow: var(--pz-shadow);
  border: 2px solid var(--pz-widget-border);
  font-family: "Segoe UI", "Arial", sans-serif;
}

.pz-wheel *,
.pz-wheel *::before,
.pz-wheel *::after {
  box-sizing: border-box;
}

.pz-wheel__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, var(--pz-backdrop-primary), transparent 30%),
    radial-gradient(circle at right 20%, var(--pz-backdrop-secondary), transparent 24%);
  pointer-events: none;
}

.pz-wheel__layout {
  position: relative;
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.22fr);
  align-items: center;
  padding: clamp(20px, 4vw, 36px);
}

.pz-wheel__content,
.pz-wheel__stage {
  position: relative;
  z-index: 1;
}

.pz-wheel__content {
  max-width: 760px;
}

.pz-wheel__title {
  margin: 0 0 20px;
  font-size: clamp(24px, 3.6vw, 40px);
  line-height: 1.08;
}

.pz-wheel__legal {
  display: none;
  gap: 12px;
  padding: 18px;
  border-radius: 22px;
  background: var(--pz-card);
  border: 2px solid var(--pz-card-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.pz-wheel__legal.is-visible {
  display: grid;
}

.pz-wheel__legal-title {
  margin: 0;
  font-size: 16px;
}

.pz-wheel__legal-list {
  margin: 0;
  padding: 0 0 0 18px;
  display: grid;
  gap: 10px;
  color: var(--pz-text-soft);
  line-height: 1.45;
}

.pz-wheel__actions {
  display: grid;
  gap: 12px;
  margin-top: 20px;
  max-width: 720px;
}

.pz-wheel__participation.is-hidden,
.pz-wheel__claim:not(.is-visible) {
  display: none;
}

.pz-wheel__agreement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--pz-agreement-bg);
  border: 1px solid var(--pz-agreement-border);
}

.pz-wheel__checkbox {
  margin: 2px 0 0;
  width: 18px;
  height: 18px;
  accent-color: var(--pz-accent);
}

.pz-wheel__agreement-text {
  color: var(--pz-text-soft);
  font-size: 14px;
  line-height: 1.45;
}

.pz-wheel__agreement-link {
  color: var(--pz-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.pz-wheel__field {
  display: grid;
  gap: 8px;
}

.pz-wheel__label {
  font-size: 14px;
  color: var(--pz-text-soft);
}

.pz-wheel__input {
  width: 100%;
  border: 1px solid var(--pz-input-border);
  background: #ffffff;
  color: var(--pz-text);
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 18px;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.pz-wheel__input::placeholder {
  color: rgba(2, 2, 2, 0.36);
}

.pz-wheel__input:focus {
  border-color: var(--pz-input-focus-border);
  box-shadow: 0 0 0 4px var(--pz-input-focus-ring);
}

.pz-wheel__hint,
.pz-wheel__attempt {
  min-height: 20px;
  font-size: 13px;
  color: var(--pz-text-soft);
}

.pz-wheel__attempt[data-state="error"] {
  color: #9f1239;
}

.pz-wheel__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 56px;
  padding: 16px 24px;
  border: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--pz-accent), var(--pz-accent-strong));
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, filter 0.18s ease;
}

.pz-wheel__button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.pz-wheel__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.pz-wheel__stage {
  display: grid;
  justify-items: stretch;
  align-self: stretch;
  order: -1;
  min-width: 0;
}

.pz-wheel__shell {
  position: relative;
  width: 100%;
  min-height: clamp(360px, 42vw, 620px);
  overflow: hidden;
  display: block;
  padding: 0;
  border-radius: 34px;
  border: 2px solid var(--pz-stage-border);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), transparent 24%),
    linear-gradient(135deg, var(--pz-stage-start) 0%, var(--pz-stage-mid) 38%, var(--pz-stage-end) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.pz-wheel__halo {
  position: absolute;
  inset: 6% -24% 6% 4%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--pz-stage-glow), rgba(255, 255, 255, 0) 62%);
  filter: blur(26px);
  pointer-events: none;
}

.pz-wheel__pointer {
  position: absolute;
  top: 50%;
  right: 10px;
  z-index: 3;
  width: 0;
  height: 0;
  transform: translateY(-50%);
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-right: 32px solid var(--pz-pointer);
  filter: drop-shadow(0 8px 12px rgba(2, 2, 2, 0.18));
}

.pz-wheel__prize-marquee {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(56%, 320px);
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 12px 28px rgba(2, 2, 2, 0.12);
  backdrop-filter: blur(10px);
  color: #ffffff;
  animation: pz-wheel-marquee-pulse 2.2s ease-in-out infinite;
  cursor: pointer;
  user-select: none;
}

.pz-wheel__prize-marquee-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.pz-wheel__prize-marquee:hover {
  transform: translateY(-1px);
}

.pz-wheel__prize-marquee-icon {
  font-size: 16px;
  line-height: 1;
}

.pz-wheel__tooltip {
  position: absolute;
  z-index: 5;
  min-width: 180px;
  max-width: min(280px, calc(100% - 24px));
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(91, 23, 208, 0.18);
  box-shadow: 0 12px 28px rgba(2, 2, 2, 0.12);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.14s ease;
}

.pz-wheel__tooltip.is-visible {
  opacity: 1;
}

.pz-wheel__tooltip-label {
  margin: 0;
  color: var(--pz-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

.pz-wheel__tooltip-hint {
  margin: 4px 0 0;
  color: var(--pz-text-soft);
  font-size: 12px;
  line-height: 1.4;
}

.pz-wheel__disc-wrap {
  position: absolute;
  top: 50%;
  left: auto;
  right: 18px;
  width: clamp(520px, 62vw, 900px);
  aspect-ratio: 1 / 1;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
}

.pz-wheel__disc {
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.12, 0.85, 0.18, 1);
  filter: drop-shadow(0 24px 42px var(--pz-wheel-disc-shadow));
}

.pz-wheel__hub {
  position: absolute;
  inset: 38%;
  display: grid;
  place-items: center;
  text-align: center;
  border-radius: 50%;
  background: var(--pz-hub-bg);
  border: 6px solid var(--pz-hub-border);
  box-shadow: inset 0 0 0 1px rgba(88, 153, 226, 0.2);
  padding: 12px;
  z-index: 2;
}

.pz-wheel__hub strong {
  display: block;
  font-size: clamp(18px, 2.4vw, 24px);
  color: var(--pz-hub-text);
}

.pz-wheel__hub span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--pz-hub-subtext);
}

.pz-wheel__claim {
  margin-top: 24px;
  padding: 18px;
  border-radius: 22px;
  background: var(--pz-claim-bg);
  border: 2px solid var(--pz-claim-border);
  box-shadow: 0 20px 32px var(--pz-claim-shadow);
  max-width: 720px;
}

.pz-wheel__claim.is-focused {
  animation: pz-wheel-claim-focus 1.8s ease;
}

.pz-wheel__claim-title {
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pz-claim-title);
}

.pz-wheel__claim-prize {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
}

.pz-wheel__claim-hint {
  display: none;
  margin: -2px 0 12px;
  color: var(--pz-text-soft);
  font-size: 14px;
  line-height: 1.45;
}

.pz-wheel__claim-text {
  margin: 0 0 16px;
  color: var(--pz-text-soft);
  line-height: 1.45;
}

.pz-wheel__claim-field {
  display: grid;
  gap: 10px;
  margin: 0 0 14px;
}

.pz-wheel__claim-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 14px;
}

.pz-wheel__claim-status {
  min-height: 20px;
  margin: -4px 0 14px;
  font-size: 14px;
  color: var(--pz-text-soft);
}

.pz-wheel__claim-status[data-state="error"] {
  color: #c62828;
}

.pz-wheel__claim--complete .pz-wheel__claim-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--pz-text);
}

.pz-wheel__claim-button {
  min-width: min(100%, 280px);
}

.pz-wheel__modal {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 2, 2, 0.48);
  z-index: 9999;
}

.pz-wheel__modal.is-open {
  display: flex;
}

.pz-wheel__modal-card {
  position: relative;
  width: min(720px, 100%);
  max-height: min(80vh, 760px);
  overflow: auto;
  border-radius: 24px;
  background: var(--pz-card);
  border: 2px solid var(--pz-card-border);
  box-shadow: 0 24px 48px rgba(2, 2, 2, 0.18);
}

.pz-wheel__modal-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: var(--pz-card);
  border-bottom: 1px solid rgba(91, 23, 208, 0.12);
}

.pz-wheel__modal-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.pz-wheel__modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 14px;
  background: rgba(91, 23, 208, 0.08);
  color: var(--pz-accent);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.pz-wheel__modal-list {
  display: grid;
  gap: 14px;
  padding: 18px 20px 20px;
}

.pz-wheel__modal-item {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(91, 23, 208, 0.14);
}

.pz-wheel__modal-item-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.pz-wheel__modal-item-hint {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--pz-text-soft);
}

@keyframes pz-wheel-claim-focus {
  0% {
    transform: translateY(0);
    box-shadow: 0 20px 32px var(--pz-claim-shadow), 0 0 0 0 rgba(91, 23, 208, 0.26);
  }
  30% {
    transform: translateY(-2px);
    box-shadow: 0 24px 40px var(--pz-claim-shadow), 0 0 0 10px rgba(91, 23, 208, 0.16);
  }
  100% {
    transform: translateY(0);
    box-shadow: 0 20px 32px var(--pz-claim-shadow), 0 0 0 0 rgba(91, 23, 208, 0);
  }
}

@keyframes pz-wheel-marquee-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 12px 28px rgba(2, 2, 2, 0.12);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 16px 34px rgba(2, 2, 2, 0.18);
  }
}

@media (max-width: 960px) {
  .pz-wheel__layout {
    grid-template-columns: 1fr;
  }

  .pz-wheel__stage {
    order: -1;
  }

  .pz-wheel__shell {
    min-height: 300px;
    border-radius: 28px;
  }

  .pz-wheel__disc-wrap {
    left: auto;
    right: -4%;
    width: clamp(400px, 86vw, 640px);
  }

  .pz-wheel__claim {
    max-width: none;
  }

  .pz-wheel__prize-marquee {
    max-width: min(66%, 360px);
  }
}

@media (max-width: 640px) {
  .pz-wheel {
    border-radius: 22px;
  }

  .pz-wheel__layout {
    gap: 18px;
    padding: 18px;
  }

  .pz-wheel__shell {
    min-height: 280px;
  }

  .pz-wheel__disc-wrap {
    left: auto;
    right: -2%;
    width: clamp(320px, 88vw, 440px);
  }

  .pz-wheel__claim-prize {
    font-size: 20px;
  }

  .pz-wheel__claim-grid {
    grid-template-columns: 1fr;
  }

  .pz-wheel__prize-marquee {
    top: 12px;
    left: 12px;
    max-width: min(72%, 280px);
    padding: 8px 12px;
    border-radius: 16px;
  }

  .pz-wheel__prize-marquee-title {
    font-size: 12px;
  }

  .pz-wheel__prize-marquee-icon {
    font-size: 15px;
  }

  .pz-wheel__hub {
    inset: 37.5%;
    padding: 10px 8px;
    border-width: 5px;
  }

  .pz-wheel__hub strong {
    font-size: 15px;
    line-height: 1.05;
  }

  .pz-wheel__hub span {
    margin-top: 4px;
    font-size: 9px;
    line-height: 1.15;
  }

  .pz-wheel__modal {
    padding: 16px;
  }

  .pz-wheel__modal-card {
    border-radius: 20px;
  }

  .pz-wheel__modal-title {
    font-size: 20px;
  }

}

@media (max-width: 420px) {
  .pz-wheel__title {
    font-size: 26px;
  }

  .pz-wheel__shell {
    min-height: 248px;
  }

  .pz-wheel__disc-wrap {
    right: 0;
    width: 90vw;
  }

  .pz-wheel__prize-marquee {
    max-width: calc(100% - 68px);
    padding: 7px 10px;
  }

  .pz-wheel__prize-marquee-title {
    font-size: 11px;
  }

  .pz-wheel__prize-marquee-icon {
    font-size: 14px;
  }

  .pz-wheel__hub {
    inset: 36.5%;
    padding: 8px 6px;
    border-width: 4px;
  }

  .pz-wheel__hub strong {
    font-size: 13px;
    line-height: 1.05;
  }

  .pz-wheel__hub span {
    margin-top: 3px;
    font-size: 8px;
    line-height: 1.1;
  }

  .pz-wheel__input,
  .pz-wheel__button {
    min-height: 52px;
    font-size: 16px;
  }
}
`;

  document.head.appendChild(style);
}

function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target === "string") {
    const element = document.querySelector<HTMLElement>(target);
    if (!element) {
      throw new Error(`Target element "${target}" was not found.`);
    }
    return element;
  }

  return target;
}

function createVisitId(): string {
  return `visit-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function getAttemptStorageValue(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return fallbackAttemptStorage.get(key) ?? null;
  }
}

function setAttemptStorageValue(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    fallbackAttemptStorage.set(key, value);
  }
}

function removeAttemptStorageValue(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    fallbackAttemptStorage.delete(key);
  }
}

function getStoredResult<T>(key: string): T | null {
  const raw = getAttemptStorageValue(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function omitEmptyUtmFields(utm: PrizeWheelUtmData): PrizeWheelUtmData {
  return Object.fromEntries(
    Object.entries(utm).filter(([, value]) => typeof value === "string" && value.trim().length > 0)
  ) as PrizeWheelUtmData;
}

function collectUtmData(storageKey = DEFAULT_UTM_STORAGE_KEY): PrizeWheelUtmData {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = getStoredResult<PrizeWheelUtmData>(storageKey) ?? {};
  const searchParams = new URLSearchParams(window.location.search);
  const current = omitEmptyUtmFields({
    utmSource: searchParams.get("utm_source") ?? undefined,
    utmMedium: searchParams.get("utm_medium") ?? undefined,
    utmCampaign: searchParams.get("utm_campaign") ?? undefined,
    utmContent: searchParams.get("utm_content") ?? undefined,
    utmTerm: searchParams.get("utm_term") ?? undefined,
    utmId: searchParams.get("utm_id") ?? undefined,
    yclid: searchParams.get("yclid") ?? undefined,
    gclid: searchParams.get("gclid") ?? undefined,
    fbclid: searchParams.get("fbclid") ?? undefined
  });

  const merged = { ...stored, ...current };
  const normalized = omitEmptyUtmFields(merged);

  if (Object.keys(normalized).length > 0) {
    setAttemptStorageValue(storageKey, JSON.stringify(normalized));
  }

  return normalized;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeSector(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z"
  ].join(" ");
}

function createWheelSvg(prizes: PrizeWheelPrize[], theme: PrizeWheelTheme): string {
  const colors = prizes.map((prize, index) => prize.accentColor ?? theme.sectorColors[index % theme.sectorColors.length]);
  const total = prizes.length;
  const angleStep = 360 / total;
  const center = 300;
  const outerRadius = 284;
  const innerRadius = 88;

  const sectors = prizes
    .map((prize, index) => {
      const start = index * angleStep;
      const end = start + angleStep;
      const angle = start + angleStep / 2;
      const textRadius = 126;
      const coords = polarToCartesian(center, center, textRadius, angle);
      const rotation = angle - 90;
      const wheelLabel = prize.wheelLabel ?? prize.shortLabel ?? prize.label;
      const maxLength = prize.wheelLabel || prize.shortLabel ? 40 : 24;
      const label = wheelLabel.length > maxLength ? `${wheelLabel.slice(0, maxLength - 3)}...` : wheelLabel;
      const safeLabel = escapeHtml(label);
      const safeFullLabel = escapeHtml(prize.label);
      const safeHint = escapeHtml(prize.hint ?? "");
      const safePath = describeSector(center, center, outerRadius, innerRadius, start, end);

      return `
        <g class="pz-wheel__sector" data-label="${safeFullLabel}" data-hint="${safeHint}">
          <path d="${safePath}" fill="${colors[index]}" opacity="0.96"></path>
          <path d="${safePath}" fill="url(#ringGlow)" opacity="${index % 2 === 0 ? "0.12" : "0.06"}"></path>
          <text
            x="${coords.x}"
            y="${coords.y}"
            fill="#ffffff"
            font-size="${label.length > 28 ? "14" : "17"}"
            font-weight="700"
            text-anchor="start"
            dominant-baseline="middle"
            transform="rotate(${rotation}, ${coords.x}, ${coords.y})"
          >${safeLabel}</text>
        </g>
      `;
    })
    .join("");

  return `
    <svg class="pz-wheel__disc" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id="ringGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop>
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="294" fill="var(--pz-wheel-base)"></circle>
      <circle cx="300" cy="300" r="290" fill="#ffffff"></circle>
      ${sectors}
      <circle cx="300" cy="300" r="86" fill="var(--pz-wheel-center)"></circle>
      <circle cx="300" cy="300" r="282" fill="none" stroke="var(--pz-wheel-stroke)" stroke-width="8"></circle>
    </svg>
  `;
}

function choosePrize(prizes: PrizeWheelPrize[]): PrizeWheelPrize {
  const totalWeight = prizes.reduce((sum, prize) => sum + Math.max(prize.weight ?? 1, 0), 0);
  const threshold = Math.random() * totalWeight;
  let cursor = 0;

  for (const prize of prizes) {
    cursor += Math.max(prize.weight ?? 1, 0);
    if (threshold <= cursor) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}

function ensurePhonePrefix(value: string): string {
  if (!value.trim()) {
    return "+7";
  }

  return value;
}

function assertRequiredOptions(options: CreatePrizeWheelOptions): asserts options is CreatePrizeWheelOptions & {
  texts: PrizeWheelTexts;
  theme: PrizeWheelTheme;
  prizes: PrizeWheelPrizeInput[];
  rules: PrizeWheelRule[];
} {
  if (!options.texts) {
    throw new Error('Prize wheel initialization error: "texts" is required.');
  }

  for (const key of REQUIRED_TEXT_KEYS) {
    const value = options.texts[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Prize wheel initialization error: texts.${key} is required.`);
    }
  }

  if (!options.prizes?.length) {
    throw new Error('Prize wheel initialization error: "prizes" must contain at least one item.');
  }

  if (!options.rules?.length) {
    throw new Error('Prize wheel initialization error: "rules" must contain at least one item.');
  }

  if (!options.theme) {
    throw new Error('Prize wheel initialization error: "theme" is required.');
  }

  for (const key of REQUIRED_THEME_KEYS) {
    const value = options.theme[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Prize wheel initialization error: theme.${key} is required.`);
    }
  }

  if (!Array.isArray(options.theme.sectorColors) || options.theme.sectorColors.length === 0) {
    throw new Error('Prize wheel initialization error: theme.sectorColors must contain at least one color.');
  }
}

function buildThemeStyle(theme: PrizeWheelTheme): string {
  return [
    `--pz-bg:${theme.background}`,
    `--pz-card:${theme.cardBackground}`,
    `--pz-card-border:${theme.cardBorderColor}`,
    `--pz-text:${theme.textColor}`,
    `--pz-text-soft:${theme.textSoftColor}`,
    `--pz-accent:${theme.accentColor}`,
    `--pz-accent-strong:${theme.accentStrongColor}`,
      `--pz-shadow:${theme.shadowColor}`,
      `--pz-widget-border:${theme.widgetBorderColor}`,
      `--pz-backdrop-primary:${theme.backdropPrimaryColor}`,
      `--pz-backdrop-secondary:${theme.backdropSecondaryColor}`,
      `--pz-agreement-bg:${theme.agreementBackground}`,
      `--pz-agreement-border:${theme.agreementBorderColor}`,
    `--pz-input-border:${theme.inputBorderColor}`,
    `--pz-input-focus-border:${theme.inputFocusBorderColor}`,
    `--pz-input-focus-ring:${theme.inputFocusRingColor}`,
    `--pz-stage-border:${theme.stageBorderColor}`,
    `--pz-stage-start:${theme.stageGradientStart}`,
    `--pz-stage-mid:${theme.stageGradientMid}`,
    `--pz-stage-end:${theme.stageGradientEnd}`,
    `--pz-stage-glow:${theme.stageGlowColor}`,
    `--pz-pointer:${theme.pointerColor}`,
    `--pz-hub-bg:${theme.hubBackground}`,
    `--pz-hub-border:${theme.hubBorderColor}`,
    `--pz-hub-text:${theme.hubTextColor}`,
    `--pz-hub-subtext:${theme.hubSubtextColor}`,
    `--pz-claim-bg:${theme.claimBackground}`,
    `--pz-claim-border:${theme.claimBorderColor}`,
    `--pz-claim-shadow:${theme.claimShadowColor}`,
    `--pz-claim-title:${theme.claimTitleColor}`,
    `--pz-wheel-base:${theme.wheelBaseFill}`,
    `--pz-wheel-stroke:${theme.wheelOuterStrokeColor}`,
    `--pz-wheel-center:${theme.wheelCenterFill}`,
    `--pz-wheel-disc-shadow:${theme.wheelDiscShadowColor}`
  ].join(";");
}

function slugifyPrizeId(value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `prize-${index + 1}`;
}

function normalizePrize(input: PrizeWheelPrizeInput, index: number): PrizeWheelPrize {
  const fullLabel = input.label ?? input.fullLabel ?? input.title ?? input.name ?? input.text ?? `Приз ${index + 1}`;
  const shortLabel =
    input.shortLabel ??
    input.wheelLabel ??
    input.short ??
    input.shortTitle ??
    input.shortText ??
    input.displayLabel ??
    input.displayName;
  const hint = input.hint ?? input.details ?? input.description;

  return {
    id: input.id ?? slugifyPrizeId(fullLabel, index),
    label: fullLabel,
    hint,
    shortLabel,
    wheelLabel: shortLabel,
    crmComment: input.crmComment ?? input.comment ?? fullLabel,
    weight: input.weight,
    accentColor: input.accentColor
  };
}

function sendYandexMetrikaGoal(
  options: CreatePrizeWheelOptions["yandexMetrika"],
  goalKey: keyof NonNullable<CreatePrizeWheelOptions["yandexMetrika"]>["goals"],
  params?: Record<string, string>
): boolean {
  if (!options || typeof window === "undefined") {
    return false;
  }

  const ymFunction = (window as typeof window & { ym?: (...args: unknown[]) => void }).ym;
  if (typeof ymFunction !== "function") {
    return false;
  }

  const goalName = options.goals[goalKey];
  if (!goalName) {
    return false;
  }

  ymFunction(options.counterId, "reachGoal", goalName, params);
  return true;
}

export function createPrizeWheel(options: CreatePrizeWheelOptions): PrizeWheelInstance {
  ensureStyles();
  assertRequiredOptions(options);

  const target = resolveTarget(options.target);
  const prizes = options.prizes.map(normalizePrize);
  const rules = options.rules;
  const texts = options.texts;
  const theme = options.theme;
  const attemptStorageKey = options.attemptStorageKey ?? DEFAULT_ATTEMPT_STORAGE_KEY;
  const resultStorageKey = `${attemptStorageKey}-result`;
  const claimedStorageKey = `${attemptStorageKey}-claimed`;
  const nameStorageKey = `${attemptStorageKey}-name`;
  const utmStorageKey = `${attemptStorageKey}-${DEFAULT_UTM_STORAGE_KEY}`;
  const spinDurationMs = Math.min(Math.max(options.spinDurationMs ?? DEFAULT_SPIN_DURATION_MS, 2500), 5000);
  const yandexMetrika = options.yandexMetrika;
  const visitId = createVisitId();
  const rulesId = `pz-wheel-rules-${Math.random().toString(36).slice(2, 8)}`;
  const utm = collectUtmData(utmStorageKey);
  const modalTitle = "Список подарков";
  const modalOpenLabel = "Список подарков";

  target.innerHTML = `
    <section class="pz-wheel" data-component="proznanie-prize-wheel" style="${escapeHtml(buildThemeStyle(theme))}">
      <div class="pz-wheel__backdrop"></div>
        <div class="pz-wheel__layout">
          <div class="pz-wheel__content">
            <h2 class="pz-wheel__title">${escapeHtml(texts.title)}</h2>
            <div class="pz-wheel__participation">
              <div class="pz-wheel__actions">
                <label class="pz-wheel__agreement">
                  <input class="pz-wheel__checkbox" type="checkbox" />
                  <span class="pz-wheel__agreement-text">${escapeHtml(texts.agreementPrefix)} <a class="pz-wheel__agreement-link" href="#${rulesId}">${escapeHtml(texts.agreementLinkText)}</a></span>
                </label>
                <button class="pz-wheel__button" type="button" disabled>${escapeHtml(texts.startButtonLabel)}</button>
                <button class="pz-wheel__prizes-button" type="button" hidden aria-hidden="true" tabindex="-1"></button>
                <div class="pz-wheel__hint">${escapeHtml(texts.hint)}</div>
                <div class="pz-wheel__attempt" data-state="idle"></div>
              </div>
              <div class="pz-wheel__legal" id="${rulesId}">
                <h3 class="pz-wheel__legal-title">${escapeHtml(texts.legalTitle)}</h3>
                <ol class="pz-wheel__legal-list">
                ${rules
                  .map((rule) => `<li>${rule.html?.trim() ? rule.html : escapeHtml(rule.text)}</li>`)
                  .join("")}
              </ol>
            </div>
          </div>
          <div class="pz-wheel__claim" aria-live="polite">
            <p class="pz-wheel__claim-title">${escapeHtml(texts.claimTitle)}</p>
            <p class="pz-wheel__claim-prize"></p>
            <p class="pz-wheel__claim-hint"></p>
            <p class="pz-wheel__claim-text">${escapeHtml(texts.claimText)}</p>
            <div class="pz-wheel__claim-grid">
              <label class="pz-wheel__claim-field">
                <span class="pz-wheel__label">${escapeHtml(OPTIONAL_NAME_LABEL)}</span>
                <input class="pz-wheel__input pz-wheel__claim-name-input" type="text" autocomplete="name" placeholder="${escapeHtml(OPTIONAL_NAME_PLACEHOLDER)}" />
              </label>
              <label class="pz-wheel__claim-field">
                <span class="pz-wheel__label">${escapeHtml(texts.phoneLabel)}</span>
                <input class="pz-wheel__input pz-wheel__claim-input" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="${escapeHtml(texts.phonePlaceholder)}" />
              </label>
            </div>
            <div class="pz-wheel__claim-status" data-state="idle"></div>
            <button class="pz-wheel__button pz-wheel__claim-button" type="button">${escapeHtml(texts.claimButtonLabel)}</button>
          </div>
          <div class="pz-wheel__claim pz-wheel__claim--complete" aria-live="polite">
            <p class="pz-wheel__claim-title">${escapeHtml(texts.sessionCompleteTitle)}</p>
            <p class="pz-wheel__claim-prize"></p>
            <p class="pz-wheel__claim-hint"></p>
            <p class="pz-wheel__claim-text">${escapeHtml(texts.sessionCompleteText)}</p>
            <button class="pz-wheel__button pz-wheel__claim-button" type="button" disabled>${escapeHtml(texts.claimSentButtonLabel)}</button>
          </div>
        </div>
        <div class="pz-wheel__stage">
          <div class="pz-wheel__shell">
            <div class="pz-wheel__halo"></div>
            <button class="pz-wheel__prize-marquee" type="button" aria-label="${escapeHtml(modalOpenLabel)}">
              <span class="pz-wheel__prize-marquee-icon" aria-hidden="true">🎁</span>
              <span class="pz-wheel__prize-marquee-title">${escapeHtml(modalOpenLabel)}</span>
            </button>
            <div class="pz-wheel__pointer"></div>
            <div class="pz-wheel__tooltip" aria-hidden="true">
              <p class="pz-wheel__tooltip-label"></p>
              <p class="pz-wheel__tooltip-hint"></p>
            </div>
            <div class="pz-wheel__disc-wrap">
              ${createWheelSvg(prizes, theme)}
              <div class="pz-wheel__hub">
                <div>
                  <strong>${escapeHtml(texts.hubTitle)}</strong>
                  <span>${escapeHtml(texts.hubSubtitle)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pz-wheel__modal" aria-hidden="true">
          <div class="pz-wheel__modal-card" role="dialog" aria-modal="true" aria-label="${escapeHtml(modalTitle)}">
            <div class="pz-wheel__modal-header">
              <h3 class="pz-wheel__modal-title">${escapeHtml(modalTitle)}</h3>
              <button class="pz-wheel__modal-close" type="button" aria-label="Закрыть">×</button>
            </div>
            <div class="pz-wheel__modal-list">
              ${prizes
                .map(
                  (prize) => `
                    <article class="pz-wheel__modal-item">
                      <p class="pz-wheel__modal-item-title">${escapeHtml(prize.label)}</p>
                      ${prize.hint ? `<p class="pz-wheel__modal-item-hint">${escapeHtml(prize.hint)}</p>` : ""}
                    </article>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const rootNode = target.querySelector<HTMLElement>(".pz-wheel");
  const participationNode = target.querySelector<HTMLElement>(".pz-wheel__participation");
  const claimNodes = target.querySelectorAll<HTMLElement>(".pz-wheel__claim");
  const nameInputNode = target.querySelector<HTMLInputElement>(".pz-wheel__claim-name-input");
  const phoneInputNode = target.querySelector<HTMLInputElement>(".pz-wheel__claim-input");
  const agreementNode = target.querySelector<HTMLInputElement>(".pz-wheel__checkbox");
  const agreementLinkNode = target.querySelector<HTMLAnchorElement>(".pz-wheel__agreement-link");
  const spinButtonNode = target.querySelector<HTMLButtonElement>(".pz-wheel__button");
  const prizesButtonNode = target.querySelector<HTMLButtonElement>(".pz-wheel__prizes-button");
  const stagePrizesButtonNode = target.querySelector<HTMLButtonElement>(".pz-wheel__prize-marquee");
  const claimButtonNodes = target.querySelectorAll<HTMLButtonElement>(".pz-wheel__claim-button");
  const attemptNodeValue = target.querySelector<HTMLElement>(".pz-wheel__attempt");
  const discNode = target.querySelector<SVGElement>(".pz-wheel__disc");
  const claimPrizeNodes = target.querySelectorAll<HTMLElement>(".pz-wheel__claim-prize");
  const claimHintNodes = target.querySelectorAll<HTMLElement>(".pz-wheel__claim-hint");
  const legalNode = target.querySelector<HTMLElement>(".pz-wheel__legal");
  const shellNode = target.querySelector<HTMLElement>(".pz-wheel__shell");
  const tooltipNode = target.querySelector<HTMLElement>(".pz-wheel__tooltip");
  const tooltipLabelNode = target.querySelector<HTMLElement>(".pz-wheel__tooltip-label");
  const tooltipHintNode = target.querySelector<HTMLElement>(".pz-wheel__tooltip-hint");
  const claimStatusNode = target.querySelector<HTMLElement>(".pz-wheel__claim-status");
  const modalNode = target.querySelector<HTMLElement>(".pz-wheel__modal");
  const modalCardNode = target.querySelector<HTMLElement>(".pz-wheel__modal-card");
  const modalCloseNode = target.querySelector<HTMLButtonElement>(".pz-wheel__modal-close");
  const titleNode = target.querySelector<HTMLElement>(".pz-wheel__title");

  if (!rootNode || !participationNode || claimNodes.length < 2 || !nameInputNode || !phoneInputNode || !agreementNode || !agreementLinkNode || !spinButtonNode || !prizesButtonNode || !stagePrizesButtonNode || claimButtonNodes.length < 2 || !attemptNodeValue || !discNode || claimPrizeNodes.length < 2 || claimHintNodes.length < 2 || !legalNode || !shellNode || !tooltipNode || !tooltipLabelNode || !tooltipHintNode || !claimStatusNode || !modalNode || !modalCardNode || !modalCloseNode || !titleNode) {
    throw new Error("Prize wheel failed to initialize.");
  }

  const root = rootNode;
  const participation = participationNode;
  const claimPanel = claimNodes[0];
  const completedPanel = claimNodes[1];
  const nameInput = nameInputNode;
  const phoneInput = phoneInputNode;
  const agreementCheckbox = agreementNode;
  const agreementLink = agreementLinkNode;
  const spinButton = spinButtonNode;
  const prizesButton = prizesButtonNode;
  const stagePrizesButton = stagePrizesButtonNode;
  const claimButton = claimButtonNodes[0];
  const completedButton = claimButtonNodes[1];
  const attemptNode = attemptNodeValue;
  const disc = discNode;
  const claimPrizeNode = claimPrizeNodes[0];
  const completedPrizeNode = claimPrizeNodes[1];
  const claimHintNode = claimHintNodes[0];
  const completedHintNode = claimHintNodes[1];
  const legalBlock = legalNode;
  const shell = shellNode;
  const tooltip = tooltipNode;
  const tooltipLabel = tooltipLabelNode;
  const tooltipHint = tooltipHintNode;
  const claimStatus = claimStatusNode;
  const modal = modalNode;
  const modalCard = modalCardNode;
  const modalClose = modalCloseNode;
  const title = titleNode;

  let currentRotation = 0;
  let spinning = false;
  let hasSpun = getAttemptStorageValue(attemptStorageKey) === "1";
  let currentResult: PrizeWheelResult | null = getStoredResult<PrizeWheelResult>(resultStorageKey);
  let claiming = false;
  let claimed = getAttemptStorageValue(claimedStorageKey) === "1";
  let participantName = getAttemptStorageValue(nameStorageKey) ?? "";
  let agreementTracked = false;
  let phoneInputTracked = false;
  let viewTracked = false;
  let viewObserver: IntersectionObserver | null = null;
  let viewRetryTimer: number | null = null;

  function setAttemptMessage(message: string, state: "idle" | "error" = "idle"): void {
    attemptNode.textContent = message;
    attemptNode.dataset.state = state;
  }

  function setClaimStatus(message: string, state: "idle" | "error" = "idle"): void {
    claimStatus.textContent = message;
    claimStatus.dataset.state = state;
  }

  function setPrizeMeta(node: HTMLElement, prize: PrizeWheelPrize | null): void {
    node.textContent = prize?.hint ?? "";
    node.style.display = prize?.hint ? "block" : "none";
  }

  function hideTooltip(): void {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function showTooltip(label: string, hint: string, clientX: number, clientY: number): void {
    tooltipLabel.textContent = label;
    tooltipHint.textContent = hint;
    tooltipHint.style.display = hint ? "block" : "none";

    tooltip.style.left = "12px";
    tooltip.style.top = "12px";
    tooltip.classList.add("is-visible");

    const shellRect = shell.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = Math.min(Math.max(clientX - shellRect.left + 16, 12), shellRect.width - tooltipRect.width - 12);
    const top = Math.min(Math.max(clientY - shellRect.top - tooltipRect.height - 14, 12), shellRect.height - tooltipRect.height - 12);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.setAttribute("aria-hidden", "false");
  }

  function openPrizeModal(): void {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePrizeModal(): void {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      closePrizeModal();
    }
  }

  function focusClaimPanel(): void {
    claimPanel.classList.remove("is-focused");
    void claimPanel.offsetWidth;
    claimPanel.classList.add("is-focused");

    const rect = claimPanel.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top - Math.max(24, window.innerHeight * 0.12);
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    window.setTimeout(() => {
      claimPanel.classList.remove("is-focused");
    }, 1900);
  }

  function scrollToWidgetTitle(): void {
    const rect = title.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top - DEFAULT_SCROLL_TOP_OFFSET;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });
  }

  function trackViewIfNeeded(): void {
    if (viewTracked) {
      return;
    }

    const delivered = sendYandexMetrikaGoal(yandexMetrika, "view", {
      visit_id: visitId
    });

    if (!delivered) {
      if (viewRetryTimer === null && typeof window !== "undefined") {
        viewRetryTimer = window.setTimeout(() => {
          viewRetryTimer = null;
          trackViewIfNeeded();
        }, 800);
      }
      return;
    }

    viewTracked = true;

    if (viewObserver) {
      viewObserver.disconnect();
      viewObserver = null;
    }
  }

  function refreshButtonState(): void {
    const agreed = agreementCheckbox.checked;
    const valid = isPhoneValid(phoneInput.value);
    spinButton.disabled = !agreed || spinning || hasSpun;
    claimButton.disabled = claiming || claimed || !currentResult || !valid;
    completedButton.disabled = true;

    if (hasSpun) {
      setAttemptMessage("");
      if (!phoneInput.value || phoneInput.value === "+7") {
        setClaimStatus("");
        return;
      }

      if (!valid) {
        setClaimStatus(texts.invalidPhoneMessage, "error");
        return;
      }

      setClaimStatus(texts.readyMessage);
      return;
    }

    if (!agreed) {
      setAttemptMessage("");
      return;
    }

    setAttemptMessage(texts.readyMessage);
  }

  async function emitLead(result: PrizeWheelResult): Promise<void> {
    const leadTitle =
      typeof options.leadTitle === "function"
        ? options.leadTitle(result)
        : options.leadTitle ?? `Колесо ПроЗнаний — ${result.prize.label}`;
    const payload: PrizeWheelLeadPayload = {
      ...result,
      leadTitle,
      leadName: participantName.trim() || texts.leadName,
      comment: result.prize.crmComment ?? result.prize.label
    };

    if (options.onLead) {
      await options.onLead(payload);
    }

    root.dispatchEvent(
      new CustomEvent<PrizeWheelLeadPayload>("prizewheel:lead", {
        detail: payload
      })
    );
  }

  async function claimPrize(): Promise<void> {
    if (!currentResult || claiming) {
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneInput.value);
    if (!isPhoneValid(normalizedPhone)) {
      setClaimStatus(texts.invalidPhoneMessage, "error");
      refreshButtonState();
      return;
    }

    claiming = true;
    refreshButtonState();

    try {
      currentResult = {
        ...currentResult,
        phone: normalizedPhone,
        formattedPhone: formatPhoneDisplay(normalizedPhone)
      };
      setAttemptStorageValue(resultStorageKey, JSON.stringify(currentResult));
      await emitLead(currentResult);
      sendYandexMetrikaGoal(yandexMetrika, "claim", {
        prize_id: currentResult.prize.id,
        prize_label: currentResult.prize.label,
        visit_id: currentResult.visitId
      });
      claimed = true;
      setAttemptStorageValue(claimedStorageKey, "1");
      claimButton.textContent = texts.claimSentButtonLabel;
      claimButton.disabled = true;
      claimPanel.classList.remove("is-visible");
      completedPrizeNode.textContent = currentResult.prize.label;
      setPrizeMeta(completedHintNode, currentResult.prize);
      completedPanel.classList.add("is-visible");
      window.setTimeout(() => {
        scrollToWidgetTitle();
      }, 40);
    } finally {
      claiming = false;
      refreshButtonState();
    }
  }

  async function spin(): Promise<PrizeWheelResult | null> {
    if (spinning || hasSpun || !agreementCheckbox.checked) {
      if (!agreementCheckbox.checked) {
        setAttemptMessage(texts.agreementRequiredMessage, "error");
      }
      refreshButtonState();
      return null;
    }

    spinning = true;
    hasSpun = true;
    setAttemptStorageValue(attemptStorageKey, "1");
    sendYandexMetrikaGoal(yandexMetrika, "spinStart", {
      visit_id: visitId
    });
    refreshButtonState();

    const prize = choosePrize(prizes);
    const prizeIndex = prizes.findIndex((item) => item.id === prize.id);
    const segmentAngle = 360 / prizes.length;
    const prizeCenterAngle = prizeIndex * segmentAngle + segmentAngle / 2;
    const fullTurns = 5 + Math.floor(Math.random() * 2);
    const pointerAngle = 90;
    const landingAngle = pointerAngle - prizeCenterAngle;
    const intraSegmentOffset = Math.max(segmentAngle * 0.35, 6);
    currentRotation += fullTurns * 360 + landingAngle + (Math.random() * intraSegmentOffset - intraSegmentOffset / 2);
    disc.style.transitionDuration = `${spinDurationMs}ms`;
    disc.style.transform = `rotate(${currentRotation}deg)`;

    await new Promise((resolve) => {
      window.setTimeout(resolve, spinDurationMs + 40);
    });

    const result: PrizeWheelResult = {
      prize,
      phone: "",
      formattedPhone: "",
      visitId,
      spunAt: new Date().toISOString(),
      utm
    };

    currentResult = result;
    claimed = false;
    setAttemptStorageValue(resultStorageKey, JSON.stringify(result));
    claimButton.textContent = texts.claimButtonLabel;
    claimPrizeNode.textContent = prize.label;
    setPrizeMeta(claimHintNode, prize);
    nameInput.value = participantName;
    phoneInput.value = "+7";
    setClaimStatus("");
    participation.classList.add("is-hidden");
    completedPanel.classList.remove("is-visible");
    claimPanel.classList.add("is-visible");
    focusClaimPanel();
    spinning = false;
    if (options.onResult) {
      await options.onResult(result);
    }
    refreshButtonState();
    return result;
  }

  nameInput.value = participantName;
  nameInput.addEventListener("input", () => {
    participantName = nameInput.value.trim();
    if (participantName) {
      setAttemptStorageValue(nameStorageKey, participantName);
    } else {
      removeAttemptStorageValue(nameStorageKey);
    }
  });

  phoneInput.value = options.initialPhone ? ensurePhonePrefix(options.initialPhone) : "+7";
  phoneInput.addEventListener("input", () => {
    if (!phoneInputTracked && phoneInput.value.replace(/\D/g, "").length > 1) {
      phoneInputTracked = true;
      sendYandexMetrikaGoal(yandexMetrika, "phoneInputStart", {
        visit_id: visitId
      });
    }

    if (!phoneInput.value) {
      phoneInput.value = "+7";
      phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
    }
    refreshButtonState();
  });

  phoneInput.addEventListener("focus", () => {
    phoneInput.value = ensurePhonePrefix(phoneInput.value);
    phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
    refreshButtonState();
  });

  phoneInput.addEventListener("blur", () => {
    const normalized = normalizePhoneNumber(phoneInput.value);
    if (isPhoneValid(normalized)) {
      phoneInput.value = formatPhoneDisplay(normalized);
    } else if (!phoneInput.value.trim() || phoneInput.value === "+7") {
      phoneInput.value = "+7";
    }
    refreshButtonState();
  });

  agreementCheckbox.addEventListener("change", () => {
    if (agreementCheckbox.checked && !agreementTracked) {
      agreementTracked = true;
      sendYandexMetrikaGoal(yandexMetrika, "agreementCheck", {
        visit_id: visitId
      });
    }

    refreshButtonState();
  });

  agreementLink.addEventListener("click", (event) => {
    event.preventDefault();
    legalBlock.classList.toggle("is-visible");
    if (legalBlock.classList.contains("is-visible")) {
      legalBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  prizesButton.addEventListener("click", () => {
    openPrizeModal();
  });

  stagePrizesButton.addEventListener("click", () => {
    openPrizeModal();
  });

  modalClose.addEventListener("click", () => {
    closePrizeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePrizeModal();
    }
  });

  modalCard.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("keydown", handleDocumentKeydown);

  spinButton.addEventListener("click", () => {
    void spin();
  });

  claimButton.addEventListener("click", () => {
    void claimPrize();
  });

  disc.addEventListener("mousemove", (event) => {
    const targetNode = event.target as HTMLElement | null;
    const sectorNode = targetNode?.closest(".pz-wheel__sector") as HTMLElement | null;

    if (!sectorNode) {
      hideTooltip();
      return;
    }

    showTooltip(sectorNode.dataset.label ?? "", sectorNode.dataset.hint ?? "", event.clientX, event.clientY);
  });

  disc.addEventListener("mouseleave", () => {
    hideTooltip();
  });

  if (hasSpun) {
    participation.classList.add("is-hidden");
    if (currentResult) {
      claimPrizeNode.textContent = currentResult.prize.label;
      completedPrizeNode.textContent = currentResult.prize.label;
      setPrizeMeta(claimHintNode, currentResult.prize);
      setPrizeMeta(completedHintNode, currentResult.prize);
      nameInput.value = participantName;
      phoneInput.value = currentResult.formattedPhone || currentResult.phone || options.initialPhone || "+7";
      if (claimed) {
        completedPanel.classList.add("is-visible");
        claimPanel.classList.remove("is-visible");
      } else {
        claimPanel.classList.add("is-visible");
        completedPanel.classList.remove("is-visible");
      }
    } else {
      completedPrizeNode.textContent = texts.sessionCompleteUnknownPrize;
      setPrizeMeta(claimHintNode, null);
      setPrizeMeta(completedHintNode, null);
      completedPanel.classList.add("is-visible");
    }
  }

  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    viewObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            trackViewIfNeeded();
            break;
          }
        }
      },
      {
        threshold: [0.35]
      }
    );

    viewObserver.observe(root);
  } else {
    trackViewIfNeeded();
  }

  refreshButtonState();

  return {
    destroy() {
      if (viewRetryTimer !== null) {
        window.clearTimeout(viewRetryTimer);
        viewRetryTimer = null;
      }
      if (viewObserver) {
        viewObserver.disconnect();
        viewObserver = null;
      }
      document.removeEventListener("keydown", handleDocumentKeydown);
      document.body.style.overflow = "";
      target.innerHTML = "";
    },
    resetAttempt() {
      removeAttemptStorageValue(attemptStorageKey);
      removeAttemptStorageValue(resultStorageKey);
      removeAttemptStorageValue(claimedStorageKey);
      removeAttemptStorageValue(nameStorageKey);
      removeAttemptStorageValue(utmStorageKey);
      hasSpun = false;
      currentResult = null;
      claiming = false;
      claimed = false;
      participantName = "";
      agreementTracked = false;
      phoneInputTracked = false;
      viewTracked = false;
      if (viewRetryTimer !== null) {
        window.clearTimeout(viewRetryTimer);
        viewRetryTimer = null;
      }
      if (viewObserver) {
        viewObserver.disconnect();
        viewObserver = null;
      }
      claimButton.textContent = texts.claimButtonLabel;
      participation.classList.remove("is-hidden");
      claimPanel.classList.remove("is-visible");
      completedPanel.classList.remove("is-visible");
      completedPrizeNode.textContent = "";
      claimPrizeNode.textContent = "";
      claimHintNode.textContent = "";
      claimHintNode.style.display = "none";
      completedHintNode.textContent = "";
      completedHintNode.style.display = "none";
      agreementCheckbox.checked = false;
      nameInput.value = "";
      phoneInput.value = "+7";
      setClaimStatus("");
      closePrizeModal();
      hideTooltip();
      refreshButtonState();

      if (typeof window !== "undefined" && "IntersectionObserver" in window) {
        viewObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                trackViewIfNeeded();
                break;
              }
            }
          },
          {
            threshold: [0.35]
          }
        );

        viewObserver.observe(root);
      } else {
        trackViewIfNeeded();
      }
    },
    updatePhone(value: string) {
      phoneInput.value = value ? ensurePhonePrefix(value) : "+7";
      refreshButtonState();
    },
    spin,
    getState() {
      return {
        canSpin: !spinButton.disabled,
        hasSpun,
        phone: phoneInput.value
      };
    }
  };
}
