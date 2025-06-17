///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/*
 * Copyright (C) con terra GmbH
 */
import module from "module";
import { assert } from "chai";
import CustomParametersForm from "../CustomParametersForm.vue";
import { mount } from "@vue/test-utils";

describe(module.id, function () {
    it("change-Event should include new custom text elements configuration", async function () {

        const wrapper = mount(CustomParametersForm as any, {
            stubs: ['v-text-field'],
            provide: {
                getCustomTextElements() {
                    return {
                        "printing-enhanced-layout": [
                            {
                                "map-title": "My map"
                            },
                            {
                                "map-subtitle": "My subtitle"
                            }
                        ]
                    };
                }
            },
            propsData: {
                layoutTemplateName: "printing-enhanced-layout"
            }
        });

        wrapper.vm.inputs = ["Kartentitel", "Untertitel"];
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted("change");

        const event = emitted![0][0];
        assert.equal(event["printing-enhanced-layout"][0]["map-title"], "Kartentitel");
        assert.equal(event["printing-enhanced-layout"][1]["map-subtitle"], "Untertitel");

        assert.isTrue(wrapper.html().includes('map-title'));
        assert.isTrue(wrapper.html().includes('map-subtitle'));
    });
});
