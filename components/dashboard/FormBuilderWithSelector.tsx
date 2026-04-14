import React, { useState, useEffect } from 'react';
import { FormField, FormPage, FormTheme } from './FormBuilder';
import { FormPreview } from './FormPreview';
import { db } from '../../services/database';
import { Program } from '../../services/models';
import { FileText, CheckCircle2 } from 'lucide-react';

interface FormBuilderWithSelectorProps {
  activeEvent: Program | null;
  onFormSelect?: (formId: string) => void;
}

export const FormBuilderWithSelector: React.FC<FormBuilderWithSelectorProps> = ({ activeEvent, onFormSelect }) => {
  const [savedForms, setSavedForms] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [currentFormFields, setCurrentFormFields] = useState<FormField[]>([]);
  const [currentPages, setCurrentPages] = useState<FormPage[]>([]);
  const [currentTheme, setCurrentTheme] = useState<FormTheme | undefined>(undefined);
  const [allowMultipleNominations, setAllowMultipleNominations] = useState(false);
  const [maxNominationsPerPerson, setMaxNominationsPerPerson] = useState(1);
  const [autoAcceptSubmissions, setAutoAcceptSubmissions] = useState(true);
  const [isSavingFormSettings, setIsSavingFormSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeEvent) {
      loadSavedForms();
      // Load previously selected form
      const savedFormId = localStorage.getItem(`selected_form_${activeEvent.id}`);
      if (savedFormId) {
        loadForm(savedFormId);
      }
    }
  }, [activeEvent]);

  const loadSavedForms = async () => {
    if (!activeEvent) return;
    const forms = await db.getForms(activeEvent.id);
    const enriched = await Promise.all(
      (forms as any[]).map(async (f: any) => {
        const fields = await db.getFormFields(f.id);
        return { ...f, fieldCount: (fields as any[])?.length || 0 };
      })
    );
    setSavedForms(enriched);
  };

  const loadForm = async (formId: string) => {
    const fields = await db.getFormFields(formId);
    const formFields: FormField[] = (fields as any[]).map((f: any) => {
      const cfg = f.config || {};
      return {
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: cfg.placeholder || undefined,
        required: !!f.required,
        options: cfg.options || undefined,
        pageId: cfg.pageId || 'page-1',
        validation: cfg.validation || undefined,
      };
    });

    const fallbackForms = activeEvent ? await db.getForms(activeEvent.id) : [];
    const form = (savedForms as any[]).find(f => f.id === formId)
      || (fallbackForms as any[]).find((f: any) => f.id === formId);

    const allowMultiple = !!(form as any)?.allow_multiple_nominations;
    const maxNominations = Math.max(1, Number((form as any)?.max_nominations_per_person || 1));
    const autoAccept = (form as any)?.auto_accept_submissions !== false;

    setCurrentFormFields(formFields);
    setCurrentPages(form?.pages || []);
    setCurrentTheme(form?.theme);
    setAllowMultipleNominations(allowMultiple);
    setMaxNominationsPerPerson(maxNominations);
    setAutoAcceptSubmissions(autoAccept);
    setSettingsMessage(null);
    setSelectedFormId(formId);
    if (onFormSelect) onFormSelect(formId);
    if (activeEvent) localStorage.setItem(`selected_form_${activeEvent.id}`, formId);
  };

  const handleFormSelect = (formId: string) => {
    void loadForm(formId);
  };

  const handleSaveFormSettings = async () => {
    if (!selectedFormId) return;
    setIsSavingFormSettings(true);
    setSettingsMessage(null);
    try {
      await db.updateForm(selectedFormId, {
        allow_multiple_nominations: allowMultipleNominations,
        max_nominations_per_person: Math.max(1, maxNominationsPerPerson),
        auto_accept_submissions: autoAcceptSubmissions,
      });

      setSavedForms((prev) => prev.map((form) => (
        form.id === selectedFormId
          ? {
              ...form,
              allow_multiple_nominations: allowMultipleNominations,
              max_nominations_per_person: Math.max(1, maxNominationsPerPerson),
              auto_accept_submissions: autoAcceptSubmissions,
            }
          : form
      )));

      setSettingsMessage('Form settings updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update form settings.';
      setSettingsMessage(message);
    } finally {
      setIsSavingFormSettings(false);
    }
  };


  if (!activeEvent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Please select a program</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full min-h-0">
      {/* Form Selector Sidebar */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4 overflow-y-auto max-h-[42vh] lg:max-h-none">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Select Nomination Form</h3>
          <p className="text-xs text-slate-500">Choose a form to use for submissions. Forms are created in the Form Builder.</p>
        </div>

        {savedForms.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No forms available</p>
            <p className="text-xs mt-1">Create forms in the Form Builder section</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedForms.map((form) => {
              const fieldsCount = typeof (form as any)?.fieldCount === 'number' ? (form as any).fieldCount : undefined;
              const isSelected = selectedFormId === form.id;

              return (
                <div
                  key={form.id}
                  onClick={() => handleFormSelect(form.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">{form.name}</h4>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {typeof fieldsCount === 'number' ? `${fieldsCount} field${fieldsCount !== 1 ? 's' : ''}` : 'Fields'}
                      </p>
                      {form.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{form.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 text-center">
            Need to create a new form?
          </p>
          <p className="text-xs text-slate-400 text-center">
            Go to <strong>Form Builder</strong> in the sidebar
          </p>
        </div>

        {selectedFormId && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomination Rules</h4>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultipleNominations}
                onChange={(e) => {
                  setAllowMultipleNominations(e.target.checked);
                  if (!e.target.checked) {
                    setMaxNominationsPerPerson(1);
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Allow Multiple Nominations</p>
                <p className="text-[11px] text-slate-500">When disabled, each person can submit only once.</p>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Nominations Per Person</label>
              <input
                type="number"
                min={1}
                value={maxNominationsPerPerson}
                disabled={!allowMultipleNominations}
                onChange={(e) => setMaxNominationsPerPerson(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAcceptSubmissions}
                onChange={(e) => setAutoAcceptSubmissions(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Auto-Accept Submissions</p>
                <p className="text-[11px] text-slate-500">Accepted status is applied automatically at submit time.</p>
              </div>
            </label>

            <button
              type="button"
              onClick={handleSaveFormSettings}
              disabled={isSavingFormSettings}
              className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
            >
              {isSavingFormSettings ? 'Saving...' : 'Save Form Rules'}
            </button>

            {settingsMessage && (
              <p className="text-[11px] text-slate-500">{settingsMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Form Preview */}
      <div className="flex-1 min-w-0 min-h-0">
        {selectedFormId ? (
          <FormPreview
            fields={currentFormFields}
            pages={currentPages.length > 0 ? currentPages : []}
            theme={currentTheme}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-center max-w-md">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Form Selected</h3>
              <p className="text-sm text-slate-500 mb-4">
                Select a form from the sidebar to preview it. To create or edit forms, go to <strong>Form Builder</strong> in the sidebar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

