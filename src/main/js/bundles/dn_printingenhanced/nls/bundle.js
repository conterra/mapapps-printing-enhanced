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
        unexpectedError: "An error has occurred.",
        ui: {
            print: "Print",
            layoutTab: "Single Maps",
            mapOnlyTab: "Map Only",
            cancelPrint: "Cancel print",
            mapSeriesTab: "Series",
            doNotPrintEmptyTilesLabel: "Skip unused tiles",
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
                scaleTooSmall: "The print scale is too small",
                mapSeriesScaleToLow: "The current scale is too large. Minimum is 1:",
                filterEmptyTilesError: "An error occurred while determining the unused tiles.",
                tooManyFrames: "Too many tiles are being generated. A maximum of 1000 tiles can be generated.",
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
            contentLabel: "Content-Text",
            editLabel: "Edit-Text",
            legendNameIfNoneIsGiven: "untitled",
            notReadyForMapSeriesPrint: "Not all prerequisites for map series printing are met.",
            askToPrintMessage: "The map series print has been configured to print a very large number of tiles. This may take a very long time. Are you sure you want to print this many tiles? <br><br> Number of tiles to be printed: ",
            askToPrintTitle: "Confirm printing of many maps",
            couldNotDetermineMapSeriesRequests: "A problem occurred while determining the map series requests.",
            mapSeriesRequestsInvalid: "Map series requests are invalid or missing.",
            mapSeriesSubHeader: "Map Series",
            singlePrintSubHeader: "Single Maps",
            selectGeometryToolToolTip: "Create print frame based on the geometry of an object",
            drawRectangleToolToolTip: "Create print frame as a rectangle",
            extentToolToolTip: "Use map extent as print frame",
            label_selectGeometry1: "Select",
            label_selectGeometry2: "Geometry",
            label_drawRectangle1: "Draw",
            label_drawRectangle2: "Rectangle",
            label_currentExtent1: "Current",
            label_currentExtent2: "Map Extent",
            tileCalculationOngoing: "Calculating unused tiles.",
            noElementsFoundForSelection: "No object was found at the selected location."
        }
    },
    de: true
};
