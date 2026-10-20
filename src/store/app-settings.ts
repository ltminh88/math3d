import { readLegacySettings } from './legacy-settings-defaults';
import { createSettingsStore, defaultStorage } from './settings-store';

/**
 * The one settings source of the app (language, sound, music, quest card, quality...). The
 * legacy translator, i18n, HUD and settings dialog all read and write it. First boot on an origin
 * that has a legacy save picks the old values up without writing anything.
 */
export const appSettings = createSettingsStore(defaultStorage(), readLegacySettings);
