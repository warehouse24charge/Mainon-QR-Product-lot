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

import {
  checkCloudHealth,
  fetchCloudTemplates,
  saveCloudTemplate,
  deleteCloudTemplate,
  fetchCloudSettings,
  saveCloudSettings,
} from './utils/cloudflareApi';

import { Database, Palette, Grid } from 'lucide-react';

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

  // Cloudflare State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudTemplates, setCloudTemplates] = useState([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

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

  // Load from Cloudflare D1 on initial mount
  const refreshCloud = useCallback(async () => {
    setIsCloudLoading(true);
    try {
      const healthy = await checkCloudHealth();
      setIsCloudConnected(healthy);
      if (healthy) {
        const cTpls = await fetchCloudTemplates();
        setCloudTemplates(cTpls);
      }
    } catch (err) {
      console.warn('Cloudflare initial sync failed:', err);
      setIsCloudConnected(false);
    } finally {
      setIsCloudLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCloud();
  }, [refreshCloud]);

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
    // Check built-in and local presets
    const foundLocal = allPresets.find(p => p.id === presetId);
    if (foundLocal) {
      setLayout(foundLocal);
      return;
    }
    // Check cloud templates
    const foundCloud = cloudTemplates.find(p => p.id === presetId);
    if (foundCloud) {
      handleLoadTemplate(foundCloud);
    }
  };

  // Handle Loading a Template (with bundled layout & print data)
  const handleLoadTemplate = (tpl) => {
    if (tpl.layout) {
      setLayout(tpl.layout);
    } else {
      // flat template format
      setLayout(tpl);
    }

    if (tpl.dataConfig) {
      setDataConfig(tpl.dataConfig);
    }

    // If template has bundled print items
    if (tpl.items && Array.isArray(tpl.items) && tpl.items.length > 0) {
      if (tpl.dataConfig?.mode === 'manual' || !tpl.dataConfig?.mode) {
        setDataConfig(prev => ({
          ...prev,
          mode: 'manual',
          manualList: tpl.items.map(i => i.serial).join('\n'),
          count: tpl.items.length,
        }));
      }
    }
  };

  // Handle Custom Template Save (Local and Cloudflare D1)
  const handleSaveTemplate = async (newTemplate, saveToCloud = true) => {
    if (saveToCloud && isCloudConnected) {
      await saveCloudTemplate({
        id: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
        layout: newTemplate.layout || layout,
        dataConfig: newTemplate.dataConfig || dataConfig,
        items: newTemplate.items || items,
      });
      await refreshCloud();
    }

    // Also mirror to local storage
    saveTemplate(newTemplate);
    refreshTemplates();
    if (newTemplate.layout) {
      setLayout(newTemplate.layout);
    }
  };

  // Handle Custom Template Delete
  const handleDeleteTemplate = async (templateId, isCloud = false) => {
    if (isCloud && isCloudConnected) {
      try {
        await deleteCloudTemplate(templateId);
        await refreshCloud();
      } catch (err) {
        console.error('Failed to delete from Cloudflare:', err);
      }
    }

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

  // Merge built-in presets, local presets, and cloud templates for dropdown
  const combinedPresets = useMemo(() => {
    const list = [...allPresets];
    cloudTemplates.forEach(ct => {
      if (!list.some(item => item.id === ct.id)) {
        list.push({
          id: ct.id,
          name: `☁️ ${ct.name}`,
          description: ct.description || `Cloud D1 (${ct.itemCount || 0} ดวง)`,
          isCustom: true,
          isCloud: true,
          ...ct.layout,
        });
      }
    });
    return list;
  }, [allPresets, cloudTemplates]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Top Navbar */}
      <Header
        items={items}
        layout={layout}
        dataConfig={dataConfig}
        isCloudConnected={isCloudConnected}
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
                presets={combinedPresets}
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
        currentDataConfig={dataConfig}
        currentItems={items}
        savedTemplates={savedTemplates}
        cloudTemplates={cloudTemplates}
        isCloudConnected={isCloudConnected}
        isCloudLoading={isCloudLoading}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSelectTemplate={handleLoadTemplate}
        onRefreshCloud={refreshCloud}
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
