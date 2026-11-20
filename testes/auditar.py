from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
ROOT=Path(__file__).resolve().parent.parent
class Inspector(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.links=[];self.images=[];self.ids=set();self.duplicate_ids=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if 'id' in a:
   if a['id'] in self.ids:self.duplicate_ids.append(a['id'])
   self.ids.add(a['id'])
  if tag in ('a','link','script','img','source'):
   for key in (['href'] if tag in ('a','link') else ['src','srcset']):
    if key in a:
     (self.images if tag in ('img','source') else self.links).append((key,a[key]))
files=sorted(ROOT.rglob('index.html'));issues=[];photo_used=[]
for f in files:
 s=f.read_text(encoding='utf8');p=Inspector();p.feed(s)
 if p.h1!=1:issues.append(f'{f.relative_to(ROOT)}: {p.h1} H1')
 if p.duplicate_ids:issues.append(f'{f.relative_to(ROOT)}: IDs duplicados {p.duplicate_ids}')
 for kind,items in [('image',p.images),('link',p.links)]:
  for key,val in items:
   paths=[chunk.strip().split(' ')[0] for chunk in val.split(',')] if key=='srcset' else [val]
   for path in paths:
    if path.startswith(('http:','https:','mailto:','tel:','data:','//','#','javascript:')):continue
    u=urlsplit(path);rel=unquote(u.path)
    if not rel:continue
    target=(ROOT/rel.lstrip('/')) if rel.startswith('/') else (f.parent/rel)
    if target.is_dir():target=target/'index.html'
    if not target.exists():issues.append(f'{f.relative_to(ROOT)}: ausente {path}')
    if kind=='image' and key=='src' and '/assets/fotos/' in ('/'+str(target.relative_to(ROOT)).replace('\\','/')) and not any(x in target.name for x in ('-480','-800')):
     photo_used.append(target.name)
counts=Counter(photo_used)
if len(counts)!=15:issues.append(f'Esperadas 15 fotografias distintas; {len(counts)} detectadas')
for k,v in counts.items():
 if v!=1:issues.append(f'Foto {k} usada {v} vezes')
print('Páginas index:',len(files),'| Fotos editoriais únicas:',len(counts),'| Falhas:',len(issues))
for issue in issues:print('FALHA:',issue)
raise SystemExit(1 if issues else 0)
