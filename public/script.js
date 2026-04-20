const loginScreen = document.getElementById('loginScreen');
const appWindow = document.getElementById('appWindow');
const usernameInput = document.getElementById('usernameInput');
const userSelectButtons = document.querySelectorAll('.user-select-btn');
const startBtn = document.getElementById('startBtn');
const currentUserInfo = document.getElementById('currentUserInfo');

let username = '';
let selectedMember = '';

// Login flow
userSelectButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedMember = button.dataset.member;
    userSelectButtons.forEach((btn) => btn.classList.toggle('selected', btn === button));
  });
});

startBtn.addEventListener('click', () => {
  const enteredName = usernameInput.value.trim();
  if (!enteredName || !selectedMember) {
    alert('Vyplňte prosím uživatelské jméno a vyberte profil.');
    return;
  }

  username = enteredName;
  loginScreen.classList.add('hidden');
  appWindow.classList.remove('hidden');
  currentUserInfo.textContent = `${username} (${selectedMember})`;
  document.title = `Malování | ${username}`;
});

