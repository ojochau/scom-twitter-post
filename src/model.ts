import { application, IDataSchema, Module, Panel } from '@ijstech/components';
import dataJson from './data.json';
import { callbackFnType, executeFnType } from '@scom/scom-blocknote-sdk';

export interface ITweetConfig {
  conversation?: 'none';
  align?: 'center' | 'right';
  cards?: 'hidden';
  theme?: 'light' | 'dark';
}

export interface ITweetData {
  url: string;
  config?: ITweetConfig;
}

declare const window: any;
const path = application.currentModuleDir;

export class Model {
  private module: Module;
  private moduleDir: string;
  private _data: ITweetData = { url: '' };
  updateWidget: () => void;
  createTwitterPost: (wrapper: Panel, url: string) => Module;

  constructor(module: Module) {
    this.module = module;
    this.moduleDir = this.module.currentModuleDir ?? path ?? '';
  }

  get url() {
    return this._data.url || '';
  }

  set url(value: string) {
    this._data.url = value ?? '';
    this.updateWidget();
  }

  get config() {
    return this._data.config;
  }

  set config(value: ITweetConfig) {
    this._data.config = value;
  }

  addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType) {
    const twitterRegex = /https:\/\/(twitter.com)\/\w*\/status\/(\d{19}$)/g;
    const blockType = "tweet";

    const TweetBlock = blocknote.createBlockSpec(
      {
        type: blockType,
        propSchema: {
          ...blocknote.defaultProps,
          url: { default: '' },
          width: { default: 512 },
          height: { default: 'auto' }
        },
        content: "none"
      },
      {
        render: (block: any) => {
          const wrapper = new Panel();
          const { url } = JSON.parse(JSON.stringify(block.props));
          const customElm = this.createTwitterPost(wrapper, url);
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
              getAttrs: (element: string | HTMLElement) => {
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
              getAttrs: (element: string | HTMLElement) => {
                if (typeof element === "string") {
                  return false;
                }
                const child = element.firstChild as HTMLElement;
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
          ]
        },
        toExternalHTML: (block: any, editor: any) => {
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
            handler(props: any) {
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
      execute: (editor: any) => {
        const block = { type: blockType, props: { url: "" } };
        if (typeof executeFn === "function") {
          executeFn(editor, block);
        }
      },
      aliases: ["tweet", "widget"],
      group: "Widget",
      icon: { image: { url: twitterImg, width: '100%', height: '100%', display: 'inline-block' } },
      hint: "Insert a twitter post"
    }

    const moduleData = {
      name: '@scom/scom-twitter-post',
      localPath: 'scom-twitter-post'
    }

    return {
      block: TweetBlock,
      slashItem: TweetSlashItem,
      moduleData
    };
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
        setData: async (data: ITweetData) => {
          const defaultData = dataJson.defaultBuilderData;
          await this.setData({ ...defaultData, ...data });
        },
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: () => {
          return this._getActions()
        },
        setData: this.setData.bind(this),
        getData: this.getData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  private getPropertiesSchema() {
    const schema: IDataSchema = {
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

  private _getActions() {
    const propertiesSchema = this.getPropertiesSchema();
    const actions = [
      {
        name: 'Edit',
        icon: 'edit',
        command: (builder: any, userInputData: any) => {
          let oldData = { url: '' };
          return {
            execute: () => {
              oldData = { ...this._data };
              if (userInputData?.url) this._data.url = userInputData.url;
              if (builder?.setData) builder.setData(this._data);
            },
            undo: () => {
              this._data = { ...oldData };
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: propertiesSchema as IDataSchema
      }
    ]
    return actions;
  }

  async setData(value: ITweetData) {
    this._data = value;
    this.updateWidget();
  }

  getData() {
    return this._data;
  }

  getTag() {
    return this.module.tag;
  }

  setTag(value: any) {
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop)) {
        if (prop === 'light' || prop === 'dark')
          this.updateTag(prop, newValue[prop]);
        else
          this.module.tag[prop] = newValue[prop];
      }
    }
    this.updateTheme();
  }

  private updateTag(type: 'light' | 'dark', value: any) {
    this.module.tag[type] = this.module.tag[type] ?? {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop))
        this.module.tag[type][prop] = value[prop];
    }
  }

  private updateStyle(name: string, value: any) {
    if (value) {
      this.module.style.setProperty(name, value);
    } else {
      this.module.style.removeProperty(name);
    }
  }

  private updateTheme() {
    const themeVar = document.body.style.getPropertyValue('--theme') || 'light';
    this.updateStyle('--text-primary', this.module.tag[themeVar]?.fontColor);
    this.updateStyle('--background-main', this.module.tag[themeVar]?.backgroundColor);
  }

  getTweetID(url: string) {
    if (/^\d{19}$/g.test(url)) return url;
    const regex = /((twitter|x).com)\/\w*\/status\/(\d{19}$)/gm;
    return regex.exec(url)?.[3];
  }

  loadLib() {
    const lib = document.getElementById("twitter-wjs");
    if (lib) return;
    const widgetsPath = `${this.moduleDir}/lib/widgets.js`;
    window.twttr = (function (d, s, id, path) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
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
}
