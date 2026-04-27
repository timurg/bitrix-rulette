export interface PrizeWheelPrize {
  id: string;
  label: string;
  hint?: string;
  shortLabel?: string;
  wheelLabel?: string;
  crmComment?: string;
  weight?: number;
  accentColor?: string;
}

export interface PrizeWheelPrizeInput {
  id?: string;
  label?: string;
  hint?: string;
  details?: string;
  description?: string;
  shortLabel?: string;
  fullLabel?: string;
  wheelLabel?: string;
  short?: string;
  shortTitle?: string;
  shortText?: string;
  displayLabel?: string;
  displayName?: string;
  title?: string;
  name?: string;
  text?: string;
  crmComment?: string;
  comment?: string;
  weight?: number;
  accentColor?: string;
}

export interface PrizeWheelRule {
  id: string;
  text: string;
  html?: string;
}

export interface PrizeWheelTexts {
  title: string;
  agreementPrefix: string;
  agreementLinkText: string;
  phoneLabel: string;
  phonePlaceholder: string;
  hint: string;
  startButtonLabel: string;
  legalTitle: string;
  claimTitle: string;
  claimText: string;
  claimButtonLabel: string;
  claimSentButtonLabel: string;
  sessionCompleteTitle: string;
  sessionCompleteText: string;
  sessionCompleteUnknownPrize: string;
  hubTitle: string;
  hubSubtitle: string;
  invalidPhoneMessage: string;
  agreementRequiredMessage: string;
  readyMessage: string;
  leadName: string;
}

export interface PrizeWheelTheme {
  background: string;
  cardBackground: string;
  cardBorderColor: string;
  textColor: string;
  textSoftColor: string;
  accentColor: string;
  accentStrongColor: string;
  shadowColor: string;
  widgetBorderColor: string;
  backdropPrimaryColor: string;
  backdropSecondaryColor: string;
  agreementBackground: string;
  agreementBorderColor: string;
  inputBorderColor: string;
  inputFocusBorderColor: string;
  inputFocusRingColor: string;
  stageBorderColor: string;
  stageGradientStart: string;
  stageGradientMid: string;
  stageGradientEnd: string;
  stageGlowColor: string;
  pointerColor: string;
  hubBackground: string;
  hubBorderColor: string;
  hubTextColor: string;
  hubSubtextColor: string;
  claimBackground: string;
  claimBorderColor: string;
  claimShadowColor: string;
  claimTitleColor: string;
  wheelBaseFill: string;
  wheelOuterStrokeColor: string;
  wheelCenterFill: string;
  wheelDiscShadowColor: string;
  sectorColors: string[];
}

export interface PrizeWheelUtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  utmId?: string;
  yclid?: string;
  gclid?: string;
  fbclid?: string;
}

export interface PrizeWheelResult {
  prize: PrizeWheelPrize;
  phone: string;
  formattedPhone: string;
  visitId: string;
  spunAt: string;
  utm: PrizeWheelUtmData;
}

export interface PrizeWheelLeadPayload extends PrizeWheelResult {
  leadTitle: string;
  leadName: string;
  comment: string;
}

export interface PrizeWheelYandexMetrikaGoals {
  view: string;
  agreementCheck: string;
  phoneInputStart: string;
  spinStart: string;
  claim: string;
}

export interface PrizeWheelYandexMetrikaOptions {
  counterId: number;
  goals: PrizeWheelYandexMetrikaGoals;
}

export interface CreatePrizeWheelOptions {
  target: string | HTMLElement;
  texts?: PrizeWheelTexts;
  theme?: PrizeWheelTheme;
  prizes?: PrizeWheelPrizeInput[];
  rules?: PrizeWheelRule[];
  yandexMetrika?: PrizeWheelYandexMetrikaOptions;
  attemptStorageKey?: string;
  leadTitle?: string | ((result: PrizeWheelResult) => string);
  initialPhone?: string;
  spinDurationMs?: number;
  onLead?: (payload: PrizeWheelLeadPayload) => void | Promise<void>;
  onResult?: (result: PrizeWheelResult) => void | Promise<void>;
}

export interface PrizeWheelInstance {
  destroy: () => void;
  resetAttempt: () => void;
  updatePhone: (value: string) => void;
  spin: () => Promise<PrizeWheelResult | null>;
  getState: () => {
    canSpin: boolean;
    hasSpun: boolean;
    phone: string;
  };
}
