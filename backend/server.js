require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.get('/api/tasks', async (_req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, status, owner, due_date } = req.body;
  const result = await pool.query(
    `INSERT INTO tasks (title, description, priority, status, owner, due_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, description || null, priority || 'Medium', status || 'Pending', owner || null, due_date || null]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, owner, due_date } = req.body;
  const result = await pool.query(
    `UPDATE tasks SET title=$1, description=$2, priority=$3, status=$4, owner=$5, due_date=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [title, description || null, priority, status, owner || null, due_date || null, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/tasks/completed', async (_req, res) => {
  await pool.query(`DELETE FROM tasks WHERE status = 'Completed'`);
  res.status(204).send();
});

app.delete('/api/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TaskFlow API listening on ${port}`));
