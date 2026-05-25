import { Link } from 'react-router-dom';
import logoEcuador from '../../assets/logo-ecuador.png';
import logoLatam from '../../assets/logo-latinoamerica.png';
import logoArgentina from '../../assets/logo-argentina.png';
import logoChile from '../../assets/logo-chile.png';

const countries = [
  { slug: 'ecuador',   name: 'Ecuador Comparte',  logo: logoEcuador },
  { slug: 'argentina', name: 'Argentina Comparte', logo: logoArgentina },
  { slug: 'chile',     name: 'Chile Comparte',     logo: logoChile },
];

export default function HomePage() {
  function saveCountry(slug) {
    localStorage.setItem('publicCountry', slug);
  }

  return (
    <section className="public-hero">
      <div className="public-hero-overlay">
        <div className="public-hero-content">
          <h1>Un propósito que nació de Colombia</h1>
          <p className="public-subtitle">Hoy inspira a toda Latinoamérica</p>

          <div className="country-circle-wrapper" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            margin: '32px 0'
          }}>
            {/* Ecuador */}
            <Link
              to="/paises/ecuador/noticias"
              onClick={() => saveCountry('ecuador')}
              style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                overflow: 'hidden', flexShrink: 0,
                textDecoration: 'none'
              }}
              title="Ecuador Comparte"
            >
              <img src={logoEcuador} alt="Ecuador" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
            </Link>

            {/* Latinoamérica — centro, más grande, círculo */}
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden', flexShrink: 0
            }}>
              <img src={logoLatam} alt="Latinoamérica Comparte" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
            </div>

            {/* Argentina */}
            <Link
              to="/paises/argentina/noticias"
              onClick={() => saveCountry('argentina')}
              style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                overflow: 'hidden', flexShrink: 0,
                textDecoration: 'none'
              }}
              title="Argentina Comparte"
            >
              <img src={logoArgentina} alt="Argentina" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
            </Link>

            {/* Chile */}
            <Link
              to="/paises/chile/noticias"
              onClick={() => saveCountry('chile')}
              style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                overflow: 'hidden', flexShrink: 0,
                textDecoration: 'none'
              }}
              title="Chile Comparte"
            >
              <img src={logoChile} alt="Chile" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
            </Link>
          </div>

          <p className="public-description">
            Una red que une personas, empresas y comunidades para construir una
            región más humana, productiva y consciente.
          </p>

          <div className="public-actions">
            <Link to="/paises/argentina/noticias" className="btn btn-light fw-bold" onClick={() => saveCountry('argentina')}>
              Ver noticias
            </Link>
            <Link to="/paises/argentina/solicitudes" className="btn btn-outline-light fw-bold" onClick={() => saveCountry('argentina')}>
              Enviar solicitud
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
