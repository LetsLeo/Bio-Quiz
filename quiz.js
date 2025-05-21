const questions = [
  {
    image: "images/frage1.jpg",
    question: "Wie nennt man die Fortbewegung von Fischen im Wasser?",
    answers: [
      "Fliegen",
      "Schwimmen",
      "Krabbeln",
      "Springen"
    ],
    correct: 1
  },
  {
    image: "images/frage2.jpg",
    question: "Welches Tier nutzt Flügel zur Fortbewegung?",
    answers: [
      "Schlange",
      "Maulwurf",
      "Fledermaus",
      "Frosch"
    ],
    correct: 2
  },
  {
    image: "images/frage3.jpg",
    question: "Wie werden die Fortbewegungsorgane von Regenwürmern genannt?",
    answers: [
      "Beine",
      "Räder",
      "Borsten",
      "Flossen"
    ],
    correct: 2
  },
  {
    image: "images/frage4.jpg",
    question: "Welche Bewegungsart nutzt eine Schlange hauptsächlich?",
    answers: [
      "Schwimmen",
      "Kriechen",
      "Laufen",
      "Springen"
    ],
    correct: 1
  },
  {
    image: "images/frage5.jpg",
    question: "Wie nennt man die Fortbewegung, wenn ein Tier sich mit Sprüngen bewegt?",
    answers: [
      "Kriechen",
      "Hüpfen",
      "Fliegen",
      "Rollen"
    ],
    correct: 1
  },
  {
    image: "images/frage6.jpg",
    question: "Welches Tier kann sowohl schwimmen als auch laufen?",
    answers: [
      "Ente",
      "Ameise",
      "Maulwurf",
      "Schnecke"
    ],
    correct: 0
  },
  {
    image: "images/frage7.jpg",
    question: "Wie bewegen sich Amöben fort?",
    answers: [
      "Mit Geißeln",
      "Mit Flügeln",
      "Mit Pseudopodien (Scheinfüßchen)",
      "Mit Beinen"
    ],
    correct: 2
  },
  {
    image: "images/frage8.jpg",
    question: "Welche Tiere benutzen Saugnäpfe zur Fortbewegung?",
    answers: [
      "Kraken",
      "Schlangen",
      "Fische",
      "Vögel"
    ],
    correct: 0
  },
  {
    image: "images/frage9.jpg",
    question: "Welche Fortbewegungsart nutzt ein Gepard bei der Jagd?",
    answers: [
      "Schwimmen",
      "Klettern",
      "Laufen",
      "Graben"
    ],
    correct: 2
  },
  {
    image: "images/frage10.jpg",
    question: "Wie nennt man die Fortbewegung von Insekten mit sechs Beinen?",
    answers: [
      "Trippeln",
      "Krabbeln",
      "Hopsen",
      "Schlängeln"
    ],
    correct: 1
  },
  {
    image: "images/frage11.jpg",
    question: "Welches Fortbewegungsmittel nutzt der Mensch am meisten?",
    answers: [
      "Laufen",
      "Fliegen",
      "Springen",
      "Schwimmen"
    ],
    correct: 0
  },
  {
    image: "images/frage12.jpg",
    question: "Wie bewegen sich Seeigel fort?",
    answers: [
      "Mit Beinen",
      "Mit Flossen",
      "Mit Stacheln und Röhrenfüßchen",
      "Mit Flügeln"
    ],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;

const questionImg = document.getElementById("question-image");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const scoreScreen = document.getElementById("score-screen");

function showQuestion() {
  const q = questions[currentQuestion];
  questionImg.src = q.image;
  questionText.textContent = q.question;
  answerButtons.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.style.display = "none";
  q.answers.forEach((answer, idx) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.onclick = () => selectAnswer(idx);
    answerButtons.appendChild(btn);
  });
}

function selectAnswer(idx) {
  const q = questions[currentQuestion];
  Array.from(answerButtons.children).forEach(btn => btn.disabled = true);
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

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
};

function showScore() {
  questionImg.style.display = "none";
  questionText.style.display = "none";
  answerButtons.style.display = "none";
  feedback.style.display = "none";
  nextBtn.style.display = "none";
  scoreScreen.style.display = "block";
  scoreScreen.textContent = `Du hast ${score} von ${questions.length} Punkten erreicht!`;
}

showQuestion();