// --- Wespe, Qualle, Kolibri Quiz: 4er Multiple Choice, schönes Layout, Auswertung, Hervorhebung
const quizData = [
  // Wespe
  {
    q: "Wie funktionieren direkte und indirekte Flugmuskeln bei der Wespe?",
    options: [
      "Beide wirken direkt auf die Flügelgelenke.",
      "Direktmuskeln bewegen die Beine, indirekte bewegen die Flügel.",
      "Direktmuskeln bewegen die Flügel, indirekte verformen den Thorax.",
      "Nur die indirekten Muskeln sind aktiv, die direkten sind verkümmert.",
    ],
    correct: 2
  },
  {
    q: "Warum ist der synchrone Flügelschlag wichtig für die Flugstabilität?",
    options: [
      "Damit beide Flügel gleichmäßig schlagen und der Flug stabil bleibt.",
      "Weil die Flügel abwechselnd schlagen müssen.",
      "Damit die Flügel langsamer schlagen können.",
      "Weil er für den Richtungswechsel beim Laufen wichtig ist.",
    ],
    correct: 0
  },
  {
    q: "Welche energetischen Anforderungen stellt der Flug an die Wespe?",
    options: [
      "Flug benötigt keine Energie, da er rein mechanisch abläuft.",
      "Der Energiebedarf ist sehr gering wegen des leichten Körpers.",
      "Sehr hoch, da die Flugmuskeln schnell und ständig arbeiten müssen.",
      "Flugenergie kommt ausschließlich aus Sonnenlicht.",
    ],
    correct: 2
  },
  {
    q: "Was ermöglicht der Wespe das „Stehen“ in der Luft (Schwirrflug)?",
    options: [
      "Ihre Flügel sind starr und flattern nicht.",
      "Sie nutzt die Luftströmungen wie ein Segelflugzeug.",
      "Die schnelle und präzise Steuerung durch spezielle Flugmuskeln.",
      "Ihr Körper ist so leicht, dass sie von allein in der Luft schwebt.",
    ],
    correct: 2
  },
  // Qualle
  {
    q: "Welche Struktur ermöglicht der Qualle ihre eigenständige Fortbewegung?",
    options: [
      "Sie besitzt Flossen mit Muskeln.",
      "Sie nutzt einen Propeller aus Tentakeln.",
      "Sie bewegt sich durch rhythmisches Zusammenziehen ihres Schirmes.",
      "Sie läuft mit kleinen Füßchen am Schirmrand.",
    ],
    correct: 2
  },
  {
    q: "Warum ist die Bewegung der Qualle als ineffizient zu bewerten?",
    options: [
      "Weil sie sich nicht selbstständig bewegen kann.",
      "Weil sie kaum Sauerstoff verbraucht.",
      "Weil sie langsam ist und sich nur wenig steuern lässt.",
      "Weil sie zu viel Muskelkraft verbraucht wie ein Fisch.",
    ],
    correct: 2
  },
  {
    q: "Wie beeinflusst der hohe Wasseranteil den Körperbau und die Bewegung der Qualle?",
    options: [
      "Er macht die Qualle unbeweglich.",
      "Er sorgt für Auftrieb und ermöglicht das Schweben im Wasser.",
      "Er verhindert, dass Nährstoffe aufgenommen werden.",
      "Er verleiht ihr eine harte Außenhaut.",
    ],
    correct: 1
  },
  {
    q: "Welche Rolle spielen Strömungen bei der Fortbewegung der Qualle?",
    options: [
      "Sie treiben die Qualle mit, da sie selbst kaum steuern kann.",
      "Sie helfen der Qualle, an Land zu gelangen.",
      "Sie stören die Qualle bei ihrer aktiven Jagd.",
      "Sie verhindern, dass sich Quallen überhaupt bewegen können.",
    ],
    correct: 0
  },
  // Kolibri
  {
    q: "Was ist die Besonderheit des Kolibris?",
    options: [
      "Er kann seit-, rückwärts fliegen und in der Luft schweben",
      "Er kann bis zu 60km/h fliegen",
      "80 Flügelschläge/ Sekunde",
      "Er isst Nektar",
    ],
    correct: 0
  },
  {
    q: "Wie nennt sich der Flug bei dem der Kolibri an der gleichen Stelle in der Luft schwebt?",
    options: [
      "Schwirrflug",
      "Schwebeflug",
      "Sturzflug",
      "Rückwärtsflug",
    ],
    correct: 0
  },
  {
    q: "Was ist die höchste Herzfrequenz und Atemfrequenz des Kolibris?",
    options: [
      "1200 Schläge/ min Herzfrequenz\n250 Atemzüge/ min",
      "1000/min H\n300/ min A",
      "1500/ min H\n180/min A",
      "950/ min H\n200/ min A",
    ],
    correct: 0
  },
  {
    q: "Wie oft muss der Kolibri Nahrung aufnehmen?",
    options: [
      "10-15 Minuten",
      "5-10 Minuten",
      "15-20 Minuten",
      "20-25 Minuten",
    ],
    correct: 0
  }
];

// Quiz State
let currentQuestion = 0, score = 0;
const quizProgress = document.getElementById("quiz-progress");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const scoreScreen = document.getElementById("score-screen");

// Show question
function showQuestion() {
  const q = quizData[currentQuestion];
  quizProgress.textContent = `Frage ${currentQuestion + 1} von ${quizData.length}`;
  questionText.style.display = "block";
  answerButtons.style.display = "flex";
  feedback.style.display = "block";
  quizProgress.style.display = "block";
  questionText.textContent = q.q;
  answerButtons.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.style.display = "none";
  scoreScreen.style.display = "none";
  // Shuffle answer classes
  const letterClass = ["option-A", "option-B", "option-C", "option-D"];
  q.options.forEach((answer, idx) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.classList.add(letterClass[idx]);
    btn.onclick = () => selectAnswer(idx, btn);
    answerButtons.appendChild(btn);
  });
}

// Answer selection and marking
function selectAnswer(idx, btn) {
  const q = quizData[currentQuestion];
  Array.from(answerButtons.children).forEach(b => b.disabled = true);
  btn.classList.add(idx === q.correct ? "correct" : "wrong", "selected");
  answerButtons.children[q.correct].classList.add("correct");
  if (idx === q.correct) {
    feedback.textContent = "Richtig!";
    feedback.className = "feedback right";
    score++;
  } else {
    feedback.textContent = "Falsch!";
    feedback.className = "feedback wrong";
  }
  nextBtn.style.display = "inline-block";
}

// Next/End logic
nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    showScore();
  }
};

function showScore() {
  questionText.style.display = "none";
  answerButtons.style.display = "none";
  feedback.style.display = "none";
  nextBtn.style.display = "none";
  quizProgress.style.display = "none";
  scoreScreen.style.display = "block";
  scoreScreen.innerHTML =
    `<div style="font-size:30px;">🎉</div>
    <div>Du hast <b>${score}</b> von <b>${quizData.length}</b> Fragen richtig beantwortet!</div>
    <div style="font-size:17px;color:#3370e2;margin-top:12px;">Super gemacht!</div>
    <button onclick="window.location.reload()" style="margin-top:24px;font-size:16px;padding:10px 26px;background:#4f8cff;color:white;border:none;border-radius:7px;">Quiz nochmal spielen</button>`;
}

// Reset on start
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  showQuestion();
}
startQuiz();