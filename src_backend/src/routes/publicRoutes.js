import { Router } from 'express';

import {
  listPublicNoticias,
  getPublicNoticia,
  listPublicTestimonios,
  getPublicTestimonio
} from '../controllers/publicController.js';

const router = Router();

router.get('/paises/:paisSlug/noticias', listPublicNoticias);

router.get('/paises/:paisSlug/noticias/:noticiaSlug', getPublicNoticia);

router.get('/paises/:paisSlug/testimonios', listPublicTestimonios);

router.get('/paises/:paisSlug/testimonios/:id', getPublicTestimonio);

export default router;