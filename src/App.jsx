import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DataInputPanel } from './components/DataInputPanel';
import { LayoutSettingsPanel } from './components/LayoutSettingsPanel';
import { StyleSettingsPanel } from './components/StyleSettingsPanel';
import { SheetPreview } from './components/SheetPreview';
import { TemplatesManagerModal } from './components/TemplatesManagerModal';
import { HistoryModal } from './components/HistoryModal';
import { PrintModal } from './components/PrintModal';

import { DEFAULT_PRESETS, INITIAL_DATA_CONFIG } from './utils/constants';
import { generateSerialList } from './utils/serialGenerator';
import {
  getSavedTemplates,
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  saveActiveLayout,
  getActiveLayout,
  saveActiveDataConfig,
  getActiveDataConfig,
  getHistoryLogs,
  addHistoryLog,
  deleteHistoryLog,
  clearHistoryLogs,
} from './utils/storage';

import { Sliders, Database, Palette, Grid, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Initialize State from LocalStorage
  const [layout, setLayout] = useState(() => {
    return getActiveLayout() || DEFAULT_PRESETS[0];
  });

  const [dataConfig, setDataConfig] = useState(() => {
    return getActiveDataConfig() || INITIAL_DATA_CONFIG;
  });

  const [savedTemplates, setSavedTemplates] = useState(() => getSavedTemplates());
  const [allPresets, setAllPresets] = useState(() => getAllTemplates());
  const [historyLogs, setHistoryLogs] = useState(() => getHistoryLogs());

  // Active Sidebar Tab: 'data', 'layout', 'style'
  const [activeTab, setActiveTab] = useState('data');

  // Modals state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Sync to local storage on changes
  useEffect(() => {
    saveActiveLayout(layout);
  }, [layout]);

  useEffect(() => {
    saveActiveDataConfig(dataConfig);
  }, [dataConfig]);

  const refreshTemplates = useCallback(() => {
    setSavedTemplates(getSavedTemplates());
    setAllPresets(getAllTemplates());
  }, []);

  const refreshHistory = useCallback(() => {
    setHistoryLogs(getHistoryLogs());
  }, []);

  // 2. Generate Serial items list in real-time
  const items = useMemo(() => {
    return generateSerialList(dataConfig);
  }, [dataConfig]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId) => {
    const found = allPresets.find(p => p.id === presetId);
    if (found) {
      setLayout(found);
    }
  };

  // Handle Custom Template Save
  const handleSaveTemplate = (newTemplate) => {
    saveTemplate(newTemplate);
    refreshTemplates();
    setLayout(newTemplate);
  };

  // Handle Custom Template Delete
  const handleDeleteTemplate = (templateId) => {
    deleteTemplate(templateId);
    refreshTemplates();
    if (layout.id === templateId) {
      setLayout(DEFAULT_PRESETS[0]);
    }
  };

  // Handle Reloading a batch from history
  const handleReloadBatch = (log) => {
    setDataConfig(prev => ({
      ...prev,
      batchName: `${log.batchName} (คัดลอก)`,
      startNumber: log.startSerial,
      count: log.count,
      mode: log.mode || 'sequential',
    }));
  };

  // Handle Confirm Print (with automatic History Log)
  const handleConfirmPrint = () => {
    // Add to history log in LocalStorage
    if (items.length > 0) {
      const newEntry = {
        batchName: dataConfig.batchName || 'Lot ไม่ระบุชื่อ',
        startSerial: items[0]?.serial || '',
        endSerial: items[items.length - 1]?.serial || '',
        count: items.length,
        layoutName: layout.name,
        mode: dataConfig.mode,
      };
      addHistoryLog(newEntry);
      refreshHistory();
    }

    // Trigger browser print
    window.print();
  };

  const stickersPerPage = (parseInt(layout.columns, 10) || 9) * (parseInt(layout.rows, 10) || 13);
  const totalPages = Math.max(1, Math.ceil(items.length / stickersPerPage));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Top Navbar */}
      <Header
        items={items}
        layout={layout}
        dataConfig={dataConfig}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar / Control Panel */}
        <div className="no-print w-full lg:w-[420px] xl:w-[450px] bg-white border-r border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-61px)] shadow-xs z-10">
          {/* Tab Navigation */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`py-3 px-2 border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'data'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              1. เลข Serial
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`py-3 px-2 border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'layout'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              2. หน้ากระดาษ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`py-3 px-2 border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === 'style'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              3. ฟอนต์ & กรอบ
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            {activeTab === 'data' && (
              <DataInputPanel
                dataConfig={dataConfig}
                onChange={setDataConfig}
                layout={layout}
              />
            )}

            {activeTab === 'layout' && (
              <LayoutSettingsPanel
                layout={layout}
                onChange={setLayout}
                presets={allPresets}
                onSelectPreset={handleSelectPreset}
              />
            )}

            {activeTab === 'style' && (
              <StyleSettingsPanel
                layout={layout}
                onChange={setLayout}
              />
            )}
          </div>
        </div>

        {/* Right Preview Canvas */}
        <SheetPreview
          items={items}
          layout={layout}
        />
      </div>

      {/* Modals */}
      <TemplatesManagerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        currentLayout={layout}
        savedTemplates={savedTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSelectTemplate={setLayout}
        onRefresh={refreshTemplates}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyLogs={historyLogs}
        onClearHistory={() => {
          clearHistoryLogs();
          refreshHistory();
        }}
        onDeleteLog={(id) => {
          deleteHistoryLog(id);
          refreshHistory();
        }}
        onReloadBatch={handleReloadBatch}
      />

      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        onConfirmPrint={handleConfirmPrint}
        itemCount={items.length}
        totalPages={totalPages}
        layout={layout}
      />
    </div>
  );
}
