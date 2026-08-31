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
            <v-tab
                v-if="!exportedLinks.length"
            >
                {{ i18n.printResults }}
            </v-tab>
            <v-tab
                v-else
            >
                {{ i18n.printResults }} ({{ exportedLinks.length }})
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
            <v-tab-item>
                <printing-results-widget
                    :i18n="i18n"
                    :exported-links="exportedLinks"
                />
            </v-tab-item>
        </v-tabs>
        <v-container
            v-if="activeTabId!==2"
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
    import PrintingResultsWidget from "./PrintingResultsWidget.vue";

    export default {
        components: {
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
                currentMapScale: 0,
                exportedLinks: [],
                error: ""
            };
        },
        watch: {
            activeTabId: function (activeTabId) {
                if (activeTabId === 0) {
                    if (this.lastLayout) {
                        this.layout = this.lastLayout;
                    }
                } else if (activeTabId === 1) {
                    if (this.layout !== this.mapOnlyLayoutName) {
                        this.lastLayout = this.layout;
                    }
                    this.layout = this.mapOnlyLayoutName;
                }
                this.$emit("activate-tab-id-changed", activeTabId);
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
                this.$emit('print', {});
                this.activeTabId = 2;
            }
        }
    };
</script>
