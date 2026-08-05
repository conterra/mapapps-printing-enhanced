# dn_printingenhanced (GISBOX fork)

This Bundle extends the Printing-Enhanced-Bundle at version 2.3.3 to match the needs for GISBOX.

In specific ArcGIS deployment constellations, `PrintViewModel.templatesInfo` can be unavailable, delayed, or incomplete during runtime.
To keep the print pipeline deterministic, this bundle activates a fallback path that reads print service capabilities (`Format`, `Layout_Template`) directly and builds `PrintTemplate` payloads from `templateOptions`.

## Migration Notes

This fork no longer relies on the legacy direct printing workflow that was previously built around older `PrintViewModel` behavior.
With the newer upstream/API behavior, parts of the print state must be derived explicitly inside this bundle.

In particular, this bundle now:

- derives layout names from page size and orientation instead of exposing direct layout selection,
- reads print service metadata directly and patches `toPrintTemplate()` when `PrintViewModel.templatesInfo` is not reliably available at runtime.

These parts are intentional fork-specific migration logic and should be reviewed carefully during upstream updates.

The following things have been changed:

- The user can choose the page-size (A4, A3) and the page-layout (Portrait or Landscape) directly with radio-buttons.
- The layout-template does not need to be chosen by the user anymore. The correct layout-name is automatically determined by the chosen parameters:
  Page-Size, Page-Layout. It has the following Pattern: `<PageSize>_<PageOrientation>`
- Default Values can be configured for Page-Size and Page-Layout.

# dn_printingenhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

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
        "enablePrintPreview": true,
        "enablePrintPreviewMovement": true,
        "showDpiSelect": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETER",
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
| layoutTemplatesInfoTaskName | String             |                                | `Get Layout Templates Info Task` | Layout templates task name.                                                                                                                                                                                                                                                     |
| defaultPageUnit             | String             | `MILLIMETER, CENTIMETER, INCH` | `CENTIMETER`                     | Default template unit (ArcGIS Server < 10.6).                                                                                                                                                                                                                                   |
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

### dn_printingenhanced GISBOX Configuration

The _url_ of the print service can be configured on the "printing" bundle. This bundle injects the configuration of the esri printing widget.

The configuration of the original dn_printingenhanced-bundle (see above) apply, except "defaultTemplate" which has been removed.
The following configuration options have been added:

- printSizes ("text" refers to the GUI-Label)
- printOrientations
    - "isDefault = true" to be chosen at startup.

- layoutNames are the names of the printing-templates. For each combination of the values of the printSizes-entries and the values of the printOrientations there must be an entry in the layoutNames. The key is the printSizes-value plus a dash plus the printOrientations-value, followed by the value which is the name of the printing-template.

```json
"dn_printingenhanced": {
    "Config": {

        ...

        "printSizes": [
            {
                "value": "a4",
                "text": "A4",
                "isDefault": false
            },
            {
                "value": "a3",
                "text": "A3",
                "isDefault": true
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
        }
    }
}
```
