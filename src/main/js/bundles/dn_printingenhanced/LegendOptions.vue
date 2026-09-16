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
    <v-flex
        v-if="modeSelectable"
        md12
    >
        <v-checkbox
            v-if="checkboxMode"
            v-model="checkboxValue"
            :label="i18n[checkboxTargetMode]"
            color="primary"
            hide-details
            class="pa-0 ma-0"
        />
        <v-radio-group
            v-else
            v-model="legendValueComp"
        >
            <v-radio
                v-for="mode in legendModes"
                :key="mode"
                :value="mode"
                :label="i18n[mode]"
                color="primary"
            />
        </v-radio-group>
    </v-flex>
</template>
<script>
    export default {
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            legendModes: {
                type: Array,
                default: () => []
            },
            legendValue: {
                type: String,
                default: "noLegend"
            }
        },
        computed: {
            // Should the legend option be shown in the ui at all? With 0 or 1 modes configured there is no real choice: no UI is shown and
            // that mode (or "noLegend" if none is configured) is used automatically.
            modeSelectable: {
                get: function () {
                    return this.legendModes.length >= 2;
                }
            },

            // When exactly 2 modes are available, and one of them is "noLegend", a checkbox is shown instead of radio buttons
            checkboxMode: {
                get: function () {
                    return this.legendModes.length === 2 && this.legendModes.includes("noLegend");
                }
            },

            // Find the mode the checkbox is enabling
            checkboxTargetMode: {
                get: function () {
                    return this.legendModes.find((mode) => mode !== "noLegend");
                }
            },

            // Value of the radio button selection
            legendValueComp: {
                get: function () {
                    if (this.legendModes.includes(this.legendValue)) {
                        return this.legendValue;
                    }
                    if (this.legendModes.includes("noLegend")) {
                        return "noLegend";
                    }
                    return this.legendModes[0] || "noLegend";
                },
                set: function (legendValue) {
                    this.$emit("update:legend-value", legendValue);
                }
            },

            // Value of the checkbox
            checkboxValue: {
                get: function () {
                    return this.legendValueComp !== "noLegend";
                },
                set: function (checked) {
                    this.legendValueComp = checked ? this.checkboxTargetMode : "noLegend";
                }
            }
        }
    };
</script>
