/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
    bundleName: "Printing Bundle Erweiterung",
    bundleDescription: "Dieses Bundle erweitert das Drucken über das Printing Bundle.",
    windowTitle: "Drucken",
    tool: {
        title: "Drucken",
        tooltip: "Drucken"
    },
    ui: {
        print: "Drucken",
        layoutTab: "Einstellungen",
        mapOnlyTab: "Nur Karte",
        layout: "Layout",
        format: "Dateiformat",
        title: "Titel",
        titlePlaceholder: "Titel des Drucks",
        file: "Dateiname",
        filePlaceholder: "Dateiname",
        author: "Autor",
        authorPlaceholder: "Autor",
        copyright: "Urheberrecht",
        copyrightPlaceholder: "Urheberrecht",
        width: "Breite",
        height: "Höhe",
        scale: "Maßstab",
        scaleEnabled: "Maßstab festlegen",
        legendEnabled: "Legende einbeziehen",
        attributionEnabled: "Quellennachweis einfügen",
        dpi: "Qualität",
        showPrintPreview: "Druckrahmen anzeigen",
        printResults: "Ergebnisse",
        noPrintResults: "Keine Druckergebnisse vorhanden",
        errors: {
            unknown: "Drucken: Ein unbekannter Fehler ist aufgetreten!",
            code403: "Drucken: Die konfigurierte Print-Service URL muss in ihrem Proxy als erlaubt deklariert sein!",
            code404: "Drucken: Es konnte kein Print-Service f\u00FCr die angegebene URL gefunden werden!"
        },
        layouts: {
            "a3-landscape": "A3 Querformat",
            "a3-portrait": "A3 Hochformat",
            "a4-landscape": "A4 Querformat",
            "a4-portrait": "A4 Hochformat",
            "letter-ansi-a-landscape": "Letter ANSI A Querformat",
            "letter-ansi-a-portrait": "Letter ANSI A Hochformat",
            "tabloid-ansi-b-landscape": "Tabloid ANSI B Querformat",
            "tabloid-ansi-b-portrait": "Tabloid ANSI B Hochformat"
        },
        low: "Niedrig",
        medium: "Mittel",
        high: "Hoch",
        graphicsLayerTitle: "Druckvorschau",
        helperTextScaleEnabled: "Der Druckrahmen kann nur angezeigt werden, wenn ein Maßstab festgelegt ist."
    }
};
