<template>
    <v-container
        grid-list-md
        fluid
        class="pa-1">
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
                    :format.sync="format"
                    :layout.sync="layout"
                    :legend-enabled.sync="legendEnabled"
                    :scale.sync="scale"
                    :scale-enabled.sync="scaleEnabled"
                    :title.sync="title"
                    :format-list="formatList"
                    :layout-list="layoutList"
                    :show-print-preview.sync="showPrintPreview"/>
            </v-tab-item>
            <v-tab-item>
                <map-only-widget
                    :i18n="i18n"
                    :attribution-enabled.sync="attributionEnabled"
                    :dpi.sync="dpi"
                    :format.sync="format"
                    :width.sync="width"
                    :height.sync="height"
                    :scale.sync="scale"
                    :scale-enabled.sync="scaleEnabled"
                    :title.sync="title"
                    :format-list="formatList"
                    :show-print-preview.sync="showPrintPreview"
                    @rotate="rotate"/>
            </v-tab-item>
        </v-tabs>
        <v-btn
            block
            ripple
            color="primary"
            @click="$emit('print', {})">
            <v-icon
                dark
                left>
                save_alt
            </v-icon>
            {{ i18n.print }}
        </v-btn>
        <v-divider class="my-3"></v-divider>
        <h3 v-if="exportedLinks.length">{{ i18n.exports}}</h3>
        <v-list
            dense>
            <v-list-tile
                v-for="exportedLink in exportedLinks"
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
            forceFeatureAttributes: {
                type: Boolean,
                default: false
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
            templatesInfo: {
                type: Object,
                default: () => {
                }
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
            showPrintPreview: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                advancedOptions: false
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
                        this.lastLayout = this.layout;
                        this.layout = "MAP_ONLY";
                    } else {
                        if (this.lastLayout) {
                            this.layout = this.lastLayout;
                        }
                    }
                }
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
