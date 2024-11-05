// script.js

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const closeLogin = document.getElementById("close-login");
  const closeSignup = document.getElementById("close-signup");
  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");

  // Show login modal
  loginBtn.onclick = () => {
      loginModal.style.display = "block";
  };

  // Show signup modal
  signupBtn.onclick = () => {
      signupModal.style.display = "block";
  };

  // Close login modal
  closeLogin.onclick = () => {
      loginModal.style.display = "none";
  };

  // Close signup modal
  closeSignup.onclick = () => {
      signupModal.style.display = "none";
  };

  // Switch to signup modal
  document.getElementById("to-signup").onclick = (e) => {
      e.preventDefault();
      loginModal.style.display = "none";
      signupModal.style.display = "block";
  };

  // Switch to login modal
  document.getElementById("to-login").onclick = (e) => {
      e.preventDefault();
      signupModal.style.display = "none";
      loginModal.style.display = "block";
  };

  // Handle login submission
  document.getElementById("login-submit").onclick = () => {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      // Mock API call
      mockApiCall(email, password)
          .then(response => {
              alert(response.message);
              if (response.success) {
                  // Redirect or perform post-login actions
                  loginModal.style.display = "none"; // Close modal on success
              }
          });
  };

  // Handle signup submission
  document.getElementById("signup-submit").onclick = () => {
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      // Mock API call
      mockApiCall(email, password, true)
          .then(response => {
              alert(response.message);
              if (response.success) {
                  // Redirect or perform post-signup actions
                  signupModal.style.display = "none"; // Close modal on success
              }
          });
  };
});

// Mock API function to simulate login/signup
function mockApiCall(email, password, isSignup = false) {
  return new Promise((resolve) => {
      setTimeout(() => {
          if (isSignup) {
              resolve({ success: true, message: "Signup successful!" });
          } else {
              if (email === "test@example.com" && password === "password") {
                  resolve({ success: true, message: "Login successful!" });
              } else {
                  resolve({ success: false, message: "Invalid email or password." });
              }
          }
      }, 1000);
  });
}
