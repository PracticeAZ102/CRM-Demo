import sys
sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')

html_path = r"C:\Users\noorul.amin\.gemini\antigravity\brain\0187a8ce-5215-43bf-993a-82e2c7885923\gem_crm_webapp_prototype.html"
with open(html_path, "r", encoding="utf-8") as f:
    text = f.read()

import re
for section in ["view-dashboard", "view-campaigns", "view-appointments", "view-targets"]:
    idx = text.find(f'id="{section}"')
    if idx != -1:
        print(f"=== {section} ===")
        print(text[idx:idx+1200])
