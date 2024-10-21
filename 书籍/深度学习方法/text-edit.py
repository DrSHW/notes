# 本文件用于将所有.md中的img标签替换为markdown语法，即![图片描述](图片地址)
# 图片描述为img标签中alt属性值，图片地址为img标签中src属性值中的后缀部分，下面给一个示例：

# <img src="C:/Users/17100/Desktop/知识库/深度学习方法/img/finetune.svg" alt="微调。" style="width:;display:block;margin-left:auto;margin-right:auto;background-color: white;">
# 替换为
# ![微调。](../img/finetune.svg)
# C:/Users/17100/Desktop/知识库/深度学习方法/字段是固定的，直接替换为../即可
# style属性不需要，直接删除即可


import os
import re

def replace_img_tag(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    img_tags = re.findall(r'<img src="C:/Users/17100/Desktop/知识库/深度学习方法/img/(.*?)" alt="(.*?)" style=".*?">', content)
    for img_tag in img_tags:
        img_tag_str = '<img src="C:/Users/17100/Desktop/知识库/深度学习方法/img/' + img_tag[0] + '" alt="' + img_tag[1] + '" style="width:;display:block;margin-left:auto;margin-right:auto;background-color: white;">'
        markdown_img_tag = '![%s](../img/%s)' % (img_tag[1], img_tag[0])
        content = content.replace(img_tag_str, markdown_img_tag)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        print('replace img tag in %s' % file_path)

def replace_img_tag_in_dir(dir_path):
    for root, dirs, files in os.walk(dir_path):
        print('root:', root)
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                replace_img_tag(file_path)

if __name__ == '__main__':
    # 操作项目根目录下的所有.md文件
    replace_img_tag_in_dir('./')
