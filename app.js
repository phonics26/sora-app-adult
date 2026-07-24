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

const SUPABASE_URL = "https://iuazjlwhzcbbrihfypqn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wb1AkV90uiIweEb4zK22yw_mg_z0lV2";
const LINE_LOGIN_CHANNEL_ID = "2010793604";
const LINE_CALLBACK_URL = SUPABASE_URL + "/functions/v1/line-webhook";


function renderHome() {
  stopAudio();
  state.screen = "home";
  document.body.classList.add("front-page-mode");
  app.innerHTML = `
    <section class="screen visual-front-page" aria-label="SORA free English listening assessment">
      <div class="front-page-canvas">
        <img src="public/sora-listening-front-page-v2.png?v=20260724-ja-final-2" alt="SORA International Academy free English listening assessment. Discover your English listening level in about eight minutes and receive your result through LINE." />
        <a class="front-hotspot hotspot-about-v2" href="https://sora.business/" target="_blank" rel="noreferrer"><span>About SORA</span></a>
        <a class="front-hotspot hotspot-header-trial-v2" href="https://forms.office.com/pages/responsepage.aspx?id=QHgH-eWXGEuyndYQxgb9NhPg1xK4OatBjxCfgrBRSaxURDdFTVFFVUUzVE9MQTZNREhVVVdDNFNQRy4u&route=shorturl" target="_blank" rel="noreferrer"><span>Book a free trial lesson</span></a>
        <button class="front-hotspot hotspot-start-v2" id="start-button"><span>Start free assessment</span></button>
      </div>
    </section>`;
  const startAssessment = () => {
    state.current = 0;
    state.answers.fill(null);
    renderQuestion();
  };
  document.querySelector("#start-button").addEventListener("click", startAssessment);
}

function renderQuestion() {
  stopAudio();
  state.screen = "question";
  document.body.classList.remove("front-page-mode");
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
  if (score >= 9) return { title: "Confident natural-speech listener", gse: "41–50", ability: "You understand fast, natural speech across different contexts.", improvement: "Adapt more easily to different accents and idiomatic expressions.", strategy: "Listen to natural speech at different speeds and notice common idioms.", practice: "Listen to TED Talks, take notes, and discuss the key points.", outcome: "Understand speech more fluently across different dialects and accents." };
  if (score >= 7) return { title: "Everyday conversation listener", gse: "31–40", ability: "You can follow everyday conversations spoken at a moderate speed.", improvement: "Build confidence with different accents and implied meanings.", strategy: "Listen to diverse accents and use context to understand meaning.", practice: "Use podcasts with transcripts, take notes, and summarize the key points.", outcome: "Follow conversations with fewer difficulties and recognize implied meanings." };
  if (score >= 5) return { title: "Developing detail listener", gse: "21–30", ability: "You can catch the main idea in simple conversations.", improvement: "Improve your understanding of important details.", strategy: "Train yourself to listen for key details in short conversations.", practice: "Watch short dialogues and answer comprehension questions.", outcome: "Understand key points and details with improved accuracy." };
  if (score >= 3) return { title: "Familiar conversation listener", gse: "11–20", ability: "You understand slow, clear speech with frequent pauses.", improvement: "Become more comfortable with connected speech and faster conversations.", strategy: "Listen to repeated phrases and mimic the speaker's rhythm.", practice: "Use simple dialogues and repeat key phrases with a speech-to-text tool.", outcome: "Follow slow, familiar conversations with less repetition." };
  return { title: "Beginning English listener", gse: "0–10", ability: "You recognize basic words and common greetings.", improvement: "Build your understanding of complete simple sentences.", strategy: "Listen to short, useful phrases several times.", practice: "Listen to greetings, repeat them aloud, and use beginner listening activities.", outcome: "Identify and respond to common greetings." };
}

function renderResults() {
  stopAudio();
  state.screen = "results";
  document.body.classList.remove("front-page-mode");
  const score = state.answers.reduce((total, answer, i) => total + Number(answer === questions[i].answer), 0);
  const result = getResult(score);
  const submissionToken = crypto.randomUUID();

  app.innerHTML = `
    <section class="screen assessment-shell">
      <article class="result-card">
        <img class="result-mascot" src="public/mascot/cloud_wink_clean.png" alt="SORA cloud mascot celebrating" />
        <p class="eyebrow">Assessment complete</p>
        <h2>Your private result is ready</h2>
        <p class="result-summary">Connect with SORA on LINE to receive your listening score, estimated GSE range, personalized feedback, and recommended practice.</p>
        <div class="next-step">
          <span class="next-icon" aria-hidden="true">💬</span>
          <div><h3>Receive it privately on LINE</h3><p>Your result will be sent automatically from SORA's Official LINE account. Add SORA as a friend during the next step if requested.</p></div>
        </div>
        <p id="line-result-status" class="privacy" role="status"></p>
        <div class="result-actions">
          <button class="button line" id="line-result-button">Receive My Result on LINE</button>
          <button class="button secondary" id="restart-button">Take it again</button>
        </div>
        <p class="privacy">Your answers and result remain private. This is a listening-only GSE estimate, not a complete English proficiency certification.</p>
      </article>
    </section>`;

  document.querySelector("#line-result-button").addEventListener("click", () => {
    requestLineResult({ score, result, submissionToken });
  });
  document.querySelector("#restart-button").addEventListener("click", renderHome);
  window.scrollTo(0, 0);
}

async function requestLineResult({ score, result, submissionToken }) {
  const button = document.querySelector("#line-result-button");
  const status = document.querySelector("#line-result-status");
  button.disabled = true;
  button.textContent = "Connecting to SORA LINE…";
  status.textContent = "Saving your private result…";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/adult_listening_results`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        submission_token: submissionToken,
        score,
        gse_range: result.gse,
        result_title: result.title,
        ability: result.ability,
        improvement: result.improvement,
        strategy: result.strategy,
        practice: result.practice,
        outcome: result.outcome,
        answers: state.answers,
        line_delivery_status: "pending_login"
      })
    });

    if (!response.ok) throw new Error(`Unable to save result (${response.status})`);

    status.textContent = "Opening LINE securely…";
    const authorizationUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
    authorizationUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: LINE_LOGIN_CHANNEL_ID,
      redirect_uri: LINE_CALLBACK_URL,
      state: submissionToken,
      scope: "openid profile",
      bot_prompt: "aggressive"
    }).toString();
    window.location.assign(authorizationUrl.toString());
  } catch (error) {
    console.error("LINE result connection failed", error);
    status.textContent = "We could not connect to LINE. Please try again.";
    button.disabled = false;
    button.textContent = "Receive My Result on LINE";
  }
}

renderHome();
