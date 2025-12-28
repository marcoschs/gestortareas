const DEFAULT_API_BASE = "https://appsmoviles.grupofmo.com";

const $ = (id) => document.getElementById(id);

function setMsg(t) {
  $("msg").textContent = t || "";
}

function normalizeBase(url) {
  return (url || "").trim().replace(/\/$/, "");
}

function getApiBase() {
  const saved = localStorage.getItem("apiBase");
  return normalizeBase(saved || DEFAULT_API_BASE);
}

function apiUrl(path) {
  return `${getApiBase()}/api/v1/${path}`;
}

function resetForm() {
  $("bookId").value = "";
  $("title").value = "";
  $("author").value = "";
  $("year").value = "";
  $("isbn").value = "";
  $("formTitle").textContent = "Nuevo libro";
  $("btnCreate").disabled = false;
  $("btnUpdate").disabled = true;
  $("btnCancel").disabled = true;
}

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function testHealth() {
  try {
    setMsg("Probando conexión...");
    const r = await fetch(apiUrl("health"), { method: "GET" });
    const data = await safeJson(r);

    if (!r.ok) {
      setMsg(`HEALTH FAIL HTTP ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return;
    }
    setMsg(`HEALTH OK: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  } catch (e) {
    setMsg(`HEALTH ERROR: ${e && e.message ? e.message : e}`);
  }
}

async function loadBooks() {
  try {
    const r = await fetch(apiUrl("books"), { method: "GET" });
    const data = await safeJson(r);
    if (!r.ok) {
      setMsg(`Error cargando (HTTP ${r.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return;
    }

    const rows = Array.isArray(data) ? data : [];
    $("tbody").innerHTML = rows.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.year ?? ""}</td>
        <td>${b.isbn ?? ""}</td>
        <td class="actions">
          <button onclick="editBook(${b.id})">Editar</button>
          <button onclick="deleteBook(${b.id})">Eliminar</button>
        </td>
      </tr>
    `).join("");

    setMsg(`Cargados ${rows.length} registros. API: ${getApiBase()}`);
  } catch (e) {
    setMsg(`Error de red: ${e && e.message ? e.message : e}`);
  }
}

async function createBook() {
  try {
    setMsg("");

    const payload = {
      title: $("title").value.trim(),
      author: $("author").value.trim(),
      year: $("year").value ? Number($("year").value) : null,
      isbn: $("isbn").value.trim() || null
    };

    if (!payload.title || !payload.author) {
      setMsg("Título y autor son obligatorios.");
      return;
    }

    const r = await fetch(apiUrl("books"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await safeJson(r);
    if (!r.ok) {
      setMsg(`Error creando (HTTP ${r.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return;
    }

    resetForm();
    await loadBooks();
  } catch (e) {
    setMsg(`Error de red al crear: ${e && e.message ? e.message : e}`);
  }
}

async function editBook(id) {
  try {
    setMsg("");

    const r = await fetch(apiUrl(`books/${id}`), { method: "GET" });
    const b = await safeJson(r);
    if (!r.ok) {
      setMsg(`No encontrado (HTTP ${r.status}): ${typeof b === "string" ? b : JSON.stringify(b)}`);
      return;
    }

    $("bookId").value = b.id;
    $("title").value = b.title ?? "";
    $("author").value = b.author ?? "";
    $("year").value = b.year ?? "";
    $("isbn").value = b.isbn ?? "";

    $("formTitle").textContent = `Editando #${b.id}`;
    $("btnCreate").disabled = true;
    $("btnUpdate").disabled = false;
    $("btnCancel").disabled = false;
  } catch (e) {
    setMsg(`Error de red al editar: ${e && e.message ? e.message : e}`);
  }
}

async function updateBook() {
  try {
    setMsg("");
    const id = $("bookId").value;
    if (!id) return;

    const payload = {
      title: $("title").value.trim(),
      author: $("author").value.trim(),
      year: $("year").value ? Number($("year").value) : null,
      isbn: $("isbn").value.trim() || null
    };

    const r = await fetch(apiUrl(`books/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await safeJson(r);
    if (!r.ok) {
      setMsg(`Error actualizando (HTTP ${r.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return;
    }

    resetForm();
    await loadBooks();
  } catch (e) {
    setMsg(`Error de red al actualizar: ${e && e.message ? e.message : e}`);
  }
}

async function deleteBook(id) {
  try {
    if (!confirm("¿Eliminar libro?")) return;

    const r = await fetch(apiUrl(`books/${id}`), { method: "DELETE" });
    const data = await safeJson(r);

    if (!r.ok && r.status !== 204) {
      setMsg(`Error eliminando (HTTP ${r.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
      return;
    }

    await loadBooks();
  } catch (e) {
    setMsg(`Error de red al eliminar: ${e && e.message ? e.message : e}`);
  }
}

// Exponer para botones inline
window.editBook = editBook;
window.deleteBook = deleteBook;

function initUI() {
  // Set default visible apiBase
  $("apiBase").value = getApiBase();

  $("btnSaveApi").addEventListener("click", () => {
    const v = normalizeBase($("apiBase").value || DEFAULT_API_BASE);
    localStorage.setItem("apiBase", v);
    $("apiBase").value = v;
    setMsg("API guardada: " + v);
  });

  $("btnTest").addEventListener("click", testHealth);

  $("btnCreate").addEventListener("click", createBook);
  $("btnUpdate").addEventListener("click", updateBook);
  $("btnCancel").addEventListener("click", () => resetForm());

  resetForm();
  // Probar y cargar
  testHealth().then(loadBooks);
}

// Cordova
document.addEventListener("deviceready", initUI, false);
// Web normal
window.addEventListener("DOMContentLoaded", () => { if (!window.cordova) initUI(); });
