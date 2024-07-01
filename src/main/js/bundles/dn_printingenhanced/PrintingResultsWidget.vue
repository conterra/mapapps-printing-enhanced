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
        class="pa-2"
    >
        <v-list
            v-if="reverseExportedLinks.length"
            dense
        >
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
                    />
                    <v-icon
                        v-else-if="exportedLink.error"
                        color="red"
                    >
                        error
                    </v-icon>
                    <v-icon
                        v-else
                    >
                        cloud_download
                    </v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                    <v-list-tile-title v-text="exportedLink.name" />
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
        <v-alert
            v-else
            :value="true"
            type="warning"
            outline
            class="ma-0"
        >
            {{ i18n.noPrintResults }}
        </v-alert>
    </v-container>
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
            exportedLinks: {
                type: Array,
                default: () => []
            }
        },
        computed: {
            reverseExportedLinks() {
                return this.exportedLinks.slice().reverse();
            }
        }
    };
</script>
