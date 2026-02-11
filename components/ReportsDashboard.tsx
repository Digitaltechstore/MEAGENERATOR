import React, { useState, useEffect } from 'react';
import { 
    Lock, 
    Unlock, 
    School, 
    Download, 
    FileBarChart, 
    ArrowLeft, 
    Loader2, 
    ChevronRight,
    Search,
    Calendar,
    Filter,
    RefreshCw,
    WifiOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ELEMENTARY_SCHOOLS, HIGH_SCHOOLS, QUARTER_DATE_RANGES, SCHOOL_YEARS } from '../constants';
import { EducationLevel, MeaSubmission } from '../types';
import pptxgen from 'pptxgenjs';

interface ReportsDashboardProps {
    onBack: () => void;
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
// Official Bacong District Seal (Public Raw Link)
const LOGO_URL = "https://raw.githubusercontent.com/Digitaltechstore/MEAGENERATOR/main/SEF%20FUNDED%20(6).png";

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ onBack }) => {
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Filters
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [selectedQuarter, setSelectedQuarter] = useState('Q1');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(SCHOOL_YEARS[0] || '2025-2026');
    
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<MeaSubmission[]>([]);
    const [error, setError] = useState<string | null>(null);

    // --- Access Control ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessCode === 'BACONGDISTRICT2026') {
            setIsAuthenticated(true);
            setError(null);
        } else {
            setError('Invalid Access Code');
        }
    };

    // --- Data Fetching ---
    useEffect(() => {
        if (selectedSchool) {
            fetchSchoolReports();
        } else {
            setReports([]); // Clear reports if no school selected
        }
    }, [selectedSchool, selectedQuarter, selectedSchoolYear]);

    const fetchSchoolReports = async () => {
        if (!selectedSchool) return;
        setLoading(true);
        setError(null);

        try {
            console.log(`Fetching: ${selectedSchool}, ${selectedQuarter}, ${selectedSchoolYear}`);
            // STRICT FILTERING: Only fetch records matching the EXACT selected school, quarter, and year.
            const { data, error } = await supabase
                .from('mea_submissions') 
                .select('*')
                .eq('school_name', selectedSchool) // <--- CRITICAL: Isolate by school
                .eq('quarter', selectedQuarter)    // <--- CRITICAL: Isolate by quarter
                .eq('school_year', selectedSchoolYear)
                .order('created_at', { ascending: false });

            if (error) {
                // If the error is network related, throw specific message
                if (error.message.includes('fetch')) throw new Error("Connection failed");
                throw error;
            }
            
            setReports(data as MeaSubmission[]);
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("Connection failed")) {
                setError("Cannot connect to Supabase. Please check your internet connection.");
            } else {
                setError('Failed to fetch reports: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- PPTX Generation ---
    const generatePptx = () => {
        const pres = new pptxgen();
        
        // 1. Title Slide
        const titleSlide = pres.addSlide();
        titleSlide.background = { color: "F3F4F6" };

        // Add Logo (Centered)
        titleSlide.addImage({ 
            path: LOGO_URL, 
            x: 4.25, // Centered (10 - 1.5) / 2
            y: 0.5, 
            w: 1.5, 
            h: 1.5 
        });

        titleSlide.addText(selectedSchool || "MEA Report", { x: 0.5, y: 2.2, w: '90%', fontSize: 36, bold: true, color: "1E3A8A", align: "center" });
        titleSlide.addText(`Monitoring, Evaluation, and Adjustment Report`, { x: 0.5, y: 3.2, w: '90%', fontSize: 24, color: "6B7280", align: "center" });
        titleSlide.addText(`Generated: ${new Date().toLocaleDateString()} | SY ${selectedSchoolYear} - ${selectedQuarter}`, { x: 0.5, y: 4, w: '90%', fontSize: 14, color: "9CA3AF", align: "center" });

        // Group reports by form_type (level)
        const grouped = reports.reduce((acc, curr) => {
            // Since we already filtered by quarter in the query, we just group by level
            // taking the most recent one (first in array due to order desc)
            if (!acc[curr.form_type]) {
                acc[curr.form_type] = curr;
            }
            return acc;
        }, {} as Record<EducationLevel, MeaSubmission>);

        const ranges = QUARTER_DATE_RANGES[selectedQuarter] || [];

        // Helper to add level slides
        const addLevelSlides = (level: EducationLevel, title: string) => {
            const report = grouped[level];
            if (!report) return;

            // Section Divider
            const sectionSlide = pres.addSlide();
            sectionSlide.background = { color: "1E3A8A" }; // Dark Blue
            
            // Small logo in top right
            sectionSlide.addImage({ path: LOGO_URL, x: 9.2, y: 0.2, w: 0.6, h: 0.6 });

            sectionSlide.addText(title, { x: 1, y: '45%', w: '80%', fontSize: 44, bold: true, color: "FFFFFF", align: "center" });
            sectionSlide.addText(`School Year: ${report.school_year} | Quarter: ${report.quarter}`, { x: 1, y: '60%', w: '80%', fontSize: 18, color: "BFDBFE", align: "center" });

            // 1. Movement / Enrollment Slide
            const moveSlide = pres.addSlide();
            moveSlide.addText(`${title} - Learners' Movement`, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1E3A8A" });
            moveSlide.addImage({ path: LOGO_URL, x: 9.3, y: 0.2, w: 0.5, h: 0.5 });
            
            const rows: any[] = [
                ['Month/Range', 'Enrollment', 'Transferred IN', 'Transferred OUT'].map(text => ({ 
                    text, 
                    options: { fill: { color: "1E40AF" }, color: "FFFFFF", bold: true } 
                }))
            ];

            // Use the structured monthly_learners_movement if available, otherwise fallback to content keys
            if (report.monthly_learners_movement && report.monthly_learners_movement.length > 0) {
                 report.monthly_learners_movement.forEach(m => {
                    rows.push([
                        { text: m.range },
                        { text: String(m.enrollment) },
                        { text: String(m.transferred_in) },
                        { text: String(m.transferred_out) }
                    ]);
                 });
            } else {
                 // Fallback for older data structure if migration happens
                ranges.forEach(r => {
                    let p = ''; 
                    if (level === EducationLevel.KINDER) p = 'k_';
                    else if (level === EducationLevel.ALS) p = 'als_';
                    
                    const enrollKey = p ? `${p}total_${r}` : `enroll_total_${r}`;
                    const inKey = p ? `${p}trans_in_${r}` : (level === EducationLevel.ALS ? `als_in_${r}` : `move_in_${r}`);
                    const outKey = p ? `${p}trans_out_${r}` : (level === EducationLevel.ALS ? `als_out_${r}` : `move_out_${r}`);

                    rows.push([
                        { text: r },
                        { text: String(report.content[enrollKey] || 0) },
                        { text: String(report.content[inKey] || 0) },
                        { text: String(report.content[outKey] || 0) }
                    ]);
                });
            }

            moveSlide.addTable(rows, { x: 0.5, y: 1.5, w: 9, colW: [4, 1.5, 1.5, 1.5], border: {pt: 1, color: "9CA3AF"}, fill: { color: "F9FAFB" } });

            // 2. Failures Slide (If applicable)
            if (report.failures_by_subject && report.failures_by_subject.length > 0) {
                const failSlide = pres.addSlide();
                failSlide.addText(`${title} - Learners Who Failed`, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "DC2626" });
                failSlide.addImage({ path: LOGO_URL, x: 9.3, y: 0.2, w: 0.5, h: 0.5 });

                const failRows: any[] = [['Subject / Learning Area', 'No. of Failures'].map(text => ({ 
                    text, 
                    options: { fill: { color: "991B1B" }, color: "FFFFFF", bold: true } 
                }))];
                report.failures_by_subject.forEach((f) => {
                    failRows.push([
                        { text: f.subjectName }, 
                        { text: String(f.failedCount) }
                    ]);
                });

                failSlide.addTable(failRows, { x: 0.5, y: 1.5, w: 8, colW: [6, 2], border: {pt: 1, color: "9CA3AF"} });
            }
        };

        // School Head Slides
        const addHeadSlides = () => {
            const report = grouped[EducationLevel.SCHOOL_HEAD];
            if (!report) return;

            const slide = pres.addSlide();
            slide.addText("School Profile Summary", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1E3A8A" });
            slide.addImage({ path: LOGO_URL, x: 9.3, y: 0.2, w: 0.5, h: 0.5 });

            // Enrollment
            slide.addText("Enrollment", { x: 0.5, y: 1.2, fontSize: 14, bold: true });
            slide.addTable([
                ['BOSY', 'EOSY (Prev)', 'Trend'].map(text => ({ 
                    text, 
                    options: { fill: { color: "3B82F6" }, color: "FFFFFF", bold: true } 
                })),
                [
                    { text: String(report.content['enrollment_bosy'] || 0) }, 
                    { text: String(report.content['enrollment_eosy'] || 0) }, 
                    { text: String(report.content['enrollment_trend'] || '-') }
                ]
            ], { x: 0.5, y: 1.5, w: 8, border: { pt: 1, color: "E5E7EB" } });

            // Personnel
            slide.addText("Personnel", { x: 0.5, y: 3.2, fontSize: 14, bold: true });
            slide.addTable([
                ['Teaching (M)', 'Teaching (F)', 'Non-Teach (M)', 'Non-Teach (F)'].map(text => ({ 
                    text, 
                    options: { fill: { color: "10B981" }, color: "FFFFFF", bold: true } 
                })),
                [
                    { text: String(report.content['personnel_teach_m'] || 0) }, 
                    { text: String(report.content['personnel_teach_f'] || 0) },
                    { text: String(report.content['personnel_non_m'] || 0) },
                    { text: String(report.content['personnel_non_f'] || 0) }
                ]
            ], { x: 0.5, y: 3.5, w: 8, border: { pt: 1, color: "E5E7EB" } });
        };

        // Determine which slides to generate based on school type
        const isHighSchool = HIGH_SCHOOLS.includes(selectedSchool || '');

        if (isHighSchool) {
            addLevelSlides(EducationLevel.JHS, "Junior High School");
            addLevelSlides(EducationLevel.SHS, "Senior High School");
            addLevelSlides(EducationLevel.ALS, "ALS (Secondary)");
        } else {
            addLevelSlides(EducationLevel.KINDER, "Kindergarten");
            addLevelSlides(EducationLevel.SPED, "SPED");
            addLevelSlides(EducationLevel.ELEM, "Elementary");
            addLevelSlides(EducationLevel.ALS, "ALS (Elementary)");
        }
        
        // Add School Head slides last
        addHeadSlides();

        pres.writeFile({ fileName: `${selectedSchool}_MEA_Report_${selectedQuarter}_${selectedSchoolYear}.pptx` });
    };


    // --- View: Login ---
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative">
                 <button 
                    onClick={onBack}
                    className="absolute top-24 left-4 sm:left-8 flex items-center text-gray-500 hover:text-blue-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
                    <div className="mx-auto bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-blue-100">
                        <Lock className="w-8 h-8 text-blue-900" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authorized Access Only</h2>
                    <p className="text-gray-500 mb-6">This area is restricted to District Personnel.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="password"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-center text-lg tracking-widest"
                            placeholder="Enter District Code"
                        />
                        {error && <p className="text-red-600 text-sm font-semibold bg-red-50 py-1 rounded">{error}</p>}
                        <button 
                            type="submit"
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center shadow-lg"
                        >
                            <Unlock className="w-4 h-4 mr-2 text-yellow-400" /> Unlock Reports
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-gray-400">Code: BACONGDISTRICT2026</p>
                </div>
            </div>
        );
    }

    // --- View: School Selection & Preview ---
    const renderPreviewCard = (level: EducationLevel, title: string) => {
        const report = reports.find(r => r.form_type === level);
        if (!report) return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center opacity-60">
                <p className="font-semibold text-gray-400">{title}</p>
                <p className="text-sm text-gray-400">No data found.</p>
            </div>
        );

        // Calculate Enrollment Display
        let enrollment = 0;
        
        // Use structured data if available
        if (report.monthly_learners_movement && report.monthly_learners_movement.length > 0) {
            // Get the last record (latest month/range)
            const latest = report.monthly_learners_movement[report.monthly_learners_movement.length - 1];
            enrollment = latest.enrollment;
        } else if (level === EducationLevel.SCHOOL_HEAD) {
            enrollment = Number(report.content['enrollment_bosy'] || 0);
        } else {
            // Fallback for older formats
            const keys = Object.keys(report.content);
            const ranges = QUARTER_DATE_RANGES[selectedQuarter] || [];
            for (const r of ranges) {
                const val = report.content[`enrollment_total_${r}`] || report.content[`enroll_total_${r}`] || report.content[`k_total_${r}`] || report.content[`als_total_${r}`];
                if (val) {
                    enrollment = Number(val);
                    break;
                }
            }
        }

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 border-l-blue-900">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-blue-900">{title}</h3>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        {report.quarter}
                    </span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Enrollment:</span>
                        <span className="font-medium">
                            {enrollment || 0}
                        </span>
                    </div>
                    {report.failures_by_subject && report.failures_by_subject.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                             <span className="text-red-600 font-medium text-xs uppercase">Failures Reported:</span>
                             <ul className="mt-1 space-y-1">
                                {report.failures_by_subject.slice(0, 3).map((f: any, i: number) => (
                                    <li key={i} className="flex justify-between text-xs">
                                        <span className="text-gray-600 truncate max-w-[150px]">{f.subjectName}</span>
                                        <span className="font-bold text-red-500">{f.failedCount}</span>
                                    </li>
                                ))}
                                {report.failures_by_subject.length > 3 && (
                                    <li className="text-xs text-gray-400 italic">+ {report.failures_by_subject.length - 3} more</li>
                                )}
                             </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FileBarChart className="w-6 h-6 mr-2 text-blue-900" />
                            Report Generator
                        </h2>
                        <p className="text-sm text-gray-500">Generate MEA slides for specific schools.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: School Selection */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Quarter & SY Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-yellow-400">
                        <div className="mb-4">
                             <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-900" />
                                School Year
                            </label>
                            <select 
                                value={selectedSchoolYear}
                                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                            >
                                {SCHOOL_YEARS.map(sy => (
                                    <option key={sy} value={sy}>{sy}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                                <Filter className="w-4 h-4 mr-2 text-blue-900" />
                                Quarter
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {QUARTERS.map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setSelectedQuarter(q)}
                                        className={`py-2 px-1 rounded-md text-sm font-bold transition-all ${
                                            selectedQuarter === q 
                                            ? 'bg-blue-900 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 flex items-center">
                            <School className="w-4 h-4 mr-2 text-blue-900" /> Select School
                        </div>
                        <div className="p-2 h-[450px] overflow-y-auto custom-scrollbar">
                            <div className="mb-2 px-2 pt-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Elementary Schools</span>
                            </div>
                            {ELEMENTARY_SCHOOLS.map(school => (
                                <button
                                    key={school}
                                    onClick={() => setSelectedSchool(school)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition-all flex items-center justify-between ${selectedSchool === school ? 'bg-blue-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <span className="truncate">{school}</span>
                                    {selectedSchool === school && <ChevronRight className="w-4 h-4 opacity-75 text-yellow-400" />}
                                </button>
                            ))}
                            
                            <div className="mt-4 mb-2 px-2 pt-2 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">High Schools</span>
                            </div>
                            {HIGH_SCHOOLS.map(school => (
                                <button
                                    key={school}
                                    onClick={() => setSelectedSchool(school)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm mb-1 transition-all flex items-center justify-between ${selectedSchool === school ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <span className="truncate">{school}</span>
                                    {selectedSchool === school && <ChevronRight className="w-4 h-4 opacity-75 text-yellow-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Preview & Action */}
                <div className="lg:col-span-8">
                    {!selectedSchool ? (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                            <Search className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No School Selected</p>
                            <p className="text-sm">Please select a School, Quarter, and School Year from the left.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-900">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900">{selectedSchool}</h3>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">{selectedQuarter}</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{selectedSchoolYear}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {error ? (
                                            <span className="text-red-500 font-medium flex items-center"><WifiOff className="w-3 h-3 mr-1"/>Connection Error</span>
                                        ) : (
                                            loading ? 'Fetching data...' : reports.length === 0 ? 'No submissions found.' : `${reports.length} report(s) found.`
                                        )}
                                    </p>
                                </div>
                                <div className="flex space-x-2 mt-4 sm:mt-0">
                                    <button 
                                        onClick={fetchSchoolReports}
                                        className="p-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                        title="Refresh Data"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={generatePptx}
                                        disabled={loading || reports.length === 0}
                                        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download .PPTX
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center text-red-700">
                                    <p className="font-bold mb-1">Error Loading Data</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {HIGH_SCHOOLS.includes(selectedSchool) ? (
                                        <>
                                            {renderPreviewCard(EducationLevel.JHS, "Junior High School")}
                                            {renderPreviewCard(EducationLevel.SHS, "Senior High School")}
                                            {renderPreviewCard(EducationLevel.ALS, "ALS (Secondary)")}
                                            {renderPreviewCard(EducationLevel.SCHOOL_HEAD, "School Head Report")}
                                        </>
                                    ) : (
                                        <>
                                            {renderPreviewCard(EducationLevel.KINDER, "Kindergarten")}
                                            {renderPreviewCard(EducationLevel.SPED, "SPED")}
                                            {renderPreviewCard(EducationLevel.ELEM, "Elementary")}
                                            {renderPreviewCard(EducationLevel.ALS, "ALS (Elementary)")}
                                            {renderPreviewCard(EducationLevel.SCHOOL_HEAD, "School Head Report")}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;