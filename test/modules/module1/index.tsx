import { Module, customModule, Container } from '@ijstech/components';
import { ScomTwitterPost } from '@scom/scom-twitter-post';
import ScomWidgetTest from '@scom/scom-widget-test';

@customModule
export default class Module1 extends Module {
  private postElm: ScomTwitterPost;
  private widgetModule: ScomWidgetTest;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  private async onShowConfig() {
    const editor = this.postElm.getConfigurators().find(v => v.target === 'Editor');
    const widgetData = await editor.getData();
    if (!this.widgetModule) {
      this.widgetModule = await ScomWidgetTest.create({
        widgetName: 'scom-twitter-post',
        onConfirm: (data: any, tag: any) => {
          editor.setData(data);
          editor.setTag(tag);
          this.widgetModule.closeModal();
        }
      });
    }
    this.widgetModule.openModal({
      width: '90%',
      maxWidth: '90rem',
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      closeOnBackdropClick: true,
      closeIcon: null
    });
    this.widgetModule.show(widgetData);
  }

  init() {
    super.init();
  }

  render() {
    return (
      <i-vstack
        margin={{ top: '1rem', left: '1rem', right: '1rem' }}
        gap="1rem"
        alignItems="center"
      >
        <i-button caption="Config" onClick={this.onShowConfig} width={160} padding={{ top: 5, bottom: 5 }} margin={{ left: 'auto', right: 20 }} font={{ color: '#fff' }} />
        <i-panel width={400} maxWidth="100%">
          <i-scom-twitter-post
            id="postElm"
            url="https://twitter.com/elonmusk/status/1734398004822712586"
          />
        </i-panel>
      </i-vstack>
    );
  }
}
