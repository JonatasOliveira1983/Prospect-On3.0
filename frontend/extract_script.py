import re

with open('c:/Users/spcom/Desktop/10D REAL 4.0/frontend/cockpit.html', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
if match:
    with open('c:/Users/spcom/Desktop/10D REAL 4.0/frontend/temp_script.jsx', 'w', encoding='utf-8') as f:
        f.write(match.group(1))
    print("Success")
else:
    print("Not found")
