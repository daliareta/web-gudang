import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Get Dashboard Stats
  app.get('/api/stats', (req, res) => {
    try {
      const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
      const totalStock = db.prepare('SELECT SUM(quantity) as count FROM items').get() as { count: number };
      const lowStock = db.prepare('SELECT COUNT(*) as count FROM items WHERE quantity <= min_stock').get() as { count: number };
      const recentTransactions = db.prepare(`
        SELECT t.*, i.name as item_name 
        FROM transactions t 
        JOIN items i ON t.item_id = i.id 
        ORDER BY t.date DESC LIMIT 5
      `).all();

      res.json({
        totalItems: totalItems.count,
        totalStock: totalStock.count || 0,
        lowStock: lowStock.count,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Items CRUD
  app.get('/api/items', (req, res) => {
    const items = db.prepare(`
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name ASC
    `).all();
    res.json(items);
  });

  app.post('/api/items', (req, res) => {
    try {
      const { sku, name, category_id, quantity, unit, min_stock, location, description, serial_number } = req.body;
      const stmt = db.prepare(`
        INSERT INTO items (sku, name, category_id, quantity, unit, min_stock, location, description, serial_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(sku, name, category_id, quantity || 0, unit, min_stock || 0, location, description, serial_number);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.put('/api/items/:id', (req, res) => {
    try {
      const { sku, name, category_id, unit, min_stock, location, description, serial_number } = req.body;
      const stmt = db.prepare(`
        UPDATE items 
        SET sku = ?, name = ?, category_id = ?, unit = ?, min_stock = ?, location = ?, description = ?, serial_number = ?
        WHERE id = ?
      `);
      stmt.run(sku, name, category_id, unit, min_stock, location, description, serial_number, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/items/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    try {
      const { name, description } = req.body;
      const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      const info = stmt.run(name, description);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Transactions (Stock In/Out)
  app.post('/api/transactions', (req, res) => {
    const { item_id, type, quantity, notes } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const transaction = db.transaction(() => {
      // 1. Record transaction
      const insertStmt = db.prepare(`
        INSERT INTO transactions (item_id, type, quantity, notes)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(item_id, type, quantity, notes);

      // 2. Update item stock
      let updateSql = '';
      if (type === 'IN') {
        updateSql = 'UPDATE items SET quantity = quantity + ? WHERE id = ?';
      } else {
        // Check stock first
        const item = db.prepare('SELECT quantity FROM items WHERE id = ?').get(item_id) as { quantity: number };
        if (!item || item.quantity < quantity) {
          throw new Error('Stok tidak mencukupi');
        }
        updateSql = 'UPDATE items SET quantity = quantity - ? WHERE id = ?';
      }
      
      db.prepare(updateSql).run(quantity, item_id);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/transactions', (req, res) => {
    const transactions = db.prepare(`
      SELECT t.*, i.name as item_name, i.sku 
      FROM transactions t 
      JOIN items i ON t.item_id = i.id 
      ORDER BY t.date DESC
    `).all();
    res.json(transactions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();
export default appPromise;
