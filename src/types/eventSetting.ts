export interface EventSettingSpec {
  groupRegistrationEnabled: boolean;
  individualLoginIdEnabled: boolean;
}

export const DEFAULT_EVENT_SETTING: EventSettingSpec = {
  groupRegistrationEnabled: true,
  individualLoginIdEnabled: true,
};
