// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  const loginToggle = document.getElementById('login-toggle');
  const registerToggle = document.getElementById('register-toggle');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const rememberMeCheckbox = document.getElementById('remember-me');
  const userProfile = document.getElementById('user-profile');
  const profileUsername = document.getElementById('profile-username');
  const logoutBtn = document.getElementById('logout-btn');
  const loginErrorSummary = document.getElementById('login-error-summary');
  const registerErrorSummary = document.getElementById('register-error-summary');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const registerSubmitBtn = document.getElementById('register-submit-btn');
  const passwordResetLink = document.getElementById('password-reset-link');

  // Account lockout data
  const LOCKOUT_THRESHOLD = 3;
  const LOCKOUT_DURATION = 60 * 1000; // 1 minute in ms

  // Check if user is logged in on page load
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser) {
    showUserProfile(loggedInUser.username);
  }

  // Toggle forms
  loginToggle.addEventListener('click', () => {
    loginToggle.classList.add('active');
    registerToggle.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    clearFormErrors();
    loginErrorSummary.classList.remove('active');
    registerErrorSummary.classList.remove('active');
  });

  registerToggle.addEventListener('click', () => {
    registerToggle.classList.add('active');
    loginToggle.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    clearFormErrors();
    loginErrorSummary.classList.remove('active');
    registerErrorSummary.classList.remove('active');
  });

  // Show/hide password toggle
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '&#128068;'; // eye with slash
      } else {
        input.type = 'password';
        button.innerHTML = '&#128065;'; // eye
      }
    });
  });

  // Password strength meter
  const passwordInput = document.getElementById('register-password');
  const strengthBar = document.querySelector('.strength-bar');
  const strengthValue = document.getElementById('strength-value');

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const strength = calculatePasswordStrength(val);
    updateStrengthMeter(strength);
  });

  function calculatePasswordStrength(password) {
    let score = 0;
    if (!password) return score;

    // Length points
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Contains lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Contains numbers
    if (/\d/.test(password)) score += 1;

    // Contains special characters
    if (/[\W_]/.test(password)) score += 1;

    return score;
  }

  function updateStrengthMeter(score) {
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const percent = (score / 5) * 100;

    strengthBar.style.setProperty('--strength-width', percent + '%');
    strengthBar.style.backgroundColor = '#ddd';
    strengthBar.style.position = 'relative';

    // Remove old bar fill if any
    const oldFill = strengthBar.querySelector('.fill');
    if (oldFill) oldFill.remove();

    // Create new fill bar
    const fill = document.createElement('div');
    fill.classList.add('fill');
    fill.style.width = percent + '%';
    fill.style.height = '100%';
    fill.style.backgroundColor = colors[score - 1] || '#ddd';
    fill.style.position = 'absolute';
    fill.style.top = '0';
    fill.style.left = '0';
    fill.style.borderRadius = '6px';
    fill.style.transition = 'width 0.4s ease, background-color 0.4s ease';
    strengthBar.appendChild(fill);

    strengthValue.textContent = texts[score - 1] || 'N/A';
  }

  // Clear all error messages
  function clearFormErrors() {
    document.querySelectorAll('.error-msg').forEach(el => {
      el.textContent = '';
    });
  }

  // Validate email format
  function isValidEmail(email) {
    const re = /^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$/;
    return re.test(email);
  }

  // Normalize email to lowercase
  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  // Show user profile and hide forms
  function showUserProfile(username) {
    profileUsername.textContent = username;
    userProfile.classList.remove('hidden');
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    document.querySelector('.toggle-btns').style.display = 'none';
    document.querySelector('.social-login').style.display = 'none';
  }

  // Hide user profile and show login form
  function hideUserProfile() {
    userProfile.classList.add('hidden');
    document.querySelector('.toggle-btns').style.display = 'flex';
    document.querySelector('.social-login').style.display = 'block';
    loginToggle.click();
  }

  // Account lockout check
  function isAccountLocked(email) {
    const lockoutData = JSON.parse(localStorage.getItem('lockoutData') || '{}');
    if (lockoutData[email]) {
      const { attempts, lockoutTime } = lockoutData[email];
      if (attempts >= LOCKOUT_THRESHOLD) {
        const now = Date.now();
        if (now - lockoutTime < LOCKOUT_DURATION) {
          return true;
        } else {
          // Reset lockout
          delete lockoutData[email];
          localStorage.setItem('lockoutData', JSON.stringify(lockoutData));
          return false;
        }
      }
    }
    return false;
  }

  // Increment failed login attempts
  function incrementFailedAttempts(email) {
    const lockoutData = JSON.parse(localStorage.getItem('lockoutData') || '{}');
    if (!lockoutData[email]) {
      lockoutData[email] = { attempts: 1, lockoutTime: 0 };
    } else {
      lockoutData[email].attempts++;
      if (lockoutData[email].attempts >= LOCKOUT_THRESHOLD) {
        lockoutData[email].lockoutTime = Date.now();
      }
    }
    localStorage.setItem('lockoutData', JSON.stringify(lockoutData));
  }

  // Reset failed login attempts
  function resetFailedAttempts(email) {
    const lockoutData = JSON.parse(localStorage.getItem('lockoutData') || '{}');
    if (lockoutData[email]) {
      delete lockoutData[email];
      localStorage.setItem('lockoutData', JSON.stringify(lockoutData));
    }
  }

  // Show loading spinner on button
  function showLoading(button) {
    button.disabled = true;
    const spinner = document.createElement('span');
    spinner.classList.add('loading-spinner');
    button.appendChild(spinner);
  }

  // Hide loading spinner on button
  function hideLoading(button) {
    button.disabled = false;
    const spinner = button.querySelector('.loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  // Validate login form
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors();
    loginErrorSummary.classList.remove('active');
    showLoading(loginSubmitBtn);

    let email = loginForm['login-email'].value;
    let password = loginForm['login-password'].value;
    email = normalizeEmail(email);

    let valid = true;
    let errors = [];

    if (!email) {
      setError(loginForm['login-email'], 'Email is required');
      errors.push('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError(loginForm['login-email'], 'Invalid email format');
      errors.push('Invalid email format');
      valid = false;
    }

    if (!password) {
      setError(loginForm['login-password'], 'Password is required');
      errors.push('Password is required');
      valid = false;
    }

    if (!valid) {
      loginErrorSummary.textContent = errors.join('. ');
      loginErrorSummary.classList.add('active');
      hideLoading(loginSubmitBtn);
      return;
    }

    if (isAccountLocked(email)) {
      loginErrorSummary.textContent = 'Account locked due to multiple failed login attempts. Please try again later.';
      loginErrorSummary.classList.add('active');
      hideLoading(loginSubmitBtn);
      return;
    }

    // Simulate authentication
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email].password === password) {
      resetFailedAttempts(email);
      alert('Login successful! Welcome back, ' + users[email].username);
      loginForm.reset();

      // Remember me functionality
      if (rememberMeCheckbox.checked) {
        localStorage.setItem('loggedInUser', JSON.stringify({ email, username: users[email].username }));
      } else {
        sessionStorage.setItem('loggedInUser', JSON.stringify({ email, username: users[email].username }));
      }

      showUserProfile(users[email].username);
    } else {
      incrementFailedAttempts(email);
      loginErrorSummary.textContent = 'Invalid email or password';
      loginErrorSummary.classList.add('active');
    }
    hideLoading(loginSubmitBtn);
  });

  // Validate registration form
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors();
    registerErrorSummary.classList.remove('active');
    showLoading(registerSubmitBtn);

    const username = registerForm['register-username'].value.trim();
    let email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    const passwordConfirm = registerForm['register-password-confirm'].value;
    email = normalizeEmail(email);

    let valid = true;
    let errors = [];

    if (!username) {
      setError(registerForm['register-username'], 'Username is required');
      errors.push('Username is required');
      valid = false;
    } else if (username.length < 3) {
      setError(registerForm['register-username'], 'Username must be at least 3 characters');
      errors.push('Username must be at least 3 characters');
      valid = false;
    }

    if (!email) {
      setError(registerForm['register-email'], 'Email is required');
      errors.push('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError(registerForm['register-email'], 'Invalid email format');
      errors.push('Invalid email format');
      valid = false;
    }

    if (!password) {
      setError(registerForm['register-password'], 'Password is required');
      errors.push('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setError(registerForm['register-password'], 'Password must be at least 8 characters');
      errors.push('Password must be at least 8 characters');
      valid = false;
    }

    if (password !== passwordConfirm) {
      setError(registerForm['register-password-confirm'], 'Passwords do not match');
      errors.push('Passwords do not match');
      valid = false;
    }

    if (!valid) {
      registerErrorSummary.textContent = errors.join('. ');
      registerErrorSummary.classList.add('active');
      hideLoading(registerSubmitBtn);
      return;
    }

    // Save user to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      alert('Email already registered');
      hideLoading(registerSubmitBtn);
      return;
    }

    users[email] = { username, password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now login.');
    registerForm.reset();
    registerToggle.click(); // Switch to login form
    hideLoading(registerSubmitBtn);
  });

  // Logout button
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUser');
    hideUserProfile();
  });

  // Password reset simulation
  passwordResetLink.addEventListener('click', e => {
    e.preventDefault();
    alert('Password reset link has been sent to your email (simulation).');
  });

  // Social login buttons simulation
  document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', () => {
      alert(`Social login with ${button.textContent} is not implemented in this demo.`);
    });
  });

  // Set error message for input
  function setError(input, message) {
    const errorMsg = input.parentElement.querySelector('.error-msg');
    if (errorMsg) {
      errorMsg.textContent = message;
    }
  }
});
