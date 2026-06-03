/**
 * PRESI GLOBAL - RESPONSIVE MOBILE NAVIGATION, CONVERSION ACTIONS, & SECURE AUTHENTICATION (index.js)
 * Description: Pure vanilla JavaScript implementing drawer menus, overlay dims, scroll triggers,
 *              and a state-persisted secure user registration & authentication engine connected to our Express API.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENT NODE SELECTIONS ---
  const hamburgerBtn = document.getElementById("hamburger-menu");
  const mobileDrawer = document.getElementById("mobile-nav-panel");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const drawerOverlay = document.getElementById("drawer-background-overlay");
  const drawerLinks = document.querySelectorAll(".drawer-link-item");
  
  // Newsletter Form selections
  const signupForm = document.getElementById("join-platform-form");
  const emailInput = document.getElementById("user-email-input");
  const successAlert = document.getElementById("form-success-alert");

  // --- 1. DRAWER MOBILE COMPONENT MECHANICS ---
  const openDrawer = () => {
    mobileDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openDrawer();
  });

  drawerCloseBtn.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener("click", () => {
      setTimeout(closeDrawer, 150);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer.classList.contains("active")) {
      closeDrawer();
    }
  });


  // --- 2. SECURE AUTHENTICATION CLIENT CONTROLLERS ---

  // Auth DOM pointers
  const authModalScreen = document.getElementById("auth-modal-screen");
  const authCloseTrigger = document.getElementById("auth-close-trigger");
  
  const loginOpenBtn = document.getElementById("login-open-btn");
  const signupOpenBtn = document.getElementById("signup-open-btn");
  const mobileLoginOpenBtn = document.getElementById("mobile-login-open-btn");
  const mobileSignupOpenBtn = document.getElementById("mobile-signup-open-btn");

  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginView = document.getElementById("login-view");
  const signupView = document.getElementById("signup-view");

  const switchToSignup = document.getElementById("switch-to-signup-trigger");
  const switchToLogin = document.getElementById("switch-to-login-trigger");

  const coreLoginForm = document.getElementById("core-login-form");
  const coreRegisterForm = document.getElementById("core-register-form");

  const authErrorAlert = document.getElementById("auth-error-alert");
  const authSuccessAlert = document.getElementById("auth-success-alert");

  const loginSpinner = document.getElementById("login-spinner");
  const signupSpinner = document.getElementById("signup-spinner");

  const pwInputRegister = document.getElementById("signup-password");
  const pwLengthIndicator = document.getElementById("pw-length-indicator");

  // Navbar Profiles
  const loggedOutNavActions = document.getElementById("logged-out-nav-actions");
  const loggedInNavActions = document.getElementById("logged-in-nav-actions");
  const userAvatarInitials = document.getElementById("user-avatar-initials");
  const userProfileName = document.getElementById("user-profile-name");
  const logoutBtn = document.getElementById("logout-btn");

  // Mobile Drawer Profiles
  const loggedOutDrawerActions = document.getElementById("logged-out-drawer-actions");
  const loggedInDrawerActions = document.getElementById("logged-in-drawer-actions");
  const mobileUserAvatarInitials = document.getElementById("mobile-user-avatar-initials");
  const mobileUserProfileName = document.getElementById("mobile-user-profile-name");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

  // Open / Close Modal handles
  const showAuthModal = (viewType = "login") => {
    closeDrawer();
    authModalScreen.classList.add("active");
    document.body.style.overflow = "hidden";
    clearAlerts();
    toggleAuthTabs(viewType);
  };

  const hideAuthModal = () => {
    authModalScreen.classList.remove("active");
    document.body.style.overflow = "";
    coreLoginForm.reset();
    coreRegisterForm.reset();
    clearAlerts();
  };

  const clearAlerts = () => {
    authErrorAlert.style.display = "none";
    authSuccessAlert.style.display = "none";
  };

  const showError = (msg) => {
    authSuccessAlert.style.display = "none";
    authErrorAlert.querySelector(".alert-msg").textContent = msg;
    authErrorAlert.style.display = "flex";
  };

  const showSuccess = (msg) => {
    authErrorAlert.style.display = "none";
    authSuccessAlert.querySelector(".alert-msg").textContent = msg;
    authSuccessAlert.style.display = "flex";
  };

  // Toggle internal views
  const toggleAuthTabs = (viewName) => {
    clearAlerts();
    if (viewName === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      loginView.classList.add("active");
      loginView.style.display = "flex";
      signupView.classList.remove("active");
      signupView.style.display = "none";
    } else {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      signupView.classList.add("active");
      signupView.style.display = "flex";
      loginView.classList.remove("active");
      loginView.style.display = "none";
    }
  };

  // Binding trigger selectors
  if (loginOpenBtn) loginOpenBtn.addEventListener("click", () => showAuthModal("login"));
  if (signupOpenBtn) signupOpenBtn.addEventListener("click", () => showAuthModal("signup"));
  if (mobileLoginOpenBtn) mobileLoginOpenBtn.addEventListener("click", () => showAuthModal("login"));
  if (mobileSignupOpenBtn) mobileSignupOpenBtn.addEventListener("click", () => showAuthModal("signup"));
  
  if (authCloseTrigger) authCloseTrigger.addEventListener("click", hideAuthModal);
  
  // Close on outer backdrop bounds click
  authModalScreen.addEventListener("click", (e) => {
    if (e.target === authModalScreen) {
      hideAuthModal();
    }
  });

  // Tab buttons bindings
  tabLogin.addEventListener("click", () => toggleAuthTabs("login"));
  tabSignup.addEventListener("click", () => toggleAuthTabs("signup"));
  switchToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAuthTabs("signup");
  });
  switchToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAuthTabs("login");
  });

  // Password Input Character Checker
  if (pwInputRegister) {
    pwInputRegister.addEventListener("input", () => {
      const pw = pwInputRegister.value;
      if (pw.length >= 6) {
        pwLengthIndicator.textContent = "✓";
        pwLengthIndicator.style.color = "#10b981";
      } else {
        pwLengthIndicator.textContent = "✗";
        pwLengthIndicator.style.color = "#ef4444";
      }
    });
  }

  // Session State synchronizers
  const authenticateUser = (token, user) => {
    localStorage.setItem("presi_global_token", token);
    localStorage.setItem("presi_global_user", JSON.stringify(user));
    renderUserSessionUI(user);
  };

  const logoutUser = () => {
    localStorage.removeItem("presi_global_token");
    localStorage.removeItem("presi_global_user");
    
    // Smooth reset transitions
    loggedInNavActions.style.opacity = "0";
    loggedInDrawerActions.style.opacity = "0";
    
    setTimeout(() => {
      loggedInNavActions.style.display = "none";
      loggedInDrawerActions.style.display = "none";
      
      loggedOutNavActions.style.display = "flex";
      loggedOutDrawerActions.style.display = "flex";
      loggedOutNavActions.style.opacity = "1";
      loggedOutDrawerActions.style.opacity = "1";
    }, 200);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "PS";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const renderUserSessionUI = (user) => {
    if (!user) return;
    const initials = getInitials(user.fullName);

    // Desktop
    userAvatarInitials.textContent = initials;
    userProfileName.textContent = user.fullName;
    
    loggedOutNavActions.style.display = "none";
    loggedInNavActions.style.display = "flex";
    loggedInNavActions.style.opacity = "1";

    // Mobile Drawer
    mobileUserAvatarInitials.textContent = initials;
    mobileUserProfileName.textContent = user.fullName;
    
    loggedOutDrawerActions.style.display = "none";
    loggedInDrawerActions.style.display = "flex";
    loggedInDrawerActions.style.opacity = "1";
  };

  // Check persisted session on boot
  const verifyCurrentSession = async () => {
    const token = localStorage.getItem("presi_global_token");
    const localUser = localStorage.getItem("presi_global_user");

    if (token) {
      if (localUser) {
        renderUserSessionUI(JSON.parse(localUser));
      }
      
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("presi_global_user", JSON.stringify(data.user));
          renderUserSessionUI(data.user);
        } else {
          // Token expired or invalid
          logoutUser();
        }
      } catch (err) {
        console.warn("Silent session verification offline/interrupted:", err);
      }
    }
  };

  // Bind sign out actions
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logoutUser);


  // --- FORM DESPATCH SUBMITS (API ACTIONS) ---

  // Handle Login submission
  coreLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlerts();
    
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      showError("Please complete all registration fields.");
      return;
    }

    try {
      loginSpinner.style.display = "inline-block";
      const submitBtn = document.getElementById("login-submit-btn");
      submitBtn.disabled = true;

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      loginSpinner.style.display = "none";
      submitBtn.disabled = false;

      if (!response.ok) {
        showError(data.error || "Login verification failed.");
      } else {
        showSuccess(`Welcome back, ${data.user.fullName}! Secure login authenticated.`);
        authenticateUser(data.token, data.user);
        
        // Stagger modal hide for user visual success feedback
        setTimeout(() => {
          hideAuthModal();
        }, 1200);
      }
    } catch (err) {
      loginSpinner.style.display = "none";
      document.getElementById("login-submit-btn").disabled = false;
      showError("Connection failed. Please check your internet connectivity.");
      console.error(err);
    }
  });

  // Handle Sign-Up submission
  coreRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlerts();

    const fullName = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!fullName || !email || !password) {
      showError("Please fill out all missing profile fields.");
      return;
    }

    if (password.length < 6) {
      showError("Your secure password must be at least 6 characters long.");
      return;
    }

    try {
      signupSpinner.style.display = "inline-block";
      const submitBtn = document.getElementById("signup-submit-btn");
      submitBtn.disabled = true;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();
      signupSpinner.style.display = "none";
      submitBtn.disabled = false;

      if (!response.ok) {
        showError(data.error || "Failed to finalize account registration.");
      } else {
        showSuccess(`Account configured! Seamlessly logged in as ${data.user.fullName}.`);
        authenticateUser(data.token, data.user);
        
        setTimeout(() => {
          hideAuthModal();
        }, 1200);
      }
    } catch (err) {
      signupSpinner.style.display = "none";
      document.getElementById("signup-submit-btn").disabled = false;
      showError("Connection failed. Please check your internet connectivity.");
      console.error(err);
    }
  });

  // Run initial session login audit
  verifyCurrentSession();


  // --- 3. INTERACTIVE HOME NEWSLETTER CONVERSION (Catalog Flow) ---
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const enteredEmail = emailInput.value.trim();
      
      if (enteredEmail && (enteredEmail.includes("@") || enteredEmail.length > 5)) {
        const submitBtn = signupForm.querySelector(".submit-btn");
        
        submitBtn.innerHTML = "<span>Processing...</span> ✔";
        submitBtn.disabled = true;
        
        setTimeout(() => {
          signupForm.style.transition = "all 0.3s ease";
          signupForm.style.opacity = "0";
          
          setTimeout(() => {
            signupForm.style.display = "none";
            successAlert.classList.add("show");
            emailInput.value = "";
          }, 300);
          
        }, 1000);
      }
    });
  }

  // --- 4. NAVIGATION BAR ELEVATION TRIGGER ON SCROLL ---
  const headerId = document.getElementById("header-id");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      headerId.style.boxShadow = "0 10px 15px -3px rgba(15, 23, 42, 0.05)";
      headerId.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
    } else {
      headerId.style.boxShadow = "";
      headerId.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    }
  });
});
