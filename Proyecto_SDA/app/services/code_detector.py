"""
CodeHallucinationDetector — Identifies hallucinations in source code (Python & JavaScript/TypeScript).

Detects:
1. Syntax / AST parsing errors with exact line numbers.
2. Hallucinated / ghost packages on PyPI and npm registries (detecting slopsquatting vectors).
3. Fabricated methods and APIs in Python stdlib and JavaScript/Node.js runtime.
4. AI-powered code correction and explanation.
"""
from __future__ import annotations
import ast
import sys
import re
from typing import List, Dict, Optional, Set
import httpx
from pydantic import BaseModel, Field

# Cache to avoid repetitive network calls
_PYPI_CACHE: Dict[str, bool] = {}
_NPM_CACHE: Dict[str, bool] = {}

# Set of standard library modules in current Python runtime
_STDLIB_MODULES: Set[str] = getattr(sys, "stdlib_module_names", set())

# Common verified top packages in Python ecosystem
_POPULAR_PYTHON_PACKAGES = {
    "numpy", "pandas", "scipy", "matplotlib", "seaborn", "scikit-learn", "sklearn",
    "torch", "torchvision", "torchaudio", "tensorflow", "keras",
    "requests", "httpx", "urllib3", "aiohttp", "fastapi", "flask", "django",
    "uvicorn", "pydantic", "pydantic_settings", "sqlalchemy", "pytest",
    "beautifulsoup4", "bs4", "selenium", "playwright", "scrapy",
    "pillow", "pil", "opencv-python", "cv2", "nltk", "spacy", "transformers",
    "datasets", "tokenizers", "accelerate", "langchain", "llama_index", "openai",
    "google-generativeai", "anthropic", "dotenv", "python-dotenv", "pyyaml", "yaml",
    "networkx", "sympy", "polars", "duckdb", "click", "typer", "rich", "tqdm",
    "cryptography", "jwt", "pyjwt", "bcrypt", "celery", "redis", "alembic",
}

# Standard Node.js built-in modules
_NODE_STDLIB = {
    "assert", "async_hooks", "buffer", "child_process", "cluster", "console",
    "constants", "crypto", "dgram", "diagnostics_channel", "dns", "domain",
    "events", "fs", "fs/promises", "http", "http2", "https", "inspector",
    "module", "net", "os", "path", "path/posix", "path/win32", "perf_hooks",
    "process", "punycode", "querystring", "readline", "repl", "stream",
    "stream/promises", "stream/consumers", "stream/web", "string_decoder",
    "timers", "timers/promises", "tls", "trace_events", "tty", "url", "util",
    "v8", "vm", "wasi", "worker_threads", "zlib", "test"
}

# Popular verified npm packages
_POPULAR_NPM_PACKAGES = {
    "react", "react-dom", "vue", "svelte", "next", "nuxt", "express", "koa", "fastify",
    "axios", "lodash", "underscore", "dayjs", "moment", "date-fns", "zod", "yup", "joi",
    "tailwindcss", "postcss", "autoprefixer", "vite", "webpack", "rollup", "esbuild",
    "typescript", "eslint", "prettier", "jest", "vitest", "mocha", "chai", "cypress",
    "zustand", "redux", "@reduxjs/toolkit", "mobx", "lucide-react", "feather-icons",
    "bcrypt", "bcryptjs", "jsonwebtoken", "dotenv", "cors", "helmet", "morgan",
    "pg", "mysql2", "sqlite3", "prisma", "@prisma/client", "mongoose", "typeorm",
    "@tanstack/react-query", "swr", "socket.io", "socket.io-client", "uuid", "nanoid",
    "chalk", "commander", "yargs", "inquirer", "ora", "rxjs", "rxjs/operators",
    "three", "@types/node", "@types/react", "@types/react-dom", "cheerio"
}

# Catalog of frequently hallucinated module attributes in Python
_KNOWN_HALLUCINATED_PYTHON_ATTRIBUTES: Dict[str, Dict[str, str]] = {
    "math": {
        "is_prime": "math.is_prime no existe en Python. Usa una función propia o sympy.isprime.",
        "fibonacci": "math.fibonacci no existe en la librería estándar de Python.",
        "factorial_recursive": "math.factorial_recursive no existe. La función estándar es math.factorial.",
        "lcm": "En versiones anteriores a Python 3.9 math.lcm no existía.",
    },
    "json": {
        "to_json": "json.to_json no existe en Python. Utiliza json.dumps().",
        "from_json": "json.from_json no existe en Python. Utiliza json.loads().",
        "dump_string": "json.dump_string no existe. Utiliza json.dumps().",
    },
    "random": {
        "random_string": "random.random_string no existe. Usa string y random.choices().",
        "random_word": "random.random_word no existe en el módulo estándar random.",
        "random_uuid": "random.random_uuid no existe. Utiliza uuid.uuid4().",
    },
    "os": {
        "copy_file": "os.copy_file no existe. Utiliza shutil.copy().",
        "move_file": "os.move_file no existe. Utiliza shutil.move().",
        "delete_folder": "os.delete_folder no existe. Utiliza shutil.rmtree() o os.rmdir().",
        "read_file": "os.read_file no existe. Utiliza la función integrada open(path).read().",
    },
    "re": {
        "extract": "re.extract no existe. Utiliza re.findall() o re.search().",
        "replace": "re.replace no existe. Utiliza re.sub().",
    },
    "datetime": {
        "now": "datetime.now() falla si importaste 'import datetime'. Debe ser datetime.datetime.now().",
    },
}

# Catalog of frequently hallucinated APIs in JavaScript / Node.js
_KNOWN_HALLUCINATED_JS_APIS = [
    (r"\bArray\.prototype\.flatDeep\b|\b\.flatDeep\(", "flatDeep() no existe en JavaScript. Utiliza .flat(Infinity) o recursión."),
    (r"\b\.unique\(\)", ".unique() no es un método nativo de Array en JS. Utiliza [...new Set(arr)] o lodash.uniq()."),
    (r"\bObject\.clone\b", "Object.clone() no existe en JS estándar. Utiliza structuredClone() o Object.assign({}, obj)."),
    (r"\bJSON\.validate\b", "JSON.validate() no existe en el objeto global JSON. Usa un try/catch con JSON.parse() o un validador como Zod."),
    (r"\bfetch\.json\b", "fetch.json() no existe. La llamada global es fetch(url) y luego response.json()."),
    (r"\bfs\.readSyncSafe\b|\bfs\.writeSyncSafe\b", "fs.*SyncSafe no existe en Node.js. Usa fs.readFileSync dentro de try/catch."),
    (r"\bMath\.randomInt\b", "Math.randomInt() no existe en JavaScript estándar. Utiliza Math.floor(Math.random() * (max - min) + min)."),
    (r"\bThread\.sleep\b", "Thread.sleep() no existe en JavaScript. Utiliza await new Promise(r => setTimeout(r, ms))."),
    (r"\bPromise\.sleep\b", "Promise.sleep() no es nativo. Usa new Promise(r => setTimeout(r, ms))."),
    (r"\bString\.prototype\.capitalize\b|\b\.capitalize\(\)", ".capitalize() no es un método nativo de String en JS estándar."),
]

from app.models.analysis import CodeIssue, CodeAnalysisResult


class CodeHallucinationDetector:
    def __init__(self):
        self._http_client = httpx.AsyncClient(timeout=4.0)

    def detect_language(self, code: str, language_hint: str = "auto") -> str:
        if language_hint in ("javascript", "typescript", "js", "ts"):
            return "javascript"
        if language_hint in ("python", "py"):
            return "python"

        js_markers = [
            r"\b(const|let|var)\s+\w+",
            r"\bfunction\s*\w*\s*\(",
            r"=>",
            r"\bconsole\.log\(",
            r"\bimport\s+.*\s+from\s+['\"]",
            r"\brequire\s*\(['\"]",
            r"\bexport\s+(default|const|function|class)",
            r"\binterface\s+\w+\s*\{",
            r"\btype\s+\w+\s*=",
        ]
        py_markers = [
            r"\bdef\s+\w+\s*\(",
            r"\bclass\s+\w+(\(.*\))?\s*:",
            r"\bfrom\s+\w+\s+import\b",
            r"\bimport\s+\w+",
            r"\belif\b",
            r"\bself\.",
            r"\b__init__\b",
            r":\s*$",
        ]

        js_score = sum(1 for p in js_markers if re.search(p, code, re.MULTILINE))
        py_score = sum(1 for p in py_markers if re.search(p, code, re.MULTILINE))

        return "javascript" if js_score > py_score else "python"

    async def analyze(
        self,
        code: str,
        language: str = "auto",
        check_pypi: bool = True,
        ai_correction: bool = False,
        llm_client = None,
        llm_provider: str = "ollama",
        model: str = "llama3.2",
    ) -> CodeAnalysisResult:
        """Analyzes code snippet in Python or JavaScript/TypeScript."""
        code = code.strip()
        detected_lang = self.detect_language(code, language)

        if not code:
            return CodeAnalysisResult(
                language=detected_lang,
                is_valid_syntax=False,
                confidence_score=0.0,
                risk_level="high",
                issues=[CodeIssue(
                    category="syntax",
                    severity="high",
                    symbol="EMPTY_CODE",
                    message="El código proporcionado está vacío.",
                )]
            )

        if detected_lang == "javascript":
            return await self._analyze_javascript(
                code=code,
                check_npm=check_pypi,
                ai_correction=ai_correction,
                llm_client=llm_client,
                llm_provider=llm_provider,
                model=model,
            )

        return await self._analyze_python(
            code=code,
            check_pypi=check_pypi,
            ai_correction=ai_correction,
            llm_client=llm_client,
            llm_provider=llm_provider,
            model=model,
        )

    # -------------------------------------------------------------
    # Python Analysis Engine (AST + PyPI)
    # -------------------------------------------------------------
    async def _analyze_python(
        self,
        code: str,
        check_pypi: bool,
        ai_correction: bool,
        llm_client,
        llm_provider: str,
        model: str = "llama3.2",
    ) -> CodeAnalysisResult:
        issues: List[CodeIssue] = []
        hallucinated_pkgs: List[str] = []
        ast_metrics: Dict[str, int] = {}
        is_valid_syntax = True

        tree = None
        try:
            tree = ast.parse(code)
            ast_metrics = self._calculate_ast_metrics(tree)
        except SyntaxError as syn_err:
            is_valid_syntax = False
            issues.append(CodeIssue(
                category="syntax",
                severity="high",
                line_number=syn_err.lineno,
                column=syn_err.offset,
                symbol=syn_err.text.strip() if syn_err.text else "SyntaxError",
                message=f"Error de sintaxis: {syn_err.msg}",
                suggestion="Revisa la sintaxis, comillas sin cerrar o indentación incorrecta.",
            ))

        if tree is not None:
            imported_modules = self._extract_python_imports(tree)
            for mod_info in imported_modules:
                root_pkg = mod_info["name"].split(".")[0]
                if root_pkg in _STDLIB_MODULES or root_pkg.lower() in _POPULAR_PYTHON_PACKAGES or root_pkg == "__future__":
                    continue

                if check_pypi:
                    exists = await self._verify_pypi_package(root_pkg)
                    if not exists:
                        hallucinated_pkgs.append(root_pkg)
                        issues.append(CodeIssue(
                            category="hallucinated_package",
                            severity="high",
                            line_number=mod_info["line"],
                            symbol=root_pkg,
                            message=f"Librería alucinada: '{root_pkg}' no existe en la librería estándar ni en el registro PyPI.",
                            suggestion=f"Verifica el nombre del paquete o busca alternativas verificadas en PyPI.",
                        ))

            api_issues = self._check_hallucinated_python_apis(tree)
            issues.extend(api_issues)

        confidence, risk = self._calculate_score(is_valid_syntax, issues)

        corrected_code = None
        ai_explanation = None
        if ai_correction and llm_client and issues:
            corrected_code, ai_explanation = await self._generate_ai_correction(
                code=code,
                language="Python",
                issues=issues,
                llm_client=llm_client,
                provider=llm_provider,
                model=model,
            )

        return CodeAnalysisResult(
            language="python",
            is_valid_syntax=is_valid_syntax,
            confidence_score=confidence,
            risk_level=risk,
            issues=issues,
            hallucinated_packages=hallucinated_pkgs,
            ast_metrics=ast_metrics,
            corrected_code=corrected_code,
            ai_explanation=ai_explanation,
        )

    # -------------------------------------------------------------
    # JavaScript / TypeScript Analysis Engine (npm & API scanner)
    # -------------------------------------------------------------
    async def _analyze_javascript(
        self,
        code: str,
        check_npm: bool,
        ai_correction: bool,
        llm_client,
        llm_provider: str,
        model: str = "llama3.2",
    ) -> CodeAnalysisResult:
        issues: List[CodeIssue] = []
        hallucinated_pkgs: List[str] = []
        is_valid_syntax = True

        # 1. Structural balance check (braces, parens, quotes)
        syntax_err = self._check_js_syntax(code)
        if syntax_err:
            is_valid_syntax = False
            issues.append(syntax_err)

        # 2. Extract imports (ESM & CommonJS)
        imports = self._extract_js_imports(code)
        for imp in imports:
            pkg_name = imp["package"]
            # Exclude relative imports
            if pkg_name.startswith((".", "/")):
                continue

            # Strip node: prefix
            norm_pkg = pkg_name[5:] if pkg_name.startswith("node:") else pkg_name
            root_pkg = norm_pkg.split("/")[0] if not norm_pkg.startswith("@") else "/".join(norm_pkg.split("/")[:2])

            if root_pkg in _NODE_STDLIB or root_pkg in _POPULAR_NPM_PACKAGES:
                continue

            if check_npm:
                exists = await self._verify_npm_package(root_pkg)
                if not exists:
                    hallucinated_pkgs.append(root_pkg)
                    issues.append(CodeIssue(
                        category="hallucinated_package",
                        severity="high",
                        line_number=imp["line"],
                        symbol=root_pkg,
                        message=f"Librería alucinada en npm (Riesgo de Slopsquatting): '{root_pkg}' no existe en el registro oficial de npm.",
                        suggestion="Verifica el nombre del paquete en npmjs.com o comprueba la ortografía.",
                    ))

        # 3. Detect known hallucinated Web / JS APIs
        lines = code.split("\n")
        for line_idx, line in enumerate(lines, 1):
            for pattern, msg in _KNOWN_HALLUCINATED_JS_APIS:
                match = re.search(pattern, line)
                if match:
                    issues.append(CodeIssue(
                        category="hallucinated_api",
                        severity="high",
                        line_number=line_idx,
                        symbol=match.group(0),
                        message=f"API de JavaScript inexistente: {msg}",
                        suggestion="Consulta MDN Web Docs para la API estándar moderna.",
                    ))

        # Basic metrics
        ast_metrics = {
            "functions": len(re.findall(r"\bfunction\b|=>", code)),
            "imports": len(imports),
            "classes": len(re.findall(r"\bclass\s+\w+", code)),
            "calls": len(re.findall(r"\b\w+\(", code)),
        }

        confidence, risk = self._calculate_score(is_valid_syntax, issues)

        corrected_code = None
        ai_explanation = None
        if ai_correction and llm_client and issues:
            corrected_code, ai_explanation = await self._generate_ai_correction(
                code=code,
                language="JavaScript / TypeScript",
                issues=issues,
                llm_client=llm_client,
                provider=llm_provider,
                model=model,
            )

        return CodeAnalysisResult(
            language="javascript",
            is_valid_syntax=is_valid_syntax,
            confidence_score=confidence,
            risk_level=risk,
            issues=issues,
            hallucinated_packages=hallucinated_pkgs,
            ast_metrics=ast_metrics,
            corrected_code=corrected_code,
            ai_explanation=ai_explanation,
        )

    def _extract_python_imports(self, tree: ast.AST) -> List[Dict]:
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append({"name": alias.name, "line": node.lineno})
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append({"name": node.module, "line": node.lineno})
        return imports

    def _check_hallucinated_python_apis(self, tree: ast.AST) -> List[CodeIssue]:
        issues = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
                module_name = node.value.id
                attr_name = node.attr
                if module_name in _KNOWN_HALLUCINATED_PYTHON_ATTRIBUTES:
                    hallu_dict = _KNOWN_HALLUCINATED_PYTHON_ATTRIBUTES[module_name]
                    if attr_name in hallu_dict:
                        issues.append(CodeIssue(
                            category="hallucinated_api",
                            severity="high",
                            line_number=node.lineno,
                            symbol=f"{module_name}.{attr_name}",
                            message=f"Método inventado: {hallu_dict[attr_name]}",
                            suggestion=f"Revisa la documentación oficial de {module_name}.",
                        ))
        return issues

    def _extract_js_imports(self, code: str) -> List[Dict]:
        imports = []
        lines = code.split("\n")
        esm_pattern = re.compile(r"""(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|import\s*\(\s*)['"]([^'"]+)['"]""")
        cjs_pattern = re.compile(r"""require\s*\(\s*['"]([^'"]+)['"]\s*\)""")

        for line_num, line in enumerate(lines, 1):
            for match in esm_pattern.finditer(line):
                imports.append({"package": match.group(1), "line": line_num})
            for match in cjs_pattern.finditer(line):
                imports.append({"package": match.group(1), "line": line_num})
        return imports

    def _check_js_syntax(self, code: str) -> Optional[CodeIssue]:
        # Balance stack for braces/brackets/parentheses
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        lines = code.split("\n")

        for line_idx, line in enumerate(lines, 1):
            # Strip simple comments
            clean_line = re.sub(r"//.*$", "", line)
            for col_idx, char in enumerate(clean_line, 1):
                if char in '({[':
                    stack.append((char, line_idx, col_idx))
                elif char in ')}]':
                    if not stack:
                        return CodeIssue(
                            category="syntax",
                            severity="high",
                            line_number=line_idx,
                            column=col_idx,
                            symbol=char,
                            message=f"Error de sintaxis: Cierre '{char}' inesperado sin apertura previa.",
                            suggestion="Revisa la concordancia de llaves y paréntesis.",
                        )
                    top_char, top_line, _ = stack.pop()
                    if pairs[char] != top_char:
                        return CodeIssue(
                            category="syntax",
                            severity="high",
                            line_number=line_idx,
                            column=col_idx,
                            symbol=char,
                            message=f"Error de sintaxis: Se esperaba el cierre de '{top_char}' abierto en la línea {top_line}, pero se encontró '{char}'.",
                            suggestion="Verifica el orden de anidamiento de bloques.",
                        )
        if stack:
            unclosed, line_no, col = stack[-1]
            return CodeIssue(
                category="syntax",
                severity="high",
                line_number=line_no,
                column=col,
                symbol=unclosed,
                message=f"Error de sintaxis: Bloque '{unclosed}' sin cerrar.",
                suggestion=f"Añade el cierre correspondiente para '{unclosed}'.",
            )
        return None

    def _calculate_ast_metrics(self, tree: ast.AST) -> Dict[str, int]:
        functions = 0
        classes = 0
        imports = 0
        calls = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions += 1
            elif isinstance(node, ast.ClassDef):
                classes += 1
            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                imports += 1
            elif isinstance(node, ast.Call):
                calls += 1
        return {
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "calls": calls,
        }

    async def _verify_pypi_package(self, package_name: str) -> bool:
        norm_name = package_name.lower().replace("_", "-")
        if norm_name in _PYPI_CACHE:
            return _PYPI_CACHE[norm_name]

        try:
            url = f"https://pypi.org/pypi/{norm_name}/json"
            res = await self._http_client.get(url)
            exists = res.status_code == 200
            _PYPI_CACHE[norm_name] = exists
            return exists
        except Exception:
            return True

    async def _verify_npm_package(self, package_name: str) -> bool:
        norm_name = package_name.lower().strip()
        if norm_name in _NPM_CACHE:
            return _NPM_CACHE[norm_name]

        try:
            url = f"https://registry.npmjs.org/{norm_name}"
            res = await self._http_client.get(url)
            exists = res.status_code == 200
            _NPM_CACHE[norm_name] = exists
            return exists
        except Exception:
            return True

    def _calculate_score(self, is_valid_syntax: bool, issues: List[CodeIssue]) -> tuple[float, str]:
        if not is_valid_syntax:
            return 0.15, "high"

        penalty = 0.0
        for issue in issues:
            if issue.category in ("hallucinated_package", "hallucinated_api"):
                penalty += 0.60
            elif issue.severity == "high":
                penalty += 0.45
            elif issue.severity == "medium":
                penalty += 0.20
            else:
                penalty += 0.08

        confidence = round(max(0.05, min(1.0, 1.0 - penalty)), 3)
        if confidence >= 0.80:
            risk = "low"
        elif confidence >= 0.50:
            risk = "medium"
        else:
            risk = "high"
        return confidence, risk

    async def _generate_ai_correction(
        self,
        code: str,
        language: str,
        issues: List[CodeIssue],
        llm_client,
        provider: str,
        model: str = "llama3.2",
    ) -> tuple[Optional[str], Optional[str]]:
        try:
            issues_summary = "\n".join(
                f"- Línea {i.line_number or '?'}: [{i.category}] {i.symbol} -> {i.message}"
                for i in issues
            )
            prompt = f"""Eres un ingeniero de software senior y experto en depurar alucinaciones de código generado por LLMs.
Detectamos las siguientes alucinaciones o errores en este código ({language}):
{issues_summary}

Código original con errores:
```{language.lower()}
{code}
```

Instrucciones:
1. Proporciona el código ({language}) corregido y 100% funcional (reemplazando librerías o métodos alucinados por equivalentes reales).
2. Explica brevemente en español qué alucinaciones corregiste.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{{
  "corrected_code": "código completo corregido aquí",
  "explanation": "resumen de lo corregido en español"
}}
No incluyas texto fuera del JSON."""

            raw = await llm_client._query(prompt, provider, model=model)
            import json
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                data = json.loads(match.group())
                return data.get("corrected_code"), data.get("explanation")
        except Exception:
            pass
        return None, None

    async def close(self):
        await self._http_client.aclose()
