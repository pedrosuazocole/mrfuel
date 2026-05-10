const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { allAsync, getAsync, runAsync } = require('../config/database');

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  const estaciones = await allAsync('SELECT * FROM estaciones ORDER BY nombre');
  res.render('estaciones/lista', { user: req.session, titulo: 'Estaciones', estaciones });
});

router.get('/nueva', isAdmin, (req, res) => {
  res.render('estaciones/nueva', { user: req.session, titulo: 'Nueva Estación' });
});

router.post('/nueva', isAdmin, async (req, res) => {
  try {
    const { nombre, codigo, direccion, ciudad, departamento, telefono, encargado } = req.body;
    await runAsync(
      'INSERT INTO estaciones (nombre, codigo, direccion, ciudad, departamento, telefono, encargado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, codigo, direccion, ciudad, departamento, telefono, encargado]
    );
    res.redirect('/estaciones');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al crear estación');
  }
});

module.exports = router;
