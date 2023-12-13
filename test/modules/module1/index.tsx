import { Module, customModule, Container } from '@ijstech/components';
import { ScomTwitterPost } from '@scom/scom-twitter-post';

@customModule
export default class Module1 extends Module {
  private postElm: ScomTwitterPost;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  init() {
    super.init();
  }

  render() {
    return (
      <i-vstack margin={{ left: 'auto', right: 'auto' }} maxWidth={960}>
        <i-scom-twitter-post
          id="postElm"
          url='https://twitter.com/helena_mar19/status/1734778568310157406'
          config={{ align: 'center', theme: 'light' }}
        />
      </i-vstack>
    );
  }
}
