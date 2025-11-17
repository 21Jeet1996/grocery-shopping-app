// ==========================
// 🔹 AUTHENTICATION (LOGIN/SIGNUP)
// ==========================

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'block';
    switchTab('login');
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
}

function switchTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginContent = document.getElementById('loginTabContent');
  const signupContent = document.getElementById('signupTabContent');
  const forgotContent = document.getElementById('forgotPasswordTabContent');

  if (loginTab && signupTab && loginContent && signupContent) {
    loginTab.classList.remove('active');
    signupTab.classList.remove('active');
    loginContent.classList.remove('active');
    signupContent.classList.remove('active');
    if (forgotContent) forgotContent.classList.remove('active');

    if (tab === 'login') {
      loginTab.classList.add('active');
      loginContent.classList.add('active');
    } else if (tab === 'signup') {
      signupTab.classList.add('active');
      signupContent.classList.add('active');
    } else if (tab === 'forgot') {
      if (forgotContent) forgotContent.classList.add('active');
    }
  }
}

function login() {
  const username = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errorMsg = document.getElementById('login-error-msg');

  if (!username || !password) {
    if (errorMsg) errorMsg.textContent = 'Please fill all fields';
    return;
  }

  const usersData = JSON.parse(localStorage.getItem('gm_users') || '{}');

  if (usersData[username] && usersData[username] === password) {
    localStorage.setItem('currentUser', username);
    closeLoginModal();
    updateAuthUI();
    showToast(`Welcome back, ${username}!`, 'success');
    if (errorMsg) errorMsg.textContent = '';
  } else {
    if (errorMsg) errorMsg.textContent = 'Invalid username or password';
  }
}

function signUp() {
  const username = document.getElementById('signupUsername')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  const errorMsg = document.getElementById('signup-error-msg');

  if (!username || !password || !confirmPassword) {
    if (errorMsg) errorMsg.textContent = 'Please fill all fields';
    return;
  }

  if (password !== confirmPassword) {
    if (errorMsg) errorMsg.textContent = 'Passwords do not match';
    return;
  }

  const usersData = JSON.parse(localStorage.getItem('gm_users') || '{}');

  if (usersData[username]) {
    if (errorMsg) errorMsg.textContent = 'Username already exists';
    return;
  }

  usersData[username] = password;
  localStorage.setItem('gm_users', JSON.stringify(usersData));
  localStorage.setItem('currentUser', username);
  
  closeLoginModal();
  updateAuthUI();
  showToast(`Welcome, ${username}! Account created successfully!`, 'success');
  if (errorMsg) errorMsg.textContent = '';
}

function skipLogin() {
  closeLoginModal();
  showToast('You can continue shopping as a guest', 'info');
}

function showForgotPassword() {
  switchTab('forgot');
}

function resetPassword() {
  const username = document.getElementById('forgotUsername')?.value.trim();
  const errorMsg = document.getElementById('forgot-error-msg');
  const successMsg = document.getElementById('forgot-success-msg');

  if (!username) {
    if (errorMsg) errorMsg.textContent = 'Please enter your username';
    if (successMsg) successMsg.textContent = '';
    return;
  }

  const usersData = JSON.parse(localStorage.getItem('gm_users') || '{}');

  if (usersData[username]) {
    if (successMsg) successMsg.textContent = 'Password reset link sent to your email!';
    if (errorMsg) errorMsg.textContent = '';
    setTimeout(() => {
      switchTab('login');
    }, 2000);
  } else {
    if (errorMsg) errorMsg.textContent = 'Username not found';
    if (successMsg) successMsg.textContent = '';
  }
}

function updateAuthUI() {
  const currentUser = localStorage.getItem('currentUser');
  const authLinks = document.getElementById('authLinks');
  const profileNav = document.getElementById('profileNav');

  if (currentUser) {
    if (authLinks) {
      authLinks.innerHTML = `<span style="margin-right:10px;">Hello, ${currentUser}</span><a href="#" onclick="logout(); return false;" class="logout-btn">Logout</a>`;
    }
  } else {
    if (authLinks) {
      authLinks.innerHTML = `<a href="#" onclick="openLoginModal(); return false;" class="login-btn-header">Login</a>`;
    }
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showToast('Logged out successfully!', 'info');
  navigateToSection('#home');
}

window.addEventListener('click', function(event) {
  const modal = $('#loginModal');
  if (event.target === modal) {
    closeLoginModal();
  }
});
