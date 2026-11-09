import { settings } from './settings.js';
import { createInvitationMusic } from './music.js';

const cover = document.querySelector('.cover');
const invitation = document.querySelector('.invitation');
const openButton = document.querySelector('.open-invitation');
const replayButton = document.querySelector('footer button');
const heroTitle = document.querySelector('.hero h1');
const music = createInvitationMusic(
  document.querySelector('#wedding-music'),
  document.querySelector('#music-controls'),
);
let opening = false;
heroTitle.tabIndex = -1;
document.body.style.overflow = 'hidden';

openButton.addEventListener('click', () => {
  if (opening) return;
  opening = true;
  openButton.disabled = true;
  // Start within the tap gesture, before the opening animation or any timer.
  void music.open();
  cover.classList.add('is-opening');
  invitation.classList.add('revealed');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => {
    cover.hidden = true;
    invitation.inert = false;
    invitation.removeAttribute('aria-hidden');
    document.body.style.overflow = '';
    heroTitle.focus({ preventScroll: true });
  }, reducedMotion ? 20 : 1850);
});

replayButton.addEventListener('click', () => {
  music.close();
  window.scrollTo({ top: 0, behavior: 'instant' });
  opening = false;
  openButton.disabled = false;
  cover.hidden = false;
  cover.classList.remove('is-opening');
  invitation.classList.remove('revealed');
  invitation.inert = true;
  invitation.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'hidden';
  openButton.focus({ preventScroll: true });
});

const days = Math.max(0, Math.ceil((Date.parse(settings.weddingDate) - Date.now()) / 86400000));
if (days > 0) {
  const countdown = document.createElement('p');
  countdown.className = 'countdown';
  const number = document.createElement('span');
  number.textContent = String(days);
  countdown.append(number, ' days until a new beginning');
  document.querySelector('#celebration').append(countdown);
}
