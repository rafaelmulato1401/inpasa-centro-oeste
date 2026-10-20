// Proteção de páginas: só deixa passar usuário autenticado e APROVADO.
// Uso numa página:  <script type="module" src="auth-guard.js"></script>
// Para páginas só de administrador: <html data-require-admin="true">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let resolveReady;
export const ready = new Promise((res) => { resolveReady = res; });

const needAdmin = document.documentElement.dataset.requireAdmin === "true";
const current = location.pathname.split("/").pop() || "index.html";
const loginUrl = "login.html?next=" + encodeURIComponent(current);
const go = (url) => location.replace(url);

onAuthStateChanged(auth, async (user) => {
  if (!user) return go(loginUrl);
  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    const d = snap.exists() ? snap.data() : null;

    if (!d || d.status !== "aprovado") {
      await signOut(auth);
      return go("login.html?msg=" + (d ? d.status : "sem-cadastro"));
    }
    if (needAdmin && d.perfil !== "admin") return go("index.html");

    window.currentUser = { uid: user.uid, email: user.email, ...d };

    document.querySelectorAll("[data-user-name]").forEach((el) => { el.textContent = d.nome || user.email; });
    document.querySelectorAll("[data-admin-only]").forEach((el) => { el.hidden = d.perfil !== "admin"; });
    document.querySelectorAll("[data-logout]").forEach((el) => {
      el.addEventListener("click", async () => { await signOut(auth); go("login.html"); });
    });

    document.documentElement.style.visibility = "visible";
    resolveReady(window.currentUser);
  } catch (e) {
    console.error(e);
    go("login.html?msg=erro");
  }
});
