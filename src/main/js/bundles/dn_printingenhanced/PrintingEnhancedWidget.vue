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
                <v-container
                    grid-list-md
                    fluid
                    class="pa-1">
                    <v-layout
                        row
                        wrap>
                        <v-flex
                            md12>
                            <v-text-field
                                v-model="title"
                                :label="i18n.title"
                                :placeholder="i18n.titlePlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-select
                                v-model="format"
                                :items="formatList"
                                :label="i18n.format"
                                hide-details
                            ></v-select>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-select
                                v-model="layout"
                                :items="layoutList"
                                :label="i18n.layout"
                                hide-details
                            ></v-select>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-tab-item>
            <v-tab-item>
                <v-container
                    grid-list-md
                    fluid
                    class="pa-1">
                    <v-layout
                        row
                        wrap>
                        <v-flex
                            md12>
                            <v-text-field
                                v-model="title"
                                :label="i18n.file"
                                :placeholder="i18n.filePlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-select
                                v-model="format"
                                :items="formatList"
                                :label="i18n.format"
                                hide-details
                            ></v-select>
                        </v-flex>
                        <v-flex
                            md5>
                            <v-text-field
                                v-model="width"
                                :label="i18n.width"
                                step="1"
                                type="number"
                                suffix="px"
                                hide-details
                            />
                        </v-flex>
                        <v-flex
                            md5>
                            <v-text-field
                                v-model="height"
                                :label="i18n.height"
                                step="1"
                                type="number"
                                suffix="px"
                                hide-details
                            />
                        </v-flex>
                        <v-flex
                            md2>
                            <v-btn
                                flat
                                icon
                                color="primary"
                                @click="rotate">
                                <v-icon>rotate_90_degrees_ccw</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
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
        <h3 v-if="exportedLinks.length">Exports</h3>
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

    export default {
        components: {},
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {
                        layer: "Layer:"
                    }
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
                default: 800
            },
            layout: {
                type: String,
                default: "a3-landscape"
            },
            legendEnabled: {
                type: Boolean,
                default: true
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
            }
        },
        data() {
            return {
                activeTab: null
            }
        },
        watch: {
            activeTab: function (tab) {
                if (tab === 1) {
                    this.lastLayout = this.layout;
                    this.layout = "MAP_ONLY";
                } else {
                    if (this.lastLayout) {
                        this.layout = this.lastLayout;
                    }
                }
            }
        },
        mounted: function () {
            this.$emit('startup');
        },
        methods: {
            rotate: function () {
                const height = this.height;
                const width = this.width;
                this.height = width;
                this.width = height;
            }
        }
    };
</script>