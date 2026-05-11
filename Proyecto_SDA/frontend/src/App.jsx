import TextInput from './components/TextInput'
import ResultPanel from './components/ResultPanel'

export default function App() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>

      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>🧠</div>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #ef4444, #dc2626, #991b1b)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          HalluciDetect
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Multi-layer hallucination detection for LLM-generated text
        </p>
        <div style={{
          width: 60,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
          margin: '14px auto 0',
        }} />
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        alignItems: 'start',
      }}>
        <section style={{
          background: '#111',
          border: '1px solid #242424',
          borderTop: '2px solid #dc2626',
          borderRadius: 12,
          padding: '1.5rem',
        }}>
          <h2 style={sectionTitle}>Input</h2>
          <TextInput />
        </section>

        <section style={{
          background: '#111',
          border: '1px solid #242424',
          borderTop: '2px solid #333',
          borderRadius: 12,
          padding: '1.5rem',
          minHeight: 320,
        }}>
          <h2 style={sectionTitle}>Analysis</h2>
          <ResultPanel />
        </section>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#333', fontSize: 12 }}>
        HalluciDetect · Linguistic · Wikipedia · Self-Consistency
      </footer>
    </div>
  )
}

const sectionTitle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '.1em',
  marginBottom: 16,
}
