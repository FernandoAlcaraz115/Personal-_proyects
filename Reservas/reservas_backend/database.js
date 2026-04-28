const fs   = require('fs');
const path = require('path');

// ── Reservas ─────────────────────────────────────────────
const DB_FILE = path.join(__dirname, 'reservas.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { reservas: [] };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function insertReserva(data) {
  const db     = loadDB();
  const record = { ...data, id: Date.now(), created_at: new Date().toISOString() };
  db.reservas.unshift(record);
  saveDB(db);
  return record;
}
function getAllReservas() { return loadDB().reservas; }

function getReservaByFolio(folio) {
  return loadDB().reservas.find(r => r.folio === folio) || null;
}
function deleteReserva(folio) {
  const db = loadDB();
  db.reservas = db.reservas.filter(r => r.folio !== folio);
  saveDB(db);
}

// ── Usuarios ─────────────────────────────────────────────
const USERS_FILE = path.join(__dirname, 'usuarios.json');

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return { users: [] };
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function saveUsers(db) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function insertUser({ nombre, email, password, role }) {
  const db   = loadUsers();
  const user = { id: Date.now(), nombre, email, password, role, created_at: new Date().toISOString() };
  db.users.push(user);
  saveUsers(db);
  return user;
}
function getUserByEmail(email) {
  return loadUsers().users.find(u => u.email === email) || null;
}
function getAllUsers() {
  return loadUsers().users.map(({ password, ...rest }) => rest);
}

module.exports = {
  insertReserva, getAllReservas, getReservaByFolio, deleteReserva,
  insertUser, getUserByEmail, getAllUsers,
};
