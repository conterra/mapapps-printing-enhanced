/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const defaultLayouts = [
    {id: "a3-landscape", name: "A3 Landscape"},
    {id: "a3-portrait", name: "A3 Portrait"},
    {id: "a4-landscape", name: "A4 Landscape"},
    {id: "a4-portrait", name: "A4 Portrait"},
    {id: "letter-ansi-a-landscape", name: "Letter ANSI A Landscape"},
    {id: "letter-ansi-a-portrait", name: "Letter ANSI A Portrait"},
    {id: "tabloid-ansi-b-landscape", name: "Tabloid ANSI B Landscape"},
    {id: "tabloid-ansi-b-portrait", name: "Tabloid ANSI B Portrait"}
];

export default {

    getLayoutId(layoutName) {
        const value = defaultLayouts.find((layoutObj) => layoutObj.name === layoutName);
        return value ? value.id : layoutName;
    },

    getLayoutName(layoutId) {
        const value = defaultLayouts.find((layoutObj) => layoutObj.id === layoutId);
        return value ? value.name : layoutId;
    }

}
