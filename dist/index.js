var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-twitter-post/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-twitter-post/data.json.ts'/> 
    exports.default = {
        "defaultBuilderData": {
            "url": "https://twitter.com/elonmusk/status/1734398004822712586"
        }
    };
});
define("@scom/scom-twitter-post", ["require", "exports", "@ijstech/components", "@scom/scom-twitter-post/data.json.ts"], function (require, exports, components_1, data_json_1) {
    "use strict";
    var ScomTwitterPost_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomTwitterPost = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    const path = components_1.application.currentModuleDir;
    const widgetsPath = `${path}/lib/widgets.js`;
    let ScomTwitterPost = ScomTwitterPost_1 = class ScomTwitterPost extends components_1.Module {
        constructor(parent, options) {
            super(parent, options);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get url() {
            return this._data.url ?? '';
        }
        set url(value) {
            this._data.url = value ?? '';
        }
        get config() {
            return this._data.config;
        }
        set config(value) {
            this._data.config = value;
        }
        addBlock(blocknote, executeFn, callbackFn) {
            const twitterRegex = /https:\/\/(twitter.com)\/\w*\/status\/(\d{19}$)/g;
            const TweetBlock = blocknote.createBlockSpec({
                type: "tweet",
                propSchema: {
                    ...blocknote.defaultProps,
                    url: { default: '' },
                    width: { default: 512 },
                    height: { default: 'auto' }
                },
                content: "none"
            }, {
                render: (block) => {
                    const wrapper = new components_1.Panel();
                    const { url } = JSON.parse(JSON.stringify(block.props));
                    const customElm = new ScomTwitterPost_1(wrapper, { url });
                    if (typeof callbackFn === "function") {
                        callbackFn(customElm, block);
                    }
                    wrapper.appendChild(customElm);
                    return {
                        dom: wrapper
                    };
                },
                parseFn: () => {
                    return [
                        {
                            tag: "div[data-content-type=tweet]",
                            node: 'tweet'
                        },
                        {
                            tag: "a",
                            getAttrs: (element) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const url = element.getAttribute('href');
                                const match = url && twitterRegex.test(url);
                                twitterRegex.lastIndex = 0;
                                if (match) {
                                    return { url };
                                }
                                return false;
                            },
                            priority: 406,
                            node: 'tweet'
                        },
                        {
                            tag: "p",
                            getAttrs: (element) => {
                                if (typeof element === "string") {
                                    return false;
                                }
                                const child = element.firstChild;
                                if (child?.nodeName === 'A') {
                                    const url = child.getAttribute('href');
                                    const match = url && twitterRegex.test(url);
                                    twitterRegex.lastIndex = 0;
                                    if (match) {
                                        return { url };
                                    }
                                }
                                return false;
                            },
                            priority: 407,
                            node: 'tweet'
                        },
                    ];
                },
                toExternalHTML: (block, editor) => {
                    const link = document.createElement("a");
                    const url = block.props.url || "";
                    link.setAttribute("href", url);
                    link.textContent = 'tweet';
                    const wrapper = document.createElement("p");
                    wrapper.appendChild(link);
                    return { dom: wrapper };
                },
                pasteRules: [
                    {
                        find: twitterRegex,
                        handler(props) {
                            const { state, chain, range } = props;
                            const textContent = state.doc.resolve(range.from).nodeAfter?.textContent;
                            chain().BNUpdateBlock(state.selection.from, {
                                type: "tweet",
                                props: {
                                    url: textContent
                                },
                            }).setTextSelection(range.from + 1);
                        }
                    }
                ]
            });
            const TweetSlashItem = {
                name: "Tweet",
                execute: (editor) => {
                    const block = { type: "tweet", props: { url: "" } };
                    if (typeof executeFn === "function") {
                        executeFn(editor, block);
                    }
                },
                aliases: ["tweet", "widget"]
            };
            return {
                block: TweetBlock,
                slashItem: TweetSlashItem
            };
        }
        async setData(data) {
            this._data = { ...data };
            await this.renderUI();
        }
        getData() {
            return this._data;
        }
        clear() {
            this.pnlTwitterPost.clearInnerHTML();
        }
        async renderUI() {
            this.clear();
            const self = this;
            const id = this.getTweetID(this.url);
            if (!id)
                return;
            const config = this.config || { theme: 'light' };
            window.twttr.ready(function (twttr) {
                self.pnlLoading.visible = true;
                twttr.widgets.createTweet(id, self.pnlTwitterPost, config).then(function () {
                    self.pnlLoading.visible = false;
                });
            });
        }
        getTweetID(url) {
            if (/^\d{19}$/g.test(url))
                return url;
            const regex = /((twitter|x).com)\/\w*\/status\/(\d{19}$)/gm;
            return regex.exec(url)?.[3];
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
        }
        getConfigurators() {
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        return this._getActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Editor',
                    target: 'Editor',
                    getActions: () => {
                        return this._getActions();
                    },
                    setData: this.setData.bind(this),
                    getData: this.getData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getPropertiesSchema() {
            const schema = {
                type: "object",
                required: ["url"],
                properties: {
                    url: {
                        type: "string"
                    }
                }
            };
            return schema;
        }
        _getActions() {
            const propertiesSchema = this.getPropertiesSchema();
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = { url: '' };
                        return {
                            execute: () => {
                                oldData = { ...this._data };
                                if (userInputData?.url)
                                    this._data.url = userInputData.url;
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            undo: () => {
                                this._data = { ...oldData };
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                }
            ];
            return actions;
        }
        async init() {
            super.init();
            await this.initLibs();
            const url = this.getAttribute('url', true);
            const config = this.getAttribute('config', true);
            if (url)
                await this.setData({ url, config });
        }
        async initLibs() {
            const lib = document.getElementById("twitter-wjs");
            if (lib)
                return;
            window.twttr = (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
                if (d.getElementById(id))
                    return t;
                js = d.createElement(s);
                js.id = id;
                js.src = widgetsPath; // "https://platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
                t._e = [];
                t.ready = function (f) {
                    t._e.push(f);
                };
                return t;
            }(document, "script", "twitter-wjs"));
        }
        render() {
            return (this.$render("i-panel", { border: { radius: 'inherit' } },
                this.$render("i-vstack", { id: "pnlLoading", width: "100%", minHeight: 20, position: "absolute", bottom: 0, zIndex: 999, background: { color: 'transparent' }, class: "i-loading-overlay", visible: false, mediaQueries: [
                        {
                            maxWidth: '767px',
                            properties: {
                                height: 'calc(100% - 3.125rem)',
                                top: 0,
                            },
                        },
                    ] },
                    this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: "center", position: "absolute", top: "calc(50% - 0.75rem)", left: "calc(50% - 0.75rem)" },
                        this.$render("i-icon", { class: "i-loading-spinner_icon", name: "spinner", width: '1.125rem', height: '1.125rem', fill: Theme.colors.primary.main }))),
                this.$render("i-panel", { id: "pnlTwitterPost" })));
        }
    };
    ScomTwitterPost = ScomTwitterPost_1 = __decorate([
        (0, components_1.customElements)('i-scom-twitter-post')
    ], ScomTwitterPost);
    exports.ScomTwitterPost = ScomTwitterPost;
});
