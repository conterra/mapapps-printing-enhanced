<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-container v-if="error">
        <!-- show error to user -->
        {{ error }}
    </v-container>
    <v-container
        v-else
        grid-list-md
        fluid
        class="pa-0 fullHeight printing-enhanced-container"
    >
        <v-tabs
            ref="v_tabs_printing"
            v-model="activeTabId"
            slider-color="primary"
            height="34"
            centered
            grow
        >
            <v-tab v-show="visibleUiElements.layoutTab">
                {{ i18n.layoutTab }}
            </v-tab>
            <v-tab v-show="visibleUiElements.mapOnlyTab">
                {{ i18n.mapOnlyTab }}
            </v-tab>
            <v-tab v-show="visibleUiElements.mapSeriesTab">
                {{ i18n.mapSeriesTab }}
            </v-tab>
            <v-tab v-show="!exportedLinks.length">
                {{ i18n.printResults }}
            </v-tab>
            <v-tab v-show="exportedLinks.length">
                {{ i18n.printResults }} ({{ exportedLinks.length + mapSeriesJobs.length }})
            </v-tab>
            <v-tab-item v-show="visibleUiElements.layoutTab">
                <layout-widget
                    :i18n="i18n"
                    :author.sync="author"
                    :copyright.sync="copyright"
                    :dpi.sync="dpi"
                    :dpi-values="dpiValues"
                    :format.sync="format"
                    :layout.sync="layout"
                    :legend-enabled.sync="legendEnabled"
                    :scale.sync="scale"
                    :scale-values="scaleValues"
                    :scale-enabled.sync="scaleEnabled"
                    :selected-scale-value.sync="scale"
                    :title.sync="title"
                    :format-list="formatList"
                    :layout-list="layoutList"
                    :enable-print-preview.sync="enablePrintPreview"
                    :visible-ui-elements="visibleUiElements"
                    :current-map-scale="currentMapScale"
                    :page-print-size.sync="pagePrintSize"
                    :page-print-size-values="pagePrintSizeValues"
                    :page-print-orientation.sync="pagePrintOrientation"
                    :page-print-orientation-values="pagePrintOrientationValues"
                    :map-only-layout-name="mapOnlyLayoutName"
                    @resetScale="$emit('resetScale')"
                />
            </v-tab-item>
            <v-tab-item v-show="visibleUiElements.mapOnlyTab">
                <map-only-widget
                    :i18n="i18n"
                    :attribution-enabled.sync="attributionEnabled"
                    :dpi.sync="dpi"
                    :dpi-values="dpiValues"
                    :file-name.sync="fileName"
                    :format.sync="format"
                    :format-list="formatList"
                    :width.sync="width"
                    :height.sync="height"
                    :scale.sync="scale"
                    :scale-values="scaleValues"
                    :scale-enabled.sync="scaleEnabled"
                    :enable-print-preview.sync="enablePrintPreview"
                    :visible-ui-elements="visibleUiElements"
                    @resetScale="$emit('resetScale')"
                    @rotate="rotate"
                />
            </v-tab-item>
            <v-tab-item v-show="visibleUiElements.mapSeriesTab">
                <map-series-widget
                    :i18n="i18n"
                    :author.sync="author"
                    :copyright.sync="copyright"
                    :dpi.sync="dpi"
                    :dpi-values="dpiValues"
                    :format.sync="format"
                    :page-print-size.sync="pagePrintSize"
                    :page-print-size-values="pagePrintSizeValues"
                    :page-print-orientation.sync="pagePrintOrientation"
                    :page-print-orientation-values="pagePrintOrientationValues"
                    :map-only-layout-name="mapOnlyLayoutName"
                    :layout.sync="layout"
                    :legend-enabled.sync="mapSeriesLegendEnabled"
                    :scale.sync="scale"
                    :scale-values="scaleValues"
                    :min-scale-for-series="minScaleForSeries"
                    :scale-enabled.sync="scaleEnabled"
                    :title.sync="title"
                    :format-list="formatList"
                    :layout-list="layoutList"
                    :visible-ui-elements="visibleUiElements"
                    :mapSeriesExtentType="mapSeriesExtentType"
                    :doNotPrintEmptyTiles.sync="doNotPrintEmptyTiles"
                    :mapSeriesJobs="mapSeriesJobs"
                    v-on:use-map-view-extent="$emit('use-map-view-extent')"
                    v-on:use-geometry-selection="$emit('use-geometry-selection')"
                    v-on:cancel-geometry-selection="$emit('cancel-geometry-selection')"
                    v-on:use-rectangle-draw="$emit('use-rectangle-draw')"
                    v-on:cancel-rectangle-draw="$emit('cancel-rectangle-draw')"
                    v-on:activate-single-print-mode="$emit('activate-single-print-mode')"
                    v-on:activate-series-print-mode="$emit('activate-series-print-mode')"
                    v-on:set-scale-value-is-valid="scaleValueIsValidForPreview = $event"
                    @resetScale="$emit('resetScale')"
                    ref="mapSeriesWidget"
                />
            </v-tab-item>
            <v-tab-item>
                <printing-results-widget
                    :i18n="i18n"
                    :exported-links="exportedLinks"
                    :mapSeriesJobs="mapSeriesJobs"
                    v-on:save-job-again="$emit('save-job-again', $event)"
                />
            </v-tab-item>
            <v-tab-item>
                <printing-results-widget
                    :i18n="i18n"
                    :exported-links="exportedLinks"
                    :mapSeriesJobs="mapSeriesJobs"
                    v-on:save-job-again="$emit('save-job-again', $event)"
                />
            </v-tab-item>
        </v-tabs>
        <v-container
            v-if="activeTabId === 0 || activeTabId === 1 || activeTabId === 2"
            grid-list-md
            fluid
            class="pa-0 px-2 pt-2 printing-button-container"
        >
            <v-btn
                block
                ripple
                color="primary"
                @click="print()"
            >
                <v-icon left>
                    print
                </v-icon>
                {{ i18n.print }}
            </v-btn>
        </v-container>
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import LayoutWidget from "./LayoutWidget.vue";
    import MapOnlyWidget from "./MapOnlyWidget.vue";
    import MapSeriesWidget from "./MapSeriesWidget.vue";
    import PrintingResultsWidget from "./PrintingResultsWidget.vue";

    export default {
        components: {
            MapSeriesWidget,
            "layout-widget": LayoutWidget,
            "map-only-widget": MapOnlyWidget,
            "printing-results-widget": PrintingResultsWidget
        },
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            dpiValues: {
                type: Array,
                default: () => []
            },
            scaleValues: {
                type: Array,
                default: () => []
            },
            forceFeatureAttributes: {
                type: Boolean,
                default: false
            },
            formatList: {
                type: Array,
                default: () => []
            },
            layoutList: {
                type: Array,
                default: () => []
            },
            visibleUiElements: {
                type: Object,
                default: () => {}
            },
            minScaleForSeries: {
                type: Number,
                default: 1000
            },
            pagePrintSize: {
                type: String,
                default: "a4"
            },
            pagePrintSizeValues: {
                type: Array,
                default: () => []
            },
            pagePrintOrientation: {
                type: String,
                default: "portrait"
            },
            pagePrintOrientationValues: {
                type: Array,
                default: () => []
            },
            mapOnlyLayoutName: {
                type: String,
                default: () => ""
            }
        },
        data() {
            return {
                attributionEnabled: true,
                author: "",
                copyright: "",
                dpi: 96,
                fileName: "",
                format: "pdf",
                height: 1100,
                layout: "a3-portrait",
                legendEnabled: true,
                scale: 0,
                scaleEnabled: false,
                title: "",
                width: 800,
                enablePrintPreview: true,
                activeTabId: 0,
                mapSeriesLegendEnabled: true,
                mapSeriesExtentSet: false,
                doNotPrintEmptyTiles: false,
                scaleValueIsValidForPreview: false,
                currentMapScale: 0,
                exportedLinks: [],
                mapSeriesJobs: [],
                mapSeriesExtentType: "",
                error: ""
            };
        },
        watch: {
            activeTabId: function (activeTabId) {
                if (activeTabId === 0 || activeTabId === 2) {
                    if (this.lastLayout) {
                        this.layout = this.lastLayout;
                    }
                } else if (activeTabId === 1) {
                    if (this.layout !== this.mapOnlyLayoutName) {
                        this.lastLayout = this.layout;
                    }
                    this.layout = this.mapOnlyLayoutName;
                }
                if (activeTabId === 2) {
                    this.$emit("activate-series-print-mode");
                } else if (activeTabId === 0 || activeTabId === 1) {
                    this.$emit("activate-single-print-mode");
                }
                this.$refs?.mapSeriesWidget?.deactivateAllTools();
                this.$emit("activate-tab-id-changed", activeTabId);
            },
            doNotPrintEmptyTiles: function (value) {
                this.$emit("do-not-print-empty-tiles-changed", value);
            }
        },
        mounted: function () {
            if (this.layout === this.mapOnlyLayoutName) {
                this.activeTabId = 1;
            } else {
                this.activeTabId = 0;
            }
            this.$emit('startup');
        },
        methods: {
            rotate: function () {
                [this.height, this.width] = [this.width, this.height];
            },
            print: function () {
                if (this.activeTabId === 2) {
                    if (this.$refs?.mapSeriesWidget?.legendEnabledValue !== undefined) {
                        this.mapSeriesLegendEnabled = this.$refs.mapSeriesWidget.legendEnabledValue;
                    }
                    this.$emit("printMapSeries", {});
                } else {
                    this.$emit("print", {});
                }
                this.activeTabId = 4;
            },
            forceOnResizeForTab() {
                this.$refs.v_tabs_printing && this.$refs.v_tabs_printing.onResize();
            }
        }
    };
</script>
