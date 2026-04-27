const loginScreen = document.getElementById('loginScreen');
const appWindow = document.getElementById('appWindow');
const usernameInput = document.getElementById('usernameInput');
const userSelectButtons = document.querySelectorAll('.user-select-btn');
const startBtn = document.getElementById('startBtn');

let username = '';
let selectedMember = '';

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
  document.title = `Malování | ${username}`;
  loginScreen.classList.add('hidden');
  appWindow.classList.remove('hidden');

  if (selectedMember === 'Osoba A') initApp();
  else if (selectedMember === 'Osoba B' && typeof initB === 'function') initB();
  else if (selectedMember === 'Osoba C' && typeof initC === 'function') initC();
});
