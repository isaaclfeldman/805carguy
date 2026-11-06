'use strict';

// Contact details stay usable without a mail app: any [data-copy] control copies its text.
(() => {
  const feedbackMs = 2200;

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.append(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    area.remove();
    return copied;
  }

  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Permission can be refused; fall back to the selection approach.
      }
    }
    return fallbackCopy(text);
  }

  document.addEventListener('click', async event => {
    const control = event.target.closest('[data-copy]');
    if (!control) return;
    event.preventDefault();
    if (!control.dataset.copyLabel) control.dataset.copyLabel = control.textContent;
    const copied = await copy(control.dataset.copy);
    control.textContent = copied ? 'Copied' : control.dataset.copy;
    control.classList.toggle('copied', copied);
    setTimeout(() => {
      control.textContent = control.dataset.copyLabel;
      control.classList.remove('copied');
    }, feedbackMs);
  });
})();
