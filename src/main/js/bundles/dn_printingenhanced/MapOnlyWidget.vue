<template>
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
        <v-checkbox
            v-model="showPrintPreview"
            :label="i18n.showPrintPreview"
            color="primary"
            hide-details
            class="mb-2"
        ></v-checkbox>
        <v-checkbox
            v-model="advancedOptions"
            :label="i18n.advancedOptions"
            color="primary"
            hide-details
            class="mb-2"
        ></v-checkbox>
        <v-card
            v-if="advancedOptions"
            class="pa-2">
            <v-layout
                row
                wrap>
                <v-flex
                    md12>
                    <v-checkbox
                        v-model="scaleEnabled"
                        :label="i18n.scaleEnabled"
                        color="primary"
                        hide-details
                        class="pa-0 ma-0"
                    ></v-checkbox>
                </v-flex>
                <v-flex
                    md10>
                    <v-text-field
                        v-model="scale"
                        :label="i18n.scale"
                        :disabled="!scaleEnabled"
                        step="1"
                        type="number"
                        hide-details
                    />
                </v-flex>
                <v-flex
                    md2>
                    <v-btn
                        flat
                        icon
                        color="primary"
                        :disabled="!scaleEnabled"
                        @click="$emit('resetScale')">
                        <v-icon>replay</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex
                    md12>
                    <v-text-field
                        v-model="dpi"
                        :label="i18n.dpi"
                        step="1"
                        type="number"
                        suffix="dpi"
                        hide-details
                    />
                </v-flex>
                <v-flex
                    md12>
                    <v-checkbox
                        v-model="attributionEnabled"
                        :label="i18n.attributionEnabled"
                        color="primary"
                        hide-details
                        class="pa-0 ma-0"
                    ></v-checkbox>
                </v-flex>
            </v-layout>
        </v-card>
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
            dpi: {
                type: Number,
                default: 96
            },
            format: {
                type: String,
                default: "pdf"
            },
            width: {
                type: Number,
                default: 800
            },
            height: {
                type: Number,
                default: 1100
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
            formatList: {
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
        watch: {
            attributionEnabled: function () {
                this.$emit('update:attribution-enabled', this.attributionEnabled);
            },
            dpi: function () {
                this.$emit('update:dpi', this.dpi);
            },
            format: function () {
                this.$emit('update:format', this.format);
            },
            width: function () {
                this.$emit('update:width', this.width);
            },
            height: function () {
                this.$emit('update:height', this.height);
            },
            scale: function () {
                this.$emit('update:scale', this.scale);
            },
            scaleEnabled: function () {
                this.$emit('update:scale-enabled', this.scaleEnabled);
            },
            title: function () {
                this.$emit('update:title', this.title);
            },
            showPrintPreview: function () {
                this.$emit('update:show-print-preview', this.showPrintPreview);
            }
        }
    };
</script>
