# PDF Converter & Merger - Complete Application

A full-featured web application for converting and merging documents between PDF, Word (DOCX), Markdown, and Text formats. Features custom themes, headers, ASCII diagram conversion, and batch processing.

## ✨ Features

### Conversion
- **Format Support**: PDF ↔ DOCX ↔ Markdown ↔ Text
- **Custom Themes**: Light, Dark, Professional, Minimal
- **Headers & Footers**: Customizable document headers
- **Page Settings**: Adjustable margins and font sizes
- **ASCII Diagram Detection**: Converts ASCII art to proper diagrams
- **Batch Processing**: Convert multiple files at once

### Merging
- **Multi-Format Merging**: Merge PDFs, Word docs, markdown, and text files
- **Smart Formatting**: Maintains formatting across merged documents
- **Page Breaks**: Automatic page breaks between merged documents
- **Output Flexibility**: Merge into PDF, DOCX, or Markdown

### UI Features
- Drag-and-drop file upload
- Real-time file preview and management
- Live conversion settings panel
- Download converted/merged files directly
- Responsive design (desktop & mobile)
- Dark mode support

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 14+ (for API server)
- **Python** 3.8+ (for document processing)
- **pip** (Python package manager)

### Step 1: Install Python Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install --break-system-packages \
    PyPDF2 \
    reportlab \
    python-docx \
    pdf2image \
    Pillow \
    markdown \
    pdfminer.six
```

**Alternative - Using requirements.txt:**
```bash
pip install -r requirements.txt
```

### Step 2: Install Node.js Dependencies

```bash
npm install express multer cors uuid
npm install --save-dev nodemon  # For development
```

### Step 3: Project Structure

```
pdf-converter/
├── pdf_converter_app.jsx           # React frontend component
├── pdf_converter_backend.py        # Python conversion engine
├── pdf_converter_api.js            # Node.js Express API
├── package.json                    # Node.js dependencies
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── uploads/                        # Temporary file storage
└── outputs/                        # Converted file storage
```

---

## 📦 Running the Application

### Option 1: React + Local API (Recommended for Development)

```bash
# Terminal 1: Start the Express API server
node pdf_converter_api.js
# Server runs on http://localhost:3000

# Terminal 2: Build and run React component
# If using Create React App:
npm start

# Or integrate the JSX component into your existing React application
```

### Option 2: Standalone Python Script

For simple file conversions without the web interface:

```bash
python3 pdf_converter_backend.py --input document.docx --output document.pdf
```

### Option 3: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Install Python
RUN apk add --no-cache python3 py3-pip

# Copy files
COPY . .

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip install -r requirements.txt

EXPOSE 3000

CMD ["node", "pdf_converter_api.js"]
```

Build and run:
```bash
docker build -t pdf-converter .
docker run -p 3000:3000 pdf-converter
```

---

## 🔧 API Endpoints

### Upload Files
```
POST /upload
Content-Type: multipart/form-data

files: [File, File, ...]

Response:
{
  "success": true,
  "files": [
    {
      "id": "uuid",
      "originalName": "document.docx",
      "savedName": "document-123.docx",
      "path": "/uploads/session-id/...",
      "size": 1024,
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Convert Files
```
POST /convert
Content-Type: application/json

{
  "files": ["/uploads/session/file1.docx"],
  "outputFormat": "pdf",
  "options": {
    "theme": "professional",
    "addHeader": true,
    "headerText": "My Document",
    "fontSize": 12,
    "margins": 1
  }
}

Response:
{
  "success": true,
  "results": [
    {
      "originalFile": "file1.docx",
      "outputFile": "file1_converted.pdf",
      "outputPath": "/download/session-id/file1_converted.pdf",
      "success": true
    }
  ]
}
```

### Merge Files
```
POST /merge
Content-Type: application/json

{
  "files": [
    "/uploads/session/file1.pdf",
    "/uploads/session/file2.pdf"
  ],
  "outputFormat": "pdf",
  "options": {
    "theme": "light"
  }
}

Response:
{
  "success": true,
  "outputFile": "merged_1234567890.pdf",
  "outputPath": "/download/session-id/merged_1234567890.pdf"
}
```

### Download Files
```
GET /download/:sessionId/:filename

Response: Binary file download
```

### Cleanup Session
```
POST /cleanup

Response:
{
  "success": true,
  "message": "Session cleaned up"
}
```

---

## 🎨 Conversion Options

### Themes
- **light**: White background, dark text (default)
- **dark**: Dark background, light text
- **professional**: Traditional business style (Times New Roman)
- **minimal**: Minimal styling, maximum readability

### Output Formats
- **pdf**: Portable Document Format (universal compatibility)
- **docx**: Microsoft Word (editable)
- **md**: Markdown (text format)

### Customization
- **addHeader**: Add document title to header (true/false)
- **headerText**: Custom header text (default: "Document")
- **fontSize**: Font size in points (10-14)
- **margins**: Page margins in inches (0.5-2)
- **addPageNumbers**: Automatic page numbering (true/false)
- **convertAsciiDiagrams**: Convert ASCII art to diagrams (true/false)

---

## 📝 Python Backend Usage

### Basic Conversion

```python
from pdf_converter_backend import DocumentConverter, ConversionOptions

# Create converter with options
options = ConversionOptions(
    output_format='pdf',
    theme='professional',
    add_header=True,
    header_text='My Document',
    font_size=12,
    margins=1.0
)

converter = DocumentConverter(options)

# Convert single file
success = converter.convert_file('input.docx', 'output.pdf')
print(f"Conversion successful: {success}")
```

### Merging Documents

```python
from pdf_converter_backend import PDFMerger, ConversionOptions

# Merge PDFs
merger = PDFMerger()
success = merger.merge_pdfs(
    ['file1.pdf', 'file2.pdf', 'file3.pdf'],
    'merged.pdf'
)

# Merge mixed documents to DOCX
options = ConversionOptions(output_format='docx')
success = merger.merge_to_docx(
    ['file1.pdf', 'file2.docx', 'file3.md'],
    'merged.docx',
    options
)
```

### ASCII Diagram Conversion

```python
from pdf_converter_backend import ASCIIDiagramConverter

ascii_art = """
    +-------+
    |  Box  |
    +-------+
"""

svg = ASCIIDiagramConverter.convert_to_svg(ascii_art)
print(svg)
```

---

## 🐛 Troubleshooting

### Python Dependencies Issues
```bash
# Update pip
python3 -m pip install --upgrade pip

# Install with system packages flag
pip install --break-system-packages PyPDF2 reportlab python-docx

# Check installations
python3 -c "import PyPDF2; import reportlab; import docx; print('All good!')"
```

### File Upload Errors
- Check file size limits (default: 50MB)
- Ensure supported formats: PDF, DOCX, MD, TXT
- Verify write permissions in `uploads/` and `outputs/` directories

### Conversion Failures
- Check Python is installed: `python3 --version`
- Verify all dependencies installed: `pip list`
- Check file permissions
- Review logs in console output

### Memory Issues with Large Files
- Process files in batches
- Increase Node.js heap size: `node --max-old-space-size=4096 pdf_converter_api.js`
- For Python: use `gc` module to manage memory

---

## 📊 Performance Tips

1. **Batch Processing**: Convert multiple files efficiently
2. **Theme Selection**: Minimal theme renders faster
3. **File Size**: Optimize source documents before conversion
4. **Async Operations**: API handles conversions asynchronously
5. **Caching**: Results are cached in session directories

---

## 🔒 Security

- **File Validation**: Only allowed file types accepted
- **Path Traversal Protection**: Resolved paths checked
- **Size Limits**: 50MB maximum file size
- **Session Isolation**: Files stored per session
- **Automatic Cleanup**: Old sessions can be cleaned up
- **CORS Enabled**: Configure for your domain

---

## 📄 Supported File Types

| Format | Input | Output | Notes |
|--------|-------|--------|-------|
| PDF    | ✅    | ✅     | Full support with theme/header |
| DOCX   | ✅    | ✅     | Word documents, maintains structure |
| MD     | ✅    | ✅     | Markdown conversion with formatting |
| TXT    | ✅    | ✅     | Plain text documents |

---

## 🛠️ Development

### Adding New Conversion Format

```python
def _convert_to_newformat(self, input_path: str, output_path: str) -> bool:
    """Custom conversion implementation"""
    try:
        # Your conversion logic here
        return True
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        return False
```

### Customizing Themes

Edit `ThemeConfig.THEMES` in `pdf_converter_backend.py`:

```python
THEMES = {
    'custom': {
        'bg_color': (255, 255, 255),
        'text_color': (0, 0, 0),
        'accent_color': (your, color, values),
        'header_bg': (240, 240, 240),
        'font_family': 'Helvetica',
    }
}
```

### Extending React Component

```jsx
// Add new settings
<select 
  value={convertOptions.newOption}
  onChange={(e) => setConvertOptions({...convertOptions, newOption: e.target.value})}
>
  <option value="value1">Option 1</option>
</select>
```

---

## 📚 Dependencies

### Python
- PyPDF2 - PDF manipulation
- reportlab - PDF generation
- python-docx - DOCX creation/reading
- pdf2image - PDF to image conversion
- Pillow - Image processing
- markdown - Markdown parsing
- pdfminer.six - PDF text extraction

### Node.js
- express - Web framework
- multer - File uploads
- cors - CORS middleware
- uuid - Session IDs

### React (Frontend)
- React 18+
- lucide-react - Icons
- No build tools required (can run as standalone JSX)

---

## 📄 License

Open source - feel free to modify and distribute.

---

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- OCR for scanned PDFs
- More diagram formats
- Additional themes
- Performance optimizations
- Additional file format support

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs
3. Verify Python/Node.js versions
4. Ensure all dependencies installed

---

## 🎯 Roadmap

- [ ] Advanced OCR capabilities
- [ ] Batch scheduling
- [ ] Cloud storage integration
- [ ] Real-time collaboration
- [ ] More export formats (HTML, EPUB, etc.)
- [ ] Advanced layout templates
- [ ] Digital signatures
- [ ] Watermarking
- [ ] Form field detection
- [ ] Performance metrics dashboard

---

**Happy Converting! 📄✨**
