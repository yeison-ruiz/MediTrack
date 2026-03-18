import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('medtime.db');

export const initDB = () => {
  try {
    // 1. Crear tablas base
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        avatar TEXT,
        role TEXT DEFAULT 'patient',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        times TEXT, -- JSON array of times
        start_date TEXT,
        end_date TEXT,
        notes TEXT,
        active INTEGER DEFAULT 1,
        image_uri TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER,
        taken_at DATETIME,
        status TEXT, -- 'taken', 'skipped', 'missed'
        FOREIGN KEY (medication_id) REFERENCES medications (id)
      );
    `);

    // 2. Migraciones manuales
    try { db.execSync("ALTER TABLE users ADD COLUMN email TEXT;"); } catch (e) {}
    try { db.execSync("ALTER TABLE users ADD COLUMN avatar TEXT;"); } catch (e) {} // Nueva columna de usuario
    try { db.execSync("ALTER TABLE users ADD COLUMN password TEXT;"); } catch (e) {} // Columna de contraseña
    try { db.execSync("ALTER TABLE medications ADD COLUMN notes TEXT;"); } catch (e) {} 
    try { db.execSync("ALTER TABLE medications ADD COLUMN type TEXT;"); } catch (e) {} // Nueva columna de tipo (tableta, jarabe...)
    try { db.execSync("ALTER TABLE medications ADD COLUMN patient_name TEXT;"); } catch (e) {} 
    try { db.execSync("ALTER TABLE medications ADD COLUMN patient_type TEXT DEFAULT 'user';"); } catch (e) {} // 'user' | 'pet'

    try { db.execSync("ALTER TABLE medications ADD COLUMN patient_type TEXT DEFAULT 'user';"); } catch (e) {} // 'user' | 'pet'

    // LIMPIEZA TOTAL: Comentado para preservar datos. Descomenta si necesitas borrar todo.
    // try { db.execSync("DELETE FROM users"); console.log("⚠️ DATA WIPED"); } catch (e) {}

    try { db.execSync("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;"); } catch (e) {}
    try { db.execSync("ALTER TABLE users ADD COLUMN verification_code TEXT;"); } catch (e) {}

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const getDB = () => db;
