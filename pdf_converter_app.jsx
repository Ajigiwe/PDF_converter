import React, { useState, useRef } from 'react';

export default function PDFConverter() {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('convert');
  const [convertOptions, setConvertOptions] = useState({
    outputFormat: 'pdf',
    theme: 'light',
    addHeader: true,
    headerText: 'Document',
    fontSize: '12',
    margins: '1',
  });
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZoneRef.current?.classList.add('drag-active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragZoneRef.current?.classList.remove('drag-active');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZoneRef.current?.classList.remove('drag-active');
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const supportedExtensions = ['.pdf', '.docx', '.doc', '.md', '.txt'];
    
    const validFiles = newFiles.filter(f => {
      const hasValidExt = supportedExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
      return hasValidExt;
    });
    
    if (validFiles.length < newFiles.length) {
      alert(`${newFiles.length - validFiles.length} file(s) not supported. Supported: PDF, DOCX, MD, TXT`);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
        }]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.docx') || filename.endsWith('.doc')) return '📝';
    if (filename.endsWith('.md')) return '📋';
    if (filename.endsWith('.txt')) return '📑';
    return '📦';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (Math.round(bytes / Math.pow(k, i) * 100) / 100).toFixed(2) + ' ' + sizes[i];
  };

  const handleConvert = () => {
    if (files.length === 0) {
      alert('Please add files to convert');
      return;
    }
    const fileList = files.map(f => f.name).join(', ');
    const options = `Output format: ${convertOptions.outputFormat.toUpperCase()}, Theme: ${convertOptions.theme}, Header: ${convertOptions.addHeader ? convertOptions.headerText : 'None'}, Font size: ${convertOptions.fontSize}pt, Margins: ${convertOptions.margins}in`;
    sendPrompt(`Convert these files to ${convertOptions.outputFormat.toUpperCase()}: ${fileList}. ${options}`);
  };

  const handleMerge = () => {
    if (files.length < 2) {
      alert('Please add at least 2 files to merge');
      return;
    }
    const fileList = files.map(f => f.name).join(', ');
    sendPrompt(`Merge these ${files.length} files into a single ${convertOptions.outputFormat.toUpperCase()}: ${fileList}`);
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}>
      <style>{`
        * { box-sizing: border-box; }
        
        .drag-active {
          background-color: var(--color-background-info) !important;
          border-color: var(--color-border-info) !important;
        }
        
        .mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        
        .mode-tab {
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .mode-tab.active {
          color: var(--color-text-primary);
          border-bottom-color: var(--color-border-info);
        }
        
        .mode-tab:hover {
          color: var(--color-text-primary);
        }
        
        .drop-zone {
          border: 2px dashed var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: var(--color-background-secondary);
        }
        
        .drop-zone:hover {
          border-color: var(--color-border-secondary);
          background: var(--color-background-tertiary);
        }
        
        .drop-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        
        .drop-text {
          font-size: 14px;
          margin-bottom: 4px;
          font-weight: 500;
        }
        
        .drop-hint {
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        
        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 1.5rem;
        }
        
        .file-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          padding: 12px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .file-card:hover {
          border-color: var(--color-border-secondary);
          background: var(--color-background-secondary);
        }
        
        .file-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .file-name {
          font-size: 12px;
          font-weight: 500;
          word-break: break-word;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        
        .file-size {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        
        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--color-background-danger);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          color: var(--color-text-danger);
          font-size: 12px;
          font-weight: bold;
        }
        
        .file-card:hover .remove-btn {
          opacity: 1;
        }
        
        .settings-panel {
          background: var(--color-background-secondary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          padding: 1.25rem;
          margin-top: 1.5rem;
        }
        
        .settings-title {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .setting-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .setting-row label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
        }
        
        .setting-row input,
        .setting-row select {
          font-size: 13px;
          padding: 8px 10px;
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md);
          background: var(--color-background-primary);
          color: var(--color-text-primary);
          font-family: var(--font-sans);
        }
        
        .setting-row input:focus,
        .setting-row select:focus {
          outline: none;
          border-color: var(--color-border-info);
        }
        
        .checkbox-setting {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-setting input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .checkbox-setting label {
          margin: 0;
          font-size: 13px;
          cursor: pointer;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 1.5rem;
        }
        
        .action-btn {
          flex: 1;
          padding: 12px 16px;
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          background: var(--color-background-primary);
          color: var(--color-text-primary);
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: var(--font-sans);
        }
        
        .action-btn:hover {
          border-color: var(--color-border-secondary);
          background: var(--color-background-secondary);
        }
        
        .action-btn.primary {
          background: var(--color-background-info);
          color: var(--color-text-info);
          border-color: var(--color-border-info);
        }
        
        .action-btn.primary:hover {
          opacity: 0.95;
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .file-count {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 0.5px solid var(--color-border-tertiary);
        }

        .hidden-input {
          display: none;
        }
      `}
      </style>

      <div className="mode-tabs">
        <button 
          className={`mode-tab ${mode === 'convert' ? 'active' : ''}`}
          onClick={() => setMode('convert')}
        >
          Convert
        </button>
        <button 
          className={`mode-tab ${mode === 'merge' ? 'active' : ''}`}
          onClick={() => setMode('merge')}
        >
          Merge
        </button>
      </div>

      <div 
        ref={dragZoneRef}
        className="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-icon">📤</div>
        <div className="drop-text">
          {mode === 'convert' ? 'Drop files to convert' : 'Drop files to merge'}
        </div>
        <div className="drop-hint">
          Supports: PDF, DOCX, MD, TXT • or click to browse
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden-input"
        onChange={(e) => addFiles(Array.from(e.target.files))}
        accept=".pdf,.docx,.doc,.md,.txt"
      />

      {files.length > 0 && (
        <>
          <div className="file-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <button 
                  className="remove-btn"
                  onClick={() => removeFile(file.id)}
                  title="Remove file"
                >
                  ×
                </button>
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
            ))}
          </div>

          <div className="file-count">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
        </>
      )}

      <div className="settings-panel">
        <div className="settings-title">
          {mode === 'convert' ? 'Conversion Settings' : 'Merge Settings'}
        </div>

        <div className="settings-grid">
          <div className="setting-row">
            <label>Output Format</label>
            <select 
              value={convertOptions.outputFormat}
              onChange={(e) => setConvertOptions({...convertOptions, outputFormat: e.target.value})}
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word (DOCX)</option>
              <option value="md">Markdown</option>
            </select>
          </div>

          <div className="setting-row">
            <label>Theme</label>
            <select 
              value={convertOptions.theme}
              onChange={(e) => setConvertOptions({...convertOptions, theme: e.target.value})}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="professional">Professional</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div className="setting-row">
            <label>Font Size (pt)</label>
            <select 
              value={convertOptions.fontSize}
              onChange={(e) => setConvertOptions({...convertOptions, fontSize: e.target.value})}
            >
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
            </select>
          </div>

          <div className="setting-row">
            <label>Margins (in)</label>
            <select 
              value={convertOptions.margins}
              onChange={(e) => setConvertOptions({...convertOptions, margins: e.target.value})}
            >
              <option value="0.5">0.5"</option>
              <option value="1">1"</option>
              <option value="1.5">1.5"</option>
              <option value="2">2"</option>
            </select>
          </div>
        </div>

        <div className="checkbox-setting" style={{marginTop: '1rem'}}>
          <input 
            type="checkbox"
            id="addHeader"
            checked={convertOptions.addHeader}
            onChange={(e) => setConvertOptions({...convertOptions, addHeader: e.target.checked})}
          />
          <label htmlFor="addHeader">Add header to pages</label>
        </div>

        {convertOptions.addHeader && (
          <div className="setting-row" style={{marginTop: '0.5rem'}}>
            <label>Header Text</label>
            <input 
              type="text"
              value={convertOptions.headerText}
              onChange={(e) => setConvertOptions({...convertOptions, headerText: e.target.value})}
              placeholder="Document title"
            />
          </div>
        )}
      </div>

      <div className="action-buttons">
        {mode === 'convert' ? (
          <button 
            className="action-btn primary"
            onClick={handleConvert}
            disabled={files.length === 0}
          >
            🔄 Convert to {convertOptions.outputFormat.toUpperCase()}
          </button>
        ) : (
          <button 
            className="action-btn primary"
            onClick={handleMerge}
            disabled={files.length < 2}
          >
            🔗 Merge {files.length} Files
          </button>
        )}
        <button 
          className="action-btn"
          onClick={handleClearAll}
          disabled={files.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}