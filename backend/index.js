const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3333;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM curriculos');
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM curriculos WHERE id = $1', [id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post('/curriculos', async (req, res) => {
  const { nome, email, telefone, formacao, experiencia } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO curriculos (nome, email, telefone, formacao, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING *', [nome, email, telefone, formacao, experiencia]);
    res.status(201).json(rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.put('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const { rows } = await pool.query('UPDATE curriculos SET nome = $1, email = $2, telefone = $3, formacao = $4, experiencia = $5 WHERE id = $6 RETURNING *', [data.nome, data.email, data.telefone, data.formacao, data.experiencia, id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.delete('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM curriculos WHERE id = $1 RETURNING *', [id]);
    res.status(200).json({
      message: 'Curriculo deletado com sucesso',
      deletedCurriculum: rows,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`));
