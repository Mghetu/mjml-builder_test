import React from 'react';
import { useEmailStore } from '../../store/emailStore';
import { Trash2, Settings } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { selectedComponent, updateComponent, deleteComponent } = useEmailStore();

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <Settings size={24} className="mx-auto mb-2 opacity-50" />
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleAttributeChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      attributes: {
        ...selectedComponent.attributes,
        [key]: value
      }
    });
  };

  const handleContentChange = (content: string) => {
    updateComponent(selectedComponent.id, { content });
  };

  const handleDelete = () => {
    deleteComponent(selectedComponent.id);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedComponent.name} Properties
        </h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderAttributeControls(selectedComponent, handleAttributeChange, handleContentChange)}
      </div>
    </div>
  );
};

const renderAttributeControls = (
  component: any, 
  onAttributeChange: (key: string, value: any) => void,
  onContentChange: (content: string) => void
) => {
  const attributes = component.attributes || {};

  switch (component.type) {
    case 'mj-text':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={component.content || 'Enter your text here'}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full p-2 border rounded resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="text"
                value={attributes['font-size'] || '16px'}
                onChange={(e) => onAttributeChange('font-size', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={attributes.color || '#333333'}
                onChange={(e) => onAttributeChange('color', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={attributes.align || 'left'}
              onChange={(e) => onAttributeChange('align', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      );

    case 'mj-button':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              value={component.content || 'Click Me'}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              type="url"
              value={attributes.href || '#'}
              onChange={(e) => onAttributeChange('href', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <input
                type="color"
                value={attributes['background-color'] || '#007bff'}
                onChange={(e) => onAttributeChange('background-color', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <input
                type="color"
                value={attributes.color || '#ffffff'}
                onChange={(e) => onAttributeChange('color', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </>
      );

    case 'mj-image':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={attributes.src || 'https://via.placeholder.com/600x300'}
              onChange={(e) => onAttributeChange('src', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              value={attributes.alt || 'Image'}
              onChange={(e) => onAttributeChange('alt', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="text"
              value={attributes.width || '100%'}
              onChange={(e) => onAttributeChange('width', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      );

    case 'mj-section':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={attributes['background-color'] || '#ffffff'}
              onChange={(e) => onAttributeChange('background-color', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Padding</label>
            <input
              type="text"
              value={attributes.padding || '20px'}
              onChange={(e) => onAttributeChange('padding', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      );

    case 'mj-spacer':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">Height</label>
          <input
            type="text"
            value={attributes.height || '20px'}
            onChange={(e) => onAttributeChange('height', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );

    case 'mj-divider':
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Border Color</label>
            <input
              type="color"
              value={attributes['border-color'] || '#cccccc'}
              onChange={(e) => onAttributeChange('border-color', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Border Width</label>
            <input
              type="text"
              value={attributes['border-width'] || '1px'}
              onChange={(e) => onAttributeChange('border-width', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      );

    default:
      return (
        <div className="text-gray-500 text-sm">
          No specific attributes available for this component type.
        </div>
      );
  }
};