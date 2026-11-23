# dn_printingenhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

Instead of letting the user pick a layout template directly, the widget can optionally let the user choose a page size (e.g. A4, A3) and orientation (Portrait/Landscape) with radio buttons, and derive the matching layout template automatically (see `deriveLayoutFromPageSize` below).

In addition to single-page printing, the bundle adds a map series tab that prints the selected area across multiple pages instead of a single one (see [Configuration for map series print](#configuration-for-map-series-print) below).

## Usage

1. First you need to add the bundle dn_printingenhanced to your app.
2. Then you can configure it.

To make the functions of this bundle available to the user, the following tool can be added to a toolset:

| Tool ID                    | Component                  | Description              |
| -------------------------- | -------------------------- | ------------------------ |
| printingEnhancedToggleTool | PrintingEnhancedToggleTool | Show or hide the widget. |

## Configuration Reference

### Config

```json
"dn_printingenhanced": {
    "Config": {
        "templateOptions": {
            "attributionEnabled": true,
            "author": "Author Name",
            "copyright": "Developer Network",
            "dpi": 150,
            "fileName": "Map Only",
            "forceFeatureAttributes": false,
            "format": "pdf",
            "height": 600,
            "layout": "a4-landscape",
            "legendEnabled": true,
            "scale": 100000,
            "scaleEnabled": true,
            "title": "Print",
            "width": 600
        },
        "visibleUiElements": {
            "layoutTab": true,
            "mapOnlyTab": false,
            "mapSeriesTab": false,
            "title": true,
            "fileName": true,
            "author": true,
            "format": true,
            "widthAndHeight": true,
            "dpi": true,
            "layout": true,
            "printPreviewCheckbox": false,
            "scaleEnabled": false,
            "scale": true,
            "copyright": false,
            "legendEnabled": true,
            "attributionEnabled": false,
            "doNotPrintEmptyTiles": true
        },
        "deriveLayoutFromPageSize": false,
        "enablePrintPreview": true,
        "enablePrintPreviewMovement": true,
        "livePrintPreviewUpdate": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETER",
        "filenameIfNoneIsGiven": "${ui.filenameIfNoneIsGiven}",
        "legend": {
            "legendModes": ["integratedLegend", "legendOwnPage", "noLegend"],
            "legendTitleAppendText": "${ui.legendTitleAppendText}",
            "legendPrintRequestDelayInMs": 2500,
            "legendTemplateOptionsRestoreDelayInMs": 300
        },
        "printSizes": [
            {
                "value": "a4",
                "text": "A4",
                "isDefault": true
            },
            {
                "value": "a3",
                "text": "A3",
                "isDefault": false
            }
        ],
        "printOrientations": [
            {
                "value": "portrait",
                "text": "${ui.portraitLabel}",
                "isDefault": true
            },
            {
                "value": "landscape",
                "text": "${ui.landscapeLabel}",
                "isDefault": false
            }
        ],
        "layoutNames": {
            "a4_portrait": "A4_hoch",
            "a4_landscape": "A4_quer",
            "a3_portrait": "A3_hoch",
            "a3_landscape": "A3_quer",
            "legend": "A4_hoch_legende",
            "mapOnly": "MAP_ONLY"
        },
        "dpiValues": [
            {
                "value": 96,
                "text": "Niedrig (96 DPI)"
            },
            {
                "value": 150,
                "text": "Mittel (150 DPI)"
            },
            {
                "value": 300,
                "text": "Hoch (300 DPI)"
            }
        ],
        "allowedFormats": [
            "pdf",
            "png32"
        ],
        "allowedLayouts": [
            "a3-landscape",
            "a3-portrait",
            "a4-landscape",
            "a4-portrait"
        ],
        "printingPreviewSymbol": {
            "type": "simple-fill",
            "color": [
                255,
                0,
                0,
                0.25
            ],
            "style": "solid",
            "outline": {
                "color": [
                    255,
                    0,
                    0,
                    1
                ],
                "width": "2px"
            }
        },
        "scaleValues": [
            {
                "value": 1000,
                "text": "1:1.000"
            },
            {
                "value": 2500,
                "text": "1:2.500"
            },
            {
                "value": 5000,
                "text": "1:5.000"
            },
            {
                "value": 10000,
                "text": "1:10.000"
            },
            {
                "value": 25000,
                "text": "1:25.000"
            },
            {
                "value": 50000,
                "text": "1:50.000"
            },
            {
                "value": 100000,
                "text": "1:100.000"
            }
        ],
        "useUsernameAsAuthor": true,
        "usernameAttributes": [
            "givenname",
            "sn"
        ],
        "customTextElements": [
            {
                "email": "${mail}"
            },
            {
                "city": "${city}"
            },
            {
                "country": "${country}"
            },
            {
                "phonenumber": "${phonenumber}"
            },
            {
                "sn": "${sn}"
            },
            {
                "street": "${street}"
            },
            {
                "testString": "testString"
            }
        ]
    }
}
```

| Property                                                      | Type               | Possible Values                                             | Default                            | Description                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------ | ----------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| templateOptions                                               | Object             |                                                             |                                    | Esri Print Widget TemplateOptions: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print-TemplateOptions.html                                                                                                                                                                                                                                                                    |
| visibleUiElements                                             | Object             |                                                             |                                    | Controls the visibility of UI elements. See [Visible UI elements](#visible-ui-elements).                                                                                                                                                                                                                                                                                                                    |
| enablePrintPreview                                            | Boolean            | `true` &#124; `false`                                       | `true`                             | Default value for the print preview.                                                                                                                                                                                                                                                                                                                                                                        |
| enablePrintPreviewMovement                                    | Boolean            | `true` &#124; `false`                                       | `true`                             | If `true`, the print preview frame can be moved and rotated by dragging it in the map; it keeps its location when the map is panned or zoomed. If `false`, the frame stays centered in the map view and the print area is chosen by panning the map.                                                                                                                                                        |
| livePrintPreviewUpdate                                        | Boolean            | `true` &#124; `false`                                       | `true`                             | Only applies if `enablePrintPreviewMovement` is `false`. If `true`, the print preview frame follows the map center while the map is being panned. If `false`, the frame is re-centered when the map movement has finished.                                                                                                                                                                                  |
| deriveLayoutFromPageSize                                      | Boolean            | `true` &#124; `false`                                       | `false`                            | If `true`, the layout dropdown is replaced by page-size and orientation radio buttons (see `printSizes`, `printOrientations`, `layoutNames`), and the matching layout template is selected automatically. If `false`, the layout dropdown is used.                                                                                                                                                          |
| layoutTemplatesInfoTaskName                                   | String             |                                                             | `Get Layout Templates Info Task`   | Layout templates task name.                                                                                                                                                                                                                                                                                                                                                                                 |
| defaultPageUnit                                               | String             | `MILLIMETER` &#124; `CENTIMETER` &#124; `INCH`              | `CENTIMETER`                       | Default template unit (ArcGIS Server < 10.6).                                                                                                                                                                                                                                                                                                                                                               |
| filenameIfNoneIsGiven                                         | String             |                                                             | `untitled`                         | Title/file name used for a print request (both the main print and, if applicable, the second legend request) if the user left the title/file name field empty.                                                                                                                                                                                                                                              |
| legend                                                        | Object             |                                                             |                                    | Configures the legend print mode. See fields below.                                                                                                                                                                                                                                                                                                                                                         |
| legend.legendModes                                            | Array              | `noLegend` &#124; `integratedLegend` &#124; `legendOwnPage` | `["integratedLegend", "noLegend"]` | Legend modes the user can choose from. The order defines the order in the UI. `integratedLegend` is preselected if available, otherwise the first entry. With fewer than two modes, no legend option is shown and the only mode (or `noLegend`) is used. `integratedLegend` is not available in the map-only tab; in the map series tab it only applies to the overview page.                               |
| legend.legendTitleAppendText                                  | String             |                                                             | `" (Legend)"`                      | Appended to the legend print's title/file name so it doesn't collide with the map print in the results list.                                                                                                                                                                                                                                                                                                |
| legend.legendPrintRequestDelayInMs                            | Number             |                                                             | `2500`                             | Delay in milliseconds before sending the second (legend) print request after the main print request. Environment-dependent.                                                                                                                                                                                                                                                                                 |
| legend.legendTemplateOptionsRestoreDelayInMs                  | Number             |                                                             | `300`                              | Delay in milliseconds before restoring the original template options after the second (legend) print request. Environment-dependent.                                                                                                                                                                                                                                                                        |
| printSizes                                                    | Array              |                                                             | A4, A3                             | Page sizes offered when `deriveLayoutFromPageSize` is `true` and in the map series tab. Each entry has the form `{"value": <id>, "text": <GUI label>, "isDefault": <boolean>}`; the entry with `isDefault: true` is selected at startup.                                                                                                                                                                    |
| printOrientations                                             | Array              |                                                             | portrait, landscape                | Page orientations offered when `deriveLayoutFromPageSize` is `true` and in the map series tab, in the same form as `printSizes`.                                                                                                                                                                                                                                                                            |
| layoutNames                                                   | Object             |                                                             |                                    | Maps page-size/orientation combinations (and special modes) to print layout template names. See fields below.                                                                                                                                                                                                                                                                                               |
| layoutNames.\<printSizes value\>\_\<printOrientations value\> | String             |                                                             |                                    | Layout template used for that page-size/orientation combination, e.g. `a4_portrait`. One entry is required for every combination of `printSizes` and `printOrientations`. In the map series tab, this layout is used for the overview page.                                                                                                                                                                 |
| layoutNames.\<combination\>\_integratedLegend                 | String             |                                                             |                                    | Optional dedicated layout used if the `integratedLegend` legend mode is selected for that combination. If missing, the layout for that combination is used, with the legend toggled on via the print request.                                                                                                                                                                                               |
| layoutNames.\<combination\>\_singlepage                       | String             |                                                             |                                    | Optional dedicated layout used for the individual pages of a map series for that combination. If missing, the individual pages use the overview page layout.                                                                                                                                                                                                                                                |
| layoutNames.mapOnly                                           | String             |                                                             |                                    | Layout template used for the map-only tab's print request (`deriveLayoutFromPageSize`, `printSizes` and `printOrientations` don't apply there).                                                                                                                                                                                                                                                             |
| layoutNames.legend                                            | String             |                                                             |                                    | Layout used for the `legendOwnPage` mode's second print request. Required if `legendOwnPage` is part of `legend.legendModes`. This should be a layout that only contains a legend (no map frame); with a normal map layout, the legend page shows the map, too.                                                                                                                                             |
| dpiValues                                                     | Array              |                                                             | 96, 150, 300                       | Available dpi values. Each entry has the form `{"value": <dpi>, "text": <GUI label>}`.                                                                                                                                                                                                                                                                                                                      |
| scaleValues                                                   | Array              |                                                             | `[]`                               | Available scale values. If the array is filled, a select box is shown in the UI instead of a text field. Each entry has the form `{"value": <scaleValue>, "text": <GUI label>}`. If `scale` is `-1`, the current scale of the map is used.                                                                                                                                                                  |
| allowedFormats                                                | String or String[] |                                                             | `all`                              | Print output formats the user can select, out of those offered by the print service. Either `"all"` or an array of format ids as used by the ArcGIS Print widget, e.g. `["pdf", "png32"]`. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedFormats                                                                                                        |
| allowedLayouts                                                | String or String[] |                                                             | `all`                              | Print layouts the user can select, out of those offered by the print service. Either `"all"` or an array of layout ids. The standard Esri layouts use the ids of the ArcGIS Print widget, e.g. `"a4-landscape"`; custom layouts use their name exactly as on the print service, e.g. `"A4 Hoch"`. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedLayouts |
| printingPreviewSymbol                                         | Object             |                                                             |                                    | Symbol of the print preview frame in the map. Also used for the frames of a map series.                                                                                                                                                                                                                                                                                                                     |
| printingPreviewOmittedTilesSymbol                             | Object             |                                                             |                                    | Symbol in the map for map series frames that are not printed because they don't intersect the selected geometry (see `doNotPrintEmptyTiles` in [Visible UI elements](#visible-ui-elements)).                                                                                                                                                                                                                |
| printingOverviewSymbol                                        | Object             |                                                             |                                    | Symbol of the frames on the printed map series overview page, in [ArcGIS REST JSON](https://developers.arcgis.com/web-map-specification/objects/symbol/) format (e.g. `esriSFS`).                                                                                                                                                                                                                           |
| printingOverviewLabelSymbol                                   | Object             |                                                             |                                    | Text symbol of the frame numbers on the printed map series overview page, in ArcGIS REST JSON format (`esriTS`).                                                                                                                                                                                                                                                                                            |
| mapSeriesTileOverlap                                          | Number             |                                                             | `0.05`                             | Overlap of neighboring map series frames as a fraction of the frame size (`0.05` = 5%).                                                                                                                                                                                                                                                                                                                     |
| useUsernameAsAuthor                                           | Boolean            | `true` &#124; `false`                                       | `true`                             | Use the currently logged in user to pre-enter the author.                                                                                                                                                                                                                                                                                                                                                   |
| usernameAttributes                                            | Array              |                                                             | `["givenname","sn"]`               | Attributes of the user for determining the user name. https://demos.conterra.de/mapapps/resources/jsregistry/root/authentication/latest/README.md                                                                                                                                                                                                                                                           |
| customTextElements                                            | Array              |                                                             | `[]`                               | Custom text elements that are available in the print template. See [Custom text elements](#custom-text-elements).                                                                                                                                                                                                                                                                                           |

### Visible UI elements

All entries of `visibleUiElements` are Booleans. Entries that are not configured keep their default.

| Property             | Default                     | Description                                                                                                                                                                                      |
| -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| layoutTab            | `true`                      | Show the tab for single-page printing.                                                                                                                                                           |
| mapOnlyTab           | `false`                     | Show the map-only tab.                                                                                                                                                                           |
| mapSeriesTab         | `false`                     | Show the map series tab. See [Configuration for map series print](#configuration-for-map-series-print).                                                                                          |
| title                | `true`                      | Show the title field.                                                                                                                                                                            |
| fileName             | `true`                      | Show the file name field.                                                                                                                                                                        |
| author               | `true`                      | Show the author field.                                                                                                                                                                           |
| format               | `true`                      | Show the format selection.                                                                                                                                                                       |
| widthAndHeight       | `true`                      | Show the width and height fields in the map-only tab.                                                                                                                                            |
| dpi                  | `true`                      | Show the dpi selection.                                                                                                                                                                          |
| layout               | `!deriveLayoutFromPageSize` | Show the layout dropdown.                                                                                                                                                                        |
| pageSizeOrientation  | `deriveLayoutFromPageSize`  | Show the page-size and orientation radio buttons in the single-page tab.                                                                                                                         |
| printPreviewCheckbox | `false`                     | Show the checkbox that toggles the print preview.                                                                                                                                                |
| scaleEnabled         | `false`                     | Show the checkbox that toggles whether the configured scale is used.                                                                                                                             |
| scale                | `true`                      | Show the scale selection.                                                                                                                                                                        |
| copyright            | `false`                     | Show the copyright field.                                                                                                                                                                        |
| legendEnabled        | `true`                      | Show the legend mode selection (see `legend.legendModes`).                                                                                                                                       |
| attributionEnabled   | `false`                     | Show the attribution checkbox.                                                                                                                                                                   |
| doNotPrintEmptyTiles | `true`                      | Show the checkbox in the map series tab that skips frames not intersecting the selected geometry. Only enabled if the map series area was selected from an object; requires `geometryServerURL`. |

### Custom text elements

By default, `customTextElements` entries are static: the configured value (optionally containing a `${...}` replacer resolved against the logged-in user) is pushed onto the print template as-is.

```json
"customTextElements": [
    {
        "email": "${mail}"
    },
    {
        "testString": "testString"
    }
]
```

To let the user type a value at print time instead, use the form `{"elementFieldName": <field name on the print template>, "title": <GUI label>}`. One text field per entry is then rendered in the layout tab, and the value the user enters is sent to the print service under `elementFieldName` when printing.

```json
"customTextElements": [
    {
        "elementFieldName": "mail",
        "title": "${ui.mailLabel}"
    },
    {
        "elementFieldName": "city",
        "title": "${ui.cityLabel}"
    }
]
```

### Change the print service url

The Printing Enhanced bundle uses components of the default [printing](https://demos.conterra.de/mapapps/resources/jsregistry/root/printing/latest/README.md) bundle.
This means that the print URL must be configured on this bundle.

```json
"printing": {
    "Config": {
        "url": "https://url.to/arcgis/rest/services/Utilities/GPServer/Export%20Web%20Map%20Task"
    }
}
```

### Customize widget configuration

To customize the appearance of the widget, use the widgetRole _printingEnhancedWidget_.

More information about customizing a widget can be found here: https://docs.conterra.de/en/mapapps/latest/apps/configuring-apps/layout.html#customize-widgets

### Configuration for map series print

The map series tab (enabled with `visibleUiElements.mapSeriesTab`) prints the selected area across multiple pages and downloads them as a ZIP file. Besides an overview page, every frame of the series is printed as an individual page.

#### Layouts

The map series always takes its layouts from `layoutNames`, based on the page size and orientation selected in the map series tab. This also applies if `deriveLayoutFromPageSize` is `false`, so `layoutNames` has to contain an entry for every combination of `printSizes` and `printOrientations` in that case, too.

-   `<size>_<orientation>` (e.g. `a4_portrait`) is used for the overview page.
-   `<size>_<orientation>_singlepage` (e.g. `a4_portrait_singlepage`) is optionally used for the individual pages. If it is missing, the individual pages use the overview page layout.

```json
"layoutNames": {
    "a4_portrait": "A4_hoch",
    "a4_portrait_singlepage": "A4_hoch_einzelseite"
}
```

#### Legend

The map series uses the same `legend.legendModes` as the single-page print. The individual pages never contain a legend.

-   `integratedLegend`: only the overview page contains the legend. It uses the layout `<size>_<orientation>_integratedLegend`, or `<size>_<orientation>` if not configured.
-   `legendOwnPage`: a separate legend page is printed with `layoutNames.legend` after all pages and added to the ZIP file. If it cannot be printed (e.g. the layout does not exist on the print service), the map series is downloaded without legend and the user is notified.

#### Components

The following settings of the `Config` component also apply to the map series: `mapSeriesTileOverlap`, `printingPreviewOmittedTilesSymbol`, `printingOverviewSymbol` and `printingOverviewLabelSymbol`. All other map series settings are configured on separate components:

```json
"dn_printingenhanced": {
    "PrintingMapSeriesPreviewController": {
        "askToPrintManyFramesThreshold": 100,
        "scaleModifications": [
            {
                "toScale": 2000,
                "roundUpTo": 0,
                "extentFactor": 1.1
            },
            {
                "toScale": 10000,
                "roundUpTo": 500,
                "extentFactor": 1.1
            }
        ],
        "selectionLayers": {
            "layerIds": ["districts", "boroughs"]
        }
    },
    "PrintingMapSeriesPreviewDrawer": {
        "geometryServerURL": "https://url.to/arcgis/rest/services/Utilities/Geometry/GeometryServer",
        "maxNumberOfDrawnFrames": 1000
    },
    "PrintingRequestBlueprintProvider": {
        "printingURLtoIntercept": "@@printtask.service.url@@",
        "cancelRequestOnIntercept": true,
        "blueprintRequestTimeoutInMs": 30000
    },
    "PrintingMapSeriesDownloader": {
        "numberOfConcurrentDownloads": 4,
        "printingRequestTimeout": 600000,
        "legendFileNamePrefix": "Legende",
        "fileNameSuffixOverviewPage": "Übersichtsseite"
    }
}
```

##### PrintingMapSeriesPreviewController

| Property                          | Type   | Default             | Description                                                                                                                                                                                 |
| --------------------------------- | ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| askToPrintManyFramesThreshold     | Number | `100`               | If the user wants to print more frames than this threshold, they are asked to confirm.                                                                                                      |
| scaleModifications                | Array  | see `manifest.json` | Modifications of the suggested scale for the map series frames when selecting a geometry. See fields below.                                                                                 |
| scaleModifications[].toScale      | Number |                     | The entry with the lowest `toScale` that is equal to or above the calculated scale is used. If the calculated scale is above every `toScale`, the entry with the highest `toScale` is used. |
| scaleModifications[].roundUpTo    | Number |                     | The suggested scale is rounded up to a multiple of this value. `0` disables rounding.                                                                                                       |
| scaleModifications[].extentFactor | Number |                     | The calculated scale is multiplied by this factor to create a buffer around the geometry.                                                                                                   |
| selectionLayers                   | Object | `{"layerIds": []}`  | Map layers that are queried by the object selection. `layerIds` references the `id` of layers already added to the map.                                                                     |

##### PrintingMapSeriesPreviewDrawer

| Property               | Type   | Default | Description                                                                                                                          |
| ---------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| geometryServerURL      | String |         | URL of an ArcGIS Server GeometryServer. Used to skip frames that don't intersect the selected geometry (see `doNotPrintEmptyTiles`). |
| maxNumberOfDrawnFrames | Number | `1000`  | Maximum number of frames drawn in the map. This also limits the number of frames that can be printed.                                |

##### PrintingRequestBlueprintProvider

| Property                    | Type    | Default | Description                                                                                                                                                 |
| --------------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| printingURLtoIntercept      | String  |         | Print service URL whose request is intercepted and used as template for all map series print requests. Usually the URL configured on the `printing` bundle. |
| cancelRequestOnIntercept    | Boolean | `true`  | Cancel the intercepted print request.                                                                                                                       |
| blueprintRequestTimeoutInMs | Number  | `30000` | Maximum time in milliseconds to wait for the intercepted print request. If it doesn't arrive in time, the map series print is aborted.                      |

##### PrintingMapSeriesDownloader

| Property                    | Type   | Default           | Description                                                       |
| --------------------------- | ------ | ----------------- | ----------------------------------------------------------------- |
| numberOfConcurrentDownloads | Number | `4`               | Number of concurrent requests to the print service.               |
| printingRequestTimeout      | Number | `600000`          | Maximum time in milliseconds to wait for a print job to complete. |
| legendFileNamePrefix        | String | `Legende`         | Prefix of the legend page file name.                              |
| fileNameSuffixOverviewPage  | String | `Übersichtsseite` | Suffix of the overview page file name.                            |
