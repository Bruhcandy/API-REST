const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3333;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM curriculos');
    res.status(200).send(rows);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM curriculos WHERE id = $1', [id]);
    res.status(200).send(result.rows);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/curriculos', async (req, res) => {
  const { nome, email, telefone, formacao, experiencia } = req.body;
  try {
    const existingCurriculo = await pool.query('SELECT * FROM curriculos WHERE nome = $1', [nome]);

    if (!existingCurriculo.rows[0]) {
      const newCurriculo = await pool.query('INSERT INTO curriculos (nome, email, telefone, formacao, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING *', [nome, email, telefone, formacao, experiencia]);
      res.status(200).send(newCurriculo.rows);
    } else {
      res.status(409).send({ message: 'Curriculo with this name already exists' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.put('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedCurriculo = await pool.query('UPDATE curriculos SET nome = $1, email = $2, telefone = $3, formacao = $4, experiencia = $5 WHERE id = $6 RETURNING *', [data.nome, data.email, data.telefone, data.formacao, data.experiencia, id]);
    res.status(200).send(updatedCurriculo.rows);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCurriculo = await pool.query('DELETE FROM curriculos WHERE id = $1 RETURNING *', [id]);
    res.status(200).send({
      message: 'Curriculo successfully deleted',
      deletedCurriculo: deletedCurriculo.rows
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
