import Component from '@ember/component';
import Penpal from 'penpal';

// I've killed all type information and replaced:
// this.x = 'foo' with this.set('x', 'foo')
// and
// let foo = this.x with let foo = this.get('x')
// because my props weren't being set correctly w/o this
//
// sorry to do this to your nice code

export default Component.extend({
  classNames: ['monaco-editor'],

  _conn: null,
  theme: 'vs-dark',
  onKeyCommand() {},

  buildEditorOptions() {
    let code = this.get('code')
    let language = this.get('language')
    let theme = this.get('theme')
    return { value: code, language, theme };
  },

  _onKeyCommand(evt) {
    this.get('onKeyCommand') && this.get('onKeyCommand')(evt);
  },

  onEditorTextChanged(value, event) {
    if (value === this.get('code')) {
      // if our editor is already up to date
      return; // no change
    }
    this.set('code', value);
    if (this.get('onChange')) {
      this.get('onChange')(value);
    }
  },

  didInsertElement() {
    this._super(...arguments);
    let container = this.get('element').querySelector(
      '.frame-container'
    );
    if (!container) {
      throw new Error('No frame container found');
    }
    this.set('_conn', Penpal.connectToChild({
      appendTo: container,
      methods: {
        onValueChanged: this.get('onEditorTextChanged').bind(this),
        keyCommand: this.get('_onKeyCommand').bind(this)
      },
      url: '/ember-monaco/frame.html'
    }));
    this.get('_conn').promise.then(frameApi => {
      let code = this.get('code')
      let language = this.get('language')
      let theme = this.get('theme')
      frameApi.setupEditor({
        language,
        theme,
        value: code
      });
    });
  },

  willDestroyElement() {
    this._super(...arguments)
    this.get('_conn').destroy();
  },
})
