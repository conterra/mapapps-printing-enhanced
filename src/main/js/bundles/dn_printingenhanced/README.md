# dn_printingenhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

## Usage
Simply add the bundle "dn_printingenhanced" to your app.

## Configuration Reference

```json
"dn_printingenhanced": {
    "Config": {
        "templateOptions": {
            "attributionEnabled": true,
            "author": "Author Name",
            "copyright": "Developer Network",
            "dpi": 96,
            "fileName": "Map Only",
            "forceFeatureAttributes ": false,
            "format": "pdf",
            "height": 600
            "layout": "a4-landscape",
            "legendEnabled ": true,
            "scale": 100000,
            "scaleEnabled": true,
            "title": "Print"
            "width": 600,
        },
        "showPrintPreview": true,
        "showAdvancedOptions": true,
        "showDpiSelect": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETER",
        "dpiValues": [
            {
                "value": 96,
                "text": "96"
            },
            {
                "value": 150,
                "text": "150"
            },
            {
                "value": 300,
                "text": "300"
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

| Property                       | Type               | Possible Values                    | Default                              | Description                                                                                                                                                                                                                       |
|--------------------------------|--------------------|------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| templateOptions                | Object             |                                    |                                      | Esri Print Widget TemplateOptions:https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print-TemplateOptions.html                                                                                           |
| showPrintPreview               | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Enable the print preview.                                                                                                                                                                                                         |
| showAdvancedOptions            | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Show advanced options.                                                                                                                                                                                                            |
| showDpiSelect                  | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Show DPI select.                                                                                                                                                                                                                  |
| layoutTemplatesInfoTaskName    | String             |                                    | ```Get Layout Templates Info Task``` | Layout templates task name.                                                                                                                                                                                                       |
| defaultPageUnit                | String             | ```MILLIMETER, CENTIMETER, INCH``` | ```CENTIMETER```                     | Default template unit (ArcGIS Server < 10.6).                                                                                                                                                                                     |
| dpiValues                      | Array              |                                    | ```[]```                             | Available dpi values.                                                                                                                                                                                                             |
| scaleValues                    | Array              |                                    | ```[]```                             | Available scale values. If the array is filled, a select will be available in the UI instead of a text field.                                                                                                                     |
| allowedFormats                 | String or String[] |                                    | ```all```                            | Specify the print output file format(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedFormats |
| allowedLayouts                 | String or String[] |                                    | ```all```                            | Specify the print output layout(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedLayouts      |
| printingPreviewSymbol          | Object             |                                    |                                      | Print preview symbol.                                                                                                                                                                                                             |
| useUsernameAsAuthor            | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Use the currently logged in user to pre-enter the author.                                                                                                                                                                         |
| usernameAttributes             | Array              |                                    | ```["givenname","sn"]```             | Attributes of the user for determining the user name.                                                                                                                                                                             |
| customTextElements             | Array              |                                    | ```[]```                             | Define custom text elements that are available in the print template. You can use strings or replacer for values of the user object.                                                                                              |
