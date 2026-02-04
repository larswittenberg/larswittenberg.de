import os
import glob
import sys
import re

def modify_content(content):
    """
    Funktion zum Bearbeiten des Inhalts einer Markdown-Datei.
    Löscht den Tweet-Icon String und passt Medien-Pfade an.
    """
    # Entferne Tweet-Icon
    target_string = '<img src="../../media/tweet.ico" width="12" /> '
    content = content.replace(target_string, '')
    
    # Pfade anpassen: (../../media/ -> (
    content = content.replace('(../../media/', '(')
    
    # Video-Source Pfade anpassen: <source src="../../media/ -> <source src="
    content = content.replace('<source src="../../media/', '<source src="')
    
    # Video-Tag Abschluss anpassen: .mp4"> -> .mp4" />
    content = content.replace('.mp4">', '.mp4" />')
    
    # Datum umformatieren: [Thu Jan 01 13:50:22 +0000 2015] -> [Thu 01 Jan 2015 - 13:50:22]
    content = re.sub(r'\[(\w{3}) (\w{3}) (\d{1,2}) (\d{2}:\d{2}:\d{2}) \+0000 (\d{4})\]', r'[\1 \3 \2 \5 - \4]', content)
    
    return content

def process_markdown_files(source_dir, output_file):
    if not os.path.exists(source_dir):
        print(f"Fehler: Der Ordner '{source_dir}' existiert nicht.")
        return

    # Alle .md Dateien im Quellordner finden und sortieren
    files = sorted(glob.glob(os.path.join(source_dir, '*.md')))
    
    if not files:
        print(f"Keine Markdown-Dateien in '{source_dir}' gefunden.")
        return

    combined_content = []
    
    print(f"Gefundene Dateien in {source_dir}:")
    for file_path in files:
        filename = os.path.basename(file_path)
        # Überspringe die Ausgabedatei, falls sie im selben Ordner liegt und schon existiert
        if filename == os.path.basename(output_file):
            continue
            
        print(f" - Verarbeite {filename}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Inhalt modifizieren
        modified = modify_content(content)
        
        # Optional: Trenner oder Header zwischen den Dateien hinzufügen
        # combined_content.append(f"\n\n<!-- Inhalt von {filename} -->\n\n")
        
        combined_content.append(modified)
    
    # Alles in die neue Datei schreiben
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("".join(combined_content))
        
    print(f"\nFertig! Alle Dateien wurden in '{output_file}' zusammengefügt.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Bitte gib das Jahr als Argument an.")
        print("Beispiel: python3 process_tweets.py 2009")
        sys.exit(1)

    year = sys.argv[1]
    SOURCE_DIR = year
    OUTPUT_FILE = f"tweets-{year}.mdx"
    
    process_markdown_files(SOURCE_DIR, OUTPUT_FILE)
