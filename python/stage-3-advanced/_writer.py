import pathlib

BASE = pathlib.Path(r'c:\Users\hpf\project\learn\learning-plan\python\stage-3-advanced')

def w(rel_path, content):
    path = BASE / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    print(f'Written: {rel_path} ({len(content)} chars)')