import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvitationMusic } from '../music.js';

class AudioStub extends EventTarget {
  paused = true;
  currentTime = 0;
  playCalls = 0;
  loadCalls = 0;
  error = null;
  play() {
    this.playCalls += 1;
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  load() { this.loadCalls += 1; this.error = null; }
}

function setup() {
  const audio = new AudioStub();
  const button = new EventTarget();
  const attributes = new Map();
  button.setAttribute = (name, value) => attributes.set(name, value);
  button.classList = { toggle() {} };
  const label = { textContent: '' };
  const status = { textContent: '', hidden: true };
  const controls = {
    hidden: true,
    querySelector: selector => ({ button, '.music-label': label, '.music-status': status })[selector],
  };
  const page = new EventTarget();
  page.hidden = false;
  const lifecycle = new EventTarget();
  const music = createInvitationMusic(audio, controls, page, lifecycle);
  const click = () => button.dispatchEvent(new Event('click'));
  return { audio, label, status, controls, music, attributes, click, page, lifecycle };
}

test('music waits for opening and calls play synchronously within that interaction', async () => {
  const { audio, music, controls, label, attributes } = setup();
  assert.equal(audio.playCalls, 0);
  assert.equal(controls.hidden, true);
  const opening = music.open();
  assert.equal(audio.playCalls, 1);
  await opening;
  assert.equal(audio.loop, true);
  assert.equal(controls.hidden, false);
  assert.equal(label.textContent, 'Pause music');
  assert.equal(attributes.get('aria-label'), 'Pause wedding music');
});

test('pause and resume keep the song position and respect an explicit pause on reopening', async () => {
  const { audio, music, click, label } = setup();
  await music.open();
  audio.currentTime = 47;
  click();
  assert.equal(audio.paused, true);
  assert.equal(label.textContent, 'Play music');
  click();
  assert.equal(audio.paused, false);
  assert.equal(audio.currentTime, 47);
  click();
  music.close();
  await music.open();
  assert.equal(audio.playCalls, 2);
  assert.equal(audio.paused, true);
  assert.equal(label.textContent, 'Play music');
});

test('returning to the cover stops the song and the next opening starts at the trimmed beginning', async () => {
  const { audio, music, controls } = setup();
  await music.open();
  audio.currentTime = 85;
  music.close();
  assert.equal(audio.paused, true);
  assert.equal(audio.currentTime, 0);
  assert.equal(controls.hidden, true);
  await music.open();
  assert.equal(audio.playCalls, 2);
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.paused, false);
});

test('blocked playback offers a working direct play button without breaking the invitation', async () => {
  const { audio, music, status, label, click } = setup();
  audio.play = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
  await music.open();
  assert.equal(status.hidden, false);
  assert.match(status.textContent, /Tap Play music/);
  assert.equal(label.textContent, 'Play music');
  audio.play = AudioStub.prototype.play;
  click();
  assert.equal(audio.paused, false);
  assert.equal(status.hidden, true);
  assert.equal(label.textContent, 'Pause music');
});

test('a cancelled old request cannot overwrite a successful new playback', async () => {
  const { audio, music, status, label, controls } = setup();
  let rejectOld;
  audio.play = () => new Promise((resolve, reject) => { rejectOld = reject; });
  const oldRequest = music.open();
  music.close();
  audio.play = AudioStub.prototype.play;
  await music.open();
  rejectOld(new Error('Old network failure'));
  await oldRequest;
  assert.equal(controls.hidden, false);
  assert.equal(audio.paused, false);
  assert.equal(label.textContent, 'Pause music');
  assert.equal(status.hidden, true);
});

test('a failed audio load can be retried from the music control', async () => {
  const { audio, music, status, click } = setup();
  await music.open();
  audio.error = { code: 2 };
  audio.dispatchEvent(new Event('error'));
  assert.equal(status.hidden, false);
  assert.equal(audio.paused, true);
  click();
  assert.equal(audio.loadCalls, 1);
  assert.equal(audio.paused, false);
  assert.equal(status.hidden, true);
});

test('switching tabs pauses music and returning requires an explicit play', async () => {
  const { audio, music, page, click, label } = setup();
  await music.open();
  audio.currentTime = 32;
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(audio.paused, true);
  assert.equal(label.textContent, 'Play music');
  click();
  assert.equal(audio.paused, true);
  page.hidden = false;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(audio.paused, true);
  click();
  assert.equal(audio.paused, false);
  assert.equal(audio.currentTime, 32);
});

test('leaving the page pauses music and a restored page stays silent', async () => {
  const { audio, music, lifecycle, click } = setup();
  await music.open();
  lifecycle.dispatchEvent(new Event('pagehide'));
  assert.equal(audio.paused, true);
  lifecycle.dispatchEvent(new Event('pageshow'));
  assert.equal(audio.paused, true);
  click();
  assert.equal(audio.paused, false);
});

test('late playback cannot start music after the tab becomes hidden', async () => {
  const { audio, music, page, label } = setup();
  let finish;
  audio.play = () => new Promise(resolve => { finish = resolve; });
  const opening = music.open();
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  audio.paused = false;
  audio.dispatchEvent(new Event('playing'));
  finish();
  await opening;
  assert.equal(audio.paused, true);
  assert.equal(label.textContent, 'Play music');
});
