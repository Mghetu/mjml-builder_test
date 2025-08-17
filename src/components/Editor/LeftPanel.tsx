import React from 'react';
import { 
  Type, Eye, FileText, Code, Settings, Box, Layout, Code2, 
  Columns, Group, Image, MousePointer, Minus, Space, Share2 
} from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { MJMLComponent } from '../../types/mjml.types';

const componentLibrary = {
  head: [
    { id: 'mj-title', name: 'Email Title', icon: Type, description: 'Email title for browser tab' },
    { id: 'mj-preview', name: 'Preview Text', icon: Eye, description: 'Preheader text' },
    { id: 'mj-font', name: 'Web Font', icon: FileText, description: 'Import Google Fonts' },
    { id: 'mj-style', name: 'CSS Styles', icon: Code, description: 'Custom CSS' },
    { id: 'mj-attributes', name: 'Default Attributes', icon: Settings, description: 'Component defaults' }
  ],
  body: [
    { id: 'mj-wrapper', name: 'Wrapper', icon: Box, description: 'Container wrapper' },
    { id: 'mj-section', name: 'Section', icon: Layout, description: 'Email section' },
    { id: 'mj-raw', name: 'Raw HTML', icon: Code2, description: 'Custom HTML' },
    { id: 'mj-column', name: 'Column', icon: Columns, description: 'Layout column' },
    { id: 'mj-group', name: 'Group', icon: Group, description: 'Column group' },
    { id: 'mj-text', name: 'Text', icon: Type, description: 'Text content' },
    { id: 'mj-image', name: 'Image', icon: Image, description: 'Responsive image' },
    { id: 'mj-button', name: 'Button', icon: MousePointer, description: 'Call-to-action button' },
    { id: 'mj-divider', name: 'Divider', icon: Minus, description: 'Horizontal divider' },
    { id: 'mj-spacer', name: 'Spacer', icon: Space, description: 'Vertical spacing' },
    { id: 'mj-social', name: 'Social', icon: Share2, description: 'Social media links' }
  ]
};

export const LeftPanel: React.FC = () => {
  const { addComponent } = useEmailStore();

  const getDefaultAttributes = (type: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      'mj-wrapper': {
        'background-color': '#ffffff',
        'padding': '0'
      },
      'mj-section': {
        'background-color': '#ffffff',
        'padding': '20px'
      },
      'mj-column': {
        'width': '100%',
        'padding': '0'
      },
      'mj-group': {
        'width': '100%'
      },
      'mj-raw': {},
      'mj-text': {
        'font-size': '16px',
        'color': '#333333',
        'line-height': '1.6',
        'font-family': 'Arial, sans-serif',
        'align': 'left'
      },
      'mj-button': {
        'background-color': '#007bff',
        'color': '#ffffff',
        'border-radius': '4px',
        'padding': '12px 24px',
        'font-size': '16px',
        'href': '#',
        'align': 'center'
      },
      'mj-image': {
        'width': '100%',
        'align': 'center',
        'src': 'https://via.placeholder.com/600x300',
        'alt': 'Image'
      },
      'mj-divider': {
        'border-color': '#cccccc',
        'border-width': '1px',
        'border-style': 'solid',
        'width': '100%'
      },
      'mj-spacer': {
        'height': '20px'
      },
      'mj-social': {
        'font-size': '15px',
        'icon-size': '20px',
        'mode': 'horizontal',
        'padding': '10px 25px',
        'align': 'center'
      }
    };

    return defaults[type] || {};
  };

  const getDefaultContent = (type: string): string | undefined => {
    switch (type) {
      case 'mj-text':
        return 'Enter your text here';
      case 'mj-button':
        return 'Click Me';
      case 'mj-raw':
        return '<p>Your HTML content here</p>';
      default:
        return undefined;
    }
  };

  const handleAddComponent = (componentData: any) => {
    console.log('🔧 Adding component:', componentData.name, componentData.id);
    
    const newComponent: MJMLComponent = {
      id: `${componentData.id}_${Date.now()}`,
      type: componentData.id,
      name: componentData.name,
      icon: componentData.icon.name,
      category: 'body',
      attributes: getDefaultAttributes(componentData.id),
      content: getDefaultContent(componentData.id),
      children: []
    };

    console.log('✅ Created component:', newComponent);
    addComponent(newComponent);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Email Structure</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Head Components */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Head Elements</h3>
          <div className="space-y-2">
            {componentLibrary.head.map((component, index) => (
              <button
                key={`head-${component.id}-${index}`}
                onClick={() => handleAddComponent(component)}
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-3 text-left"
              >
                <component.icon size={20} className="text-blue-600" />
                <div>
                  <div className="font-medium text-gray-800">{component.name}</div>
                  <div className="text-xs text-gray-500">{component.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Body Components */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Body Elements</h3>
          <div className="space-y-2">
            {componentLibrary.body.map((component, index) => (
              <button
                key={`body-${component.id}-${index}`}
                onClick={() => handleAddComponent(component)}
                className="w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center space-x-3 text-left"
              >
                <component.icon size={20} className="text-green-600" />
                <div>
                  <div className="font-medium text-gray-800">{component.name}</div>
                  <div className="text-xs text-gray-500">{component.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};