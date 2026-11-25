#!/usr/bin/env python3
"""
Attestly CLI — Command Line Interface for LLM Hallucination Auditing.

Commands:
  attestly audit <file_or_text>   Audit a single file, code snippet, or prompt.
  attestly scan <directory>       Recursively scan code files for ghost libraries,
                                  slopsquatting traps, and security issues.
"""
from __future__ import annotations
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional, List

from app.models.analysis import AnalysisRequest, AnalysisMode, AnalysisResponse
from app.services.detector import HallucinationDetector


# ANSI Colors for sleek terminal styling
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
WHITE = "\033[97m"
BG_RED = "\033[41m"
BG_GREEN = "\033[42m"
BG_YELLOW = "\033[43m"


def print_banner():
    banner = f"""{CYAN}{BOLD}
    ╔═══════════════════════════════════════════════════════════════╗
    ║   🧠 ATTESTLY — AI Hallucination & Security Audit CLI v2.5   ║
    ╚═══════════════════════════════════════════════════════════════╝{RESET}
    """
    sys.stderr.write(banner + "\n")


def format_risk_badge(risk: str) -> str:
    risk_upper = risk.upper()
    if risk_upper == "LOW":
        return f"{BG_GREEN}{WHITE}{BOLD} LOW RISK {RESET}"
    elif risk_upper == "MEDIUM":
        return f"{BG_YELLOW}{WHITE}{BOLD} MEDIUM RISK {RESET}"
    else:
        return f"{BG_RED}{WHITE}{BOLD} HIGH RISK {RESET}"


def detect_mode_from_path(path: Path) -> AnalysisMode:
    suffix = path.suffix.lower()
    if suffix in (".py", ".js", ".jsx", ".ts", ".tsx"):
        return AnalysisMode.code
    elif suffix in (".sql",):
        return AnalysisMode.sql
    elif suffix in (".math", ".calc"):
        return AnalysisMode.math
    return AnalysisMode.text


async def run_audit(
    content: str,
    mode: AnalysisMode,
    detector: Optional[HallucinationDetector] = None,
    use_external: bool = True,
    ai_fix: bool = False,
    provider: str = "ollama",
    model: str = "llama3.2",
) -> AnalysisResponse:
    if detector is None:
        detector = HallucinationDetector()
    req = AnalysisRequest(
        text=content,
        mode=mode,
        use_external_verification=use_external,
        use_ai_correction=ai_fix,
        llm_provider=provider,
        model=model,
    )
    return await detector.analyze(req)


def print_audit_result_table(res: AnalysisResponse, source_label: str):
    print(f"\n{BOLD}{WHITE}━━━ AUDIT REPORT: {CYAN}{source_label}{WHITE} ━━━{RESET}")
    print(f"  • {BOLD}Domain / Mode:{RESET}      {CYAN}{res.mode.upper()}{RESET}")
    print(f"  • {BOLD}Overall Confidence:{RESET} {GREEN if res.overall_score >= 0.8 else (YELLOW if res.overall_score >= 0.5 else RED)}{res.overall_score:.3f} / 1.000{RESET}")
    print(f"  • {BOLD}Risk Assessment:{RESET}    {format_risk_badge(res.risk_level)}")
    print(f"  • {BOLD}Engine / Pipeline:{RESET}  {DIM}{res.method_used} ({res.processing_time_ms}ms){RESET}")
    print(f"{DIM}{'─' * 60}{RESET}")

    # Code / SQL specifics
    if res.code_result:
        cr = res.code_result
        syntax_status = f"{GREEN}VALID (No grammar errors){RESET}" if cr.is_valid_syntax else f"{RED}SYNTAX ERROR FOUND{RESET}"
        print(f"  • {BOLD}Syntax Check:{RESET}       {syntax_status}")

        if cr.hallucinated_packages:
            print(f"\n  {RED}{BOLD}⚠️  GHOST PACKAGES (Non-existent in Registry):{RESET}")
            for p in cr.hallucinated_packages:
                print(f"    {RED}✖ {BOLD}{p}{RESET} (Not found on PyPI/npm)")

        if cr.suspicious_packages:
            print(f"\n  {YELLOW}{BOLD}🛡️  SLOPSQUATTING / SUSPICIOUS PACKAGES:{RESET}")
            for p in cr.suspicious_packages:
                print(f"    {YELLOW}⚡ {BOLD}{p}{RESET} (Recently registered trap package)")

        if cr.vulnerabilities_found:
            print(f"\n  {RED}{BOLD}🚨 OSV SECURITY ADVISORIES / CVEs:{RESET}")
            for v in cr.vulnerabilities_found:
                print(f"    {RED}► [{v.get('id')}]{RESET} {v.get('package')}: {v.get('summary')}")

        if cr.issues:
            print(f"\n  {BOLD}Issues Breakdown ({len(cr.issues)}):{RESET}")
            for idx, issue in enumerate(cr.issues, 1):
                sev_color = RED if issue.severity == "high" else (YELLOW if issue.severity == "medium" else BLUE)
                loc = f"Line {issue.line_number}" if issue.line_number else "Global"
                print(f"    {idx}. [{sev_color}{issue.category.upper()}{RESET}] {loc} — {BOLD}{issue.symbol}{RESET}")
                print(f"       {DIM}Message:{RESET} {issue.message}")
                if issue.suggestion:
                    print(f"       {GREEN}💡 Fix:{RESET} {issue.suggestion}")

    # Math specifics
    elif res.math_result:
        mr = res.math_result
        print(f"  • {BOLD}Total Equations:{RESET}  {mr.total_equations_found}")
        print(f"  • {BOLD}Valid Equations:{RESET}  {GREEN}{mr.valid_equations}{RESET}")
        print(f"  • {BOLD}Hallucinations:{RESET}   {RED if mr.has_hallucinations else GREEN}{mr.hallucinated_equations}{RESET}")
        if mr.steps:
            print(f"\n  {BOLD}Step-by-Step Equations:{RESET}")
            for step in mr.steps:
                mark = f"{GREEN}✔{RESET}" if step.is_valid else f"{RED}✖{RESET}"
                print(f"    {mark} Step {step.step_number}: {step.raw_expression}")
                if not step.is_valid:
                    print(f"       {RED}Calculated:{RESET} {step.calculated_value} != {step.right_side} (Discrepancy: {step.difference})")

    # Factual text specifics
    elif res.claims:
        print(f"\n  {BOLD}Factual Claims Audited ({len(res.claims)}):{RESET}")
        for idx, cl in enumerate(res.claims, 1):
            cl_color = GREEN if cl.risk_level == "low" else (YELLOW if cl.risk_level == "medium" else RED)
            print(f"    {idx}. [{cl_color}{cl.risk_level.upper()}{RESET}] \"{cl.text}\" (Confidence: {cl.confidence:.2f})")
            print(f"       {DIM}Evidence / Reason:{RESET} {cl.explanation}")

    print(f"{DIM}{'━' * 60}{RESET}\n")


async def handle_audit(args):
    content = ""
    source_label = ""
    mode = AnalysisMode.text

    if args.text:
        content = args.text
        source_label = "Inline Input"
        mode = AnalysisMode(args.mode) if args.mode != "auto" else AnalysisMode.text
    elif args.target:
        target_path = Path(args.target)
        if not target_path.exists():
            sys.stderr.write(f"{RED}Error: File '{args.target}' does not exist.{RESET}\n")
            sys.exit(2)
        content = target_path.read_text(encoding="utf-8")
        source_label = str(target_path)
        mode = AnalysisMode(args.mode) if args.mode != "auto" else detect_mode_from_path(target_path)
    elif not sys.stdin.isatty():
        content = sys.stdin.read()
        source_label = "Standard Input (stdin)"
        mode = AnalysisMode(args.mode) if args.mode != "auto" else AnalysisMode.text
    else:
        sys.stderr.write(f"{RED}Error: Must provide a file path, -t/--text, or pipe into stdin.{RESET}\n")
        sys.exit(2)

    if not content.strip():
        sys.stderr.write(f"{RED}Error: Content to audit is empty.{RESET}\n")
        sys.exit(2)

    if args.format == "table":
        print_banner()
        sys.stderr.write(f"{DIM}[*] Running Attestly diagnosis on '{source_label}' (Mode: {mode.value})...{RESET}\n")

    res = await run_audit(
        content=content,
        mode=mode,
        use_external=not args.no_web,
        ai_fix=args.ai_fix,
    )

    if args.format == "json":
        print(res.model_dump_json(indent=2))
    elif args.format == "markdown":
        print(f"# Attestly Audit Report: {source_label}\n")
        print(f"- **Mode**: {res.mode}")
        print(f"- **Confidence**: {res.overall_score:.3f}")
        print(f"- **Risk Level**: {res.risk_level.upper()}")
        print(f"- **Method**: {res.method_used}\n")
        if res.code_result:
            print(f"## Issues ({len(res.code_result.issues)})")
            for i in res.code_result.issues:
                print(f"- **[{i.category.upper()}]** Line {i.line_number or '?'}: `{i.symbol}` — {i.message}")
    else:
        print_audit_result_table(res, source_label)

    # Evaluate exit condition for CI/CD
    if args.fail_on == "high" and res.risk_level == "high":
        sys.exit(1)
    elif args.fail_on == "medium" and res.risk_level in ("high", "medium"):
        sys.exit(1)
    sys.exit(0)


async def handle_scan(args):
    root_path = Path(args.path)
    if not root_path.exists() or not root_path.is_dir():
        sys.stderr.write(f"{RED}Error: Directory '{args.path}' does not exist.{RESET}\n")
        sys.exit(2)

    if args.format == "table":
        print_banner()
        print(f"{DIM}[*] Scanning repository at: {root_path.resolve()}{RESET}\n")

    # Supported code extensions
    exts = {".py", ".js", ".jsx", ".ts", ".tsx", ".sql"}
    matched_files: List[Path] = []
    for root, dirs, files in os.walk(root_path):
        # Skip hidden, virtualenv and node_modules folders
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", ".venv", "build", "dist")]
        for file in files:
            p = Path(root) / file
            if p.suffix.lower() in exts:
                matched_files.append(p)

    if not matched_files:
        print(f"{YELLOW}No source code files (.py, .js, .ts, .sql) found in '{args.path}'.{RESET}")
        sys.exit(0)

    total_scanned = len(matched_files)
    results = []
    has_failure = False
    detector = HallucinationDetector()

    for idx, file_path in enumerate(matched_files, 1):
        try:
            code_content = file_path.read_text(encoding="utf-8")
            if len(code_content.strip()) < 2:
                if args.format == "table":
                    print(f"[{idx}/{total_scanned}] {DIM}SKIP {file_path.relative_to(root_path)} (Empty file){RESET}", flush=True)
                continue

            mode = detect_mode_from_path(file_path)
            res = await run_audit(
                content=code_content,
                mode=mode,
                detector=detector,
                use_external=not args.no_web,
            )
            results.append({"file": str(file_path.relative_to(root_path)), "result": res})

            if args.format == "table":
                status_icon = f"{GREEN}✔ LOW{RESET}" if res.risk_level == "low" else (f"{YELLOW}▲ MED{RESET}" if res.risk_level == "medium" else f"{RED}✖ HIGH{RESET}")
                issues_count = len(res.code_result.issues) if res.code_result else 0
                print(f"[{idx}/{total_scanned}] {status_icon} {BOLD}{file_path.relative_to(root_path)}{RESET} — {issues_count} issue(s) ({res.overall_score:.2f})", flush=True)
                if res.code_result and (res.code_result.hallucinated_packages or res.code_result.suspicious_packages):
                    for p in res.code_result.hallucinated_packages:
                        print(f"       {RED}└─ Ghost Library: {p}{RESET}", flush=True)
                    for p in res.code_result.suspicious_packages:
                        print(f"       {YELLOW}└─ Slopsquatting Alert: {p}{RESET}", flush=True)

            if args.fail_on == "high" and res.risk_level == "high":
                has_failure = True
            elif args.fail_on == "medium" and res.risk_level in ("high", "medium"):
                has_failure = True
        except Exception as e:
            if args.format == "table":
                print(f"[{idx}/{total_scanned}] {RED}ERROR{RESET} {file_path.relative_to(root_path)}: {e}", flush=True)

    if args.format == "json":
        serializable = [
            {"file": r["file"], "risk_level": r["result"].risk_level, "score": r["result"].overall_score, "issues": [i.model_dump() for i in r["result"].code_result.issues] if r["result"].code_result else []}
            for r in results
        ]
        print(json.dumps(serializable, indent=2))
    else:
        print(f"\n{BOLD}{'═' * 60}{RESET}")
        high_count = sum(1 for r in results if r["result"].risk_level == "high")
        med_count = sum(1 for r in results if r["result"].risk_level == "medium")
        low_count = sum(1 for r in results if r["result"].risk_level == "low")
        print(f"{BOLD}SCAN SUMMARY:{RESET} {total_scanned} files audited | {RED}{high_count} High Risk{RESET} | {YELLOW}{med_count} Medium{RESET} | {GREEN}{low_count} Low{RESET}")
        if has_failure:
            print(f"{RED}{BOLD}✖ AUDIT FAILED: High/medium risk hallucinations detected!{RESET}")
            sys.exit(1)
        else:
            print(f"{GREEN}{BOLD}✔ AUDIT PASSED: All code clean & verified!{RESET}")
            sys.exit(0)


def main():
    parser = argparse.ArgumentParser(
        prog="attestly",
        description="Attestly CLI — Multi-Domain AI Hallucination & Security Studio"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 1. Audit command
    audit_parser = subparsers.add_parser("audit", help="Audit a file or text snippet")
    audit_parser.add_argument("target", nargs="?", default=None, help="File path to audit (or omit if using -t / stdin)")
    audit_parser.add_argument("-t", "--text", help="Direct text/code string to audit")
    audit_parser.add_argument("-m", "--mode", choices=["auto", "text", "code", "math", "sql"], default="auto", help="Analysis mode")
    audit_parser.add_argument("-f", "--format", choices=["table", "json", "markdown"], default="table", help="Output format")
    audit_parser.add_argument("--fail-on", choices=["high", "medium", "none"], default="high", help="Exit code 1 threshold")
    audit_parser.add_argument("--no-web", action="store_true", help="Disable web grounding and PyPI/npm deep checks")
    audit_parser.add_argument("--ai-fix", action="store_true", help="Request AI-generated correction")

    # 2. Scan command (Directory scan)
    scan_parser = subparsers.add_parser("scan", help="Scan a directory recursively for code hallucinations")
    scan_parser.add_argument("path", nargs="?", default=".", help="Directory path to scan")
    scan_parser.add_argument("-f", "--format", choices=["table", "json"], default="table", help="Output format")
    scan_parser.add_argument("--fail-on", choices=["high", "medium", "none"], default="high", help="Exit code 1 threshold")
    scan_parser.add_argument("--no-web", action="store_true", help="Disable registry verification")

    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    if args.command == "audit":
        asyncio.run(handle_audit(args))
    elif args.command == "scan":
        asyncio.run(handle_scan(args))


if __name__ == "__main__":
    main()
