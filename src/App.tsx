import React, { useEffect } from 'react';
import { useEmailStore } from './store/emailStore';
import { useMJMLCompiler } from './hooks/useMJMLCompiler';
import { LeftPanel } from './components/Editor/LeftPanel';
import { RightPanel } from './components/Editor/RightPanel';
import { Monitor, Tablet, Smartphone, Eye, Code, FileText, Edit3 } from 'lucide-react';

function App() {
  const {
    viewMode,
    setViewMode,
    deviceType,
    setDeviceType,
    previewTab,
    setPreviewTab,
    emailStructure,
    compiledHtml,
    mjmlCode,
    setCompiledHtml,
    setMjmlCode,
    setErrors,
    selectedComponent,
    setSelectedComponent
  } = useEmailStore();

  const { compileToHTML } = useMJMLCompiler();

  // Real-time compilation
  useEffect(() => {
    const result = compileToHTML(emailStructure);
    setCompiledHtml(result.html);
    setMjmlCode(result.mjml);
    setErrors(result.errors);
  }, [emailStructure, compileToHTML, setCompiledHtml, setMjmlCode, setErrors]);

  const deviceSettings = {
    desktop: { width: '600px', height: '800px', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '320px', height: '568px', icon: Smartphone }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">MJML Builder Pro</h1>
          
          <div className="flex items-center space-x-4">
            {/* Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 flex items-center space-x-2 ${
                  viewMode === 'edit' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 flex items-center space-x-2 ${
                  viewMode === 'preview' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
            </div>

            {/* Device Toggle (Preview Mode Only) */}
            {viewMode === 'preview' && (
              <div className="flex border rounded-lg overflow-hidden">
                {Object.entries(deviceSettings).map(([key, device]) => (
                  <button
                    key={key}
                    onClick={() => setDeviceType(key as any)}
                    className={`p-2 ${
                      deviceType === key 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <device.icon size={18} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Always Visible in Edit Mode */}
        {viewMode === 'edit' && <LeftPanel />}

        {/* Center Content */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'preview' && (
            /* Preview Tabs */
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex space-x-1">
                {[
                  { id: 'visual', name: 'Visual', icon: Eye },
                  { id: 'mjml', name: 'MJML Code', icon: Code },
                  { id: 'html', name: 'HTML Code', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      previewTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 p-8 overflow-auto">
            {viewMode === 'edit' ? (
              <EditCanvas />
            ) : (
              <PreviewCanvas 
                tab={previewTab}
                device={deviceSettings[deviceType]}
                html={compiledHtml}
                mjml={mjmlCode}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Only in Edit Mode */}
        {viewMode === 'edit' && <RightPanel />}
      </div>
    </div>
  );
}

// Edit Canvas Component
const EditCanvas: React.FC = () => {
  const { emailStructure, setSelectedComponent, selectedComponent } = useEmailStore();

  return (
    <div className="bg-white shadow-lg mx-auto" style={{ width: '600px', minHeight: '800px' }}>
      <div className="p-8">
        {emailStructure.body.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-medium mb-2">Start Building Your Email</h3>
            <p>Add components from the left panel to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emailStructure.body.map((component) => (
              <SimpleComponentRenderer 
                key={component.id} 
                component={component} 
                isSelected={selectedComponent?.id === component.id}
                onSelect={() => setSelectedComponent(component)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Preview Canvas Component
interface PreviewCanvasProps {
  tab: string;
  device: { width: string; height: string };
  html: string;
  mjml: string;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ tab, device, html, mjml }) => {
  if (tab === 'visual') {
    return (
      <div className="flex justify-center">
        <div 
          className="bg-white shadow-lg border transition-all duration-300 overflow-auto"
          style={{ 
            width: device.width,
            height: device.height
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    );
  }

  if (tab === 'mjml') {
    return (
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-full">
        <pre className="text-sm whitespace-pre-wrap">
          <code>{mjml}</code>
        </pre>
      </div>
    );
  }

  if (tab === 'html') {
    return (
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto h-full">
        <pre className="text-sm whitespace-pre-wrap">
          <code>{html}</code>
        </pre>
      </div>
    );
  }

  return null;
};

// Simple Component Renderer (without nesting for now)
interface SimpleComponentRendererProps {
  component: any;
  isSelected: boolean;
  onSelect: () => void;
}

const SimpleComponentRenderer: React.FC<SimpleComponentRendererProps> = ({ 
  component, 
  isSelected, 
  onSelect 
}) => {
  const renderSimplePreview = () => {
    switch (component.type) {
      case 'mj-section':
        return (
          <div
            className={`border-2 rounded p-4 mb-2 ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: component.attributes?.['background-color'] || '#ffffff',
              padding: component.attributes?.padding || '20px'
            }}
          >
            <div className="text-xs text-blue-600 mb-2 font-semibold">
              📄 Section {isSelected && '(Selected)'}
            </div>
            {component.children && component.children.length > 0 ? (
              <div className="space-y-2">
                {component.children.map((child: any) => (
                  <SimpleComponentRenderer
                    key={child.id}
                    component={child}
                    isSelected={false}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">
                Empty Section - Add content here
              </div>
            )}
          </div>
        );
        
      case 'mj-column':
        return (
          <div className="border border-green-300 rounded p-2 bg-green-50">
            <div className="text-xs text-green-600 mb-2">
              📊 Column ({component.attributes?.width || '100%'})
            </div>
            {component.children && component.children.length > 0 ? (
              <div className="space-y-1">
                {component.children.map((child: any) => (
                  <SimpleComponentRenderer
                    key={child.id}
                    component={child}
                    isSelected={false}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-2 text-xs">
                Empty Column
              </div>
            )}
          </div>
        );
        
      case 'mj-text':
        return (
          <div 
            className={`p-2 rounded ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'}`}
            style={{
              fontSize: component.attributes?.['font-size'] || '16px',
              color: component.attributes?.color || '#333333',
              textAlign: component.attributes?.align || 'left'
            }}
          >
            {component.content || 'Text content'}
          </div>
        );
        
      case 'mj-button':
        return (
          <div className="p-2 text-center">
            <button
              style={{
                backgroundColor: component.attributes?.['background-color'] || '#007bff',
                color: component.attributes?.color || '#ffffff',
                borderRadius: component.attributes?.['border-radius'] || '4px',
                padding: component.attributes?.padding || '12px 24px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {component.content || 'Button'}
            </button>
          </div>
        );
        
      case 'mj-image':
        return (
          <div className="p-2 text-center">
            <img
              src={component.attributes?.src || 'https://via.placeholder.com/300x150'}
              alt={component.attributes?.alt || 'Image'}
              style={{ 
                width: component.attributes?.width || '100%',
                maxWidth: '300px',
                height: 'auto'
              }}
            />
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-100 p-3 rounded border">
            <div className="text-sm font-medium">{component.name}</div>
            <div className="text-xs text-gray-500">{component.type}</div>
          </div>
        );
    }
  };

  return (
    <div 
      onClick={onSelect}
      className="cursor-pointer"
    >
      {renderSimplePreview()}
    </div>
  );
};

export default App;