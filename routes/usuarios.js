const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { allAsync, runAsync } = require('../config/database');

router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', async (req, res) => {
  const usuarios = await allAsync('SELECT id, nombre, email, rol, telefono, activo, fecha_creacion FROM usuarios ORDER BY nombre');
  res.render('usuarios/lista', { user: req.session, titulo: 'Usuarios', usuarios });
});

router.post('/nuevo', async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await runAsync(
      'INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hash, rol, telefono]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
});

module.exports = router;
