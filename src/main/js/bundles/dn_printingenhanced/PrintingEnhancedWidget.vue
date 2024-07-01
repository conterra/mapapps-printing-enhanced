<!--

    Copyright (C) 2024 con terra GmbH (info@conterra.de)

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
    <v-container
        grid-list-md
        fluid
        class="pa-0 fullHeight printing-enhanced-container"
    >
        <v-tabs
            v-model="activeTab"
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
                    :title.sync="title"
                    :format-list="formatList"
                    :layout-list="layoutList"
                    :enable-print-preview.sync="enablePrintPreview"
                    :visible-ui-elements="visibleUiElements"
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
            v-if="activeTab!==2"
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
            exportedLinks: {
                type: Array,
                default: () => []
            },
            visibleUiElements: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                attributionEnabled: {
                    type: Boolean,
                    default: true
                },
                author: {
                    type: String,
                    default: ""
                },
                copyright: {
                    type: String,
                    default: ""
                },
                dpi: {
                    type: Number,
                    default: 96
                },
                fileName: {
                    type: String,
                    default: ""
                },
                format: {
                    type: String,
                    default: "pdf"
                },
                height: {
                    type: Number,
                    default: 1100
                },
                layout: {
                    type: String,
                    default: "a3-portrait"
                },
                legendEnabled: {
                    type: Boolean,
                    default: true
                },
                scale: {
                    type: Number,
                    default: 0
                },
                scaleEnabled: {
                    type: Boolean,
                    default: false
                },
                title: {
                    type: String,
                    default: ""
                },
                width: {
                    type: Number,
                    default: 800
                },
                enablePrintPreview: {
                    type: Boolean,
                    default: true
                },
                printPreviewInitallyVisible:{
                    type: Boolean,
                    default: null
                },
                activeTab: {
                    type: Number,
                    default: 0
                }
            };
        },
        watch: {
            activeTab: function(tab) {
                if (tab === 0) {
                    if (this.lastLayout) {
                        this.layout = this.lastLayout;
                    }
                } else if (tab === 1) {
                    if (this.layout !== "MAP_ONLY") {
                        this.lastLayout = this.layout;
                    }
                    this.layout = "MAP_ONLY";
                }
            }
        },
        mounted: function () {
            if (this.layout === "MAP_ONLY") {
                this.activeTab = 1;
            } else {
                this.activeTab = 0;
            }
            this.$emit('startup');
        },
        methods: {
            rotate: function () {
                [this.height, this.width] = [this.width, this.height];
            },
            print: function () {
                this.$emit('print', {});
                this.activeTab = 2;
            }
        }
    };
</script>
