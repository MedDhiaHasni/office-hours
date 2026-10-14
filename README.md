# Office Hours

A Vampire Survivors-style browser game in which you play a burnt-out professor trying to survive five minutes of students swarming your office.

No installation required. Open the link and play.

**Play now:** [https://meddhiahasni.github.io/office-hours/](https://meddhiahasni.github.io/office-hours/)

Supported on desktop browsers. Mobile support is planned.

## Table of Contents

- [The Story](#the-story)
- [How to Play](#how-to-play)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Build and Deploy](#build-and-deploy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## The Story

It is 3 PM on a Friday, and you just want to go home. But it is office hours, and the students keep coming: freshmen, gunners, sleepers, email demons, and even the Dean himself. Survive until 4:00 PM and you have earned the weekend.

---

## How to Play

| Action      | Control                            |
|-------------|------------------------------------|
| Move        | `WASD` or arrow keys               |
| Aim         | Move the mouse                     |
| Throw paper | Left-click (hold to auto-fire)     |

**Goal:** survive five minutes, until the clock reaches 4:00 PM.

**Strategy:** keep moving. Defeating students drops XP, and collecting XP levels you up. Choose upgrades that complement your playstyle.

---

## Features

- **Manual mouse aiming:** no aim assist, so accuracy is up to the player.
- **Level-up system:** more than 10 unique upgrades.
- **Wave events:** a new event every 30 seconds (Midterm Season, Email Storm, The Dean Approaches).
- **Five enemy types:** each with different AI behavior.
- **Sound effects:** shooting, hits, kills, and level-ups.
- **Best-time tracking:** saved locally in the browser.
- **Game feel:** screen shake, hit-stop, damage numbers, and particle bursts.
- **Emoji-based sprites:** no external image assets, so the game loads instantly.

---

## Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Language    | JavaScript (ES6+)                         |
| Game engine | [Phaser 3](https://phaser.io/)            |
| Physics     | Phaser Arcade Physics                     |
| Audio       | [Howler.js](https://howlerjs.com/)        |
| Build tool  | [Vite](https://vitejs.dev/)               |
| Hosting     | GitHub Pages                              |

**Bundle size:** about 370 KB gzipped. **Load time:** under one second on a 4G connection.

---

## Run Locally

```bash
# Clone the repository
git clone https://github.com/MedDhiaHasni/office-hours.git
cd office-hours

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## Build and Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The `dist/` folder contains the production build that is served. The `gh-pages` branch hosts the live site.

---

## Roadmap

**Completed**

- [x] Core game loop (survive five minutes)
- [x] Mouse aiming and manual fire
- [x] Upgrade system
- [x] Sound effects
- [x] Wave events

**Planned**

- [ ] Custom sprites to replace emojis
- [ ] Background music
- [ ] Mobile touch controls
- [ ] Boss fights with attack patterns
- [ ] Character selection
- [ ] Online leaderboard
- [ ] New enemies: TA, Lab Assistant, Career Advisor

---

## Contributing

This is a personal project, but ideas and pull requests are welcome. Open an issue to report a bug or suggest an improvement.

---

## License

Released under the MIT License.

---

## Credits

- Game engine: [Phaser 3](https://phaser.io/)
- Audio library: [Howler.js](https://howlerjs.com/)
- Sound effects: Google Actions Sound Library
- Created by [Med Dhia Hasni](https://github.com/MedDhiaHasni)

If you enjoy the game, consider giving the repository a star. It helps other people discover it.
