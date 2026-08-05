# dn_printingenhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

Instead of letting the user pick a layout template directly, the widget can optionally let the user choose a page size (e.g. A4, A3) and orientation (Portrait/Landscape) with radio buttons, and derive the matching layout template automatically (see `deriveLayoutFromPageSize` below).

In addition to single-page printing, the bundle adds a map series tab that prints the selected area across multiple pages instead of a single one (see "Configuration for map series print" below).

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
            "forceFeatureAttributes ": false,
            "format": "pdf",
            "height": 600,
            "layout": "a4-landscape",
            "legendEnabled ": true,
            "scale": 100000,
            "scaleEnabled": true,
            "title": "Print",
            "width": 600
        },
        "visibleUiElements": {
            "layoutTab": true,
            "mapOnlyTab": false,
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
            "legendEnabled": false,
            "attributionEnabled": false
        },
        "deriveLayoutFromPageSize": false,
        "enablePrintPreview": true,
        "enablePrintPreviewMovement": true,
        "showDpiSelect": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETER",
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

| Property                    | Type               | Possible Values                | Default                          | Description                                                                                                                                                                                                                                                                     |
| --------------------------- | ------------------ | ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| templateOptions             | Object             |                                |                                  | Esri Print Widget TemplateOptions:https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print-TemplateOptions.html                                                                                                                                         |
| visibleUiElements           | Object             |                                |                                  | Controls visibility of UI elements.                                                                                                                                                                                                                                             |
| enablePrintPreview          | Boolean            | `true` &#124; `false`          | `true`                           | Default value for the print preview.                                                                                                                                                                                                                                            |
| enablePrintPreviewMovement  | Boolean            | `true` &#124; `false`          | `true`                           | Allows the user to edit the print preview in map.                                                                                                                                                                                                                               |
| deriveLayoutFromPageSize    | Boolean            | `true` &#124; `false`          | `false`                          | If `true`, the layout dropdown is replaced by page-size and orientation radio buttons (see `printSizes`, `printOrientations`, `layoutNames`), and the matching layout template is selected automatically. If `false`, the original layout dropdown is used.                    |
| layoutTemplatesInfoTaskName | String             |                                | `Get Layout Templates Info Task` | Layout templates task name.                                                                                                                                                                                                                                                     |
| defaultPageUnit             | String             | `MILLIMETER, CENTIMETER, INCH` | `CENTIMETER`                     | Default template unit (ArcGIS Server < 10.6).                                                                                                                                                                                                                                   |
| printSizes                  | Array              |                                | `[]`                             | Page sizes offered when `deriveLayoutFromPageSize` is `true`. Each entry has the form `{"value": <id>, "text": <GUI label>, "isDefault": <boolean>}`; the entry with `isDefault: true` is selected at startup.                                                                  |
| printOrientations           | Array              |                                | `[]`                             | Page orientations offered when `deriveLayoutFromPageSize` is `true`, in the same form as `printSizes`.                                                                                                                                                                          |
| layoutNames                 | Object             |                                | `{}`                             | Maps a page-size/orientation combination to the name of the matching print layout template. The key is `<printSizes value>_<printOrientations value>`; one entry is required for every combination of `printSizes` and `printOrientations`.                                   |
| dpiValues                   | Array              |                                | `[]`                             | Available dpi values.                                                                                                                                                                                                                                                           |
| scaleValues                 | Array              |                                | `[]`                             | Available scale values. If the array is filled, a select box will be available in the UI instead of a text field. Each entry in the array is of the type `{"value": <scaleValue>,"text": <Label in the select box>}`. If `scale` is `-1`, the current scale of the map is used. |
| allowedFormats              | String or String[] |                                | `all`                            | Specify the print output file format(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedFormats                                               |
| allowedLayouts              | String or String[] |                                | `all`                            | Specify the print output layout(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedLayouts                                                    |
| printingPreviewSymbol       | Object             |                                |                                  | Print preview symbol.                                                                                                                                                                                                                                                           |
| useUsernameAsAuthor         | Boolean            | `true` &#124; `false`          | `true`                           | Use the currently logged in user to pre-enter the author.                                                                                                                                                                                                                       |
| usernameAttributes          | Array              |                                | `["givenname","sn"]`             | Attributes of the user for determining the user name. https://demos.conterra.de/mapapps/resources/jsregistry/root/authentication/latest/README.md                                                                                                                               |
| customTextElements          | Array              |                                | `[]`                             | Define custom text elements that are available in the print template. You can use strings or replacer for values of the user object.                                                                                                                                            |

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

⚠️ Warnings ⚠️
Due to changes in the API currently the formats and layouts have to be defined differently than before. Furthermore only english print services are supported. This change is expected to be reverted with a future API update.
To filter your formats and layouts please use their entire ids as follows:

```json
"dn_printingenhanced": {
    "Config": {
        "allowedFormats": [
            "Portable Document Format (PDF)",
            "32-Bit Portable Network Graphics (PNG32)",
            "8-Bit Portable Network Graphics (PNG8)",
            "Joint Photographic Experts Group (JPG)",
            "GIF (Graphics Interchange Format)",
            "Encapsulated PostScript (EPS)",
            "Scalable Vector Graphics (SVG)",
            "Compressed Scalable Vector Graphics (SVGZ)",
            "Adobe Illustrator Exchange (AIX)",
            "Tag Image File Format (TIFF)"
        ],
        "allowedLayouts": [
            "A0 Hoch",
            "A0 Quer",
            "A1 Hoch",
            "A1 Quer",
            "A2 Hoch",
            "A2 Quer",
            "A3 Hoch",
            "A3 Quer",
            "A4 Hoch Kataster",
            "A4 Hoch",
            "A4_Quer"
        ]
        ...
    }
}
```

### Configuration for map series print

The following Configs have been added for **map series**:

- every layoutname has a additional layout for printing an overview page and its single pages.
  The layoutname for the overview page is the normal layoutname.
  The layoutname for the single page is the normal layoutname plus "\_singlepage".
  E.g.
    - "a4_portrait": "A4_hoch_overview",
    - "a4_portrait_singlepage": "A4_hoch_singlepage"
- mapSeriesTileOverlap: overlap of the tiles in percent. Default is 0.05 (5%).
- askToPrintManyFramesThreshold: threshold for number of frames that the user can print without confirming: if the user wants to print more map series frames than allowed by this threshold, they will be asked to confirm that they actually want to print that many frames
- minScaleForSeries: minimum print scale for map series print. if below, the frames of the map-series won't update to it and the print cant start.
- scaleModifications: modifications of the suggested scale for the map-series-frames when selecting a geometry
    - toScale: if the calculated scale is equal or below this, the config entry with the lowest value of toScale is used here.
    - roundUpTo: the finally suggested scale is rounded up to this value
    - extentFactor: the calculated scale is multiplied by this factor, to create a "buffer" around the geometry.
- selectionLayers: layers that are allowed for the geometry selection tool
- printingURLtoIntercept: print url that will be intercepted when printing map series (usually should be the normal print url)
- cancelRequestOnIntercept: cancel normal print request on intercept
- numberOfConcurrentDownloads: number of request to the print service that will be done concurrently
- legendFileNamePrefix: Prefix for legend file
- fileNameSuffixOverviewPage: suffix for the overview page file name in map series mode
- printingRequestTimeout: timeout for waiting for a print job to execute
- geometryServerURL: URL of the ArcGIS Server GeometryServer that is used to filter empty tiles (tiles not covered by selected print geometry), e.g. "https://dev0221w.conterra.de/server/rest/services/Utilities/Geometry/GeometryServer"
- maxNumberOfDrawnFrames: maximum number of frames that will be drawn in the map; this implicitly also restricts the number of max frames printed

```json
"dn_printingenhanced": {
    "PrintingMapSeriesPreviewController": {
        "askToPrintManyFramesThreshold": 100,
        "minScaleForSeries": 1000,
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
            "layerIds": [1,2,3],
            "externalServicesIds": []
        }
    },
    "PrintingRequestBlueprintProvider": {
        "printingURLtoIntercept": "@@gisbox.ags.baseurl@@/@@gisbox.ags.printService@@/execute",
        "cancelRequestOnIntercept": true
    },
    "PrintingMapSeriesDownloader": {
        "numberOfConcurrentDownloads": 4,
        "printingRequestTimeout": 600000,
        "legendFileNamePrefix": "Legende",
        "fileNameSuffixOverviewPage": "Übersichtsseite"
    },
    "PrintingMapSeriesPreviewDrawer": {
        "geometryServerURL": "define in app.json",
        "maxNumberOfDrawnFrames": 1000
    }
}
```
