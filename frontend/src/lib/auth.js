// Simple client-side mock authentication helper
// Persists current user in localStorage under 'helpdesk_user'

const STORAGE_KEY = "helpdesk_user";

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("auth: failed to read user from localStorage", e);
    return null;
  }
}

function writeUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error("auth: failed to write user to localStorage", e);
  }
}

const subscribers = new Set();

export function onAuthChange(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function notify() {
  const u = readUser();
  subscribers.forEach((cb) => {
    try {
      cb(u);
    } catch (e) {
      console.error("auth subscriber error", e);
    }
  });
}

// Mock login: accepts any non-empty username/password and returns a user object
export async function login(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username || !password) {
        return reject(new Error("Usuario o contraseña inválidos"));
      }

      // simple mock user object
      const user = {
        id: Date.now().toString(),
        username,
        name: username,
        role: username === "admin" ? "admin" : "agent",
        token: `mock-token-${Date.now()}`,
      };

      writeUser(user);
      notify();
      resolve(user);
    }, 400);
  });
}

export function logout() {
  writeUser(null);
  notify();
}

export function getUser() {
  return readUser();
}

export function isAuthenticated() {
  return !!readUser();
}

// initialise: listen to storage events (other tabs)
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) notify();
});

export default {
  login,
  logout,
  getUser,
  isAuthenticated,
  onAuthChange,
};
