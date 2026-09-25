import Adw from "gi://Adw";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import type Gtk from "gi://Gtk";
import { getTemplate } from "../utils/getTemplate.js";
import { DEFAULT_LOG_LEVEL, LOGGING_LEVELS, logger } from "../utils/logger.js";

const LOGS_COMMAND = 'journalctl --user -n 50 -g "Vicinae"';

export const GeneralPage = GObject.registerClass(
    {
        GTypeName: "VicinaeGeneralPage",
        Template: getTemplate("GeneralPage"),
        InternalChildren: [
            "showStatusIndicator",
            "loggingLevel",
            "launcherAutoCloseFocusLoss",
            "launcherAppClass",
            "journalctlRow",
            "copyLogsCommandButton",
        ],
    },
    class GeneralPage extends Adw.PreferencesPage {
        private settings!: Gio.Settings;

        declare _showStatusIndicator: Adw.SwitchRow;
        declare _loggingLevel: Adw.ComboRow;
        declare _launcherAutoCloseFocusLoss: Adw.SwitchRow;
        declare _launcherAppClass: Adw.EntryRow;
        declare _journalctlRow: Adw.ActionRow;
        declare _copyLogsCommandButton: Gtk.Button;

        bindSettings(settings: Gio.Settings) {
            this.settings = settings;
            logger.debug("Settings bound to GeneralPage");

            this.bindShowStatusIndicator(settings);
            this.bindLoggingLevel(settings);
            this.bindLauncherAutoCloseFocusLoss(settings);
            this.bindLauncherAppClass(settings);
            this.bindCopyLogsCommand();
        }

        private bindCopyLogsCommand() {
            this._copyLogsCommandButton.connect("clicked", () => {
                const display = Gdk.Display.get_default();
                display?.get_clipboard()?.set(LOGS_COMMAND);

                this._copyLogsCommandButton.set_icon_name(
                    "object-select-symbolic",
                );

                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
                    this._copyLogsCommandButton.set_icon_name(
                        "edit-copy-symbolic",
                    );
                    return GLib.SOURCE_REMOVE;
                });
            });
        }

        /** `show-status-indicator` ↔ status indicator switch. */
        private bindShowStatusIndicator(settings: Gio.Settings) {
            settings.bind(
                "show-status-indicator",
                this._showStatusIndicator,
                "active",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }

        /** `logging-level` ↔ logging ComboRow (not a direct GSettings bind). */
        private bindLoggingLevel(settings: Gio.Settings) {
            const row = this._loggingLevel;
            const currentLevel = settings.get_string("logging-level");
            const currentIndex = (LOGGING_LEVELS as readonly string[]).indexOf(
                currentLevel,
            );
            const defaultIndex = LOGGING_LEVELS.indexOf(DEFAULT_LOG_LEVEL);

            row.set_selected(currentIndex >= 0 ? currentIndex : defaultIndex);

            row.connect("notify::selected", () => {
                const selectedIndex = row.get_selected();
                if (
                    selectedIndex >= 0 &&
                    selectedIndex < LOGGING_LEVELS.length
                ) {
                    settings.set_string(
                        "logging-level",
                        LOGGING_LEVELS[selectedIndex],
                    );
                }
            });
        }

        /** `launcher-auto-close-focus-loss` ↔ auto-close switch. */
        private bindLauncherAutoCloseFocusLoss(settings: Gio.Settings) {
            settings.bind(
                "launcher-auto-close-focus-loss",
                this._launcherAutoCloseFocusLoss,
                "active",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }

        /** `launcher-app-class` ↔ launcher WM class entry. */
        private bindLauncherAppClass(settings: Gio.Settings) {
            settings.bind(
                "launcher-app-class",
                this._launcherAppClass,
                "text",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }
    },
);
