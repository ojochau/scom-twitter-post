import {
  ControlElement,
  customElements,
  Module,
  Container,
  Panel,
  Styles,
  application
} from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

interface ScomTwitterPostElement extends ControlElement {
  url: string;
  config?: ITweetConfig;
}

interface ITweetConfig {
  conversation?: 'none';
  align?: 'center'|'right';
  cards?: 'hidden';
  theme?: 'light' | 'dark';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-twitter-post']: ScomTwitterPostElement;
    }
  }
}

interface ITweet {
  url: string;
  config?: ITweetConfig;
}

declare const window: any;

const path = application.currentModuleDir;
const widgetsPath = `${path}/lib/widgets.js`;

@customElements('i-scom-twitter-post')
export class ScomTwitterPost extends Module {
  private pnlContent: Panel;
  private pnlLoading: Panel;

  private _data: ITweet;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomTwitterPostElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this._data.url ?? '';
  }
  set url(value: string) {
    this._data.url = value ?? '';
  }

  get config() {
    return this._data.config;
  }
  set config(value: ITweetConfig) {
    this._data.config = value;
  }

  async setData(data: ITweet) {
    this._data = {...data};
    await this.renderUI();
  }

  getData() {
    return this._data;
  }

  clear() {
    this.pnlContent.clearInnerHTML();
  }

  private async renderUI() {
    this.clear();
    const self = this;
    const id = this.getTweetID(this.url);
    const config = this.config || {theme: 'light'};
    window.twttr.ready(
      function (twttr: any) {
        self.pnlLoading.visible = true;
        twttr.widgets.createTweet(
          id,
          self.pnlContent,
          config
        ).then(function() {
          self.pnlLoading.visible = false;
        });
      }
    );
  }

  private getTweetID(url: string) {
    if (/^\d{19}$/g.test(url)) return url;
    const regex = /(twitter.com)\/\w*\/status\/(\d{19}$)/gm;
    return regex.exec(url)?.[2];
  }

  async init() {
    super.init();
    await this.initLibs();
    const url = this.getAttribute('url', true);
    const config = this.getAttribute('config', true);
    if (url) await this.setData({ url, config });
  }

  private async initLibs() {
    const lib = document.getElementById("twitter-wjs");
    if (lib) return;
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = widgetsPath; // "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
    
      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
    
      return t;
    }(document, "script", "twitter-wjs"));
  }

  render() {
    return (
      <i-panel border={{ radius: 'inherit' }}>
        <i-vstack
          id="pnlLoading"
          width="100%"
          minHeight={200}
          position="absolute"
          bottom={0}
          zIndex={999}
          background={{ color: Theme.background.main }}
          class="i-loading-overlay"
          visible={false}
          mediaQueries={[
            {
              maxWidth: '767px',
              properties: {
                height: 'calc(100% - 3.125rem)',
                top: 0,
              },
            },
          ]}
        >
          <i-vstack
            horizontalAlignment="center"
            verticalAlignment="center"
            position="absolute"
            top="calc(50% - 0.75rem)"
            left="calc(50% - 0.75rem)"
          >
            <i-icon
              class="i-loading-spinner_icon"
              name="spinner"
              width={24}
              height={24}
              fill={Theme.colors.primary.main}
            />
          </i-vstack>
        </i-vstack>
        <i-panel id="pnlContent"></i-panel>
      </i-panel>
    );
  }
}
