require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dJxih4m6XUbv@ep-soft-unit-ace9qegi-pooler.sa-east-1.aws.neon.tech/natoscar?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Rota para listar todos os carros
app.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM car ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para obter um carro específico
app.get('/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM car WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para criar um novo carro
app.post('/cars', async (req, res) => {
  const { marca, modelo, ano, descricao, imagem_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO car (marca, modelo, ano, descricao, imagem_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [marca, modelo, ano, descricao, imagem_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para atualizar um carro
app.put('/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, ano, descricao, imagem_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE car SET marca = $1, modelo = $2, ano = $3, descricao = $4, imagem_url = $5 WHERE id = $6 RETURNING *',
      [marca, modelo, ano, descricao, imagem_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota para deletar um carro
app.delete('/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM car WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Natoscar API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});