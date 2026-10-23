// --- PROJECT CONFIGURATION & DATA ---
const quizData = [
  {
    visual: "1. Equation Set-up",
    question: "1. Raju's father's age is 5 years more than three times Raju's age. Raju's father is 44 years old. Set up an equation to find Raju's age.",
    options: ["3x + 5 = 44", "3x - 5 = 44", "5x + 3 = 44", "3x = 44"],
    answer: "3x + 5 = 44"
  },
  {
    visual: "2. Algebraic Statements",
    question: "2. The number x is 8 greater than 80. Convert this statement into mathematical form.",
    options: ["x = 80 - 8", "x = 80 * 8", "x = 80 + 8", "x = 80 / 8"],
    answer: "x = 80 + 8"
  },
  {
    visual: "3. Verbal to Algebraic",
    question: "3. The sum of three times x and 11 is 32. Convert this statement into an equation.",
    options: ["3x - 11 = 32", "3x + 11 = 32", "11x + 3 = 32", "3(x + 11) = 32"],
    answer: "3x + 11 = 32"
  },
  {
    visual: "4. Verbal to Algebraic",
    question: "4. A number multiplied by 2 gives 30. Convert this statement into an equation.",
    options: ["x + 2 = 30", "x / 2 = 30", "2x = 30", "x - 2 = 30"],
    answer: "2x = 30"
  },
  {
    visual: "5. Verbal to Algebraic",
    question: "5. If you subtract 5 from 6 times a number, you get 7. Convert this statement into an equation.",
    options: ["5x - 6 = 7", "6x - 5 = 7", "6x + 5 = 7", "5 - 6x = 7"],
    answer: "6x - 5 = 7"
  },
  {
    visual: "6. Verbal to Algebraic",
    question: "6. One fourth of m is 3 more than 7. Convert this statement into an equation.",
    options: ["m/4 - 7 = 3", "m/4 + 3 = 7", "4m - 7 = 3", "m/4 = 7 + 3"],
    answer: "m/4 - 7 = 3"
  },
  {
    visual: "7. Verbal to Algebraic",
    question: "7. One third of a number plus 5 is 8. Convert this statement into an equation.",
    options: ["x/3 + 5 = 8", "3x + 5 = 8", "x/3 - 5 = 8", "3(x + 5) = 8"],
    answer: "x/3 + 5 = 8"
  },
  {
    visual: "8. Match the Expression",
    question: "8. Verbal statement: 12 more than x. What is its algebraic expression?",
    options: ["12x", "x - 12", "x + 12", "12 - x"],
    answer: "x + 12"
  },
  {
    visual: "9. Match the Statement",
    question: "9. Algebraic expression: 2m + 1. What is its verbal statement layout?",
    options: ["Twice of m plus 1", "m plus 2", "Twice of m minus 1", "One half of m plus 1"],
    answer: "Twice of m plus 1"
  },
  {
    visual: "10. Match the Expression",
    question: "10. Verbal statement: Twice the sum of y and z. What is its algebraic expression?",
    options: ["2y + z", "2(y + z)", "y + 2z", "2yz"],
    answer: "2(y + z)"
  }
];

const REQUIRED_PIN = "25136";

// --- STATE VARIABLES ---
let currentQuestionIndex = 0;
let pointsScore = 0; 
let studentName = "";
let isProcessingAnswer = false; 

// --- TIMER UPGRADE VARIABLES ---
let timerInterval = null;
let timeLeft = 20;

// --- DOM ELEMENTS ---
const screens = {
  loading: document.getElementById('loading-screen'),
  login: document.getElementById('login-screen'),
  game: document.getElementById('game-screen'),
  score: document.getElementById('score-screen')
};

// --- AUDIO UTILITY ENGINE ---
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'incorrect') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'victory') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscNode.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + (idx * 0.08));
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        oscNode.start(ctx.currentTime + (idx * 0.08));
        oscNode.stop(ctx.currentTime + 0.6);
      });
    }
  } catch (error) {
    console.log("Audio play blocked.");
  }
}

// --- SYSTEM INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    switchScreen('login');
  }, 2500);
  
  setupEventListeners();
});

function switchScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    screens[key].classList.remove('active');
  });
  screens[screenKey].classList.add('active');
}

function setupEventListeners() {
  const nameInput = document.getElementById('student-name');
  const pinInput = document.getElementById('security-pin');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');

  function validateLoginInputs() {
    const isNameValid = nameInput.value.trim().length >= 2;
    const isPinValid = pinInput.value.trim() === REQUIRED_PIN;
    startBtn.disabled = !(isNameValid && isPinValid);
  }

  nameInput.addEventListener('input', validateLoginInputs);
  pinInput.addEventListener('input', validateLoginInputs);

  startBtn.addEventListener('click', () => {
    studentName = nameInput.value.trim();
    document.getElementById('display-student-name').innerHTML = `Student: ${studentName} &nbsp;&nbsp; <span id="score-counter">Points: 0</span>`;
    startQuiz();
  });

  restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    pointsScore = 0;
    nameInput.value = "";
    pinInput.value = "";
    startBtn.disabled = true;
    switchScreen('login');
  });
}

function startQuiz() {
  switchScreen('game');
  loadQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  document.getElementById('timer-countdown').innerText = timeLeft;
  
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer-countdown').innerText = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  isProcessingAnswer = true;
  playSound('incorrect');
  
  const currentQuestion = quizData[currentQuestionIndex];
  const allButtons = document.querySelectorAll('.option-btn');
  
  allButtons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === currentQuestion.answer) {
      btn.classList.add('correct-choice');
    }
  });

  setTimeout(() => {
    advanceQuiz();
  }, 1500);
}

function loadQuestion() {
  isProcessingAnswer = false;
  const currentQuestion = quizData[currentQuestionIndex];
  
  document.getElementById('progress').innerText = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  
  const percentageFilled = (currentQuestionIndex / quizData.length) * 100;
  document.getElementById('progress-bar-fill').style.width = `${percentageFilled}%`;
  
  document.getElementById('data-visual').innerText = currentQuestion.visual;
  document.getElementById('question-text').innerText = currentQuestion.question;
  
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = "";
  
  currentQuestion.options.forEach(option => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.innerText = option;
    btn.addEventListener('click', (e) => handleAnswerSubmit(option, e.target));
    optionsContainer.appendChild(btn);
  });
  
  startTimer();
}

// --- UPDATED EVENT HANDLER ---
function handleAnswerSubmit(selectedOption, clickedButton) {
  if (isProcessingAnswer) return; 
  isProcessingAnswer = true; 
  clearInterval(timerInterval);

  const currentQuestion = quizData[currentQuestionIndex];
  const allButtons = document.querySelectorAll('.option-btn');
  
  allButtons.forEach(btn => btn.disabled = true);

  if (selectedOption === currentQuestion.answer) {
    pointsScore++;
    playSound('correct');
    clickedButton.classList.add('correct-choice');
    document.getElementById('score-counter').innerText = `Points: ${pointsScore}`;
  } else {
    playSound('incorrect');
    clickedButton.classList.add('incorrect-choice');
    allButtons.forEach(btn => {
      if (btn.innerText === currentQuestion.answer) {
        btn.classList.add('correct-choice');
      }
    });
  }

  setTimeout(() => {
    advanceQuiz();
  }, 1500);
}

function advanceQuiz() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    document.getElementById('progress-bar-fill').style.width = "100%";
    showFinalScore();
  }
}

function saveAndLoadLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem('equationsQuizLeaderboard')) || [];
  
  const newEntry = { name: studentName, score: pointsScore, date: new Date().toLocaleDateString() };
  leaderboard.push(newEntry);
  
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  localStorage.setItem('equationsQuizLeaderboard', JSON.stringify(leaderboard));
    leaderboard.forEach(function(entry) {
    const li = document.createElement('li');
    li.innerHTML = "<strong>" + entry.name + "</strong> - " + entry.score + "/10 pts (" + entry.date + ")";
    listContainer.appendChild(li);
  });
}
function showFinalScore() {
  switchScreen('score');
  playSound('victory');
  
  document.getElementById('final-score').innerText = pointsScore;
document.getElementById('total-score').innerText = quizData.length;
document.getElementById('report-name').innerText = studentName;
const performanceStatus = document.getElementById('performance-feedback');
if (performanceStatus) {
if (pointsScore === quizData.length) {
performanceStatus.innerText = "Excellent! Perfect Score 🎉";
} else if (pointsScore >= quizData.length * 0.7) {
performanceStatus.innerText = "Good Job! 👍";
} else {
performanceStatus.innerText = "Keep Practicing! 📝";
}
}
saveAndLoadLeaderboard();
}
