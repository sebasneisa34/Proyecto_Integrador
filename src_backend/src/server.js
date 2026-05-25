import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import paisRoutes from './routes/paisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noticiaRoutes from './routes/noticiaRoutes.js';
import testimonioRoutes from './routes/testimonioRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import archivoRoutes from './routes/archivoRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

dotenv.config();

const app = express();

app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API CMS multipais funcionando correctamente'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/paises', paisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/testimonios', testimonioRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/auditoria', auditRoutes);
app.use('/api/archivos', archivoRoutes);
app.use('/api/public', publicRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});