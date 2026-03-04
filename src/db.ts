import Database from 'better-sqlite3';

const db = new Database('warehouse.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INTEGER,
    quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    min_stock INTEGER DEFAULT 5,
    location TEXT,
    description TEXT,
    serial_number TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
  );
`);

// Migration: Add serial_number to items if not exists
try {
  db.prepare('ALTER TABLE items ADD COLUMN serial_number TEXT').run();
} catch (e) {
  // Column already exists or other error
}

// Seed some initial data if empty
const checkCategories = db.prepare('SELECT count(*) as count FROM categories').get() as { count: number };
if (checkCategories.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  insertCategory.run('Perangkat Aktif', 'Modem, Router, OLT, dan Switch');
  insertCategory.run('Kabel & Fiber Optic', 'Dropcore, Preconn, Kabel UTP, dan Patchcord');
  insertCategory.run('Perangkat Pasif', 'Splitter, ODP, Roset, dan Adapter');
  insertCategory.run('Alat Kerja (Tools)', 'Splicer, OPM, VFL, dan Tang Crimping');
  insertCategory.run('Material Instalasi', 'RJ45, Protection Sleeve, Klem Kabel, dan Isolasi');
  
  const insertItem = db.prepare('INSERT INTO items (sku, name, category_id, quantity, unit, min_stock, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertItem.run('ONT-001', 'Modem ONT XPON HG6243C', 1, 25, 'unit', 10, 'Rak A1', 'Modem standar untuk pelanggan');
  insertItem.run('RTR-001', 'Router Dual Band AC1200', 1, 15, 'unit', 5, 'Rak A1', 'Router tambahan untuk jangkauan wifi');
  insertItem.run('CBL-001', 'Dropcore 1 Core 150M Preconn', 2, 40, 'roll', 10, 'Gudang B', 'Kabel FO pelanggan siap pakai');
  insertItem.run('TLS-001', 'Optical Power Meter (OPM)', 4, 5, 'unit', 2, 'Lemari Alat', 'Alat ukur redaman signal');
  insertItem.run('MAT-001', 'RJ45 Connector Cat5e', 5, 10, 'box', 2, 'Rak C1', 'Konektor kabel LAN (1 box isi 50)');
} else {
  // Update "Bahan Baku" to "Material Instalasi" if it exists
  db.prepare("UPDATE categories SET name = 'Material Instalasi', description = 'RJ45, Protection Sleeve, Klem Kabel, dan Isolasi' WHERE name = 'Bahan Baku'").run();
}

export default db;
