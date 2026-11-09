export function createInvitationMusic(audio, controls) {
  const button = controls.querySelector('button');
  const label = controls.querySelector('.music-label');
  const status = controls.querySelector('.music-status');
  let opened = false;
  let userPaused = false;
  let pending = false;
  let request = 0;

  // The audio asset already starts at 0:20 of the original song.
  audio.loop = true;
  audio.volume = 0.65;

  function sync() {
    const active = pending || !audio.paused;
    label.textContent = active ? 'Pause music' : 'Play music';
    button.setAttribute('aria-label', active ? 'Pause wedding music' : 'Play wedding music');
    button.classList.toggle('is-playing', !audio.paused && !pending);
  }

  function showError(message) {
    if (!opened) return;
    status.textContent = message;
    status.hidden = false;
  }

  function pause() {
    request += 1;
    pending = false;
    audio.pause();
    sync();
  }

  async function play() {
    const currentRequest = ++request;
    pending = true;
    status.hidden = true;
    sync();
    try {
      if (audio.error) audio.load();
      await audio.play();
      if (currentRequest !== request) return;
      pending = false;
      sync();
    } catch (error) {
      if (currentRequest !== request) return;
      pending = false;
      sync();
      if (error?.name === 'AbortError') return;
      showError(error?.name === 'NotAllowedError'
        ? 'Tap Play music to start the song.'
        : 'The song couldn’t load. Tap Play music to try again.');
    }
  }

  button.addEventListener('click', () => {
    status.hidden = true;
    if (pending || !audio.paused) {
      userPaused = true;
      pause();
    } else {
      userPaused = false;
      void play();
    }
  });

  audio.addEventListener('playing', () => {
    if (!opened) { pause(); return; }
    pending = false;
    status.hidden = true;
    sync();
  });
  audio.addEventListener('pause', () => { pending = false; sync(); });
  audio.addEventListener('error', () => {
    pause();
    showError('The song couldn’t load. Tap Play music to try again.');
  });

  sync();
  return {
    open() {
      opened = true;
      controls.hidden = false;
      if (!userPaused) return play();
      sync();
      return Promise.resolve();
    },
    close() {
      opened = false;
      controls.hidden = true;
      status.hidden = true;
      pause();
      audio.currentTime = 0;
    },
  };
}
