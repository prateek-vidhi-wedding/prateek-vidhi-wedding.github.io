# Prateek Vidhi Wedding Invitation

A tap-to-open wedding invitation with animated doors, personalized couple artwork, background music, a wedding countdown, venue details, and directions. The site has no forms or guest-data storage.

Website: https://prateek-vidhi-wedding.github.io/

Repository: https://github.com/prateek-vidhi-wedding/prateek-vidhi-wedding.github.io

## Preview locally

1. Open this `standalone-invitation` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. Tap the **P & V** seal to open the invitation.

No npm installation or build step is required. Use Live Server instead of opening the HTML file directly, because the page uses JavaScript modules. Google Fonts load when online; local fonts are used as fallbacks.

## Music

The song starts when a guest taps to open the invitation. A floating Play/Pause button stays available while they browse. If a browser blocks playback, the button lets them start it directly. The song loops while the invitation is open.

`assets/wedding-song.mp3` is a website copy of the supplied MP3 with the first **20 seconds removed**. Playback and each loop therefore start at the original song's 0:20 mark. The original file in Downloads is unchanged.

Reopening the cover stops and resets the song. A guest's choice to pause is remembered while the page remains open.

## Edit the invitation

- `index.html`: names, wording, displayed date, venue, and directions.
- `styles.css`: colors, layout, opening doors, and animations.
- `app.js`: opening/replay controls and countdown.
- `music.js`: music playback, pause/resume, and browser playback feedback.
- `settings.js`: wedding date used by the countdown.
- `assets/`: palace artwork, couple illustration, favicon, and trimmed music.

Wedding: Prateek Singh & Vidhi Singh, 1 March 2027, The Countryside Resort, Prayagraj. Ceremony time remains “Ceremony time to follow.”

Venue address: 148, Nasirapur Jhusi, Andawa, Prayagraj, Uttar Pradesh 221505, India. The directions button uses the Maps link published on the [venue's listing](https://solo.to/countrysideprayag).

## Publish updates

This folder is connected to the repository over HTTPS. Commit and push changes to `main`; GitHub Pages publishes from the repository root. Keep `.nojekyll` with the other website files.

Only the active artwork files are published. Local artwork notes and unused portrait alternatives are ignored by Git.

## Check the files

If Node.js is installed, run `npm test`. The checks cover local resource paths and music controls, including failed playback and cancelled requests. No dependencies are needed.
