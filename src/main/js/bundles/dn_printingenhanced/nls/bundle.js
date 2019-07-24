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
    root: {
        bundleName: "Printing Enhanced Bundle",
        bundleDescription: "This bundle extends Printing bundle.",
        windowTitle: "Printing",
        tool: {
            title: "Printing",
            tooltip: "Printing"
        },
        ui: {
            print: "Export",
            layout: "Layout",
            format: "Format",
            onlyMap: "Only Map",
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
            advancedOptions: "Show advanced options",
            scale: "Scale",
            scaleEnabled: "Set scale",
            legendEnabled: "Enable legend",
            attributionEnabled: "Enable attribution",
            dpi: "DPI",
            showPrintPreview: "Show print preview",
            exports: "Exports",
            errors: {
                unknown: "AGS Printing: An unknown error occurred!",
                code403: "AGS Printing: The configured printing service URL has to be in your proxy whitelist!",
                code404: "AGS Printing: The printing service could not be resolved for the configured URL!"
            }
        }
    },
    de: true
};
