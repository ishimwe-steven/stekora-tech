require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const adminPanelRoutes = require('./routes/adminPanel');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminPanelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
