/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
        print: "Exportieren",
        layout: "Layout",
        format: "Dateiformat",
        onlyMap: "Nur Karte",
        title: "Titel",
        titlePlaceholder: "Titel des Drucks",
        file: "Datei",
        filePlaceholder: "Dateiname",
        author: "Autor",
        authorPlaceholder: "Autor",
        copyright: "Urheberrecht",
        copyrightPlaceholder: "Urheberrecht",
        width: "Breite",
        height: "Höhe",
        advancedOptions: "Erweiterte Optionen anzeigen",
        scale: "Maßstab",
        scaleEnabled: "Maßstab festlegen",
        legendEnabled: "Legende einbeziehen",
        dpi: "DPI",
        errors: {
            unknown: "ArcGIS Server Drucken: Ein unbekannter Fehler ist aufgetreten!",
            code403: "ArcGIS Server Drucken: Die konfigurierte Print-Service URL muss in ihrem Proxy als erlaubt deklariert sein!",
            code404: "ArcGIS Server Drucken: Es konnte kein Print-Service f\u00FCr die angegebene URL gefunden werden!"
        }
    }
};
