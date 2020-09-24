<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

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
        class="pa-0">
        <v-tabs
            v-model="activeTab"
            slider-color="primary"
            height="34"
            centered
            grow
        >
            <v-tab>
                {{ i18n.layout }}
            </v-tab>
            <v-tab>
                {{ i18n.onlyMap }}
            </v-tab>
            <v-tab-item>
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
                    :show-dpi-select="showDpiSelect"
                    :show-advanced-options="showAdvancedOptions"
                    @resetScale="$emit('resetScale')"/>
            </v-tab-item>
            <v-tab-item>
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
                    :show-dpi-select="showDpiSelect"
                    :show-advanced-options="showAdvancedOptions"
                    @resetScale="$emit('resetScale')"
                    @rotate="rotate"/>
            </v-tab-item>
        </v-tabs>
        <v-container
            grid-list-md
            fluid
            class="px-2 py-0">
            <v-btn
                block
                ripple
                color="primary"
                @click="$emit('print', {})">
                <v-icon left>
                    save_alt
                </v-icon>
                {{ i18n.print }}
            </v-btn>
            <v-divider class="my-3"></v-divider>
            <h3 v-if="reverseExportedLinks.length">{{ i18n.exports }}</h3>
            <v-list
                dense>
                <v-list-tile
                    v-for="exportedLink in reverseExportedLinks"
                    :key="exportedLink.id"
                    :href="exportedLink.url"
                    target="_blank"
                >
                    <v-list-tile-action>
                        <v-progress-circular
                            v-if="exportedLink.loading"
                            indeterminate
                            size="22"
                            color="primary"
                        ></v-progress-circular>
                        <v-icon
                            v-else-if="exportedLink.error"
                            color="red">
                            error
                        </v-icon>
                        <v-icon
                            v-else>
                            cloud_download
                        </v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="exportedLink.name"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-container>
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import LayoutWidget from "./LayoutWidget.vue";
    import MapOnlyWidget from "./MapOnlyWidget.vue";

    export default {
        components: {
            "layout-widget": LayoutWidget,
            "map-only-widget": MapOnlyWidget
        },
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {}
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
            showAdvancedOptions: {
                type: Boolean,
                default: true
            },
            showDpiSelect: {
                type: Boolean,
                default: true
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
                }
            }
        },
        computed: {
            activeTab: {
                get: function () {
                    if (this.layout === "MAP_ONLY") {
                        return 1;
                    } else {
                        return 0;
                    }
                },
                set: function (tab) {
                    if (tab === 1) {
                        if (this.layout !== "MAP_ONLY") {
                            this.lastLayout = this.layout;
                        }
                        this.layout = "MAP_ONLY";
                    } else {
                        if (this.lastLayout) {
                            this.layout = this.lastLayout;
                        }
                    }
                }
            },
            reverseExportedLinks() {
                return this.exportedLinks.slice().reverse();
            }
        },
        mounted: function () {
            this.$emit('startup');
        },
        methods: {
            rotate: function () {
                [this.height, this.width] = [this.width, this.height]
            }
        }
    };
</script>
