import Adw from "gi://Adw";
import Gdk from "gi://Gdk";
import type Gio from "gi://Gio";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import { Icons } from "../lib/icons.js";

import { getTemplate } from "../utils/getTemplate.js";
import {
    type ExtensionMetadata,
    makeBugReportUrl,
} from "../utils/issue-report.js";

export interface Credit {
    title: string;
    subtitle: string;
    github?: string; // Optional GitHub username
}

export const CREDITS: Credit[] = [
    {
        title: "Dagim G. Astatkie",
        subtitle: "Original Author",
        github: "dagimg-dot",
    },
    {
        title: "Fernando Carletti",
        subtitle: "Contributor",
        github: "fernandocarletti",
    },
    {
        title: "Tommy Brunn",
        subtitle: "Contributor",
        github: "Nevon",
    },
    {
        title: "Yuriy Matskanyuk",
        subtitle: "Contributor",
        github: "SiriusCrain",
    },
    {
        title: "Noa Virellia",
        subtitle: "Contributor",
        github: "AsterisMono",
    },
    {
        title: "Andrei Zvonimir Crnković",
        subtitle: "Contributor",
        github: "andreicek",
    },
    {
        title: "John Niang",
        subtitle: "Contributor",
        github: "JohnNiang",
    },
    {
        title: "nothingrotf",
        subtitle: "Contributor",
        github: "nothingrotf",
    },
    {
        title: "abdssamie",
        subtitle: "Contributor",
        github: "Abdssamie",
    },
    {
        title: "Matheus Inácio",
        subtitle: "Contributor",
        github: "matheus-inacio",
    },
];

const LICENSE = `MIT License

Copyright (c) 2025 Dagim G. Astatkie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export const AboutPage = GObject.registerClass(
    {
        GTypeName: "VicinaeAboutPage",
        Template: getTemplate("AboutPage"),
        InternalChildren: [
            "extensionIcon",
            "extensionName",
            "extensionVersion",
            "linkWebsite",
            "linkIssues",
            "creditsRow",
            "legalRow",
            "extensionLicense",
        ],
    },
    class AboutPage extends Adw.PreferencesPage {
        declare _extensionIcon: Gtk.Image;
        declare _extensionName: Gtk.Label;
        declare _extensionVersion: Gtk.Label;
        declare _linkWebsite: Gtk.Button;
        declare _linkIssues: Gtk.Button;
        declare _creditsRow: Adw.ExpanderRow;
        declare _legalRow: Adw.ExpanderRow;
        declare _extensionLicense: Gtk.TextView;

        setMetadata(metadata: ExtensionMetadata) {
            // biome-ignore lint/style/noNonNullAssertion: path is always provided by GNOME Shell
            Icons.load(metadata.path!);

            const vicinaeIcon = Icons.get("vicinae") as Gio.Icon;

            this._extensionIcon.set_from_gicon(vicinaeIcon);

            this._extensionName.set_text(metadata.name);
            this._extensionVersion.set_text(
                `v${metadata["version-name"] || metadata.version}${__VICINAE_ENV_SUFFIX__ ?? ""}`,
            );

            if (metadata.url) {
                this._linkWebsite.connect("clicked", () => {
                    Gtk.show_uri(null, metadata.url || "", Gdk.CURRENT_TIME);
                });
                this._linkIssues.connect("clicked", async () => {
                    const issueUrl = await makeBugReportUrl(metadata);
                    Gtk.show_uri(null, issueUrl, Gdk.CURRENT_TIME);
                });
            } else {
                this._linkWebsite.visible = false;
                this._linkIssues.visible = false;
            }

            this._extensionLicense.buffer.set_text(LICENSE, -1);

            // biome-ignore lint/style/noNonNullAssertion: path is always provided by GNOME Shell
            this.renderCredits(metadata.path!);
        }

        private renderCredits(path: string) {
            const creditsExpander = this._creditsRow;

            CREDITS.forEach((credit) => {
                const creditRow = new Adw.ActionRow({
                    title: credit.title,
                    subtitle: credit.subtitle,
                });

                // Add GitHub icon if username is available
                if (credit.github) {
                    Icons.load(path);
                    const githubIcon = Icons.get("github") as Gio.Icon;

                    creditRow.add_suffix(
                        new Gtk.Image({
                            gicon: githubIcon,
                            pixel_size: 16,
                        }),
                    );

                    // Make the row clickable
                    creditRow.set_activatable(true);
                    creditRow.connect("activated", () => {
                        this.openGitHubProfile(credit.github);
                    });
                }

                creditsExpander.add_row(creditRow);
            });
        }

        private openGitHubProfile(githubUsername: string | undefined) {
            if (!githubUsername) return;

            const githubUrl = `https://github.com/${githubUsername}`;
            try {
                Gtk.show_uri(null, githubUrl, Gdk.CURRENT_TIME);
            } catch (error) {
                console.error("Failed to open GitHub profile:", error);
            }
        }
    },
);
