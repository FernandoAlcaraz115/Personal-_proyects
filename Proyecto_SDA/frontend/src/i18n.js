export const translations = {
  es: {
    navTitle: 'HalluciDetect',
    navSubtitle: 'AI Hallucination Studio',
    navHowItWorks: '¿Cómo funciona?',
    navStatus: 'Multi-Domain Engine Activo',
    heroBadge: 'SISTEMA DE DETECCIÓN MULTIDOMINIO v2.0',
    heroTitle: 'Detecta y corrige alucinaciones de IA',
    heroSubtitle: 'Pipeline neuronal y formal para verificar texto fáctico, detectar librerías fantasma en código y auditar ecuaciones con SymPy.',
    
    // Modes
    modeText: 'Fáctico',
    modeCode: 'Código',
    modeMath: 'Matemáticas',
    modeTextDesc: 'Verificación de hechos, historia y ciencia con Wikipedia y la Web',
    modeCodeDesc: 'Detección de sintaxis, librerías PyPI fantasma y APIs inventadas',
    modeMathDesc: 'Auditoría formal de operaciones y álgebra simbólica con SymPy',

    // Sections
    sectionInput: 'Entrada de Datos',
    sectionAnalysis: 'Diagnóstico & Resultados',
    quickDemo: 'Demos Rápidos',
    placeholderText: 'Pega aquí el texto generado por un LLM para auditar alucinaciones factuales…',
    placeholderCode: 'Pega aquí el código generado por IA (ej. Python) para detectar librerías inexistentes o métodos alucinados…',
    placeholderMath: 'Pega aquí ecuaciones o resolución paso a paso (ej: 23 * 47 = 1181) para auditar con SymPy…',
    
    // Controls
    labelProvider: 'Proveedor',
    labelLanguage: 'Idioma',
    labelModel: 'Modelo',
    labelSC: 'Auto-Consistencia',
    labelWikipedia: 'Grounding Web',
    labelAICorrection: 'Corrección con IA ⚡',
    btnAnalyze: 'Ejecutar Diagnóstico ⚡',
    btnAnalyzing: 'Analizando Pipeline…',

    // Presets
    demosText: [
      { label: '🌍 Capital falsa',  text: 'La capital de Francia es Berlín, una ciudad famosa por la Torre Eiffel y sus museos de arte.' },
      { label: '🍴 Dato absurdo',   text: 'La mayonesa es un instrumento musical de viento que se utiliza en las orquestas clásicas europeas desde el siglo XVIII.' },
      { label: '💼 Historia falsa', text: 'Steve Jobs fundó Microsoft en 1975 junto a su socio Bill Gates en el garaje de su casa en Seattle, Washington.' },
      { label: '✅ Texto correcto', text: 'El agua es una molécula compuesta por dos átomos de hidrógeno y uno de oxígeno. Es esencial para la vida en la Tierra.' },
    ],
    demosCode: [
      { label: '📦 Librería fantasma', text: "import package_totalmente_fantasma_xyz123\n\n# El modelo inventó una librería que no existe en PyPI\ndata = package_totalmente_fantasma_xyz123.load_data('test.csv')\nprint(data.summary())" },
      { label: '❌ Método inventado',  text: "import math\n\ndef verificar_primo(numero):\n    # math.is_prime NO existe en la librería estándar de Python\n    return math.is_prime(numero)\n\nprint(verificar_primo(29))" },
      { label: '⚡ Error sintáctico',  text: "def calcular_promedio(valores):\n    total = 0\n    for v in valores\n        total += v\n    return total / len(valores)" },
      { label: '✅ Código correcto',   text: "import math\n\ndef calcular_hipotenusa(a, b):\n    return math.sqrt(a**2 + b**2)\n\nprint('Hipotenusa:', calcular_hipotenusa(3, 4))" },
    ],
    demosMath: [
      { label: '🧮 Multiplicación errónea', text: "Paso 1: Multiplicamos los dos números primos grandes.\n23 * 47 = 1181\nPaso 2: Sumamos la constante 19.\n1181 + 19 = 1200" },
      { label: '📊 Porcentaje falso',       text: "En la encuesta de satisfacción, el 15% de 200 personas respondieron favorablemente, lo que equivale a 35 personas." },
      { label: '🔬 Álgebra inválida',       text: "Aplicando identidades trigonométricas fundamentales:\nsin(x)^2 + cos(x)^2 = 2" },
      { label: '✅ Cálculo verídico',        text: "Paso 1: 15 + 27 = 42\nPaso 2: 42 * 2 = 84\nPaso 3: 84 / 4 = 21" },
    ],

    // Result labels
    labelMethod: 'Método Utilizado',
    labelConfidence: 'ÍNDICE DE CONFIANZA',
    labelRisk: 'Nivel de Riesgo',
    riskLow: 'Fiabilidad Alta',
    riskMedium: 'Riesgo Moderado',
    riskHigh: 'Alucinación Crítica',
    emptyHint: 'Configura la entrada y presiona "Ejecutar Diagnóstico" para visualizar el desglose en tiempo real.',
    errorLabel: 'Error en la Ejecución',
    copiedTooltip: '¡Copiado al portapapeles!',
    copyButton: 'Copiar',
    
    // Code Result View
    codeSyntaxValid: 'Sintaxis AST Válida',
    codeSyntaxError: 'Error de Sintaxis Detectado',
    codeGhostWarning: 'Librerías Fantasma Detectadas en PyPI',
    codeNoGhost: 'Sin librerías fantasma',
    codeIssuesFound: 'Anomalías de Código',
    codeLine: 'Línea',
    codeAiPatched: 'Código Corregido por IA',
    codeAiExplanation: 'Diagnóstico de la IA',

    // Math Result View
    mathAuditedEquations: 'Ecuaciones Auditadas con SymPy',
    mathErrorsFound: 'Discrepancias Matemáticas',
    mathNoErrors: 'Todas las igualdades son formalmente válidas',
    mathStep: 'Paso',
    mathAffirmed: 'Afirmado por el LLM',
    mathExpected: 'Valor Real (SymPy)',
    mathDifference: 'Discrepancia',
    mathAiSolution: 'Solución Formal Paso a Paso',

    // Factual view
    claimsBreakdown: 'Auditoría por Afirmación',
    halluFound: (n, total) => `${n} de ${total} afirmación${total > 1 ? 'es' : ''} identificada${n > 1 ? 's' : ''} como alucinación`,
    halluNone: (total) => `Sin alucinaciones detectadas en las ${total} afirmaciones auditadas`,
    analyzedText: 'Texto Segmentado',
    legendHigh: 'Alto Riesgo (Alucinación)',
    legendMedium: 'Riesgo Medio (Incierto)',
    legendLow: 'Fiabilidad Verificada',
    legendHover: 'Pasa el cursor para ver detalles',
    wikiLink: 'Fuente Wikipedia →',
    halluDetected: 'Alucinación Detectada',
    claimAccurate: 'Afirmación Verídica',
    correctedLabel: 'Corrección Recomendada',

    // Modal
    howTitle: 'Arquitectura de HalluciDetect',
    howIntro: 'HalluciDetect combina técnicas de caja negra, análisis estático de código y verificación simbólica formal para interceptar alucinaciones en tres dimensiones críticas.',
    howClose: 'Cerrar',
  },

  en: {
    navTitle: 'HalluciDetect',
    navSubtitle: 'AI Hallucination Studio',
    navHowItWorks: 'How it works?',
    navStatus: 'Multi-Domain Engine Active',
    heroBadge: 'MULTI-DOMAIN DETECTION SYSTEM v2.0',
    heroTitle: 'Detect & Patch AI Hallucinations',
    heroSubtitle: 'Neural and formal pipeline to audit factual claims, detect ghost PyPI packages in code, and verify equations with SymPy.',
    
    // Modes
    modeText: 'Factual',
    modeCode: 'Code',
    modeMath: 'Mathematics',
    modeTextDesc: 'Fact-checking, history and science with Wikipedia and Web sources',
    modeCodeDesc: 'AST syntax verification, ghost PyPI packages and fabricated APIs',
    modeMathDesc: 'Formal arithmetic and symbolic algebra auditing with SymPy',

    // Sections
    sectionInput: 'Input Configuration',
    sectionAnalysis: 'Diagnosis & Results',
    quickDemo: 'Quick Presets',
    placeholderText: 'Paste LLM-generated text to audit factual claims and hallucinated facts…',
    placeholderCode: 'Paste AI-generated code (e.g. Python) to detect ghost packages or fabricated APIs…',
    placeholderMath: 'Paste math equations or step-by-step reasoning (e.g. 23 * 47 = 1181) to verify with SymPy…',
    
    // Controls
    labelProvider: 'Provider',
    labelLanguage: 'Language',
    labelModel: 'Model',
    labelSC: 'Self-Consistency',
    labelWikipedia: 'Web Grounding',
    labelAICorrection: 'AI Correction ⚡',
    btnAnalyze: 'Run Diagnosis ⚡',
    btnAnalyzing: 'Analyzing Pipeline…',

    // Presets
    demosText: [
      { label: '🌍 False capital', text: 'The capital of France is Berlin, a city famous for the Eiffel Tower and its art museums.' },
      { label: '🍴 Absurd claim',  text: 'Mayonnaise is a wind musical instrument used in classical European orchestras since the 18th century.' },
      { label: '💼 Fake history',  text: 'Steve Jobs founded Microsoft in 1975 together with his partner Bill Gates in the garage of his house in Seattle, Washington.' },
      { label: '✅ Accurate text', text: 'Water is a molecule composed of two hydrogen atoms and one oxygen atom. It is essential for life on Earth.' },
    ],
    demosCode: [
      { label: '📦 Ghost package', text: "import package_totalmente_fantasma_xyz123\n\n# The LLM invented a package that does not exist on PyPI\ndata = package_totalmente_fantasma_xyz123.load_data('test.csv')\nprint(data.summary())" },
      { label: '❌ Fabricated API', text: "import math\n\ndef is_prime_number(num):\n    # math.is_prime does NOT exist in Python standard library\n    return math.is_prime(num)\n\nprint(is_prime_number(29))" },
      { label: '⚡ Syntax error',   text: "def compute_average(values):\n    total = 0\n    for v in values\n        total += v\n    return total / len(values)" },
      { label: '✅ Clean code',    text: "import math\n\ndef hypotenuse(a, b):\n    return math.sqrt(a**2 + b**2)\n\nprint('Hypotenuse:', hypotenuse(3, 4))" },
    ],
    demosMath: [
      { label: '🧮 Wrong multiplication', text: "Step 1: Multiply the two prime factors.\n23 * 47 = 1181\nStep 2: Add constant 19.\n1181 + 19 = 1200" },
      { label: '📊 False percentage',       text: "In the survey, 15% of 200 people answered yes, which equals 35 people." },
      { label: '🔬 Invalid identity',       text: "Using fundamental trigonometric identities:\nsin(x)^2 + cos(x)^2 = 2" },
      { label: '✅ Accurate calculation',   text: "Step 1: 15 + 27 = 42\nStep 2: 42 * 2 = 84\nStep 3: 84 / 4 = 21" },
    ],

    // Result labels
    labelMethod: 'Method Used',
    labelConfidence: 'CONFIDENCE INDEX',
    labelRisk: 'Risk Level',
    riskLow: 'High Reliability',
    riskMedium: 'Moderate Risk',
    riskHigh: 'Critical Hallucination',
    emptyHint: 'Configure input and click "Run Diagnosis" to visualize real-time breakdown.',
    errorLabel: 'Execution Error',
    copiedTooltip: 'Copied to clipboard!',
    copyButton: 'Copy',
    
    // Code Result View
    codeSyntaxValid: 'Valid AST Syntax',
    codeSyntaxError: 'Syntax Error Detected',
    codeGhostWarning: 'Ghost PyPI Packages Found',
    codeNoGhost: 'No ghost packages',
    codeIssuesFound: 'Code Anomalies',
    codeLine: 'Line',
    codeAiPatched: 'AI-Patched Code',
    codeAiExplanation: 'AI Diagnosis',

    // Math Result View
    mathAuditedEquations: 'Audited Equations with SymPy',
    mathErrorsFound: 'Mathematical Discrepancies',
    mathNoErrors: 'All equations are formally valid',
    mathStep: 'Step',
    mathAffirmed: 'Affirmed by LLM',
    mathExpected: 'True Value (SymPy)',
    mathDifference: 'Discrepancy',
    mathAiSolution: 'Step-by-Step Formal Solution',

    // Factual view
    claimsBreakdown: 'Claim-by-Claim Breakdown',
    halluFound: (n, total) => `${n} of ${total} claim${total > 1 ? 's' : ''} identified as hallucination`,
    halluNone: (total) => `No hallucinations detected in ${total} audited claims`,
    analyzedText: 'Segmented Text',
    legendHigh: 'High Risk (Hallucination)',
    legendMedium: 'Moderate Risk (Uncertain)',
    legendLow: 'Verified Reliability',
    legendHover: 'Hover to see details',
    wikiLink: 'Wikipedia Source →',
    halluDetected: 'Hallucination Detected',
    claimAccurate: 'Accurate Claim',
    correctedLabel: 'Recommended Correction',

    // Modal
    howTitle: 'HalluciDetect Architecture',
    howIntro: 'HalluciDetect combines black-box heuristics, static code AST inspection, and formal symbolic verification to intercept AI hallucinations across three critical domains.',
    howClose: 'Close',
  },
}
