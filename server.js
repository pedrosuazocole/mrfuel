/**
 * ========================================
 * MR. FUEL - SERVIDOR PRINCIPAL
 * Sistema de Cliente Misterioso - Texaco
 * ========================================
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { iniciarCronJobs } = require('./utils/cron');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// CONFIGURACIÓN
// ===================================

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'mr_fuel_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 horas
    httpOnly: true
  }
}));

// Variables globales para vistas
app.use((req, res, next) => {
  res.locals.user = req.session;
  res.locals.currentPath = req.path;
  next();
});

// ===================================
// RUTAS
// ===================================

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const auditoriasRoutes = require('./routes/auditorias');
const estacionesRoutes = require('./routes/estaciones');
const usuariosRoutes = require('./routes/usuarios');

// Rutas públicas
app.use('/', authRoutes);

// Rutas protegidas
app.use('/dashboard', dashboardRoutes);
app.use('/auditorias', auditoriasRoutes);
app.use('/estaciones', estacionesRoutes);
app.use('/usuarios', usuariosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', {
    user: req.session,
    titulo: 'Página no encontrada',
    mensaje: 'La página que buscás no existe',
    codigo: 404
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    user: req.session,
    titulo: 'Error del Servidor',
    mensaje: 'Ocurrió un error inesperado',
    codigo: 500
  });
});

// ===================================
// INICIAR SERVIDOR
// ===================================

app.listen(PORT, () => {
  console.clear();
  console.log('═══════════════════════════════════════════════');
  console.log('🛢️  MR. FUEL - CLIENTE MISTERIOSO TEXACO');
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📅 Timezone: ${process.env.TZ || 'America/Tegucigalpa'}`);
  console.log(`🔐 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════\n');
  
  // Iniciar cron jobs de recordatorios
  iniciarCronJobs();
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
