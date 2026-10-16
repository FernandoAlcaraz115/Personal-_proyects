"""
CodeHallucinationDetector — Identifies hallucinations in source code (Python).

Detects:
1. Syntax / AST parsing errors with exact line numbers.
2. Hallucinated / ghost packages (not in stdlib and not on PyPI).
3. Non-existent methods/attributes in standard libraries and popular packages.
4. AI-powered code correction and explanation.
"""
from __future__ import annotations
import ast
import sys
import re
from typing import List, Dict, Optional, Set
import httpx
from pydantic import BaseModel, Field

# Cache to avoid repetitive network calls for PyPI package verification
_PYPI_CACHE: Dict[str, bool] = {}

# Set of standard library modules in current Python runtime
_STDLIB_MODULES: Set[str] = getattr(sys, "stdlib_module_names", set())

# Common verified top packages in Python ecosystem
_POPULAR_PACKAGES = {
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

# Catalog of frequently hallucinated module attributes / functions
_KNOWN_HALLUCINATED_ATTRIBUTES: Dict[str, Dict[str, str]] = {
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


from app.models.analysis import CodeIssue, CodeAnalysisResult



class CodeHallucinationDetector:
    def __init__(self):
        self._http_client = httpx.AsyncClient(timeout=4.0)

    async def analyze(
        self,
        code: str,
        language: str = "python",
        check_pypi: bool = True,
        ai_correction: bool = False,
        llm_client = None,
        llm_provider: str = "ollama",
    ) -> CodeAnalysisResult:
        """Analyzes code snippet for syntax, hallucinated imports and fabricated APIs."""
        code = code.strip()
        issues: List[CodeIssue] = []
        hallucinated_pkgs: List[str] = []
        ast_metrics: Dict[str, int] = {}
        is_valid_syntax = True

        if not code:
            return CodeAnalysisResult(
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

        # 1. Parse AST to check syntax
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

        # 2. If tree parsed successfully, inspect imports and calls
        if tree is not None:
            # Check imports for ghost/hallucinated packages
            imported_modules = self._extract_imports(tree)
            for mod_info in imported_modules:
                root_pkg = mod_info["name"].split(".")[0]
                if root_pkg in _STDLIB_MODULES or root_pkg.lower() in _POPULAR_PACKAGES or root_pkg == "__future__":
                    continue

                # Check if package exists on PyPI
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

            # Check calls for fabricated attributes/functions
            api_issues = self._check_hallucinated_apis(tree)
            issues.extend(api_issues)

        # 3. Calculate confidence and risk
        confidence, risk = self._calculate_score(is_valid_syntax, issues)

        # 4. AI-assisted correction if requested
        corrected_code = None
        ai_explanation = None
        if ai_correction and llm_client and issues:
            corrected_code, ai_explanation = await self._generate_ai_correction(
                code=code,
                issues=issues,
                llm_client=llm_client,
                provider=llm_provider,
            )

        return CodeAnalysisResult(
            is_valid_syntax=is_valid_syntax,
            confidence_score=confidence,
            risk_level=risk,
            issues=issues,
            hallucinated_packages=hallucinated_pkgs,
            ast_metrics=ast_metrics,
            corrected_code=corrected_code,
            ai_explanation=ai_explanation,
        )

    def _extract_imports(self, tree: ast.AST) -> List[Dict]:
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append({"name": alias.name, "line": node.lineno})
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append({"name": node.module, "line": node.lineno})
        return imports

    def _check_hallucinated_apis(self, tree: ast.AST) -> List[CodeIssue]:
        issues = []
        for node in ast.walk(tree):
            # Check attribute access e.g., math.is_prime(...)
            if isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
                module_name = node.value.id
                attr_name = node.attr
                if module_name in _KNOWN_HALLUCINATED_ATTRIBUTES:
                    hallu_dict = _KNOWN_HALLUCINATED_ATTRIBUTES[module_name]
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
            # If PyPI is unreachable, fail gracefully without reporting false positive
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
        issues: List[CodeIssue],
        llm_client,
        provider: str,
    ) -> tuple[Optional[str], Optional[str]]:
        try:
            issues_summary = "\n".join(
                f"- Línea {i.line_number or '?'}: [{i.category}] {i.symbol} -> {i.message}"
                for i in issues
            )
            prompt = f"""Eres un ingeniero de software senior y experto en depurar alucinaciones de código generado por LLMs.
Detectamos las siguientes alucinaciones o errores en este código Python:
{issues_summary}

Código original con errores:
```python
{code}
```

Instrucciones:
1. Proporciona el código Python corregido y 100% funcional (reemplazando librerías o métodos alucinados por equivalentes reales).
2. Explica brevemente en español qué alucinaciones corregiste.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{{
  "corrected_code": "código completo corregido aquí",
  "explanation": "resumen de lo corregido en español"
}}
No incluyas texto fuera del JSON."""

            raw = await llm_client._query(prompt, provider)
            import json
            # Extract JSON block
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                data = json.loads(match.group())
                return data.get("corrected_code"), data.get("explanation")
        except Exception:
            pass
        return None, None

    async def close(self):
        await self._http_client.aclose()
