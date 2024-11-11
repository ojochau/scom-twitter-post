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
            const blockType = "tweet";
            const TweetBlock = blocknote.createBlockSpec({
                type: blockType,
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
                                type: blockType,
                                props: {
                                    url: textContent
                                },
                            }).setTextSelection(range.from + 1);
                        }
                    }
                ]
            });
            const twitterImg = "data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2032%2032%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Crect%20width%3D%2732%27%20height%3D%2732%27%20fill%3D%27none%27%2F%3E%3Cpath%20d%3D%27M17.9686%2014.1623L26.7065%204H24.6358L17.0488%2012.8238L10.9891%204H4L13.1634%2017.3432L4%2028H6.07069L14.0827%2018.6817L20.4822%2028H27.4714L17.9681%2014.1623H17.9686ZM15.1326%2017.4607L14.2041%2016.132L6.81679%205.55961H9.99723L15.9589%2014.0919L16.8873%2015.4206L24.6368%2026.5113H21.4564L15.1326%2017.4612V17.4607Z%27%20fill%3D%27white%27%2F%3E%3C%2Fsvg%3E";
            const TweetSlashItem = {
                name: "Tweet",
                execute: (editor) => {
                    const block = { type: blockType, props: { url: "" } };
                    if (typeof executeFn === "function") {
                        executeFn(editor, block);
                    }
                },
                aliases: ["tweet", "widget"],
                group: "Widget",
                icon: { image: { url: twitterImg, width: '100%', height: '100%', display: 'inline-block' } },
                hint: "Insert a twitter post"
            };
            const moduleData = {
                name: '@scom/scom-twitter-post',
                localPath: 'scom-twitter-post'
            };
            return {
                block: TweetBlock,
                slashItem: TweetSlashItem,
                moduleData
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
            await super.init();
            this._moduleDir = this.currentModuleDir ?? path ?? '';
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
            const widgetsPath = `${this._moduleDir}/lib/widgets.js`;
            window.twttr = (function (d, s, id, path) {
                var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
                if (d.getElementById(id))
                    return t;
                js = d.createElement(s);
                js.id = id;
                js.src = path; // "https://platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
                t._e = [];
                t.ready = function (f) {
                    t._e.push(f);
                };
                return t;
            }(document, "script", "twitter-wjs", widgetsPath));
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
