import {
  ControlElement,
  customElements,
  Module,
  Container,
  Panel,
  Styles,
} from '@ijstech/components';
import { BlockNoteSpecs, callbackFnType, executeFnType } from '@scom/scom-blocknote-sdk';
import { ITweetConfig, ITweetData, Model } from './model';
const Theme = Styles.Theme.ThemeVars;

interface ScomTwitterPostElement extends ControlElement {
  url: string;
  config?: ITweetConfig;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-twitter-post']: ScomTwitterPostElement;
    }
  }
}

declare const window: any;

@customElements('i-scom-twitter-post')
export class ScomTwitterPost extends Module implements BlockNoteSpecs {
  private model: Model;
  private pnlTwitterPost: Panel;
  private pnlLoading: Panel;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomTwitterPostElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this.model.url;
  }
  set url(value: string) {
    this.model.url = value;
  }

  get config() {
    return this.model.config;
  }
  set config(value: ITweetConfig) {
    this.model.config = value;
  }

  addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType) {
    this.initModel();
    return this.model.addBlock(blocknote, executeFn, callbackFn);
  }

  async setData(data: ITweetData) {
    await this.model.setData({ ...data });
  }

  getData() {
    return this.model.getData();
  }

  getTag() {
    return this.tag;
  }

  async setTag(value: any) {
    this.model.setTag(value);
  }

  getConfigurators() {
    this.initModel();
    return this.model.getConfigurators();
  }

  clear() {
    if (this.pnlTwitterPost) {
      this.pnlTwitterPost.clearInnerHTML();
    }
  }

  private async renderWidget() {
    if (!this.pnlTwitterPost) return;
    this.clear();
    const self = this;
    const id = this.model.getTweetID(this.url);
    if (!id) return;
    const config = this.config || { theme: 'light' };
    window.twttr.ready(
      function (twttr: any) {
        self.pnlLoading.visible = true;
        twttr.widgets.createTweet(
          id,
          self.pnlTwitterPost,
          config
        ).then(function () {
          self.pnlLoading.visible = false;
        });
      }
    );
  }

  private createTwitterPost(wrapper: Panel, url: string) {
    const twitterPostElm = new ScomTwitterPost(wrapper, { url });
    return twitterPostElm;
  }

  private initModel() {
    if (!this.model) {
      this.model = new Model(this);
      this.model.createTwitterPost = this.createTwitterPost.bind(this);
      this.model.updateWidget = this.renderWidget.bind(this);
      this.model.loadLib();
    }
  }

  async init() {
    await super.init();
    this.initModel();
    const url = this.getAttribute('url', true);
    const config = this.getAttribute('config', true);
    if (url) await this.setData({ url, config });
  }

  render() {
    return (
      <i-panel border={{ radius: 'inherit' }}>
        <i-vstack
          id="pnlLoading"
          width="100%"
          minHeight="5rem"
          position="absolute"
          bottom={0}
          zIndex={999}
          background={{ color: 'transparent' }}
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
              width={'1.125rem'}
              height={'1.125rem'}
              fill={Theme.colors.primary.main}
            />
          </i-vstack>
        </i-vstack>
        <i-panel id="pnlTwitterPost"></i-panel>
      </i-panel>
    );
  }
}
