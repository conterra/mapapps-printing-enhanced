# TODO

## Map series: decouple series layout from the shared Esri `templateOptions`

Found while reviewing `pr/07-map-series`. Only affects `deriveLayoutFromPageSize: false`.

### Problem 1: Esri resets the series layout

- `PrintingMapSeriesPreviewController._setLayoutNameForMapSeries()` writes the series layout names
  (`layoutNames["<size>_<orientation>"]`, e.g. `"A4 Portrait"`) into the shared Esri `templateOptions`
  (`layout`, `layoutSinglePage`, `layoutNameSinglePage`). This already happens when the "Serie" tab is opened,
  via `activateSeriesPrintMode()` → `_primeMapSeriesBlueprintIfPossible()` → `primePrintingRequestBlueprint()`.
- In non-derive mode the print service's layout list doesn't include that name (it only offers e.g. `a4-landscape`).
  Esri's `PrintViewModel._processTemplateOptions()` then calls `TemplateOptions.reset()` and `applyTemplate()`,
  which sets `layout` to the service default (`letter-ansi-a-landscape` in the sample).
  Other fields (title, format, dpi, …) are kept.
- Consequences:
  - The series tiles are fine. They use `layoutSinglePage`, which Esri doesn't touch.
  - `_getOverviewLayoutName()` reads `templateOptions.layout` and gets Esri's default instead of the overview layout.
    `_printMapSeries()` reads it only after several `await`s, so a real series print most likely uses the wrong
    overview layout. **Not yet confirmed with an actual print.**
  - `vm.layout` is bound to `templateOptions.layout` (`Binding.syncAll`), so the user's single-print layout is
    overwritten. It is currently patched by remembering/restoring `lastLayout` in the `activeTabId` watcher of
    `PrintingEnhancedWidget.vue`.

How to reproduce (sample app): set `deriveLayoutFromPageSize: false` in `src/main/js/apps/sample/app.json`, then
open the "Serie" tab and check `esriPrintWidget.templateOptions.layout`.

### Problem 2: the "Layout" dropdown on the "Serie" tab does nothing

- `MapSeriesWidget.vue` (around line 142) renders a `v-select` with `v-model="layoutValue"` whenever
  `visibleUiElements.layout` is on (the default in non-derive mode).
- The component declares neither a `layout` prop nor a `layoutValue`. The dropdown is always empty and has no
  effect. The series always derives its layout from page size and orientation.

### Proposed fix

1. Keep the series layout names (single page and overview) as state in `PrintingMapSeriesPreviewController`,
   computed from `vm.pagePrintSize` / `vm.pagePrintOrientation`. Stop writing them into Esri's `templateOptions`.
   - Pass the single-page layout explicitly to `PrintingMapSeriesPreviewDrawer.drawMapSeriesFrames()`
     (`getGeometryParamsFromTemplate()` already takes a `layout` argument).
   - Use the stored names in `_createMapSeriesPrintState()`, `_printMapSeries()` and the other readers of
     `_getSinglePageLayoutName()` / `_getOverviewLayoutName()`.
   - Check `PrintingMapSeriesRequestsProvider._createLegacyFallbackBlueprint()`. It sets
     `esriTemplateOptions.layout = overviewLayoutTemplate` for the intercepted print. A non-service layout name
     might trigger the same Esri reset there.
   - Remove `layoutSinglePage` / `layoutNameSinglePage` from `templateOptions` entirely, including
     `PrintingEnhancedWidgetFactory._setLayoutName()`.
2. Once the series no longer touches `templateOptions.layout`, simplify the `lastLayout` logic in the
   `activeTabId` watcher of `PrintingEnhancedWidget.vue` back to the map-only case.
3. Remove the "Layout" `v-select` from `MapSeriesWidget.vue`.
4. Verify in the browser with both `deriveLayoutFromPageSize: true` and `false`: series tiles, overview layout of
   an actual series print, single-print preview after visiting "Serie", and the "Nur Karte" round trip.
