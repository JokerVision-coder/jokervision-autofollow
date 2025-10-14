import React from 'react';

const DocumentationHub = () => {
  const openInNewTab = (url) => {
    // Open in new tab to bypass React routing
    window.open(url, '_blank');
  };

  const downloadFile = (filename) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            📚 JokerVision Documentation
          </h1>
          <p style={{ color: '#666', fontSize: '1.2em' }}>
            Complete guides for features, training, and setup
          </p>
        </div>

        {/* Alert */}
        <div style={{
          background: '#fff3cd',
          borderLeft: '5px solid #ffc107',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '10px', fontSize: '1.1em' }}>
            💡 How to View Documents
          </div>
          <div style={{ color: '#856404' }}>
            Click the buttons below to view or download documents. 
            Documents will open in a new window for easy reading and printing.
          </div>
        </div>

        {/* Documents Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Features Guide */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}></div>
            
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>📖</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
              Complete Features Guide
            </div>
            <div style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Comprehensive documentation of all 17 JokerVision features including AI Communication, 
              Lead Management, Facebook Integration, Social Media Hub, and more.
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.9em' }}>
                <span>📄</span>
                <span>50+ pages</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.9em' }}>
                <span>⏱️</span>
                <span>30 min read</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => downloadFile('JOKERVISION_COMPLETE_FEATURES_GUIDE.md')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95em'
                }}
              >
                <span>📥</span>
                <span>Download Guide</span>
              </button>
            </div>
          </div>

          {/* Training Guide */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}></div>
            
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>🎓</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
              Training & Operations Guide
            </div>
            <div style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Complete training manual with daily workflows, step-by-step procedures, best practices, 
              and troubleshooting. Includes role-specific guides for sales reps, managers, and marketing.
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.9em' }}>
                <span>📄</span>
                <span>70+ pages</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.9em' }}>
                <span>⏱️</span>
                <span>45 min read</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => downloadFile('JOKERVISION_TRAINING_GUIDE.md')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95em'
                }}
              >
                <span>📥</span>
                <span>Download Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8em' }}>🔗 Quick Access Links</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            <button
              onClick={() => downloadFile('EXTERNAL_SETUP_COMPLETE_GUIDE.md')}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>⚙️</span>
              <span>External Setup Guide</span>
            </button>

            <button
              onClick={() => downloadFile('QUICK_SETUP_REFERENCE.md')}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>⚡</span>
              <span>Quick Reference</span>
            </button>

            <button
              onClick={() => downloadFile('SETUP_CHECKLIST.md')}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>✅</span>
              <span>Setup Checklist</span>
            </button>

            <button
              onClick={() => downloadFile('API_CREDENTIALS_SETUP.md')}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>🔐</span>
              <span>API Setup Guide</span>
            </button>

            <button
              onClick={() => downloadFile('PRODUCTION_READY_GUIDE.md')}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>🚀</span>
              <span>Production Guide</span>
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                border: 'none',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderLeft: '4px solid #667eea',
                textAlign: 'left'
              }}
            >
              <span>🏠</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8em' }}>📖 How to Read Downloaded Files</h2>
          <div style={{ background: '#d1ecf1', borderLeft: '4px solid #0c5460', padding: '20px', borderRadius: '5px' }}>
            <div style={{ fontWeight: 'bold', color: '#0c5460', marginBottom: '10px' }}>
              Files are in Markdown (.md) format
            </div>
            <div style={{ color: '#0c5460', lineHeight: '1.6' }}>
              <strong>To read them:</strong><br/>
              • <strong>Windows:</strong> Open with Notepad, WordPad, or Notepad++<br/>
              • <strong>Mac:</strong> Open with TextEdit or Notes<br/>
              • <strong>Online viewer:</strong> Go to <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0c5460' }}>markdownlivepreview.com</a> and paste the content<br/>
              • <strong>Best option:</strong> Install a Markdown viewer extension in your browser
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationHub;
