import TextInput from './components/TextInput'
import ResultPanel from './components/ResultPanel'

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🧠</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: 8,
        }}>
          HalluciDetect
        </h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>
          Multi-layer hallucination detection for LLM-generated text
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        <section style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.5rem',
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Input
          </h2>
          <TextInput />
        </section>

        <section style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.5rem',
          minHeight: 300,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Analysis
          </h2>
          <ResultPanel />
        </section>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#334155', fontSize: 12 }}>
        HalluciDetect · Linguistic + Wikipedia + Self-Consistency
      </footer>
    </div>
  )
}
