// Tab-Switching Logic
const quizTabBtn = document.getElementById("quiz-tab-btn");
const gameTabBtn = document.getElementById("game-tab-btn");
const quizSection = document.getElementById("quiz-section");
const gameSection = document.getElementById("game-section");

quizTabBtn.onclick = () => {
  quizTabBtn.classList.add("active");
  gameTabBtn.classList.remove("active");
  quizSection.classList.add("active");
  gameSection.classList.remove("active");
};
gameTabBtn.onclick = () => {
  gameTabBtn.classList.add("active");
  quizTabBtn.classList.remove("active");
  gameSection.classList.add("active");
  quizSection.classList.remove("active");
};