export function offset(el) {
  if (el === window) {
    return { top: 0, left: 0 };
  }
  const { top, left } = el.getBoundingClientRect();
  return { top, left };
}

export function style(el, property) {
  return window.getComputedStyle(el).getPropertyValue(property);
}

export function height(el) {
  return el === window ? window.innerHeight : el.getBoundingClientRect().height;
}

export function width(el) {
  return el === window ? window.innerWidth : el.getBoundingClientRect().width;
}

export function css(element, css) {
  const { style } = element;

  Object.keys(css).forEach(prop => {
    style[prop] = css[prop];
  });
}

export function cssBatch(elements, style) {
  elements.forEach(el => css(el, style));
}

export function ready(fn) {
  if (typeof fn !== 'function') {
    return;
  }

  if (document.readyState !== 'loading') {
    return fn();
  }

  document.addEventListener('DOMContentLoaded', fn, false);
}

// internal
export function childHasFocus(el, focusedEl) {
  if (el === void 0 || el.contains(focusedEl) === true) {
    return true;
  }

  for (
    let next = el.nextElementSibling;
    next !== null;
    next = next.nextElementSibling
  ) {
    if (next.contains(focusedEl)) {
      return true;
    }
  }

  return false;
}

// internal
export function getBodyFullscreenElement(isFullscreen, activeEl) {
  return isFullscreen === true
    ? // when a video tag enters fullscreen activeEl is null
      activeEl === document.documentElement || activeEl === null
      ? document.body
      : activeEl
    : document.body;
}

export default {
  offset,
  style,
  height,
  width,
  css,
  cssBatch,
  ready
};
