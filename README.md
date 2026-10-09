# 🎓 Office Hours

> **A Vampire Survivors-style browser game where you play a burnt-out professor trying to survive 5 minutes of students swarming your office.**

No installs. No downloads. Just click and play.

---

## 🎮 Play Now

👉 **[Play Office Hours](https://meddhiahasni.github.io/office-hours/)**

*(Works on desktop browsers. Mobile support coming soon.)*

---

## 📖 The Story

It's 3 PM on a Friday. You just want to go home. But it's **Office Hours** — and the students keep coming. Freshmen, gunners, sleepers, email demons, and even the Dean himself. Survive until **4:00 PM** and you've earned the weekend.

---

## 🕹️ How to Play

| Action          | Control                            |
|-----------------|------------------------------------|
| **Move**        | `WASD` or `Arrow Keys`             |
| **Aim**         | Move your **mouse**                |
| **Throw Paper** | **Left-Click** (hold to auto-fire) |

**Goal:** Survive **5 minutes** until the clock hits 4:00 PM.

**Strategy:** Keep moving. Kill students to drop XP. Collect XP to level up. Pick upgrades that synergize with your playstyle.

---

## ⚡ Features

- 🎯 **Manual mouse aiming** — no aimbot, just skill
- 📈 **Level-up system** with 10+ unique upgrades
- 🌊 **Wave events** every 30 seconds (Midterm Season! Email Storm! The Dean Approaches!)
- 👥 **5 enemy types** with different AI behaviors
- 🔊 **Sound effects** for shooting, hits, kills, and level-ups
- 🏆 **Best-time tracking** (saved locally)
- 💥 **Juice** — screen shake, hit-stop, damage numbers, particle bursts
- 🎨 **Emoji-based sprites** — no external assets, loads instantly

---

## 🛠️ Tech Stack

| Layer           | Tech                                         |
|-----------------|----------------------------------------------|
| **Language**    | JavaScript (ES6+)                            |
| **Game Engine** | [Phaser 3](https://phaser.io/)               |
| **Physics**     | Phaser Arcade Physics                        |
| **Audio**       | [Howler.js](https://howlerjs.com/)           |
| **Build Tool**  | [Vite](https://vitejs.dev/)                  |
| **Hosting**     | GitHub Pages                                 |

**Bundle size:** ~370 KB gzipped. **Load time:** under 1s on 4G.

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/MedDhiaHasni/office-hours.git
cd office-hours

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The `dist/` folder is what gets served. The `gh-pages` branch hosts the live site.

---

## 🗺️ Roadmap

- [x] Core game loop (survive 5 min)
- [x] Mouse aiming + manual fire
- [x] Upgrade system
- [x] Sound effects
- [x] Wave events
- [ ] Custom sprites (replace emojis)
- [ ] Background music
- [ ] Mobile touch controls
- [ ] Boss fights with attack patterns
- [ ] Character selection
- [ ] Online leaderboard
- [ ] New enemies: TA, Lab Assistant, Career Advisor

---

## 🤝 Contributing

This is a personal project, but ideas and PRs are welcome! Open an issue if you find a bug or have a suggestion.

---

## 📜 License

MIT — do whatever you want with it.

---

## 🙏 Credits

- Game engine: [Phaser 3](https://phaser.io/)
- Audio library: [Howler.js](https://howlerjs.com/)
- Sound effects: Google Actions Sound Library
- Built by: [Med Dhia Hasni](https://github.com/MedDhiaHasni)

---

## ⭐ If you like it...

Give the repo a star ⭐ — it helps more people discover the game!

Now go survive those office hours. 📚💀
