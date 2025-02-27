import Vue from 'vue';

import { isSSR, fromSSR } from './Platform.js';
import { listenOpts, noop } from '../utils/event.js';
import debounce from '../utils/debounce.js';

const SIZE_LIST = ['sm', 'md', 'lg', 'xl'];
const { passive } = listenOpts;

export default {
  width: 0,
  height: 0,

  name: 'xs',

  sizes: {
    sm: 600,
    md: 1024,
    lg: 1440,
    xl: 1920
  },

  lt: {
    sm: true,
    md: true,
    lg: true,
    xl: true
  },
  gt: {
    xs: false,
    sm: false,
    md: false,
    lg: false
  },
  xs: true,
  sm: false,
  md: false,
  lg: false,
  xl: false,

  setSizes: noop,
  setDebounce: noop,

  install($q, queues, cfg) {
    if (isSSR === true) {
      $q.screen = this;
      return;
    }

    const classes = cfg.screen !== void 0 && cfg.screen.bodyClasses === true;

    const update = force => {
      const w = window.innerWidth,
        h = window.innerHeight;

      if (h !== this.height) {
        this.height = h;
      }

      if (w !== this.width) {
        this.width = w;
      } else if (force !== true) {
        return;
      }

      let s = this.sizes;

      this.gt.xs = w >= s.sm;
      this.gt.sm = w >= s.md;
      this.gt.md = w >= s.lg;
      this.gt.lg = w >= s.xl;
      this.lt.sm = w < s.sm;
      this.lt.md = w < s.md;
      this.lt.lg = w < s.lg;
      this.lt.xl = w < s.xl;
      this.xs = this.lt.sm;
      this.sm = this.gt.xs === true && this.lt.md === true;
      this.md = this.gt.sm === true && this.lt.lg === true;
      this.lg = this.gt.md === true && this.lt.xl === true;
      this.xl = this.gt.lg;

      s =
        (this.xs === true && 'xs') ||
        (this.sm === true && 'sm') ||
        (this.md === true && 'md') ||
        (this.lg === true && 'lg') ||
        'xl';

      if (s !== this.name) {
        if (classes === true) {
          document.body.classList.remove(`screen--${this.name}`);
          document.body.classList.add(`screen--${s}`);
        }
        this.name = s;
      }
    };

    let updateEvt,
      updateSizes = {},
      updateDebounce = 16;

    this.setSizes = sizes => {
      SIZE_LIST.forEach(name => {
        if (sizes[name] !== void 0) {
          updateSizes[name] = sizes[name];
        }
      });
    };
    this.setDebounce = deb => {
      updateDebounce = deb;
    };

    const start = () => {
      const style = getComputedStyle(document.body),
        target =
          window.visualViewport !== void 0 ? window.visualViewport : window;

      // if css props available
      if (style.getPropertyValue('--q-size-sm')) {
        SIZE_LIST.forEach(name => {
          this.sizes[name] = parseInt(
            style.getPropertyValue(`--q-size-${name}`),
            10
          );
        });
      }

      this.setSizes = sizes => {
        SIZE_LIST.forEach(name => {
          if (sizes[name]) {
            this.sizes[name] = sizes[name];
          }
        });
        update(true);
      };

      this.setDebounce = delay => {
        updateEvt !== void 0 &&
          target.removeEventListener('resize', updateEvt, passive);
        updateEvt = delay > 0 ? debounce(update, delay) : update;
        target.addEventListener('resize', updateEvt, passive);
      };

      this.setDebounce(updateDebounce);

      if (Object.keys(updateSizes).length > 0) {
        this.setSizes(updateSizes);
        updateSizes = void 0; // free up memory
      } else {
        update();
      }

      // due to optimizations, this would be left out otherwise
      classes === true &&
        this.name === 'xs' &&
        document.body.classList.add(`screen--xs`);
    };

    if (fromSSR === true) {
      queues.takeover.push(start);
    } else {
      start();
    }

    Vue.util.defineReactive($q, 'screen', this);
  }
};
