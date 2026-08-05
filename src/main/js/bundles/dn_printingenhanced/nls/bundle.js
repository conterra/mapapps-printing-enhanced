/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
    root: {
        bundleName: "Printing Enhanced Bundle",
        bundleDescription: "This bundle extends Printing bundle.",
        windowTitle: "Printing",
        tool: {
            title: "Printing",
            tooltip: "Printing"
        },
        unexpectedError: "Ein Fehler ist aufgetreten.",
        ui: {
            print: "Print",
            layoutTab: "Einzelkarten",
            mapOnlyTab: "Map Only",
            cancelPrint: "Druck abbrechen",
            mapSeriesTab: "Serie",
            doNotPrintEmptyTilesLabel: "Nicht genutzte Kacheln auslassen",
            layout: "Layout",
            format: "Format",
            title: "Title",
            titlePlaceholder: "Print title",
            file: "File name",
            filePlaceholder: "File name",
            author: "Author",
            authorPlaceholder: "Author",
            copyright: "Copyright",
            copyrightPlaceholder: "Copyright",
            width: "Width",
            height: "Height",
            rotatePrintFrame: "Rotate print frame",
            scale: "Scale",
            scaleEnabled: "Set scale",
            legendEnabled: "Enable legend",
            attributionEnabled: "Enable attribution",
            dpi: "Quality",
            showPrintPreview: "Show print preview",
            printResults: "Results",
            printResultLoading: "Print result is loading",
            printError: "An error occurred while loading the print result",
            printResultAvailable: ": print result is available",
            noPrintResults: "No print results",
            errors: {
                scaleTooSmall: "Der Druck-Maßstab ist zu klein",
                mapSeriesScaleToLow: "Der aktuelle Maßstab ist zu groß. Minimum ist 1:",
                filterEmptyTilesError: "Beim Ermitteln der nicht genutzten Kacheln ist ein Fehler aufgetreten.",
                tooManyFrames: "Es werden zu viele Kacheln erzeugt. Es können maximal 1000 Kacheln erzeugt werden.",
                error: "Error during printing: ",
                unknown: "Printing: An unknown error occurred!",
                code403: "Printing: The configured printing service URL has to be in your proxy whitelist!",
                code404: "Printing: The printing service could not be resolved for the configured URL!"
            },
            layouts: {
                "a3-landscape": "A3 Landscape",
                "a3-portrait": "A3 Portrait",
                "a4-landscape": "A4 Landscape",
                "a4-portrait": "A4 Portrait",
                "letter-ansi-a-landscape": "Letter ANSI A Landscape",
                "letter-ansi-a-portrait": "Letter ANSI A Portrait",
                "tabloid-ansi-b-landscape": "Tabloid ANSI B Landscape",
                "tabloid-ansi-b-portrait": "Tabloid ANSI B Portrait"
            },
            low: "Low",
            medium: "Medium",
            high: "High",
            graphicsLayerTitle: "Printing Preview",
            helperTextScaleEnabled: "Print preview can only be displayed if a scale is set.",
            portraitLabel: "Portrait",
            landscapeLabel: "Landscape",
            legendNameIfNoneIsGiven: "untitled",
            notReadyForMapSeriesPrint: "Es sind nicht alle Voraussetzungen für den Kartenseriendruck gegeben.",
            askToPrintMessage: "Der Serien-Druck wurde so konfiguriert, dass sehr viele Kacheln gedruckt werden sollen. Dadurch kann der Vorgang sehr lange dauern. Sind Sie sich sicher, dass so viele Kacheln gedruckt werden sollen? <br><br> Anzahl der Kacheln, die gedruckt werden: ",
            askToPrintTitle: "Druck vieler Karten bestätigen",
            couldNotDetermineMapSeriesRequests: "Problem bei der Ermittlung der Kartenserienanfragen aufgetreten.",
            mapSeriesRequestsInvalid: "Kartenserien-Anfragen ungültig oder nicht vorhanden.",
            mapSeriesSubHeader: "Kartenserien",
            singlePrintSubHeader: "Einzelkarten",
            selectGeometryToolToolTip: "Druck-Rahmen auf Basis der Geometrie eines Objektes erstellen",
            drawRectangleToolToolTip: "Druck-Rahmen als Rechteck erstellen",
            extentToolToolTip: "Kartenausschnitt als Druck-Rahmen verwenden",
            label_selectGeometry1: "Geometrie",
            label_selectGeometry2: "auswählen",
            label_drawRectangle1: "Rechteck",
            label_drawRectangle2: "einzeichnen",
            label_currentExtent1: "Aktueller",
            label_currentExtent2: "Kartenausschnitt",
            tileCalculationOngoing: "Nicht genutzte Kacheln werden berechnet."
        }
    },
    de: true
};
