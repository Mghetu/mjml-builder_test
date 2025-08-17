import { create } from 'zustand';
import { MJMLComponent, EmailStructure, ViewMode, DeviceType, PreviewTab } from '../types/mjml.types';

interface EmailStore {
  // State
  emailStructure: EmailStructure;
  selectedComponent: MJMLComponent | null;
  viewMode: ViewMode;
  deviceType: DeviceType;
  previewTab: PreviewTab;
  compiledHtml: string;
  mjmlCode: string;
  errors: string[];

  // Actions
  setEmailStructure: (structure: EmailStructure) => void;
  setSelectedComponent: (component: MJMLComponent | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setDeviceType: (device: DeviceType) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  addComponent: (component: MJMLComponent) => void;
  updateComponent: (id: string, updates: Partial<MJMLComponent>) => void;
  deleteComponent: (id: string) => void;
  setCompiledHtml: (html: string) => void;
  setMjmlCode: (mjml: string) => void;
  setErrors: (errors: string[]) => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  // Initial State
  emailStructure: {
    head: {
      title: 'Untitled Email',
      preview: '',
      fonts: [],
      styles: ''
    },
    body: []
  },
  selectedComponent: null,
  viewMode: 'edit',
  deviceType: 'desktop',
  previewTab: 'visual',
  compiledHtml: '',
  mjmlCode: '',
  errors: [],

  // Actions
  setEmailStructure: (structure) => set({ emailStructure: structure }),
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setDeviceType: (device) => set({ deviceType: device }),
  setPreviewTab: (tab) => set({ previewTab: tab }),
  setCompiledHtml: (html) => set({ compiledHtml: html }),
  setMjmlCode: (mjml) => set({ mjmlCode: mjml }),
  setErrors: (errors) => set({ errors }),

 addComponent: (component) => {
  console.log('📦 Store: Adding component:', component.name, component.type);
  const { emailStructure } = get();
  const newStructure = { ...emailStructure };
  
  if (component.category === 'body') {
    switch (component.type) {
      case 'mj-wrapper':
        // mj-wrapper can contain sections, add directly to body
        newStructure.body.push(component);
        break;
        
      case 'mj-section':
        // mj-section can be in body or wrapper, add directly to body for now
        newStructure.body.push(component);
        break;
        
      case 'mj-raw':
        // mj-raw can be placed anywhere, add directly to body
        newStructure.body.push(component);
        break;
        
      case 'mj-column':
        // mj-column must be inside mj-section
        // Auto-create section if none exists
        const sectionForColumn: MJMLComponent = {
          id: `mj-section_${Date.now()}`,
          type: 'mj-section',
          name: 'Section',
          icon: 'Layout',
          category: 'body',
          attributes: {
            'background-color': '#ffffff',
            'padding': '20px'
          },
          children: [component]
        };
        
        newStructure.body.push(sectionForColumn);
        console.log('📦 Auto-created section for column');
        break;
        
      case 'mj-group':
        // mj-group must be inside mj-section
        const sectionForGroup: MJMLComponent = {
          id: `mj-section_${Date.now()}`,
          type: 'mj-section',
          name: 'Section',
          icon: 'Layout',
          category: 'body',
          attributes: {
            'background-color': '#ffffff',
            'padding': '20px'
          },
          children: [component]
        };
        
        newStructure.body.push(sectionForGroup);
        console.log('📦 Auto-created section for group');
        break;
        
      case 'mj-text':
      case 'mj-button':
      case 'mj-image':
      case 'mj-divider':
      case 'mj-spacer':
      case 'mj-social':
        // These must be inside mj-column, which must be inside mj-section
        // Auto-create the complete structure: section > column > component
        const fullStructure: MJMLComponent = {
          id: `mj-section_${Date.now()}`,
          type: 'mj-section',
          name: 'Section',
          icon: 'Layout',
          category: 'body',
          attributes: {
            'background-color': '#ffffff',
            'padding': '20px'
          },
          children: [{
            id: `mj-column_${Date.now()}`,
            type: 'mj-column',
            name: 'Column',
            icon: 'Columns',
            category: 'body',
            attributes: {
              'width': '100%'
            },
            children: [component]
          }]
        };
        
        newStructure.body.push(fullStructure);
        console.log('📦 Auto-created section > column > content structure');
        break;
        
      default:
        // For unknown components, add directly
        newStructure.body.push(component);
        break;
    }
    
    console.log('📦 New structure body length:', newStructure.body.length);
    set({ emailStructure: newStructure });
  } else {
    console.log('⚠️ Head component - not implemented yet');
  }
},

  updateComponent: (id, updates) => {
    const { emailStructure } = get();
    const newStructure = { ...emailStructure };
    
    const updateInArray = (components: MJMLComponent[]): MJMLComponent[] => {
      return components.map(comp => 
        comp.id === id 
          ? { ...comp, ...updates }
          : comp.children 
            ? { ...comp, children: updateInArray(comp.children) }
            : comp
      );
    };
    
    newStructure.body = updateInArray(newStructure.body);
    set({ emailStructure: newStructure });
  },

  deleteComponent: (id) => {
    const { emailStructure } = get();
    const newStructure = { ...emailStructure };
    
    const filterFromArray = (components: MJMLComponent[]): MJMLComponent[] => {
      return components
        .filter(comp => comp.id !== id)
        .map(comp => 
          comp.children 
            ? { ...comp, children: filterFromArray(comp.children) }
            : comp
        );
    };
    
    newStructure.body = filterFromArray(newStructure.body);
    set({ 
      emailStructure: newStructure,
      selectedComponent: null 
    });
  }
}));