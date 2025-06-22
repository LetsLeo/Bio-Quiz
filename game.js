// ... alles wie gehabt, aber Button-Handling robuster ...
function setGameModeButtons() {
  // Buttons an das aktuelle DOM binden
  document.getElementById("kolibri-btn").onclick = () => startGame("kolibri");
  document.getElementById("qualle-btn").onclick = () => startGame("qualle");
}
// Initial setzen:
setGameModeButtons();

// Nach Tab-Wechsel zurück zur Auswahl und Buttons neu binden!
document.getElementById("game-tab-btn").onclick = () => {
  running = false;
  if (timerInterval) clearInterval(timerInterval);
  canvas.style.display = "none";
  gameUI.style.display = "none";
  modeSelect.style.display = "block";
  gameScoreTimerBar.style.display = "none";
  setGameModeButtons();
};