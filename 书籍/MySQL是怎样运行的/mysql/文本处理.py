# 本文件的作用是将文件夹内的所有md文件中\[([0-9][0-9]-[0-9][0-9])\]最外侧的括号改为小括号，并在括号中内容末尾加上.png
# 例如：\[01-01\]改为(01-01.png)

import os
import re

def change_brackets(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'\[([0-9][0-9]-[0-9][0-9])\]', r'(\1.png)', content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
def main():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                change_brackets(file_path)

if __name__ == '__main__':
    main()