import sys

try:
    with open('index.html', 'r', encoding='utf-8') as f:
        text = f.read()

    iife_start = text.find('{(() => {', text.find('Backtesting Lab'))
    iife_end = text.find('})()}', iife_start) + 5
    
    if iife_start == -1 or iife_end == 4:
        print("Not found")
        sys.exit(1)

    iife_body = text[iife_start + len('{(() => {'):iife_end - 5]
    new_widget = f"\n\nconst BacktestLabWidget = ({{ API_BASE }}) => {{\n    {iife_body}\n}};\n\n"
    
    page10d_start = text.find('const Page10D =')
    
    text = text[:iife_start] + '<BacktestLabWidget API_BASE={API_BASE} />' + text[iife_end:]
    text = text[:page10d_start] + new_widget + text[page10d_start:]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("FIXED")
except Exception as e:
    print("ERROR", str(e))
