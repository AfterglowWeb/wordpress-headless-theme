#!/bin/bash
rm blank.zip
zip -r blank.zip . -x "*.zip" -x "*.tar" -x "*.tar.gz" -x "*.env" -x "*.env*" -x ".git/*" -x ".gitignore" -x "*.config.js" -x "node_modules/*" -x ".DS_Store" -x "**/*.DS_Store" -x "._*"