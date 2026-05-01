# PDF Converter & Merger - Quick Start Guide

Get your PDF converter running in 5 minutes! 🚀

## What You Get

A full-featured web application with:
- ✅ Drag-and-drop file upload
- ✅ Convert between PDF, Word, Markdown, and Text
- ✅ Merge multiple documents
- ✅ Custom themes (light, dark, professional, minimal)
- ✅ Add headers, adjust margins, font sizes
- ✅ ASCII diagram detection and conversion

---

## 📦 Installation (5 minutes)

### 1. Install Python Dependencies (2 min)

```bash
# Open terminal in your project directory

# Option A: Without virtual environment (simplest)
pip install PyPDF2 reportlab python-docx pdf2image Pillow markdown pdfminer.six

# Option B: With virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Verify installation:**
```bash
python3 -c "import PyPDF2; import reportlab; import docx; print('✅ Python ready!')"
```

### 2. Install Node.js Dependencies (2 min)

```bash
# Make sure you have Node.js 14+ installed
node --version  # Should be v14 or higher

# Install dependencies
npm install

# Verify installation
npm list express multer cors uuid
```

### 3. Run the Application (1 min)

**Terminal 1 - Start API Server:**
```bash
node pdf_converter_api.js
```
You should see:
```
📄 PDF Converter API listening on http://localhost:3000
✨ Ready to convert and merge documents!
```

**Terminal 2 - Use the Web Interface:**

Option A: If you have React available:
```bash
npm start
# Or integrate pdf_converter_app.jsx into your React app
```

Option B: Direct API usage with cURL or Postman

---

## 🎯 Quick Usage Examples

### Example 1: Convert a DOCX to PDF

```bash
# Using Python directly
python3 -c "
from pdf_converter_backend import DocumentConverter, ConversionOptions

options = ConversionOptions(
    output_format='pdf',
    theme='professional',
    add_header=True,
    header_text='My Report'
)

converter = DocumentConverter(options)
success = converter.convert_file('myfile.docx', 'myfile.pdf')
print(f'✅ Converted!' if success else '❌ Failed')
"
```

### Example 2: Merge Multiple PDFs

```bash
python3 -c "
from pdf_converter_backend import PDFMerger

merger = PDFMerger()
success = merger.merge_pdfs(
    ['file1.pdf', 'file2.pdf', 'file3.pdf'],
    'merged_output.pdf'
)
print(f'✅ Merged!' if success else '❌ Failed')
"
```

### Example 3: Convert with Custom Options

```bash
python3 -c "
from pdf_converter_backend import DocumentConverter, ConversionOptions

options = ConversionOptions(
    output_format='docx',
    theme='minimal',
    add_header=True,
    header_text='Project Report',
    font_size=11,
    margins=1.5
)

converter = DocumentConverter(options)
converter.convert_file('input.md', 'output.docx')
"
```

### Example 4: Using the API with cURL

```bash
# Upload files
curl -X POST -F "files=@document.pdf" \
  http://localhost:3000/upload

# Convert to DOCX
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["/uploads/session-id/document.pdf"],
    "outputFormat": "docx",
    "options": {"theme": "professional"}
  }'

# Merge files
curl -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["/uploads/session/file1.pdf", "/uploads/session/file2.pdf"],
    "outputFormat": "pdf"
  }'
```

---

## 📂 File Structure

```
pdf-converter/
├── pdf_converter_app.jsx          # React UI component (drag-drop interface)
├── pdf_converter_backend.py       # Python conversion engine
├── pdf_converter_api.js           # Node.js API server
├── requirements.txt               # Python packages
├── package.json                   # Node packages
├── README.md                      # Full documentation
├── QUICKSTART.md                  # This file
├── uploads/                       # Temp files (auto-created)
└── outputs/                       # Converted files (auto-created)
```

---

## 🎨 Customization Quick Tips

### Change Default Theme
Edit line in `pdf_converter_backend.py`:
```python
ConversionOptions(theme='dark')  # or 'light', 'professional', 'minimal'
```

### Adjust Default Font Size
```python
ConversionOptions(font_size=13)  # 10-14 points
```

### Custom Header Text
```python
ConversionOptions(
    add_header=True,
    header_text='My Company - Confidential'
)
```

### Disable Headers
```python
ConversionOptions(add_header=False)
```

---

## ⚡ Common Workflows

### Workflow 1: Batch Convert Multiple Files

```bash
python3 << 'EOF'
from pdf_converter_backend import DocumentConverter, ConversionOptions
from pathlib import Path

options = ConversionOptions(output_format='pdf', theme='professional')
converter = DocumentConverter(options)

# Convert all DOCX files in a folder
for docx_file in Path('.').glob('*.docx'):
    pdf_file = docx_file.with_suffix('.pdf')
    if converter.convert_file(str(docx_file), str(pdf_file)):
        print(f'✅ {docx_file.name} -> {pdf_file.name}')
    else:
        print(f'❌ Failed: {docx_file.name}')
EOF
```

### Workflow 2: Convert and Merge

```bash
python3 << 'EOF'
from pdf_converter_backend import DocumentConverter, PDFMerger, ConversionOptions

# Step 1: Convert all to PDF
converter = DocumentConverter(ConversionOptions(output_format='pdf'))
files_to_merge = []

for input_file in ['report.docx', 'appendix.md', 'summary.txt']:
    output = input_file.rsplit('.', 1)[0] + '.pdf'
    if converter.convert_file(input_file, output):
        files_to_merge.append(output)

# Step 2: Merge all PDFs
if files_to_merge:
    PDFMerger.merge_pdfs(files_to_merge, 'final_report.pdf')
    print(f'✅ Created: final_report.pdf')
EOF
```

### Workflow 3: Web Interface (Easiest)

1. Open React interface (or integrate into your app)
2. Drag files into the upload area
3. Select output format and theme
4. Click "Convert" or "Merge"
5. Download results

---

## 🐛 Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'PyPDF2'"

```bash
# Solution: Install missing package
pip install PyPDF2 reportlab python-docx pdf2image Pillow markdown pdfminer.six
```

### Problem: "Port 3000 already in use"

```bash
# Solution: Use different port
PORT=3001 node pdf_converter_api.js
```

### Problem: "Permission denied" on uploads/outputs folders

```bash
# Solution: Create and set permissions
mkdir -p uploads outputs
chmod 755 uploads outputs
```

### Problem: File conversion returns false

1. Check file exists: `ls -la your_file.pdf`
2. Check format is supported (PDF, DOCX, MD, TXT)
3. Check file size < 50MB
4. Run Python dependency check above

---

## 📊 Testing Your Setup

Run this to verify everything works:

```bash
python3 << 'EOF'
print("🧪 Testing PDF Converter Setup...\n")

# Test 1: Python modules
print("1️⃣  Checking Python packages...")
try:
    import PyPDF2
    import reportlab
    import docx
    import markdown
    print("   ✅ All Python packages installed\n")
except ImportError as e:
    print(f"   ❌ Missing package: {e}\n")

# Test 2: Backend import
print("2️⃣  Testing backend import...")
try:
    from pdf_converter_backend import DocumentConverter, ConversionOptions
    print("   ✅ Backend loaded successfully\n")
except Exception as e:
    print(f"   ❌ Backend error: {e}\n")

# Test 3: Create sample conversion
print("3️⃣  Testing conversion...")
try:
    # Create simple test files
    with open('test_input.txt', 'w') as f:
        f.write("Test Document\n\nThis is a test file.")
    
    options = ConversionOptions(
        output_format='pdf',
        theme='light',
        add_header=True,
        header_text='Test Header'
    )
    
    converter = DocumentConverter(options)
    if converter.convert_file('test_input.txt', 'test_output.pdf'):
        print("   ✅ Conversion test passed\n")
    else:
        print("   ❌ Conversion failed\n")
except Exception as e:
    print(f"   ❌ Error: {e}\n")

print("🎉 Setup verification complete!")
EOF
```

---

## 🚀 Next Steps

1. **Try the web UI**: Open the React component and drag-drop files
2. **Explore options**: Test different themes and settings
3. **Integrate**: Add to your own project
4. **Customize**: Modify themes, add new features
5. **Deploy**: See README.md for Docker/production setup

---

## 📚 Full Documentation

For complete API docs, advanced options, and customization:
👉 See **README.md** in the project root

---

## 💡 Pro Tips

✨ **Parallel Processing**: Process multiple files concurrently
```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    for file in files:
        executor.submit(converter.convert_file, file, output)
```

✨ **Watch for Changes**: Auto-convert on file update
```bash
# Using watchmedo (install: pip install watchdog)
watchmedo shell-command \
  --patterns="*.docx" \
  --recursive \
  --command='python3 convert.py' .
```

✨ **Error Logging**: Add logging to conversions
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

---

**Happy Converting!** 📄✨

Questions? Check the full README.md or test the examples above.
