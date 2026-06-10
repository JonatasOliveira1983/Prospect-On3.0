import re
with open('C:/Users/spcom/Desktop/Prospect-On 3.0/frontend/app/(system)/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find SP_BAIRRO_ZONA object
matches = list(re.finditer(r'SP_BAIRRO_ZONA\s*:\s*Record<[^>]+>\s*=\s*\{', content))
print('Found SP_BAIRRO_ZONA at positions:', [m.start() for m in matches])

if matches:
    for start_pos in [m.start() for m in matches]:
        brace_start = content.find('{', start_pos)
        if brace_start != -1:
            brace_count = 1
            i = brace_start + 1
            while i < len(content) and brace_count > 0:
                if content[i] == '{':
                    brace_count += 1
                elif content[i] == '}':
                    brace_count -= 1
                i += 1
            bairros_str = content[brace_start:i]
            
            # Find all keys
            keys = re.findall(r'"([^"]+)"\s*:', bairros_str)
            seen = set()
            for k in keys:
                if k in seen:
                    print('Duplicate: ' + k)
                seen.add(k)
            print('Total unique keys: ' + str(len(seen)))
            print('Total keys (with duplicates): ' + str(len(keys)))