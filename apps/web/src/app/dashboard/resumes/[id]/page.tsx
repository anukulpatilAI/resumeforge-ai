'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useResumeStore } from '@/store/resume.store';
import { useProfileStore } from '@/store/profile.store';
import { api } from '@/lib/api';
import html2pdf from 'html2pdf.js';
import { Loader2, FileDown, Printer, Sparkles, FileText, ChevronLeft, PanelLeft, PanelRight } from 'lucide-react';
import { AiAssistant } from '@/components/ai-assistant';
import { AtsScorer } from '@/components/ats-scorer';

const sectionLabels: Record<string, string> = {
  personal: 'Personal',
  summary: 'Summary',
  education: 'Education',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
};

export default function ResumeBuilderPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentResume, isLoading, isSaving, fetchResume, updateResume } = useResumeStore();
  const { profile, loadProfile } = useProfileStore();
  const [activePanel, setActivePanel] = useState<'sections' | 'templates' | 'versions' | 'ai' | 'ats'>('sections');
  const [selectedSection, setSelectedSection] = useState<string>('personal');
  const [pdfFormat, setPdfFormat] = useState<'A4' | 'LETTER'>('A4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobileView, setMobileView] = useState<'tools' | 'preview' | 'edit'>('preview');
  const [showMobilePanel, setShowMobilePanel] = useState<'left' | 'right' | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResume(id);
    loadProfile();
  }, [id, fetchResume, loadProfile]);

  const resumeJson = currentResume?.versions?.[0]?.resumeJson;
  const sections = resumeJson?.sections || {};
  const sectionOrder = resumeJson?.sectionOrder || [];
  const currentSection = sections[selectedSection];

  const toggleSection = (key: string) => {
    const updated = {
      sections: {
        ...sections,
        [key]: { ...sections[key], visible: !sections[key]?.visible },
      },
    };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateResume(id, updated), 500);
  };

  const set = (s: typeof sections) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateResume(id, { sections: s }), 500);
  };

  const downloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = printRef.current;
      await document.fonts.ready;
      const scale = window.devicePixelRatio || 1;
      await html2pdf()
        .set({
          margin: 10,
          filename: `resume-${id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: scale * 2, useCORS: true, logging: false, letterRendering: true },
          jsPDF: { unit: 'pt', format: pdfFormat.toLowerCase(), orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const origTitle = document.title;
    document.title = '';
    window.print();
    setTimeout(() => { document.title = origTitle; }, 100);
  };

  if (isLoading || !currentResume) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const showLeftPanel = showMobilePanel === 'left';
  const showRightPanel = showMobilePanel === 'right';

  return (
    <div className="flex flex-col xl:flex-row h-auto xl:h-[calc(100vh-8rem)] gap-4">
      {/* Mobile toolbar */}
      <div className="flex xl:hidden gap-1 rounded-xl border border-[var(--border)] p-1 overflow-x-auto">
        <button
          onClick={() => setShowMobilePanel(showLeftPanel ? null : 'left')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${
            showLeftPanel ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <FileDown className="h-3.5 w-3.5" />
          Tools
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${
            mobileView === 'preview' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={() => setShowMobilePanel(showRightPanel ? null : 'right')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${
            showRightPanel ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Left Panel — Sections */}
      <div className={`${!showLeftPanel && 'hidden xl:block'} w-full xl:${leftPanelCollapsed ? 'w-12' : 'w-80'} shrink-0 rounded-xl border border-[var(--border)] ${leftPanelCollapsed ? 'p-2' : 'p-4'} overflow-y-auto max-h-[70vh] xl:max-h-none transition-all duration-200`}>
        {/* Collapse toggle */}
        <div className="hidden xl:flex items-center justify-end mb-2">
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            title={leftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {leftPanelCollapsed ? (
          <div className="flex flex-col items-center gap-3 py-2">
            {(['sections', 'templates', 'ai', 'ats', 'versions'] as const).map((p) => {
              const icon = {
                sections: FileText,
                templates: PanelLeft,
                ai: Sparkles,
                ats: FileText,
                versions: FileText,
              }[p];
              const Icon = icon;
              return (
                <button
                  key={p}
                  onClick={() => { setActivePanel(p); setLeftPanelCollapsed(false); }}
                  className={`rounded-lg p-2 ${activePanel === p ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                  title={p === 'sections' ? 'Sections' : p === 'templates' ? 'Templates' : p === 'versions' ? 'History' : p === 'ai' ? 'AI' : 'ATS'}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
            <div className="w-8 border-t border-[var(--border)]" />
            <button
              onClick={() => { setLeftPanelCollapsed(false); }}
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              title="Export PDF"
            >
              <FileDown className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        ) : (
        <div className="space-y-4"><div className="flex gap-1 mb-4 rounded-lg bg-[var(--muted)] p-1 overflow-x-auto">
          {(['sections', 'templates', 'ai', 'ats', 'versions'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActivePanel(p)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap ${
                activePanel === p ? 'bg-[var(--background)] shadow-sm' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {p === 'sections' ? 'Sections' : p === 'templates' ? 'Templates' : p === 'versions' ? 'History' : p === 'ai' ? 'AI' : 'ATS'}
            </button>
          ))}
        </div>

        {/* Export & Print */}
        <div className="mb-4 rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileDown className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm font-medium">Export PDF</span>
          </div>
          <div className="flex gap-2">
            <select
              value={pdfFormat}
              onChange={(e) => setPdfFormat(e.target.value as 'A4' | 'LETTER')}
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="A4">A4</option>
              <option value="LETTER">Letter</option>
            </select>
            <button
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileDown className="h-3 w-3" />
              )}
              {isGeneratingPdf ? 'Generating...' : 'Download'}
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
          >
            <Printer className="h-3 w-3" />
            Print
          </button>
          <p className="mt-1.5 text-[10px] text-[var(--muted-foreground)] text-center">
            Print and choose <span className="font-medium">Save as PDF</span> in the dialog (preserves fonts)
          </p>
        </div>

        {activePanel === 'sections' && (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold mb-2">Sections</h3>
            {sectionOrder.map((key: string) => (
              <div
                key={key}
                onClick={() => setSelectedSection(key)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer text-sm ${
                  selectedSection === key ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-[var(--muted)]'
                }`}
              >
                <span>{sectionLabels[key] || key}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection(key); }}
                  className={`h-5 w-10 rounded-full transition-colors shrink-0 ${
                    sections[key]?.visible !== false ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${sections[key]?.visible !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activePanel === 'templates' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2">Select Template</h3>
            <TemplateSelector
              currentId={currentResume.template?.id || resumeJson?.templateId || null}
              onSelect={(tid) => updateResume(id, { templateId: tid })}
              resumeId={id}
              selectedScheme={resumeJson?.metadata?.selectedColorScheme}
            />
          </div>
        )}

        {activePanel === 'versions' && (
          <VersionHistory
            versions={currentResume.versions || []}
            onRestore={(v) => useResumeStore.getState().restoreVersion(id, v)}
          />
        )}

        {activePanel === 'ai' && (
          <div className="overflow-y-auto max-h-96 xl:max-h-none pb-4">
            <AiAssistant
              resumeData={{
                targetRole: resumeJson?.metadata?.targetRole,
                skills: (sections.skills?.items || []).map((s: any) => s.name),
                roles: (sections.experience?.items || []).map((e: any) => ({
                  role: e.role,
                  company: e.company,
                  achievements: e.achievements || [],
                })),
                projects: (sections.projects?.items || []).map((p: any) => ({
                  name: p.name,
                  domain: p.domain,
                  techStack: p.techStack || [],
                })),
                existingSummary: sections.summary?.text || '',
              }}
              onApplySummary={(text, format) => {
                set({ ...sections, summary: { ...sections.summary, text, format } });
              }}
              onApplyExperience={(idx, bulletPoints) => {
                const items = [...(sections.experience?.items || [])];
                if (items[idx]) {
                  items[idx] = { ...items[idx], achievements: bulletPoints };
                  set({ ...sections, experience: { ...sections.experience, items } });
                }
              }}
              onApplyProject={(idx, description) => {
                const items = [...(sections.projects?.items || [])];
                if (items[idx]) {
                  items[idx] = { ...items[idx], description };
                  set({ ...sections, projects: { ...sections.projects, items } });
                }
              }}
            />
          </div>
        )}

        {activePanel === 'ats' && (
          <div className="overflow-y-auto max-h-96 xl:max-h-none pb-4">
            <AtsScorer
              resumeId={id}
              sections={sections}
              targetRole={resumeJson?.metadata?.targetRole}
              onSectionsUpdate={(updated) => set(updated)}
            />
          </div>
        )}
        </div>
      )}
      </div>

      {/* Center Panel — Preview */}
      <div className={`${mobileView !== 'preview' && 'hidden xl:block'} flex-1 rounded-xl border border-[var(--border)] p-4 sm:p-6 overflow-y-auto bg-[var(--muted)]/30`}>
        <div ref={printRef} id="resume-print-area">
          <ResumePreview
            key={resumeJson?.metadata?.selectedColorScheme || 'default'}
            sections={sections}
            sectionOrder={sectionOrder}
            template={currentResume.template}
            profile={profile}
            metadata={resumeJson?.metadata}
          />
        </div>
      </div>

      {/* Right Panel — Edit */}
      <div className={`${!showRightPanel && 'hidden xl:block'} w-full xl:${rightPanelCollapsed ? 'w-12' : 'w-80'} shrink-0 rounded-xl border border-[var(--border)] ${rightPanelCollapsed ? 'p-2' : 'p-4'} overflow-y-auto max-h-[70vh] xl:max-h-none transition-all duration-200`}>
        {/* Collapse toggle */}
        <div className="hidden xl:flex items-center justify-between mb-2">
          {!rightPanelCollapsed && (
            <h3 className="text-sm font-semibold">{sectionLabels[selectedSection] || selectedSection}</h3>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => setShowMobilePanel(showLeftPanel ? null : 'left')} className="xl:hidden text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Sections
            </button>
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              title={rightPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${rightPanelCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {rightPanelCollapsed ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
              {(sectionLabels[selectedSection] || selectedSection).charAt(0)}
            </div>
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              title="Expand editor"
            >
              <PanelRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
        <div className="space-y-4"><div className="flex items-center justify-between mb-3 xl:hidden">
          <h3 className="text-sm font-semibold">{sectionLabels[selectedSection] || selectedSection}</h3>
          <button onClick={() => setShowMobilePanel(showLeftPanel ? null : 'left')} className="xl:hidden text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Sections
          </button>
        </div>
        {currentSection ? (
          <SectionEditor
            sectionKey={selectedSection}
            section={currentSection}
            profile={profile}
            onChange={(updated: any) => {
              set({ ...sections, [selectedSection]: updated });
            }}
          />
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">Select a section to edit</p>
        )}
        </div>)}
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}

function TemplateSelector({ currentId, onSelect, resumeId, selectedScheme }: { currentId: string | null; onSelect: (id: string) => void; resumeId: string; selectedScheme?: string }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const { updateResume } = useResumeStore();

  useEffect(() => {
    api.get<any[]>('/templates').then(setTemplates).catch(() => {});
  }, []);

  const currentTemplate = templates.find((t) => t.id === currentId);
  const colorOptions = currentTemplate?.templateJson?.colorOptions || [];

  const handleColorScheme = (schemeName: string) => {
    updateResume(resumeId, { metadata: { selectedColorScheme: schemeName } as any });
  };

  return (
    <div className="space-y-2">
      {templates.map((t) => {
        const c = t.templateJson?.colors || {};
        const isSelected = currentId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full rounded-lg border p-2.5 text-left text-sm transition-all ${
              isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-0.5">
                <div className="h-3 w-3 rounded-sm" style={{ background: c.primary || '#1a1a2e' }} />
                <div className="h-3 w-3 rounded-sm" style={{ background: c.accent || '#0f3460' }} />
                <div className="h-3 w-3 rounded-sm" style={{ background: c.sidebar || c.text || '#333' }} />
              </div>
              <div className="font-medium">{t.name}</div>
            </div>
            <div className="flex gap-1.5 text-xs text-[var(--muted-foreground)] flex-wrap">
              <span className="capitalize">{t.templateJson?.layout?.replace('-', ' ')}</span>
              <span>·</span>
              <span>{t.templateJson?.headerLayout}</span>
            </div>
          </button>
        );
      })}
      {colorOptions.length > 0 && currentId && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs font-medium mb-2 text-[var(--muted-foreground)]">Color Presets</p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((opt: any) => {
              const isActive = selectedScheme === opt.name;
              return (
                <button
                  key={opt.name}
                  onClick={() => handleColorScheme(opt.name)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    isActive
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                  title={opt.name}
                >
                  <div className="flex gap-px">
                    <div className="h-3 w-3 rounded-sm" style={{ background: opt.colors.primary }} />
                    <div className="h-3 w-3 rounded-sm" style={{ background: opt.colors.accent }} />
                  </div>
                  {opt.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function VersionHistory({ versions, onRestore }: { versions: any[]; onRestore: (v: number) => void }) {
  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div key={v.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
          <div>
            <p className="text-sm font-medium">Version {v.version}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{new Date(v.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => onRestore(v.version)} className="text-xs text-[var(--primary)] hover:underline">
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}

const DEMO_DATA = {
  personal: {
    fullName: 'Alexandra Chen', email: 'alex.chen@example.com', phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alexchen', github: 'github.com/alexchen', portfolio: 'alexchen.dev', photoUrl: '',
  },
  summary: 'Innovative software engineer with 6+ years of experience building scalable web applications and distributed systems. Passionate about developer tooling, API design, and mentoring junior engineers.',
  education: [{ degree: 'B.S. Computer Science', institution: 'Stanford University', location: 'Stanford, CA', startYear: '2014', endYear: '2018', cgpa: '3.8' }],
  skills: [
    { name: 'TypeScript', category: 'Programming Languages', level: 'expert' }, { name: 'React', category: 'Frontend', level: 'expert' },
    { name: 'Node.js', category: 'Backend', level: 'advanced' }, { name: 'Python', category: 'Programming Languages', level: 'advanced' },
    { name: 'GraphQL', category: 'Backend', level: 'advanced' }, { name: 'PostgreSQL', category: 'Databases', level: 'advanced' },
    { name: 'Docker', category: 'Cloud & DevOps', level: 'intermediate' }, { name: 'AWS', category: 'Cloud & DevOps', level: 'intermediate' },
  ],
  experience: [
    { company: 'TechCorp Inc.', role: 'Senior Frontend Engineer', location: 'San Francisco, CA', startDate: 'Jan 2021', endDate: '', isCurrent: true, techStack: ['React', 'TypeScript', 'GraphQL'], achievements: ['Led migration to React, improving load times by 60%', 'Built shared component library for 4 teams', 'Mentored 3 junior engineers'] },
    { company: 'StartupXYZ', role: 'Full Stack Developer', location: 'Remote', startDate: 'Jun 2018', endDate: 'Dec 2020', isCurrent: false, techStack: ['Node.js', 'React', 'MongoDB'], achievements: ['Built dashboard serving 10K+ daily users', 'Reduced API latency by 45%', 'Implemented CI/CD pipeline'] },
  ],
  projects: [
    { name: 'OpenDash', domain: 'Developer Tools', description: 'Open-source analytics dashboard for microservices health monitoring.', techStack: ['React', 'D3.js', 'WebSockets', 'Go'] },
    { name: 'DocuMind', domain: 'AI/ML', description: 'AI-powered documentation search engine using natural language queries.', techStack: ['Python', 'BERT', 'Elasticsearch', 'FastAPI'] },
  ],
  certifications: [
    { name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Google Cloud Professional Developer', issuer: 'Google Cloud', date: '2022' },
  ],
  languages: [
    { name: 'English', proficiency: 'native' }, { name: 'Mandarin', proficiency: 'fluent' }, { name: 'Spanish', proficiency: 'intermediate' },
  ],
};

function ResumePreview({ sections, sectionOrder, template, profile, metadata }: any) {
  const tj = template?.templateJson || {};
  const schemeName = metadata?.selectedColorScheme || null;

  let colors = { ...(tj.colors || { primary: '#1a1a2e', background: '#fff', text: '#333', accent: '#0f3460' }) };
  if (schemeName && tj.colorOptions) {
    const scheme = tj.colorOptions.find((o: any) => o.name === schemeName);
    if (scheme) colors = { ...colors, ...scheme.colors };
  }
  const fonts = tj.fonts || { heading: 'Inter', body: 'Inter' };
  const spacing = tj.spacing || { sectionGap: 16, itemGap: 8, marginX: 48, marginY: 36 };
  const layout = tj.layout || 'single-column';
  const sectionStyle = tj.sectionStyle || 'underline-headers';
  const showPhoto = tj.showPhoto !== false;
  const photoStyle = tj.photoStyle || 'circle';
  const headerLayout = tj.headerLayout || 'centered';
  const photoPosition = tj.photoPosition || 'left';
  const skillStyle = tj.skillStyle || 'pill';
  const sectionDivider = tj.sectionDivider || 'space';

  const sidebarBg = colors.sidebar || colors.primary;
  const sidebarText = colors.sidebarText || '#ffffff';
  const isInSidebar = headerLayout === 'sidebar';

  const hasRealData = (key: string, section: any) => {
    if (key === 'personal') return section?.data?.fullName;
    if (key === 'summary') return section?.text;
    return (section?.items || []).length > 0;
  };

  const getData = (key: string, section: any) => {
    const items = section?.items || [];
    return items.length > 0 ? items : DEMO_DATA[key as keyof typeof DEMO_DATA] || [];
  };

  const sectionDividerStyle: React.CSSProperties =
    sectionDivider === 'line' ? { borderBottom: `1px solid ${colors.text}22`, marginBottom: spacing.sectionGap, paddingBottom: spacing.sectionGap } :
    sectionDivider === 'dot' ? { borderBottom: `1px dotted ${colors.text}33`, marginBottom: spacing.sectionGap, paddingBottom: spacing.sectionGap } :
    sectionDivider === 'space' ? { marginBottom: spacing.sectionGap } :
    {};

  const renderSectionHeader = (label: string, textColor?: string) => {
    const tc = textColor || colors.primary;
    const baseStyle: React.CSSProperties = { color: tc, fontSize: 16, fontWeight: 600, paddingBottom: 6, marginBottom: 10 };
    if (sectionStyle === 'underline-headers') return <h2 style={{ ...baseStyle, borderBottom: `2px solid ${colors.accent}` }}>{label}</h2>;
    if (sectionStyle === 'icon-headers') return <h2 style={{ ...baseStyle, borderLeft: `4px solid ${colors.accent}`, paddingLeft: 10 }}>{label}</h2>;
    if (sectionStyle === 'minimal-headers') return <h2 style={{ ...baseStyle, borderBottom: `1px solid ${tc}44`, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 13 }}>{label}</h2>;
    return <h2 style={{ ...baseStyle, borderBottom: `2px solid ${colors.accent}` }}>{label}</h2>;
  };

  const renderPhoto = (data: any, size: number, textColor?: string) => {
    const photoUrl = data?.photoUrl || '';
    const tc = textColor || colors.primary;
    if (!showPhoto) return null;
    const borderRadius = photoStyle === 'circle' ? '50%' : '4px';
    if (photoUrl) return <img src={photoUrl.startsWith('http') ? photoUrl : `http://localhost:4000${photoUrl}`} alt="" style={{ width: size, height: size, borderRadius, objectFit: 'cover', border: `2px solid ${colors.accent}` }} />;
    return <div style={{ width: size, height: size, borderRadius, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>{(data?.fullName || 'A').charAt(0)}</div>;
  };

  const renderPersonal = (data: any, textColor?: string, isInSidebar?: boolean) => {
    const tc = textColor || colors.text;
    const pc = textColor || colors.primary;
    return (
      <div style={{ textAlign: isInSidebar ? 'left' : 'center', marginBottom: spacing.sectionGap }}>
        {showPhoto && !isInSidebar && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{renderPhoto(data, 72)}</div>}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: pc, fontFamily: fonts.heading, margin: 0 }}>{data?.fullName || 'Your Name'}</h1>
        {(data?.email || data?.phone) && <p style={{ fontSize: 13, margin: '4px 0 0', color: tc }}>{[data.email, data.phone].filter(Boolean).join(' | ')}</p>}
        {data?.location && <p style={{ fontSize: 13, margin: 0, color: tc }}>{data.location}</p>}
        <div style={{ fontSize: 12, marginTop: 4, color: tc }}>{[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}</div>
      </div>
    );
  };

  const renderBold = (t: string, tc: string) => {
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700, color: tc }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderSummary = (text: string, textColor?: string, format?: string) => {
    const isBullet = format === 'bulletPoints';
    const bullets = text ? text.split('\n').filter(Boolean) : [];
    return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader('Professional Summary', textColor)}
        {isBullet && bullets.length > 0 ? (
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: textColor || colors.text, fontFamily: fonts.body }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{renderBold(b, textColor || colors.text)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: textColor || colors.text, fontFamily: fonts.body }}>{text ? renderBold(text, textColor || colors.text) : '—'}</p>
        )}
      </div>
    );
  };

  const renderSkills = (items: any[], textColor?: string) => {
    const tc = textColor || colors.text;
    if (!items || items.length === 0) return null;
    if (skillStyle === 'bar') return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader('Skills', textColor)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((s: any) => {
            const pct = s.level === 'expert' ? 95 : s.level === 'advanced' ? 80 : s.level === 'intermediate' ? 60 : 40;
            return <div key={s.name}><div style={{ fontSize: 12, marginBottom: 2, color: tc }}>{s.name}</div><div style={{ height: 6, background: `${tc}22`, borderRadius: 3 }}><div style={{ width: `${pct}%`, height: '100%', background: colors.accent, borderRadius: 3 }} /></div></div>;
          })}
        </div>
      </div>
    );
    if (skillStyle === 'list') return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader('Skills', textColor)}
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: tc }}>
          {items.map((s: any) => <li key={s.name}>{s.name}</li>)}
        </ul>
      </div>
    );
    if (skillStyle === 'grid') return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader('Skills', textColor)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {items.map((s: any) => <div key={s.name} style={{ fontSize: 12, padding: '2px 0', color: tc }}>{s.name}</div>)}
        </div>
      </div>
    );
    return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader('Skills', textColor)}
        <div>{(items as any[]).map((s: any) => (
          <span key={s.name} style={{ display: 'inline-block', border: `1px solid ${colors.primary}33`, color: tc, background: `${colors.primary}08`, padding: '3px 10px', fontSize: 12, borderRadius: 4, margin: '0 4px 4px 0', fontFamily: fonts.body }}>{s.name}</span>
        ))}</div>
      </div>
    );
  };

  const renderSectionItems = (key: string, items: any[], textColor?: string) => {
    if (!items || items.length === 0) return null;
    const tc = textColor || colors.text;
    return (
      <div style={sectionDividerStyle}>
        {renderSectionHeader(sectionLabels[key] || key, textColor)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.itemGap }}>
          {items.map((item: any, i: number) => (
            <div key={i} style={{ fontSize: 13, color: tc, fontFamily: fonts.body }}>
              {key === 'education' && <div><span style={{ fontWeight: 600, color: textColor || colors.primary }}>{item.degree}</span>{item.institution && <span> — {item.institution}</span>}<div style={{ fontSize: 12, color: `${tc}aa` }}>{item.location}{item.location && item.startYear ? ' | ' : ''}{item.startYear}{item.endYear ? ` – ${item.endYear}` : ''}{item.cgpa ? ` | GPA: ${item.cgpa}` : ''}</div></div>}
              {key === 'experience' && <div><div style={{ fontWeight: 600, color: textColor || colors.primary }}>{item.role}</div><div style={{ color: tc }}>{item.company}</div><div style={{ fontSize: 12, color: `${tc}aa`, marginBottom: 4 }}>{item.location}{item.location ? ' | ' : ''}{item.startDate} – {item.isCurrent ? 'Present' : item.endDate}</div>{item.achievements?.length > 0 && <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>{item.achievements.map((a: string, j: number) => <li key={j}>{a}</li>)}</ul>}{item.techStack?.length > 0 && <div style={{ fontSize: 11, color: `${tc}aa`, marginTop: 2 }}>Tech: {item.techStack.join(', ')}</div>}</div>}
              {key === 'projects' && <div><span style={{ fontWeight: 600, color: textColor || colors.primary }}>{item.name}</span><span style={{ fontSize: 12, color: `${tc}aa` }}> ({item.domain})</span><div style={{ fontSize: 12, lineHeight: 1.5 }}>{item.description}</div>{item.techStack?.length > 0 && <div style={{ fontSize: 11, color: `${tc}aa`, marginTop: 2 }}>{item.techStack.join(', ')}</div>}</div>}
              {key === 'certifications' && <div><span style={{ fontWeight: 600, color: textColor || colors.primary }}>{item.name}</span><div style={{ fontSize: 12, color: `${tc}aa` }}>{item.issuer}{item.date ? ` | ${item.date}` : ''}</div></div>}
              {key === 'languages' && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{item.name}</span><span style={{ fontSize: 12, color: `${tc}aa`, textTransform: 'capitalize' }}>{item.proficiency}</span></div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const pageStyle: React.CSSProperties = {
    maxWidth: '210mm', margin: '0 auto', background: colors.background, color: colors.text,
    fontFamily: fonts.body, padding: `${spacing.marginY}px ${spacing.marginX}px`,
    borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', minHeight: 500,
  };

  const renderHeaderBanner = (data: any) => {
    const bannerBg = colors.banner || colors.primary;
    const bannerTxt = colors.bannerText || '#ffffff';
    return (
      <div style={{ background: `linear-gradient(135deg, ${bannerBg}, ${bannerBg}dd)`, color: bannerTxt, margin: `-${spacing.marginY}px -${spacing.marginX}px ${spacing.sectionGap}px`, padding: `20px ${spacing.marginX}px`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 16 }}>
        {showPhoto && renderPhoto(data, 48)}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: bannerTxt, fontFamily: fonts.heading, margin: 0 }}>{data?.fullName || 'Your Name'}</h1>
          <div style={{ fontSize: 13, marginTop: 4, color: `${bannerTxt}dd` }}>{[data?.email, data?.phone, data?.location].filter(Boolean).join(' | ')}</div>
          <div style={{ fontSize: 11, marginTop: 2, color: `${bannerTxt}88` }}>{[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}</div>
        </div>
      </div>
    );
  };

  const renderSplitHeader = (data: any) => {
    const isPhotoRight = photoPosition === 'right';
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: spacing.sectionGap, textAlign: 'left' }}>
        {!isPhotoRight && renderPhoto(data, 80)}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.primary, fontFamily: fonts.heading, margin: 0 }}>{data?.fullName || 'Your Name'}</h1>
          {(data?.email || data?.phone) && <p style={{ fontSize: 13, margin: '4px 0 0', color: colors.text }}>{[data.email, data.phone].filter(Boolean).join(' | ')}</p>}
          {data?.location && <p style={{ fontSize: 13, margin: 0, color: colors.text }}>{data.location}</p>}
          <div style={{ fontSize: 12, marginTop: 4, color: colors.text }}>{[data?.linkedin, data?.github?.replace('https://', ''), data?.portfolio].filter(Boolean).join(' | ')}</div>
        </div>
        {isPhotoRight && renderPhoto(data, 80)}
      </div>
    );
  };

  const renderCompactHeader = (data: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sectionGap, borderBottom: `1px solid ${colors.text}22`, paddingBottom: 8 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.primary, fontFamily: fonts.heading, margin: 0, display: 'inline' }}>{data?.fullName || 'Your Name'}</h1>
        {data?.email && <span style={{ fontSize: 12, marginLeft: 12, color: colors.text }}>{data.email}</span>}
      </div>
      <div style={{ fontSize: 12, color: colors.text, textAlign: 'right' }}>
        {[data?.phone, data?.location].filter(Boolean).join(' | ')}
      </div>
    </div>
  );

  const renderLeftHeader = (data: any) => (
    <div style={{ marginBottom: spacing.sectionGap, borderBottom: `1px solid ${colors.text}22`, paddingBottom: 12 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.primary, fontFamily: fonts.heading, margin: 0 }}>{data?.fullName || 'Your Name'}</h1>
      <div style={{ fontSize: 13, marginTop: 4, color: colors.text }}>{[data?.email, data?.phone, data?.location].filter(Boolean).join(' | ')}</div>
      <div style={{ fontSize: 12, marginTop: 2, color: colors.text + 'aa' }}>{[data?.linkedin, data?.github, data?.portfolio].filter(Boolean).join(' | ')}</div>
    </div>
  );

  const renderHeader = (data: any) => {
    if (!data) data = DEMO_DATA.personal;
    switch (headerLayout) {
      case 'banner': return renderHeaderBanner(data);
      case 'split': return renderSplitHeader(data);
      case 'compact': return renderCompactHeader(data);
      case 'left': return renderLeftHeader(data);
      case 'centered':
      default: return renderPersonal(data, colors.text);
    }
  };

  const renderSidebarContent = () => {
    const pd = hasRealData('personal', sections?.personal) ? sections.personal.data : DEMO_DATA.personal;
    const sm = hasRealData('summary', sections?.summary) ? sections.summary.text : DEMO_DATA.summary;
    const sk = getData('skills', sections?.skills);
    return (
      <div style={{ padding: spacing.marginY, color: sidebarText }}>
        {showPhoto && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{renderPhoto(pd, 80)}</div>}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: sidebarText, fontFamily: fonts.heading, margin: '0 0 4px', textAlign: 'center' }}>{pd?.fullName || 'Your Name'}</h1>
        {pd?.email && <p style={{ fontSize: 12, margin: '2px 0', color: sidebarText + 'dd', textAlign: 'center' }}>{pd.email}{pd.phone ? ` | ${pd.phone}` : ''}</p>}
        {pd?.location && <p style={{ fontSize: 12, margin: '2px 0', color: sidebarText + 'dd', textAlign: 'center' }}>{pd.location}</p>}
        <div style={{ fontSize: 11, marginTop: 4, textAlign: 'center', color: sidebarText + 'bb' }}>{[pd?.linkedin, pd?.github, pd?.portfolio].filter(Boolean).join(' | ')}</div>
        <hr style={{ border: 'none', borderTop: `1px solid ${sidebarText}33`, margin: '16px 0' }} />
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: sidebarText, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>About</h3>
          {sections?.summary?.format === 'bulletPoints' ? (
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: sidebarText + 'dd' }}>
              {(sm || '').split('\n').filter(Boolean).map((b: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
                  <span style={{ flexShrink: 0 }}>•</span>
                  <span>{renderBold(b, sidebarText)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: sidebarText + 'dd' }}>{sm ? renderBold(sm, sidebarText) : ''}</div>
          )}
        </div>
        <hr style={{ border: 'none', borderTop: `1px solid ${sidebarText}33`, margin: '16px 0' }} />
        <div><h3 style={{ fontSize: 13, fontWeight: 600, color: sidebarText, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Skills</h3>{sk.map((s: any) => <span key={s.name} style={{ display: 'inline-block', border: `1px solid ${sidebarText}44`, color: sidebarText, padding: '2px 8px', fontSize: 11, borderRadius: 3, margin: '0 4px 4px 0' }}>{s.name}</span>)}</div>
      </div>
    );
  };

  if (layout === 'two-column' && isInSidebar) {
    const leftSec = ['personal', 'summary', 'skills'];
    const rightSec = sectionOrder.filter((k: string) => !leftSec.includes(k));
    return (
      <div style={{ ...pageStyle, display: 'flex', padding: 0, overflow: 'hidden' }}>
        <div style={{ width: '35%', background: sidebarBg, flexShrink: 0 }}>{renderSidebarContent()}</div>
        <div style={{ flex: 1, padding: `${spacing.marginY}px ${spacing.marginX}px` }}>
          {rightSec.map((key: string) => {
            const section = sections[key];
            if (!section || section.visible === false) return null;
            const data = getData(key, section);
            return <React.Fragment key={key}>{renderSectionItems(key, data, colors.text)}</React.Fragment>;
          })}
        </div>
      </div>
    );
  }

  if (layout === 'two-column') {
    const leftSec = ['summary', 'skills'];
    const rightSec = sectionOrder.filter((k: string) => !['personal', 'summary', 'skills'].includes(k));
    return (
      <div style={pageStyle}>
        {renderHeader(sections?.personal?.data || DEMO_DATA.personal)}
        <div style={{ display: 'flex', gap: 24, marginTop: spacing.sectionGap }}>
          <div style={{ width: '35%', flexShrink: 0 }}>
            {leftSec.map((key: string) => {
              const section = sections[key];
              if (section && section.visible === false) return null;
              if (key === 'summary') return <React.Fragment key={key}>{renderSummary(section?.text || DEMO_DATA.summary, colors.text, section?.format)}</React.Fragment>;
              if (key === 'skills') return <React.Fragment key={key}>{renderSkills(getData('skills', section))}</React.Fragment>;
              return null;
            })}
          </div>
          <div style={{ flex: 1 }}>
          {rightSec.map((key: string) => {
            const section = sections[key];
            if (!section || section.visible === false) return null;
            const data = getData(key, section);
            return <React.Fragment key={key}>{renderSectionItems(key, data)}</React.Fragment>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {renderHeader(sections?.personal?.data || DEMO_DATA.personal)}
      {sectionOrder.map((key: string) => {
        const section = sections[key];
        if (!section || section.visible === false) return null;
        if (key === 'personal') return null;
        if (key === 'summary') return <React.Fragment key={key}>{renderSummary(section.text || DEMO_DATA.summary, colors.text, section.format)}</React.Fragment>;
        const items = section.items || [];
        const displayItems = items.length > 0 ? items : DEMO_DATA[key as keyof typeof DEMO_DATA] || [];
        if (key === 'skills') return <React.Fragment key={key}>{renderSkills(displayItems as any[])}</React.Fragment>;
        if (!Array.isArray(displayItems) || displayItems.length === 0) return null;
        return <React.Fragment key={key}>{renderSectionItems(key, displayItems)}</React.Fragment>;
      })}
    </div>
  );
}

function SectionEditor({ sectionKey, section, profile, onChange }: any) {
  const data = section.data || {};
  const items = section.items || [];
  const [newInputs, setNewInputs] = useState<Record<string, string>>({});

  if (sectionKey === 'personal') {
    return (
      <div className="space-y-3">
        {['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio'].map((f) => (
          <div key={f}>
            <label className="block text-xs font-medium mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
            <input value={data[f] || ''} onChange={(e) => onChange({ ...section, data: { ...data, [f]: e.target.value } })} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === 'summary') {
    const fmt = section.format || 'paragraph';
    const setFmt = (f: 'paragraph' | 'bulletPoints') => onChange({ ...section, format: f });
    const text = section.text || '';
    const setText = (t: string) => onChange({ ...section, text: t });
    const bullets = text ? text.split('\n').filter(Boolean) : [''];
    const setBullets = (b: string[]) => setText(b.join('\n'));
    return (
      <div className="space-y-3">
        <div className="flex gap-0.5 rounded-md bg-[var(--muted)] p-0.5 w-fit">
          {(['paragraph', 'bulletPoints'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFmt(opt)}
              className={`rounded px-3 py-1 text-xs font-medium ${
                fmt === opt ? 'bg-[var(--background)] shadow-sm' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {opt === 'paragraph' ? 'Paragraph' : 'Bullet Points'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)]">Use **bold** to make text bold</p>
        {fmt === 'paragraph' ? (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="Write your professional summary..." />
        ) : (
          <div className="space-y-1">
            {bullets.map((b: string, i: number) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[var(--muted-foreground)] shrink-0">•</span>
                <input
                  value={b}
                  onChange={(e) => {
                    const copy = [...bullets];
                    copy[i] = e.target.value;
                    setBullets(copy);
                  }}
                  placeholder={`Bullet point ${i + 1}`}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {bullets.length > 1 && (
                  <button onClick={() => setBullets(bullets.filter((_: string, j: number) => j !== i))} className="text-red-500 hover:text-red-700 shrink-0">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setBullets([...bullets, ''])} className="text-xs text-[var(--primary)] hover:underline">+ Add bullet</button>
          </div>
        )}
      </div>
    );
  }

  const addItem = () => {
    const empty: any = { id: crypto.randomUUID() };
    if (sectionKey === 'education') Object.assign(empty, { degree: '', institution: '', location: '', startYear: '', endYear: '', cgpa: '' });
    else if (sectionKey === 'skills') Object.assign(empty, { name: '', category: '', level: 'intermediate' });
    else if (sectionKey === 'experience') Object.assign(empty, { company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, techStack: [], achievements: [] });
    else if (sectionKey === 'projects') Object.assign(empty, { name: '', domain: '', description: '', techStack: [], githubUrl: '', liveUrl: '' });
    else if (sectionKey === 'certifications') Object.assign(empty, { name: '', issuer: '', date: '', url: '' });
    else if (sectionKey === 'languages') Object.assign(empty, { name: '', proficiency: 'intermediate' });
    onChange({ ...section, items: [...items, empty] });
  };

  const updateItem = (i: number, field: string, value: any) => {
    const updated = items.map((item: any, idx: number) => idx === i ? { ...item, [field]: value } : item);
    onChange({ ...section, items: updated });
  };

  const removeItem = (i: number) => {
    onChange({ ...section, items: items.filter((_: any, idx: number) => idx !== i) });
  };

  const addArrayItem = (i: number, field: string) => {
    const key = `${i}-${field}`;
    const val = newInputs[key];
    if (!val?.trim()) return;
    const updated = items.map((item: any, idx: number) =>
      idx === i ? { ...item, [field]: [...(item[field] || []), val.trim()] } : item
    );
    onChange({ ...section, items: updated });
    setNewInputs((p) => ({ ...p, [key]: '' }));
  };

  const removeArrayItem = (i: number, field: string, idx: number) => {
    const updated = items.map((item: any, index: number) =>
      index === i ? { ...item, [field]: item[field].filter((_: any, j: number) => j !== idx) } : item
    );
    onChange({ ...section, items: updated });
  };

  return (
    <div className="space-y-3">
      <button onClick={addItem} className="w-full rounded-lg border border-dashed border-[var(--border)] py-2 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]">+ Add Item</button>
      {items.map((item: any, i: number) => (
        <div key={item.id || i} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
          <div className="flex justify-end">
            <button onClick={() => removeItem(i)} className="text-xs text-red-500">Remove</button>
          </div>
          {Object.entries(item).filter(([k]) => k !== 'id').map(([key, val]: [string, any]) => {
            if (Array.isArray(val)) {
              return (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {val.map((v: string, j: number) => (
                      <span key={j} className="inline-flex items-center gap-1 rounded bg-[var(--muted)] px-2 py-0.5 text-xs">
                        {v} <button onClick={() => removeArrayItem(i, key, j)} className="text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      value={newInputs[`${i}-${key}`] || ''}
                      onChange={(e) => setNewInputs((p) => ({ ...p, [`${i}-${key}`]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(i, key); } }}
                      placeholder="Add item..."
                      className="flex-1 rounded border border-[var(--border)] bg-transparent px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <button onClick={() => addArrayItem(i, key)} className="text-xs text-[var(--primary)] whitespace-nowrap">+ Add</button>
                  </div>
                </div>
              );
            }
            if (key === 'isCurrent') {
              return (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={val} onChange={(e) => updateItem(i, key, e.target.checked)} className="rounded" />
                  Currently working here
                </label>
              );
            }
            if (key === 'proficiency' || key === 'level' || key === 'category') {
              return (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 capitalize">{key}</label>
                  <select value={val || ''} onChange={(e) => updateItem(i, key, e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm">
                    {key === 'proficiency' && ['native', 'fluent', 'intermediate', 'basic'].map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === 'level' && ['beginner', 'intermediate', 'advanced', 'expert'].map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === 'category' && ['Programming Languages', 'Automation', 'Cloud & DevOps', 'Databases', 'Frontend', 'Backend', 'Testing', 'Tools & Others'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            }
            return (
              <div key={key}>
                <label className="block text-xs font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input value={val || ''} onChange={(e) => updateItem(i, key, e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
