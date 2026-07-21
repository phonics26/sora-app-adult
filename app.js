const questions = [
  {
    prompt: "Listen to the word and choose the correct picture.",
    choices: ["Apple", "Chair", "Dog", "Table"],
    icons: ["🍎", "🪑", "🐶", "▱"],
    answer: 1
  },
  {
    prompt: "Listen to the word and choose the correct picture.",
    choices: ["Bird", "Fish", "Box", "Cow"],
    icons: ["🐦", "🐟", "📦", "🐄"],
    answer: 0
  },
  {
    prompt: "Listen to the sentence and choose the correct response.",
    choices: ["I am fine.", "My name is Ken.", "Yes, please.", "It is sunny."],
    answer: 1
  },
  {
    prompt: "Listen to the sentence and choose the correct response.",
    choices: ["I am 12 years old.", "I like pizza.", "I am fine.", "It is sunny."],
    answer: 0
  },
  {
    prompt: "Where is Anna going?",
    choices: ["To the park.", "To school.", "To the beach.", "To the store."],
    answer: 1
  },
  {
    prompt: "What does Tom order?",
    choices: ["A sandwich", "A cup of tea", "A glass of water", "A chair"],
    answer: 1
  },
  {
    prompt: "What time will the next train to Tokyo depart?",
    choices: ["3:30 PM", "4:45 PM", "5:30 PM", "6:15 PM"],
    answer: 2
  },
  {
    prompt: "What drink does she order?",
    choices: ["A cup of tea", "A glass of orange juice", "A bottle of water", "A cup of coffee"],
    answer: 1
  },
  {
    prompt: "What does Jack ask Emily to buy?",
    choices: ["Bread, milk, and eggs", "Milk, apples, and juice", "Bread, milk, and apples", "Eggs, bananas, and water"],
    answer: 2
  },
  {
    prompt: "Where is Sarah going this weekend?",
    choices: ["To the beach", "To Mount Fuji", "To the park", "To a shopping mall"],
    answer: 1
  }
];

const state = { screen: "home", current: 0, answers: Array(questions.length).fill(null), audio: null };
const app = document.querySelector("#app");

function renderHome() {
  stopAudio();
  state.screen = "home";
  app.innerHTML = `
    <section class="screen hero">
      <div class="hero-copy">
        <div class="free-badge"><span class="free-dot"></span>100% free · No registration required</div>
        <p class="eyebrow">SORA English listening assessment</p>
        <h1>Hear English.<br />Discover your level.</h1>
        <p>Experience 10 real-life listening questions created by SORA’s international teaching team. Your result is instant, free, and designed to show you the clearest next step.</p>
        <div class="hero-actions">
          <button class="button primary" id="start-button">Take the free assessment <span aria-hidden="true">→</span></button>
          <a class="button secondary" href="https://forms.office.com/r/qjpXvnSNDX" target="_blank" rel="noreferrer">Book a free trial lesson</a>
        </div>
        <div class="hero-note">
          <span>◷ About 8 minutes</span>
          <span>🎧 Headphones recommended</span>
          <span>✓ Instant result</span>
        </div>
        <div class="trust-line"><strong>World English, taught by world-class educators.</strong><br />Learn practical English from experienced international teachers in a supportive community at SORA.</div>
      </div>
      <div class="hero-art" aria-label="SORA cloud mascot">
        <div class="floating-card one"><span>🎧</span> Free listening assessment</div>
        <img src="public/mascot/cloud_wink_clean.png" alt="SORA cloud mascot winking" />
        <div class="floating-card two"><span>✨</span> Discover your next step</div>
      </div>
    </section>`;
  document.querySelector("#start-button").addEventListener("click", () => {
    state.current = 0;
    state.answers.fill(null);
    renderQuestion();
  });
}

function renderQuestion() {
  stopAudio();
  state.screen = "question";
  const q = questions[state.current];
  const selected = state.answers[state.current];
  const pictureClass = q.icons ? " picture-answers" : "";
  app.innerHTML = `
    <section class="screen assessment-shell">
      <div class="assessment-top">
        <div class="progress-track" aria-label="Assessment progress"><div class="progress-fill" style="width:${((state.current + 1) / questions.length) * 100}%"></div></div>
        <span class="progress-label">${state.current + 1} of ${questions.length}</span>
      </div>
      <article class="question-card">
        <p class="eyebrow">Listening question ${state.current + 1}</p>
        <h2 class="question-title">${q.prompt}</h2>
        <div class="audio-box">
          <button class="play-button" id="play-button" aria-label="Play recording">▶</button>
          <div class="audio-info">
            <div class="audio-label"><span>Question ${state.current + 1} audio</span><span id="audio-time">Ready to play</span></div>
            <input class="audio-progress" id="audio-progress" type="range" min="0" max="100" value="0" aria-label="Recording progress" />
          </div>
          <audio id="question-audio" preload="metadata" src="public/audio/${state.current + 1}.mp4"></audio>
        </div>
        <div class="answers${pictureClass}" role="radiogroup" aria-label="Answer choices">
          ${q.choices.map((choice, i) => `
            <label class="answer ${q.icons ? "picture-answer" : ""} ${selected === i ? "selected" : ""}">
              <input type="radio" name="answer" value="${i}" ${selected === i ? "checked" : ""} />
              ${q.icons ? `<span class="picture-emoji" aria-hidden="true">${q.icons[i]}</span>` : `<span class="answer-key">${String.fromCharCode(65 + i)}</span>`}
              <span>${choice}</span>
            </label>`).join("")}
        </div>
        <div class="question-actions">
          <button class="button ghost" id="back-button">${state.current === 0 ? "Exit" : "← Previous"}</button>
          <button class="button primary" id="next-button" ${selected === null ? "disabled" : ""}>${state.current === questions.length - 1 ? "See my result" : "Next question →"}</button>
        </div>
      </article>
    </section>`;

  setupAudio();
  document.querySelectorAll('input[name="answer"]').forEach(input => input.addEventListener("change", event => {
    state.answers[state.current] = Number(event.target.value);
    document.querySelectorAll(".answer").forEach(label => label.classList.remove("selected"));
    event.target.closest(".answer").classList.add("selected");
    document.querySelector("#next-button").disabled = false;
  }));
  document.querySelector("#back-button").addEventListener("click", () => {
    if (state.current === 0) renderHome();
    else { state.current -= 1; renderQuestion(); }
  });
  document.querySelector("#next-button").addEventListener("click", () => {
    if (state.answers[state.current] === null) return;
    if (state.current < questions.length - 1) { state.current += 1; renderQuestion(); window.scrollTo(0, 0); }
    else renderResults();
  });
}

function setupAudio() {
  const audio = document.querySelector("#question-audio");
  const button = document.querySelector("#play-button");
  const progress = document.querySelector("#audio-progress");
  const time = document.querySelector("#audio-time");
  state.audio = audio;
  button.addEventListener("click", async () => {
    if (audio.paused) { try { await audio.play(); } catch { time.textContent = "Unable to play"; } }
    else audio.pause();
  });
  audio.addEventListener("play", () => { button.textContent = "❚❚"; button.setAttribute("aria-label", "Pause recording"); });
  audio.addEventListener("pause", () => { button.textContent = "▶"; button.setAttribute("aria-label", "Play recording"); });
  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration)) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  audio.addEventListener("ended", () => { button.textContent = "↻"; button.setAttribute("aria-label", "Replay recording"); });
  progress.addEventListener("input", () => { if (Number.isFinite(audio.duration)) audio.currentTime = (progress.value / 100) * audio.duration; });
}

function stopAudio() {
  if (state.audio) { state.audio.pause(); state.audio = null; }
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function getResult(score) {
  if (score >= 9) return { title: "Excellent listening", text: "You understand everyday spoken English with strong accuracy. A full assessment can identify the right challenge for your next stage." };
  if (score >= 7) return { title: "Strong foundation", text: "You follow many everyday words, questions, and short conversations. Your next step is building confidence with longer, faster English." };
  if (score >= 4) return { title: "A promising start", text: "You understand key information in familiar English. Guided practice can help you follow conversations more naturally." };
  return { title: "Your English journey starts here", text: "You are beginning to recognize useful spoken English. The right support and regular listening practice will help you progress." };
}

function renderResults() {
  stopAudio();
  state.screen = "results";
  const score = state.answers.reduce((total, answer, i) => total + Number(answer === questions[i].answer), 0);
  const result = getResult(score);
  const subject = encodeURIComponent("My SORA English Listening Assessment result");
  const shareText = encodeURIComponent(`I completed the SORA English Listening Assessment and scored ${score}/10. Try it and discover your listening level!`);
  const lineMessage = encodeURIComponent(`Hello SORA! I completed the free English Listening Assessment and scored ${score}/10. I would like to learn more about my result and English learning opportunities.`);
  app.innerHTML = `
    <section class="screen assessment-shell">
      <article class="result-card">
        <img class="result-mascot" src="public/mascot/cloud_wink_clean.png" alt="SORA cloud mascot celebrating" />
        <p class="eyebrow">Assessment complete</p>
        <h2>${result.title}</h2>
        <div class="score-ring" style="--score:${score * 10}%"><div class="score-value">${score}/10<small>listening score</small></div></div>
        <p class="result-summary">${result.text}</p>
        <div class="next-step">
          <span class="next-icon" aria-hidden="true">↗</span>
          <div><h3>Your result is the beginning</h3><p>Listening is one part of your ability. Contact SORA for guidance on your result, or continue with reading, speaking, and writing to build your complete English profile.</p></div>
        </div>
        <div class="result-actions">
          <a class="button primary" href="https://forms.office.com/r/qjpXvnSNDX" target="_blank" rel="noreferrer">Book a free trial lesson <span aria-hidden="true">↗</span></a>
          <a class="button line" href="https://line.me/R/msg/text/?${lineMessage}" target="_blank" rel="noreferrer">Open my result in LINE</a>
          <a class="button secondary" href="mailto:?subject=${subject}&body=${shareText}">Share my result</a>
          <button class="button secondary" id="restart-button">Take it again</button>
        </div>
        <p class="privacy">This is a short listening snapshot, not a formal proficiency certification.</p>
        <details class="review">
          <summary>Review my answers</summary>
          <div class="review-list">
            ${questions.map((q, i) => `<div class="review-row"><span>Question ${i + 1}: ${q.prompt}</span><span class="${state.answers[i] === q.answer ? "correct" : "incorrect"}">${state.answers[i] === q.answer ? "Correct" : "Review"}</span></div>`).join("")}
          </div>
        </details>
      </article>
    </section>`;
  document.querySelector("#restart-button").addEventListener("click", renderHome);
  window.scrollTo(0, 0);
}

renderHome();
