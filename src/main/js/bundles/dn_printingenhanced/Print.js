/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
// COPYRIGHT © 2018 Esri
//
// All rights reserved under the copyright laws of the United States
// and applicable international laws, treaties, and conventions.
//
// This material is licensed for use under the Esri Master License
// Agreement (MLA), and is bound by the terms of that agreement.
// You may redistribute and use this code without modification,
// provided you adhere to the terms of the MLA and include this
// copyright notice.
//
// See use restrictions at http://www.esri.com/legal/pdfs/mla_e204_e300/english
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts and Legal Services Department
// 380 New York Street
// Redlands, California, USA 92373
// USA
//
// email: contracts@esri.com
//
// See http://js.arcgis.com/4.12/esri/copyright.txt for details.

/**
 * Defines the layout template options used by the {@link module:esri/widgets/Print|Print} widget to generate the print page.
 *
 * @name templateOptions
 * @since 4.6
 * @instance
 *
 * @example
 * templateOptions: {
 *   title: "My Print",
 *   author: "Sam",
 *   copyright: "My Company",
 *   legendEnabled: false
 * }
 *
 * @type {module:esri/widgets/Print/TemplateOptions}
 * @autocast
 */

define(["require", "exports", "../core/tsSupport/declareExtendsHelper", "../core/tsSupport/decorateHelper", "dojo/i18n!./Print/nls/Print", "../core/Collection", "../core/Logger", "../core/urlUtils", "../core/watchUtils", "../core/accessorSupport/decorators", "../tasks/support/PrintTemplate", "./Widget", "./Print/FileLink", "./Print/PrintViewModel", "./Print/TemplateOptions", "./support/widget"], function (t, e, i, n, a, o, s, r, l, p, d, c, u, h, _, b) {
    var v = o.ofType(u), x = {
        base: "esri-print esri-widget esri-widget--panel",
        headerTitle: "esri-print__header-title",
        inputText: "esri-print__input-text",
        layoutTabList: "esri-print__layout-tab-list",
        layoutTab: "esri-print__layout-tab",
        layoutSection: "esri-print__layout-section",
        mapOnlySection: "esri-print__map-only-section",
        scaleInput: "esri-print__scale-input",
        loader: "esri-print__loader",
        advancedOptionsButton: "esri-print__advanced-options-button",
        advancedOptionsButtonContainer: "esri-print__advanced-options-button-container",
        advancedOptionsButtonTitle: "esri-print__advanced-options-button-title",
        advancedOptionsButtonIconOpened: "esri-print__advanced-options-button-icon--opened",
        advancedOptionsButtonIconClosed: "esri-print__advanced-options-button-icon--closed",
        advancedOptionsButtonIconClosed_RTL: "esri-print__advanced-options-button-icon--closed-rtl",
        refreshButton: "esri-print__refresh-button",
        swapButton: "esri-print__swap-button",
        linkButton: "esri-print__link-button",
        printButton: "esri-print__export-button",
        formSectionContainer: "esri-print__form-section-container",
        advancedOptionsSection: "esri-print__advanced-options-section",
        advancedOptionsContainer: "esri-print__advanced-options-container",
        authorInfoContainer: "esri-print__author-info-container",
        copyrightInfoContainer: "esri-print__copyright-info-container",
        exportedFilesContainer: "esri-print__export-panel-container",
        exportedFilesTitle: "esri-print__export-title",
        exportedFile: "esri-print__exported-file",
        exportedFileLink: "esri-widget__anchor esri-print__exported-file-link",
        exportedFileLinkTitle: "esri-print__exported-file-link-title",
        heightContainer: "esri-print__height-container",
        legendInfoContainer: "esri-print__legend-info-container",
        printWidgetContainer: "esri-print__container",
        panelContainer: "esri-print__panel-container",
        scaleInfoContainer: "esri-print__scale-info-container",
        scaleInputContainer: "esri-print__scale-input-container",
        sizeContainer: "esri-print__size-container",
        widthContainer: "esri-print__width-container",
        widgetButton: "esri-widget--button",
        button: "esri-button",
        select: "esri-select",
        header: "esri-widget__heading",
        input: "esri-input",
        disabled: "esri-disabled",
        anchorDisabled: "esri-widget__anchor--disabled",
        buttonDisabled: "esri-button--disabled",
        panelError: "esri-print__panel--error",
        exportedFileError: "esri-print__exported-file--error",
        hide: "esri-hidden",
        rotate: "esri-rotating",
        iconCheckMark: "esri-icon-check-mark",
        iconDownload: "esri-icon-download",
        iconError: "esri-icon-error",
        iconPrinter: "esri-icon-printer",
        iconRightTriangleArrow: "esri-icon-right-triangle-arrow",
        iconLeftTriangleArrow: "esri-icon-left-triangle-arrow",
        iconDownArrow: "esri-icon-down-arrow",
        iconRefresh: "esri-icon-refresh",
        iconSpinner: "esri-icon-loading-indicator",
        iconSwap: "esri-icon-swap",
        iconLinked: "esri-icon-link-horizontal",
        iconUnlinked: "esri-icon-unlocked-link-horizontal",
        widgetIcon: "esri-icon-printer"
    }, y = s.getLogger("esri.widgets.Print");
    return function (t) {
        function e(e) {
            var i = t.call(this) || this;
            return i._exportedFileNameMap = {}, i._layoutTabSelected = !0, i._advancedOptionsVisibleForLayout = !1, i._advancedOptionsVisibleForMapOnly = !1, i._pendingExportScroll = !1, i._previousTitleOrFilename = "", i._rootNode = null, i._awaitingServerResponse = !1, i.exportedLinks = new v, i.iconClass = x.widgetIcon, i.label = a.widgetLabel, i.templateOptions = new _, i.printServiceUrl = null, i.view = null, i.viewModel = new h, i
        }

        return i(e, t), e.prototype.postInitialize = function () {
            var t = this;
            this.own([l.init(this, "viewModel.templatesInfo", function (e) {
                var i = t.templateOptions, n = i.format, a = i.layout;
                if (e) {
                    var o = a === e.layout.defaultValue || a && "MAP_ONLY" === a.toUpperCase() || e.layout.choiceList && e.layout.choiceList.indexOf(a) > -1,
                        s = n === e.format.defaultValue || e.format.choiceList && e.format.choiceList.indexOf(n) > -1;
                    o || (a && y.warn("User sets an invalid layout, resetting it to the default valid one..."), t.templateOptions.layout = e.layout.defaultValue), s || (n && y.warn("User sets an invalid format, resetting it to the default valid one..."), t.templateOptions.format = e.format.defaultValue), a && "MAP_ONLY" === a.toUpperCase() && (t._layoutTabSelected = !1)
                }
            }), l.init(this, "templateOptions.format", function (e) {
                var i = t.viewModel.templatesInfo;
                if (i && e) {
                    var n = !1;
                    i.format.choiceList && i.format.choiceList.forEach(function (i) {
                        i.toUpperCase() === e.toUpperCase() && (t.templateOptions.format = i, n = !0)
                    }), n || (t.templateOptions.format = i.format.defaultValue, y.warn("User sets an invalid format, resetting it to the default valid one...")), t.scheduleRender()
                }
            }), l.init(this, "templateOptions.layout", function (e) {
                var i = t.viewModel.templatesInfo;
                if (i && e) {
                    t._layoutTabSelected = "MAP_ONLY" !== e.toUpperCase();
                    var n = !t._layoutTabSelected;
                    n || i.layout.choiceList && i.layout.choiceList.forEach(function (i) {
                        i.toUpperCase() === e.toUpperCase() && (t.templateOptions.layout = i, n = !0)
                    }), n || (t.templateOptions.layout = i.layout.defaultValue, y.warn("User sets an invalid layout, resetting it to the default valid one...")), t.scheduleRender()
                }
            }), l.init(this, "templateOptions.dpi", function (e) {
                if (e <= 0) return void (t.templateOptions.dpi = 1);
                t.scheduleRender()
            }), l.init(this, "viewModel.view.scale", function (e) {
                var i = t.templateOptions, n = i.scale;
                i.scaleEnabled && n || (t.templateOptions.scale = e)
            }), l.whenOnce(this, "printServiceUrl", function () {
                var e = setTimeout(function () {
                    t._awaitingServerResponse = !0, t.scheduleRender()
                }, 500);
                t.viewModel.load().then(function () {
                    return clearTimeout(e)
                })
            })]);
            var e = this.templateOptions, i = e.height, n = e.width;
            this.templateOptions.width = n || 800, this.templateOptions.height = i || 1100
        }, e.prototype.render = function () {
            var t, e = this.templateOptions, i = e.attributionEnabled, n = e.author, o = e.copyright, s = e.dpi,
                r = e.format, l = e.height, p = e.layout, d = e.legendEnabled, c = e.title, u = e.scaleEnabled,
                h = e.scale, _ = e.width,
                v = b.tsx("div", {class: x.formSectionContainer}, b.tsx("label", null, this._layoutTabSelected ? a.title : a.fileName, b.tsx("input", {
                    type: "text",
                    tabIndex: 0,
                    placeholder: this._layoutTabSelected ? a.titlePlaceHolder : a.fileNamePlaceHolder,
                    class: this.classes(x.inputText, x.input),
                    value: c,
                    "data-input-name": "title",
                    oninput: this._updateInputValue,
                    bind: this
                }))), y = this.get("viewModel.templatesInfo.format.choiceList") || [],
                f = y.length > 0 ? y.map(function (t) {
                    var e = t === r;
                    return b.tsx("option", {key: t, selected: e, value: t}, t.toUpperCase())
                }) : b.tsx("option", {key: "format-default-option"}, a.formatDefaultOption),
                m = b.tsx("div", {class: x.formSectionContainer}, b.tsx("label", null, a.fileFormatTitle, b.tsx("select", {
                    class: x.select,
                    onchange: this._updateFromOption,
                    "data-target-property": "format",
                    bind: this
                }, f))), g = this.get("viewModel.templatesInfo.layout.choiceList") || [],
                O = g.length > 0 ? g.map(function (t) {
                    var e = t === p, i = a[t] || t;
                    return b.tsx("option", {key: t, selected: e, value: t}, i)
                }) : b.tsx("option", {key: "layout-default-option"}, a.layoutDefaultOption),
                w = b.tsx("div", {class: x.formSectionContainer}, b.tsx("label", null, a.layoutTitle, b.tsx("select", {
                    class: x.select,
                    onchange: this._updateFromOption,
                    "data-target-property": "layout",
                    bind: this
                }, O))), T = b.tsx("div", {class: x.formSectionContainer}, b.tsx("label", null, a.dpi, b.tsx("input", {
                    type: "number",
                    class: this.classes(x.inputText, x.input),
                    "data-input-name": "dpi",
                    oninput: this._updateInputValue,
                    value: "" + s,
                    min: "1",
                    tabIndex: 0,
                    bind: this
                }))),
                C = b.tsx("div", {class: this.classes(x.scaleInfoContainer, x.formSectionContainer)}, b.tsx("label", null, b.tsx("input", {
                    "data-option-name": "scaleEnabled",
                    checked: u,
                    type: "checkbox",
                    tabIndex: 0,
                    onchange: this._toggleInputValue,
                    bind: this
                }), a.scale), b.tsx("div", {class: x.scaleInputContainer}, b.tsx("input", {
                    "aria-label": a.scaleLabel,
                    "aria-valuenow": "" + h,
                    role: "spinbutton",
                    type: "number",
                    class: this.classes(x.inputText, x.input, x.scaleInput),
                    tabIndex: 0,
                    "data-input-name": "scale",
                    oninput: this._updateInputValue,
                    disabled: !u,
                    value: "" + h,
                    bind: this
                }), b.tsx("button", {
                    role: "button",
                    "aria-label": a.reset,
                    class: this.classes(x.widgetButton, x.refreshButton, x.iconRefresh),
                    tabIndex: 0,
                    onclick: this._resetToCurrentScale,
                    bind: this
                }))), I = this._advancedOptionsVisibleForLayout ? b.tsx("div", {
                    "aria-labelledby": this.id + "__advancedOptionsForLayout",
                    class: x.advancedOptionsContainer
                }, C, b.tsx("div", {class: this.classes(x.authorInfoContainer, x.formSectionContainer)}, b.tsx("label", null, a.author, b.tsx("input", {
                    type: "text",
                    value: n,
                    class: this.classes(x.inputText, x.input),
                    tabIndex: 0,
                    "data-input-name": "author",
                    oninput: this._updateInputValue,
                    bind: this
                }))), b.tsx("div", {class: this.classes(x.copyrightInfoContainer, x.formSectionContainer)}, b.tsx("label", null, a.copyright, b.tsx("input", {
                    type: "text",
                    class: this.classes(x.inputText, x.input),
                    tabIndex: 0,
                    value: o,
                    "data-input-name": "copyright",
                    oninput: this._updateInputValue,
                    bind: this
                }))), T, b.tsx("div", {class: this.classes(x.legendInfoContainer, x.formSectionContainer)}, b.tsx("label", null, b.tsx("input", {
                    type: "checkbox",
                    "data-option-name": "legendEnabled",
                    tabIndex: 0,
                    checked: d,
                    onchange: this._toggleInputValue,
                    bind: this
                }), a.legend))) : null, L = this._advancedOptionsVisibleForMapOnly ? b.tsx("div", {
                    "aria-labelledby": this.id + "__advancedOptionsForMapOnly",
                    class: x.advancedOptionsContainer
                }, C, T, b.tsx("div", {class: x.formSectionContainer}, b.tsx("label", null, b.tsx("input", {
                    "data-option-name": "attributionEnabled",
                    type: "checkbox",
                    onchange: this._toggleInputValue,
                    tabIndex: 0,
                    checked: i,
                    bind: this
                }), a.attribution))) : null, S = this._layoutTabSelected ? b.tsx("section", {
                    key: "esri-print__layoutContent",
                    id: this.id + "__layoutContent",
                    "aria-labelledby": this.id + "__layoutTab",
                    class: x.layoutSection,
                    role: "tabpanel",
                    "aria-selected": this._layoutTabSelected
                }, b.tsx("div", {class: x.panelContainer}, v, w, this._layoutTabSelected ? m : null), b.tsx("div", {class: this.classes(x.panelContainer, x.advancedOptionsSection)}, b.tsx("button", {
                    "aria-label": a.advancedOptions,
                    "aria-expanded": this._advancedOptionsVisibleForLayout ? "true" : "false",
                    role: "button",
                    class: x.advancedOptionsButton,
                    onclick: this._showAdvancedOptions,
                    bind: this
                }, b.tsx("div", {class: x.advancedOptionsButtonContainer}, b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconRightTriangleArrow, x.advancedOptionsButtonIconClosed)
                }), b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconLeftTriangleArrow, x.advancedOptionsButtonIconClosed_RTL)
                }), b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconDownArrow, x.advancedOptionsButtonIconOpened)
                }), b.tsx("span", {class: x.advancedOptionsButtonTitle}, a.advancedOptions))), I)) : b.tsx("section", {
                    key: "esri-print__mapOnlyContent",
                    id: this.id + "__mapOnlyContent",
                    "aria-selected": !this._layoutTabSelected,
                    "aria-labelledby": this.id + "__mapOnlyTab",
                    class: x.mapOnlySection,
                    role: "tabpanel"
                }, b.tsx("div", {class: x.panelContainer}, v, this._layoutTabSelected ? null : m, b.tsx("div", {class: this.classes(x.sizeContainer, x.formSectionContainer)}, b.tsx("div", {class: x.widthContainer}, b.tsx("label", null, a.width, b.tsx("input", {
                    type: "text",
                    class: this.classes(x.inputText, x.input),
                    "data-input-name": "width",
                    onchange: this._updateInputValue,
                    value: "" + _,
                    tabIndex: 0,
                    bind: this
                }))), b.tsx("div", {class: x.heightContainer}, b.tsx("label", null, a.height, b.tsx("input", {
                    type: "text",
                    class: this.classes(x.inputText, x.input),
                    "data-input-name": "height",
                    onchange: this._updateInputValue,
                    value: "" + l,
                    tabIndex: 0,
                    bind: this
                }))), b.tsx("button", {
                    role: "button",
                    "aria-label": a.swap,
                    class: this.classes(x.widgetButton, x.swapButton, x.iconSwap),
                    onclick: this._switchInput,
                    tabIndex: 0,
                    bind: this
                })), b.tsx("div", {class: this.classes(x.panelContainer, x.advancedOptionsSection)}, b.tsx("button", {
                    "aria-label": a.advancedOptions,
                    "aria-expanded": this._advancedOptionsVisibleForMapOnly ? "true" : "false",
                    role: "button",
                    class: x.advancedOptionsButton,
                    onclick: this._showAdvancedOptions,
                    bind: this
                }, b.tsx("div", {class: x.advancedOptionsButtonContainer}, b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconRightTriangleArrow, x.advancedOptionsButtonIconClosed)
                }), b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconLeftTriangleArrow, x.advancedOptionsButtonIconClosed_RTL)
                }), b.tsx("span", {
                    "aria-hidden": "true",
                    class: this.classes(x.iconDownArrow, x.advancedOptionsButtonIconOpened)
                }), b.tsx("span", {class: x.advancedOptionsButtonTitle}, a.advancedOptions))), L))),
                k = this.exportedLinks.toArray(), F = this._renderExportedLink(k),
                M = (t = {}, t[x.buttonDisabled] = !p && !r, t),
                V = null != this.get("view") && "2d" !== this.get("view.type"),
                E = b.tsx("div", {class: x.panelError}, V ? a.sceneViewError : a.serviceError),
                B = b.tsx("div", null, b.tsx("ul", {
                    class: x.layoutTabList,
                    role: "tablist",
                    onclick: this._toggleLayoutPanel,
                    onkeydown: this._toggleLayoutPanel,
                    bind: this
                }, b.tsx("li", {
                    id: this.id + "__layoutTab",
                    "data-tab-id": "layoutTab",
                    class: x.layoutTab,
                    role: "tab",
                    tabIndex: 0,
                    "aria-selected": "" + this._layoutTabSelected
                }, a.layoutTab), b.tsx("li", {
                    id: this.id + "__mapOnlyTab",
                    "data-tab-id": "mapOnlyTab",
                    class: x.layoutTab,
                    role: "tab",
                    tabIndex: 0,
                    "aria-selected": "" + !this._layoutTabSelected
                }, a.mapOnlyTab)), S, b.tsx("button", {
                    "aria-label": a.exportDescription,
                    role: "button",
                    class: this.classes(x.printButton, x.button, M),
                    tabIndex: 0,
                    onclick: this._handlePrintMap,
                    bind: this
                }, a.export), b.tsx("div", {
                    class: x.exportedFilesContainer,
                    afterUpdate: this._scrollExportIntoView,
                    onclick: this._removeLink,
                    bind: this
                }, b.tsx("h3", {class: this.classes(x.exportedFilesTitle, x.header)}, a.exportText), k.length > 0 ? null : b.tsx("div", null, b.tsx("div", null, a.exportHint)), F)),
                P = b.tsx("div", null, b.tsx("div", {class: x.printWidgetContainer}, b.tsx("header", {class: x.headerTitle}, a.export), this.error || !this.printServiceUrl || V || !this.view ? E : B)),
                A = "initializing" === this.get("viewModel.state"), U = A ? this._renderLoader() : P;
            return b.tsx("div", {afterCreate: b.storeNode, bind: this, class: x.base, "data-node-ref": "_rootNode"}, U)
        }, e.prototype._renderLoader = function () {
            var t, e = (t = {}, t[x.loader] = this._awaitingServerResponse, t);
            return b.tsx("div", {class: this.classes(e), key: "loader"})
        }, e.prototype._createFileLink = function (t) {
            var e = t.layoutOptions.titleText || a.untitled, i = t.format.toLowerCase(),
                n = i.indexOf("png") > -1 ? "png" : i, o = e + n;
            return void 0 !== this._exportedFileNameMap[o] ? this._exportedFileNameMap[o]++ : this._exportedFileNameMap[o] = 0, new u({
                name: e,
                extension: n,
                count: this._exportedFileNameMap[o]
            })
        }, e.prototype._toPrintTemplate = function (t) {
            var e = t.attributionEnabled, i = t.author, n = t.copyright, a = t.dpi, o = t.forceFeatureAttributes,
                s = t.format, r = t.height, l = t.layout, p = t.legendEnabled, c = t.title, u = t.scale, h = t.width,
                _ = new d({
                    attributionVisible: e,
                    layoutOptions: {authorText: i || "", copyrightText: n || "", titleText: c || ""},
                    forceFeatureAttributes: o,
                    format: s,
                    layout: l,
                    outScale: u
                });
            return h && (_.exportOptions.width = h), r && (_.exportOptions.height = r), a && (_.exportOptions.dpi = a), p || (_.layoutOptions.legendLayers = []), _
        }, e.prototype._resetToCurrentScale = function () {
            this.templateOptions.scale = this.viewModel.view.scale
        }, e.prototype._updateInputValue = function (t) {
            var e = t.target, i = e.getAttribute("data-input-name");
            this.templateOptions[i] = e.value
        }, e.prototype._handlePrintMap = function () {
            var t = this;
            this._pendingExportScroll = !0;
            var e = this._toPrintTemplate(this.templateOptions), i = this._createFileLink(e);
            this.exportedLinks.add(i), this.viewModel.print(e).then(function (t) {
                i.set({url: t && t.url, state: "ready"})
            }).catch(function () {
                i.set({state: "error"})
            }).then(function () {
                return t.scheduleRender()
            })
        }, e.prototype._updateFromOption = function (t) {
            var e = t.target,
                i = e.selectedOptions ? e.selectedOptions.item(0).value : e.options[e.selectedIndex].value,
                n = e.getAttribute("data-target-property");
            this.templateOptions[n] = i
        }, e.prototype._switchInput = function () {
            var t;
            t = [this.templateOptions.height, this.templateOptions.width], this.templateOptions.width = t[0], this.templateOptions.height = t[1]
        }, e.prototype._showAdvancedOptions = function () {
            this._layoutTabSelected ? this._advancedOptionsVisibleForLayout = !this._advancedOptionsVisibleForLayout : this._advancedOptionsVisibleForMapOnly = !this._advancedOptionsVisibleForMapOnly
        }, e.prototype._scrollExportIntoView = function () {
            if (this._pendingExportScroll) {
                this._pendingExportScroll = !1;
                var t = this, e = t._rootNode, i = t._rootNode, n = i.clientHeight, a = i.scrollHeight, o = a - n;
                o > 0 && (e.scrollTop = o)
            }
        }, e.prototype._toggleInputValue = function (t) {
            var e = t.target, i = e.getAttribute("data-option-name");
            this.templateOptions[i] = e.checked, "scaleEnabled" === i && (this.viewModel.scaleEnabled = this.templateOptions.scaleEnabled, this.templateOptions[i] || this._resetToCurrentScale())
        }, e.prototype._removeLink = function (t) {
            var e = t.target, i = e["data-item"];
            i && "error" === i.state && this.exportedLinks.remove(i)
        }, e.prototype._renderExportedLink = function (t) {
            var e = this;
            return t.map(function (t) {
                var i, n, o, s = (i = {}, i[x.anchorDisabled] = "pending" === t.state || "error" === t.state, i),
                    l = (n = {}, n[x.iconSpinner] = "pending" === t.state, n[x.rotate] = "pending" === t.state, n[x.iconDownload] = "ready" === t.state, n[x.iconError] = "error" === t.state, n[x.exportedFileError] = "error" === t.state, n),
                    p = (o = {}, o[x.exportedFileError] = "error" === t.state, o), d = "" === t.url ? null : t.url;
                d && (d = r.addProxy(d));
                var c;
                return c = "pending" === t.state ? a.pending : "ready" === t.state ? a.ready : a.error, b.tsx("div", {
                    "aria-label": c,
                    key: t.formattedName,
                    class: x.exportedFile
                }, b.tsx("a", {
                    "aria-label": t.formattedName + ". " + a.linkReady,
                    href: d,
                    tabIndex: 0,
                    target: "_blank",
                    class: e.classes(x.exportedFileLink, s)
                }, b.tsx("span", {"data-item": t, class: e.classes(l)}), b.tsx("span", {
                    "data-item": t,
                    class: e.classes(x.exportedFileLinkTitle, p)
                }, t.formattedName)))
            })
        }, e.prototype._swapInputValue = function () {
            var t = this._previousTitleOrFilename;
            this._previousTitleOrFilename = this.templateOptions.title, this.templateOptions.title = t
        }, e.prototype._toggleLayoutPanel = function (t) {
            this._swapInputValue();
            var e = t.target;
            if (this._layoutTabSelected = "layoutTab" === e.getAttribute("data-tab-id"), this._layoutTabSelected) {
                var i = this.get("viewModel.templatesInfo.layout.choiceList");
                this.templateOptions.layout = i && i[0]
            } else this.templateOptions.layout = "MAP_ONLY"
        }, n([p.property({type: v}), b.renderable()], e.prototype, "exportedLinks", void 0), n([p.property()], e.prototype, "iconClass", void 0), n([p.property()], e.prototype, "label", void 0), n([b.renderable(), p.property({type: _})], e.prototype, "templateOptions", void 0), n([p.aliasOf("viewModel.error")], e.prototype, "error", void 0), n([p.aliasOf("viewModel.printServiceUrl")], e.prototype, "printServiceUrl", void 0), n([p.aliasOf("viewModel.view"), b.renderable()], e.prototype, "view", void 0), n([p.property({type: h}), b.renderable(["viewModel.templatesInfo", "viewModel.state"])], e.prototype, "viewModel", void 0), n([b.accessibleHandler()], e.prototype, "_toggleLayoutPanel", null), e = n([p.subclass("esri.widgets.Print")], e)
    }(p.declared(c))
});