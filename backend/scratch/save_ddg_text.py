import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scratch.debug_bing_sp import extract_text_from_html

def main():
    html_path = "scratch/debug_ddg.html"
    if not os.path.exists(html_path):
        print("HTML nao encontrado.")
        return
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    txt = extract_text_from_html(html)
    with open("scratch/debug_ddg_text.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    print("Texto bruto salvo em scratch/debug_ddg_text.txt. Tamanho:", len(txt))

if __name__ == "__main__":
    main()
