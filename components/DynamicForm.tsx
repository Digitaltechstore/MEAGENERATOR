import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronRight, 
    ChevronLeft, 
    Save, 
    CheckCircle2, 
    Loader2,
    Calendar,
    ChevronDown,
    ChevronUp,
    Search,
    X,
    AlertTriangle,
    FileText,
    Edit3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EducationLevel, FormData, Question, QuestionType, FormSection } from '../types';
import { 
    LEVEL_CONFIGS, 
    COMMON_PROFILE_SECTION, 
    ELEMENTARY_SCHOOLS, 
    HIGH_SCHOOLS, 
    SCHOOLS_LIST,
    QUARTER_DATE_RANGES,
    SUBJECTS_KINDER,
    SUBJECTS_ELEM_JHS_BASE,
    SUBJECTS_SHS_CORE,
    MAPEH_COMPONENTS
} from '../constants';

interface DynamicFormProps {
  levelId: EducationLevel;
  onBack: () => void;
}

// Extend Question interface internally to support grouping
interface ExtendedQuestion extends Question {
    _month?: string;
}

interface ExtendedSection extends FormSection {
    questions: ExtendedQuestion[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({ levelId, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});
  
  // Subject States
  const [splitMapeh, setSplitMapeh] = useState(false);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  // SHS Specific States
  const [shsLibrarySelection, setShsLibrarySelection] = useState<string[]>([]);
  const [shsSearchTerm, setShsSearchTerm] = useState('');
  const [shsQuickMode, setShsQuickMode] = useState(false);

  // Derived state for Quarter to ensure stability in dependency arrays
  const currentQuarter = (formData['quarter'] as string) || 'Q1';

  // Initialize defaults
  useEffect(() => {
    setFormData(prev => {
        const newData = { ...prev };
        if (!newData['district']) newData['district'] = 'Bacong';
        if (!newData['quarter']) newData['quarter'] = 'Q1'; 
        if (!newData['sy']) newData['sy'] = '2025-2026';
        return newData;
    });

    const saved = localStorage.getItem(`mea_draft_${levelId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure defaults even if draft is partial
        if (!parsed['district']) parsed['district'] = 'Bacong';
        if (!parsed['quarter']) parsed['quarter'] = 'Q1';
        setFormData(parsed);
        
        if (parsed._customSubjects) setCustomSubjects(parsed._customSubjects);
        if (parsed._splitMapeh) setSplitMapeh(parsed._splitMapeh);
        if (parsed._shsLibrarySelection) setShsLibrarySelection(parsed._shsLibrarySelection);
        if (parsed._shsQuickMode) setShsQuickMode(parsed._shsQuickMode);
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, [levelId]);

  // Save drafts when data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
        const toSave = { 
            ...formData, 
            _customSubjects: customSubjects, 
            _splitMapeh: splitMapeh,
            _shsLibrarySelection: shsLibrarySelection,
            _shsQuickMode: shsQuickMode
        };
        localStorage.setItem(`mea_draft_${levelId}`, JSON.stringify(toSave));
    }
  }, [formData, customSubjects, splitMapeh, shsLibrarySelection, shsQuickMode, levelId]);

  const getSchoolOptions = (level: EducationLevel) => {
    switch (level) {
        case EducationLevel.KINDER:
        case EducationLevel.SPED:
        case EducationLevel.ELEM:
            return ELEMENTARY_SCHOOLS;
        case EducationLevel.JHS:
        case EducationLevel.SHS:
            return HIGH_SCHOOLS;
        case EducationLevel.ALS:
        case EducationLevel.SCHOOL_HEAD:
        default:
            return SCHOOLS_LIST; 
    }
  };

  // Helper to extract numeric value safely
  const getSafeNumber = (val: string | number | undefined): number => {
      if (val === undefined || val === null || val === '') return 0;
      if (typeof val === 'string' && val.toUpperCase() === 'N/A') return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
  };

  // 1. Determine if "Failures by Subject" step is applicable
  const hasSubjectFailures = [EducationLevel.KINDER, EducationLevel.ELEM, EducationLevel.JHS, EducationLevel.SHS].includes(levelId);

  // 2. Build the Sections List
  const allSections: ExtendedSection[] = useMemo(() => {
    const config = LEVEL_CONFIGS[levelId];
    // Use the derived currentQuarter to strictly control recalculation
    const dateRanges = QUARTER_DATE_RANGES[currentQuarter] || [];

    // Profile Section
    const adjustedProfileSection: ExtendedSection = {
        ...COMMON_PROFILE_SECTION,
        questions: COMMON_PROFILE_SECTION.questions.map(q => {
            if (q.id === 'schoolName') {
                return { ...q, options: getSchoolOptions(levelId) };
            }
            return q;
        })
    };

    // Standard Level Sections
    const processedLevelSections: ExtendedSection[] = config.sections.map(section => {
        const isMovementSection = ['movement', 'kinder_movement', 'als_movement'].includes(section.id);

        if (isMovementSection) {
            const expandedQuestions: ExtendedQuestion[] = [];
            dateRanges.forEach(dateRange => {
                section.questions.forEach(q => {
                    expandedQuestions.push({
                        ...q,
                        id: `${q.id}_${dateRange}`, // Unique ID per range
                        label: q.label, 
                        _month: dateRange // Grouping key
                    });
                });
            });

            return { ...section, questions: expandedQuestions };
        }
        return section;
    });

    let sections = [adjustedProfileSection];

    // Insert Movement Section (Usually first in config)
    if (processedLevelSections.length > 0 && ['movement', 'kinder_movement', 'als_movement'].includes(processedLevelSections[0].id)) {
         sections.push(processedLevelSections[0]);
    }

    // Insert "Failures by Subject" Step if applicable
    if (hasSubjectFailures) {
        sections.push({
            id: 'failures_by_subject',
            title: 'Learners Who Failed (By Subject)',
            description: levelId === EducationLevel.SHS 
                ? 'Select the subjects you teach and enter the number of failures.' 
                : 'Enter the number of learners who failed in each learning area.',
            questions: [] // Handled by custom renderer
        });
    }

    // Append remaining sections
    if (processedLevelSections.length > 0) {
         // If first was movement, add the rest
         if (['movement', 'kinder_movement', 'als_movement'].includes(processedLevelSections[0].id)) {
             sections.push(...processedLevelSections.slice(1));
         } else {
             sections.push(...processedLevelSections);
         }
    }

    // Add Review Step at the end
    sections.push({
        id: 'review_submission',
        title: 'Review & Submit',
        description: 'Please review your data before finalizing the report.',
        questions: []
    });

    return sections;
  }, [levelId, currentQuarter, hasSubjectFailures]);

  // Auto-open accordions when quarter changes
  useEffect(() => {
    const ranges = QUARTER_DATE_RANGES[currentQuarter] || [];
    const initialOpenState: Record<string, boolean> = {};
    ranges.forEach(r => initialOpenState[r] = true);
    setOpenMonths(initialOpenState);
  }, [currentQuarter]);

  const handleInputChange = (id: string, value: string | number) => {
    // Changing Quarter Logic
    if (id === 'quarter') {
        const prevQuarter = formData['quarter'] || 'Q1';
        
        // If value is same, do nothing to avoid unnecessary processing
        if (value === prevQuarter) return;

        const confirmChange = window.confirm(
            "Changing the quarter will reset Monthly Learners' Movement data. Continue?"
        );
        if (!confirmChange) return;

        const oldQuarter = prevQuarter as string;
        const oldRanges = QUARTER_DATE_RANGES[oldQuarter] || [];
        
        const newData = { ...formData };
        newData[id] = value; 

        // Cleanup old movement data
        Object.keys(newData).forEach(key => {
            if (oldRanges.some(r => key.endsWith(`_${r}`))) {
                delete newData[key];
            }
        });

        setFormData(newData);
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleAddCustomSubject = () => {
      if (newSubjectName.trim()) {
          const formattedName = newSubjectName.trim();
          if (!customSubjects.includes(formattedName) && !shsLibrarySelection.includes(formattedName)) {
            setCustomSubjects(prev => [...prev, formattedName]);
          }
          setNewSubjectName('');
      }
  };

  const handleRemoveCustomSubject = (subj: string) => {
      setCustomSubjects(prev => prev.filter(s => s !== subj));
      const key = `fail_subject_${subj}`;
      const newData = { ...formData };
      delete newData[key];
      setFormData(newData);
  };

  // SHS Handlers
  const toggleShsQuickMode = () => {
      const newMode = !shsQuickMode;
      setShsQuickMode(newMode);
      if (newMode) {
          setShsLibrarySelection(SUBJECTS_SHS_CORE);
          // Pre-fill with 0 for all core subjects
          const newData = { ...formData };
          SUBJECTS_SHS_CORE.forEach(subj => {
              const key = `fail_subject_${subj}`;
              if (newData[key] === undefined || newData[key] === '') {
                  newData[key] = '0';
              }
          });
          setFormData(newData);
      }
  };

  const toggleLibrarySubject = (subj: string) => {
      if (shsLibrarySelection.includes(subj)) {
          setShsLibrarySelection(prev => prev.filter(s => s !== subj));
          // Clean up data
          const key = `fail_subject_${subj}`;
          const newData = { ...formData };
          delete newData[key];
          setFormData(newData);
      } else {
          setShsLibrarySelection(prev => [...prev, subj]);
      }
  };

  const handleRemoveLibrarySubject = (subj: string) => {
      toggleLibrarySubject(subj);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user found.");

        // Construct Failures Data Structure
        const failuresBySubject: Array<{ subjectName: string; subjectSource: string; failedCount: number }> = [];

        if (levelId === EducationLevel.SHS) {
            shsLibrarySelection.forEach(subj => {
                failuresBySubject.push({
                    subjectName: subj,
                    subjectSource: 'library',
                    failedCount: getSafeNumber(formData[`fail_subject_${subj}`])
                });
            });
            customSubjects.forEach(subj => {
                failuresBySubject.push({
                    subjectName: subj,
                    subjectSource: 'custom',
                    failedCount: getSafeNumber(formData[`fail_subject_${subj}`])
                });
            });
        } else if (hasSubjectFailures) {
            // Logic for other levels (simplified construction based on active views)
            let subjects: string[] = [];
            if (levelId === EducationLevel.KINDER) subjects = SUBJECTS_KINDER;
            else if (levelId === EducationLevel.ELEM || levelId === EducationLevel.JHS) {
                 subjects = [...SUBJECTS_ELEM_JHS_BASE];
                 if (levelId === EducationLevel.ELEM) subjects = subjects.map(s => s === 'EPP / TLE' ? 'EPP' : s);
                 else subjects = subjects.map(s => s === 'EPP / TLE' ? 'TLE' : s);
                 if (splitMapeh) subjects = subjects.filter(s => s !== 'MAPEH').concat(MAPEH_COMPONENTS);
            }
            
            subjects.forEach(subj => {
                 failuresBySubject.push({
                    subjectName: subj,
                    subjectSource: 'curriculum',
                    failedCount: getSafeNumber(formData[`fail_subject_${subj}`])
                });
            });
        }

        const { error } = await supabase.from('mea_reports').insert({
            user_id: user.id,
            level: levelId,
            school_year: formData['sy'],
            quarter: formData['quarter'],
            content: { 
                ...formData, 
                failuresBySubject, // Explicitly store the array
                _meta: { 
                    splitMapeh, 
                    customSubjects,
                    shsLibrarySelection,
                    shsQuickMode
                } 
            }
        });

        if (error) throw error;
        localStorage.removeItem(`mea_draft_${levelId}`);
        setIsSubmitted(true);
        window.scrollTo(0, 0);

    } catch (error: any) {
        alert("Failed to submit report: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Required field validation for Profile
    if (currentStep === 0) {
        const missing = allSections[0].questions.filter(q => q.required && !formData[q.id]);
        if (missing.length > 0) {
            alert(`Please fill in: ${missing.map(q => q.label).join(', ')}`);
            return;
        }
    }

    // Validation for SHS Subjects
    if (levelId === EducationLevel.SHS && allSections[currentStep].id === 'failures_by_subject') {
        if (shsLibrarySelection.length === 0 && customSubjects.length === 0) {
            alert("No subjects selected. Please add at least one subject you teach.");
            return;
        }
    }
    
    if (currentStep < allSections.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  // --- Renderers ---

  const renderQuestionInput = (q: ExtendedQuestion) => {
    const value = formData[q.id] ?? '';

    return (
      <div key={q.id} className="mb-4">
        <label htmlFor={q.id} className="block text-sm font-medium text-gray-700 mb-1">
          {q.label} {q.required && <span className="text-red-500">*</span>}
        </label>
        
        {q.type === QuestionType.SELECT ? (
          <div className="relative">
            <select
              id={q.id}
              value={value}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
            >
              <option value="">Select an option...</option>
              {q.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ) : q.type === QuestionType.READ_ONLY ? (
            <input
            type="text"
            id={q.id}
            value={value}
            readOnly
            className="block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm p-2.5 border cursor-not-allowed"
          />
        ) : (
          <input
            type={q.type === QuestionType.NUMBER ? "number" : "text"}
            min={q.type === QuestionType.NUMBER ? "0" : undefined}
            id={q.id}
            value={value}
            placeholder={q.type === QuestionType.NUMBER ? "0" : q.placeholder}
            onChange={(e) => handleInputChange(q.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
          />
        )}
      </div>
    );
  };

  // SHS Specific Renderer
  const renderShsSubjectSelection = () => {
      const filteredLibrary = SUBJECTS_SHS_CORE.filter(s => 
          s.toLowerCase().includes(shsSearchTerm.toLowerCase())
      );

      // Combine active subjects for the input list
      const activeSubjects = [
          ...shsLibrarySelection.map(s => ({ name: s, source: 'library' })),
          ...customSubjects.map(s => ({ name: s, source: 'custom' }))
      ];

      return (
          <div className="space-y-8 animate-fade-in">
              {/* 1. Selection Area */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select the subjects you teach (SHS)</h3>
                  
                  {/* Quick Mode Toggle */}
                  <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                      <div className="flex items-center h-5">
                          <input 
                              id="quickMode"
                              type="checkbox" 
                              checked={shsQuickMode} 
                              onChange={toggleShsQuickMode}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                      </div>
                      <div className="ml-3 text-sm">
                          <label htmlFor="quickMode" className="font-medium text-blue-900 cursor-pointer">
                              Auto-add all recommended subjects
                          </label>
                          <p className="text-blue-700">Pre-populates list with 0 failures. You can still edit or remove subjects.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Library Column */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">A. Recommended SHS Subject Library</label>
                          <div className="relative mb-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search library..." 
                                className="block w-full pl-10 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
                                value={shsSearchTerm}
                                onChange={e => setShsSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="border border-gray-200 rounded-md h-72 overflow-y-auto p-1 bg-gray-50">
                              {filteredLibrary.length === 0 && <p className="text-xs text-gray-400 p-2">No matches found.</p>}
                              {filteredLibrary.map(subj => {
                                  const isSelected = shsLibrarySelection.includes(subj);
                                  return (
                                    <label key={subj} className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-white'}`}>
                                        <div className="flex items-center h-5">
                                            <input 
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleLibrarySubject(subj)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>{subj}</span>
                                    </label>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Custom Column */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">B. Add Custom Subject</label>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-72 flex flex-col">
                              <p className="text-xs text-gray-500 mb-4">
                                  If your subject is not in the library (e.g. specialized TVL tracks), add it manually here.
                              </p>
                              <div className="flex gap-2 mb-4">
                                  <input 
                                      type="text"
                                      value={newSubjectName}
                                      onChange={(e) => setNewSubjectName(e.target.value)}
                                      placeholder="Enter Subject Name..."
                                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                                  />
                                  <button 
                                      onClick={handleAddCustomSubject}
                                      disabled={!newSubjectName.trim()}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                  >
                                      Add
                                  </button>
                              </div>
                              
                              {/* Preview of Custom Subjects Added */}
                              {customSubjects.length > 0 && (
                                  <div className="flex-1 overflow-y-auto">
                                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Custom Subjects Added:</p>
                                      <div className="flex flex-wrap gap-2">
                                          {customSubjects.map(s => (
                                              <span key={s} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                  {s}
                                                  <button 
                                                    onClick={() => handleRemoveCustomSubject(s)} 
                                                    className="ml-1.5 text-emerald-600 hover:text-emerald-900 focus:outline-none"
                                                  >
                                                      <X className="h-3 w-3" />
                                                  </button>
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              {/* 2. Inputs Area */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Failures for Selected Subjects</h3>
                  
                  {activeSubjects.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-gray-500 font-medium">No subjects selected yet.</p>
                          <p className="text-sm text-gray-400">Please select from the library or add a custom subject above.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <p className="text-sm text-gray-500 italic">Please enter the number of learners who failed in each subject below.</p>
                          <div className="grid grid-cols-1 gap-y-3">
                              {activeSubjects.map((item) => (
                                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-all">
                                      <div className="flex items-center space-x-3 overflow-hidden">
                                          <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.source === 'library' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                              {item.source === 'library' ? 'Core' : 'Custom'}
                                          </span>
                                          <span className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                          <div className="flex items-center space-x-2">
                                              <span className="text-xs text-gray-500 hidden sm:inline uppercase font-bold tracking-wider">Failures:</span>
                                              <input 
                                                  type="number"
                                                  min="0"
                                                  placeholder="0"
                                                  value={formData[`fail_subject_${item.name}`] || ''}
                                                  onChange={(e) => handleInputChange(`fail_subject_${item.name}`, e.target.value)}
                                                  className="w-24 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                              />
                                          </div>
                                          <button 
                                              onClick={() => item.source === 'library' ? handleRemoveLibrarySubject(item.name) : handleRemoveCustomSubject(item.name)}
                                              className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                              title="Remove Subject"
                                          >
                                              <X className="w-5 h-5" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  // Generic Subject Failures Renderer (Kinder, Elem, JHS)
  const renderSubjectFailures = () => {
      // Branch to SHS specific renderer
      if (levelId === EducationLevel.SHS) {
          return renderShsSubjectSelection();
      }

      let subjects: string[] = [];
      const showMapehToggle = [EducationLevel.ELEM, EducationLevel.JHS].includes(levelId);

      if (levelId === EducationLevel.KINDER) {
          subjects = SUBJECTS_KINDER;
      } else if (levelId === EducationLevel.ELEM || levelId === EducationLevel.JHS) {
          subjects = [...SUBJECTS_ELEM_JHS_BASE];
          if (levelId === EducationLevel.ELEM) {
              subjects = subjects.map(s => s === 'EPP / TLE' ? 'EPP' : s);
          } else {
              subjects = subjects.map(s => s === 'EPP / TLE' ? 'TLE' : s);
          }
          
          if (splitMapeh) {
              subjects = subjects.filter(s => s !== 'MAPEH').concat(MAPEH_COMPONENTS);
          }
      }

      return (
          <div className="space-y-6 animate-fade-in">
              {showMapehToggle && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                      <div>
                          <h4 className="font-semibold text-blue-900">Split MAPEH Components?</h4>
                          <p className="text-sm text-blue-700">Toggle to enter grades for Music, Arts, PE, and Health separately.</p>
                      </div>
                      <button 
                          onClick={() => setSplitMapeh(!splitMapeh)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${splitMapeh ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${splitMapeh ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 divide-y divide-gray-200">
                      {subjects.map((subject, idx) => (
                          <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50">
                              <label className="text-sm font-medium text-gray-700 w-full sm:w-2/3">
                                  {subject}
                              </label>
                              <div className="w-full sm:w-1/3">
                                  <input 
                                      type="number"
                                      min="0"
                                      placeholder="No. of Failures"
                                      value={formData[`fail_subject_${subject}`] || ''}
                                      onChange={(e) => handleInputChange(`fail_subject_${subject}`, e.target.value)}
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderReviewFailures = () => {
    const failures: Array<{name: string, count: number}> = [];
    
    if (levelId === EducationLevel.SHS) {
         [...shsLibrarySelection, ...customSubjects].forEach(subj => {
             const val = getSafeNumber(formData[`fail_subject_${subj}`]);
             if (val > 0) failures.push({ name: subj, count: val });
         });
    } else {
         let subjects: string[] = [];
         if (levelId === EducationLevel.KINDER) subjects = SUBJECTS_KINDER;
          else if (levelId === EducationLevel.ELEM || levelId === EducationLevel.JHS) {
               subjects = [...SUBJECTS_ELEM_JHS_BASE];
               if (levelId === EducationLevel.ELEM) subjects = subjects.map(s => s === 'EPP / TLE' ? 'EPP' : s);
               else subjects = subjects.map(s => s === 'EPP / TLE' ? 'TLE' : s);
               if (splitMapeh) subjects = subjects.filter(s => s !== 'MAPEH').concat(MAPEH_COMPONENTS);
          }
          subjects.forEach(subj => {
             const val = getSafeNumber(formData[`fail_subject_${subj}`]);
             if (val > 0) failures.push({ name: subj, count: val });
          });
    }

    if (failures.length === 0) return <p className="text-sm text-gray-500 italic">No failures recorded.</p>;

    return (
        <ul className="divide-y divide-gray-100">
            {failures.map(f => (
                <li key={f.name} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-700">{f.name}</span>
                    <span className="font-medium text-red-600">{f.count}</span>
                </li>
            ))}
        </ul>
    );
  };

  const renderReviewStandard = (section: ExtendedSection) => {
    const validQuestions = section.questions.filter(q => q.type !== QuestionType.HEADER);
    const filledQuestions = validQuestions.filter(q => formData[q.id]);
    
    if (filledQuestions.length === 0) return <p className="text-sm text-gray-500 italic">No data entered.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {filledQuestions.map(q => (
                <div key={q.id} className="flex flex-col border-b border-gray-50 pb-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {q._month ? `${q._month} - ` : ''}{q.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{formData[q.id]}</span>
                </div>
            ))}
        </div>
    );
  };

  const renderReview = () => {
    const contentSections = allSections.slice(0, -1); // Exclude Review section itself

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Please review your report details below. If you need to make changes, click the "Edit" button to go back to that section.
                        </p>
                    </div>
                </div>
            </div>

            {contentSections.map((section, idx) => {
                return (
                    <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="font-semibold text-gray-800 text-sm">{section.title}</h4>
                            <button 
                              onClick={() => setCurrentStep(idx)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-3 h-3 mr-1" /> Edit
                            </button>
                        </div>
                        <div className="p-4">
                            {section.id === 'failures_by_subject' ? renderReviewFailures() : renderReviewStandard(section)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  const renderSectionContent = (section: ExtendedSection) => {
      // Review Step
      if (section.id === 'review_submission') {
          return renderReview();
      }

      // Special Step: Subject Failures
      if (section.id === 'failures_by_subject') {
          return renderSubjectFailures();
      }

      // Grouped render (Accordions for Movement)
      const groupedByMonth: Record<string, ExtendedQuestion[]> = {};
      let hasGroups = false;

      section.questions.forEach(q => {
          if (q._month) {
              hasGroups = true;
              if (!groupedByMonth[q._month]) groupedByMonth[q._month] = [];
              groupedByMonth[q._month].push(q);
          }
      });

      if (!hasGroups) {
          return section.questions.map(q => {
             if (q.type === QuestionType.HEADER) {
               return <h3 key={q.id} className="text-lg font-semibold text-gray-700 mt-6 mb-3 pb-1 border-b">{q.label}</h3>;
             }
             return renderQuestionInput(q);
          });
      }

      return Object.keys(groupedByMonth).map(month => (
          <div key={month} className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <button 
                  onClick={() => setOpenMonths(p => ({...p, [month]: !p[month]}))}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                  <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">{month}</span>
                  </div>
                  {openMonths[month] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              
              {openMonths[month] && (
                  <div className="p-6 border-t border-gray-200 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedByMonth[month].map(q => (
                              <div key={q.id}>
                                  {renderQuestionInput(q)}
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      ));
  };

  // --- Summary View ---
  const renderSummary = () => {
    const config = LEVEL_CONFIGS[levelId];
    const isSchoolHead = levelId === EducationLevel.SCHOOL_HEAD;
    // Use derived state
    const quarter = currentQuarter;
    const ranges = QUARTER_DATE_RANGES[quarter] || [];

    // Enrollment / Movement
    let totalEnrollment = 0;
    let totalIn = 0;
    let totalOut = 0;

    if (!isSchoolHead) {
        // Use latest non-zero enrollment
        for (let i = ranges.length - 1; i >= 0; i--) {
            const r = ranges[i];
            const val = getSafeNumber(formData[`enroll_total_${r}`] || formData[`k_total_${r}`] || formData[`als_total_${r}`]);
            if (val > 0) {
                totalEnrollment = val;
                break;
            }
        }
        ranges.forEach(r => {
             totalIn += getSafeNumber(formData[`move_in_${r}`] || formData[`k_trans_in_${r}`] || formData[`als_in_${r}`]);
             totalOut += getSafeNumber(formData[`move_out_${r}`] || formData[`k_trans_out_${r}`] || formData[`als_out_${r}`]);
        });
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start space-x-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-green-800">Submission Successful!</h2>
            <p className="text-green-700">Your MEA data for {config.label} has been saved.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Latest Enrollment</p>
                <p className="text-3xl font-bold text-blue-600">{isSchoolHead ? (formData['enrollment_bosy'] || 0) : totalEnrollment}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Transferred IN</p>
                <p className="text-3xl font-bold text-green-600">{totalIn}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Transferred OUT</p>
                <p className="text-3xl font-bold text-red-600">{totalOut}</p>
            </div>
        </div>

        <div className="flex justify-center space-x-4 pt-8">
            <button onClick={onBack} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">
                Return to Dashboard
            </button>
            <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Print Report
            </button>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return renderSummary();
  }

  const currentSection = allSections[currentStep];
  const config = LEVEL_CONFIGS[levelId];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {allSections.length}: {currentSection.title}</p>
         </div>
         <button onClick={onBack} className="text-sm text-gray-500 hover:text-red-600 underline">
            Cancel
         </button>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep + 1) / allSections.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
            <div className="mb-6">
                 <h3 className="text-xl font-semibold leading-6 text-gray-900">{currentSection.title}</h3>
                 {currentSection.description && <p className="mt-1 text-sm text-gray-500">{currentSection.description}</p>}
            </div>
            
            {/* Main Content Area */}
            <div className="space-y-6">
                 {renderSectionContent(currentSection)}
            </div>
        </div>
        
        <div className="flex items-center justify-between gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50">
            <button 
                type="button" 
                onClick={() => setCurrentStep(p => p - 1)}
                disabled={currentStep === 0}
                className={`flex items-center text-sm font-semibold leading-6 ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:text-gray-700'}`}
            >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </button>
            
            <div className="flex items-center space-x-4">
                 <span className="text-xs text-gray-400 flex items-center">
                    <Save className="h-3 w-3 mr-1" /> Draft saved
                 </span>
                <button 
                    type="button" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>Saving <Loader2 className="h-4 w-4 ml-2 animate-spin"/></>
                    ) : (
                        <>{currentStep === allSections.length - 1 ? 'Submit MEA' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;