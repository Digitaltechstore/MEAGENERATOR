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
    Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ELEMENTARY_SCHOOLS, HIGH_SCHOOLS, QUARTER_DATE_RANGES } from '../constants';
import { EducationLevel, MeaReport } from '../types';
import pptxgen from 'pptxgenjs';

interface ReportsDashboardProps {
    onBack: () => void;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ onBack }) => {
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<MeaReport[]>([]);
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
        }
    }, [selectedSchool]);

    const fetchSchoolReports = async () => {
        if (!selectedSchool) return;
        setLoading(true);
        setError(null);

        try {
            // Query Supabase for all reports matching the school name in the JSON content
            const { data, error } = await supabase
                .from('mea_reports')
                .select('*')
                .eq('content->>schoolName', selectedSchool)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Filter to get only the latest submission per level/quarter if multiples exist
            setReports(data as MeaReport[]);
        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch reports: ' + err.message);
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
            path: "/bacong-logo.png", 
            x: 4.25, // Centered (10 - 1.5) / 2
            y: 0.5, 
            w: 1.5, 
            h: 1.5 
        });

        titleSlide.addText(selectedSchool || "MEA Report", { x: 0.5, y: 2.2, w: '90%', fontSize: 36, bold: true, color: "1E3A8A", align: "center" });
        titleSlide.addText(`Monitoring, Evaluation, and Adjustment Report`, { x: 0.5, y: 3.2, w: '90%', fontSize: 24, color: "6B7280", align: "center" });
        titleSlide.addText(`Generated: ${new Date().toLocaleDateString()}`, { x: 0.5, y: 4, w: '90%', fontSize: 14, color: "9CA3AF", align: "center" });

        // Group reports by level
        const grouped = reports.reduce((acc, curr) => {
            acc[curr.level] = curr; 
            return acc;
        }, {} as Record<EducationLevel, MeaReport>);

        const quarter = reports[0]?.quarter || "Q1";
        const ranges = QUARTER_DATE_RANGES[quarter] || [];

        // Helper to add level slides
        const addLevelSlides = (level: EducationLevel, title: string) => {
            const report = grouped[level];
            if (!report) return;

            // Section Divider
            const sectionSlide = pres.addSlide();
            sectionSlide.background = { color: "1E3A8A" }; // Dark Blue
            
            // Small logo in top right
            sectionSlide.addImage({ path: "/bacong-logo.png", x: 9.2, y: 0.2, w: 0.6, h: 0.6 });

            sectionSlide.addText(title, { x: 1, y: '45%', w: '80%', fontSize: 44, bold: true, color: "FFFFFF", align: "center" });
            sectionSlide.addText(`School Year: ${report.school_year} | Quarter: ${report.quarter}`, { x: 1, y: '60%', w: '80%', fontSize: 18, color: "BFDBFE", align: "center" });

            // 1. Movement / Enrollment Slide
            const moveSlide = pres.addSlide();
            moveSlide.addText(`${title} - Learners' Movement`, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1E3A8A" });
            moveSlide.addImage({ path: "/bacong-logo.png", x: 9.3, y: 0.2, w: 0.5, h: 0.5 });
            
            const rows = [
                ['Month/Range', 'Enrollment', 'Transferred IN', 'Transferred OUT']
            ];

            ranges.forEach(r => {
                // Determine prefix based on level
                let p = ''; 
                if (level === EducationLevel.KINDER) p = 'k_';
                else if (level === EducationLevel.ALS) p = 'als_';
                
                // Fallback for standard key names
                const enrollKey = p ? `${p}total_${r}` : `enroll_total_${r}`;
                const inKey = p ? `${p}trans_in_${r}` : (level === EducationLevel.ALS ? `als_in_${r}` : `move_in_${r}`);
                const outKey = p ? `${p}trans_out_${r}` : (level === EducationLevel.ALS ? `als_out_${r}` : `move_out_${r}`);

                rows.push([
                    r,
                    String(report.content[enrollKey] || 0),
                    String(report.content[inKey] || 0),
                    String(report.content[outKey] || 0)
                ]);
            });

            moveSlide.addTable(rows, { x: 0.5, y: 1.5, w: 9, colW: [4, 1.5, 1.5, 1.5], border: {pt: 1, color: "9CA3AF"}, fill: { color: "F9FAFB" }, headerStyles: { fill: { color: "1E40AF" }, color: "FFFFFF", bold: true } });

            // 2. Failures Slide (If applicable)
            if (report.content.failuresBySubject && Array.isArray(report.content.failuresBySubject) && report.content.failuresBySubject.length > 0) {
                const failSlide = pres.addSlide();
                failSlide.addText(`${title} - Learners Who Failed`, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "DC2626" });
                failSlide.addImage({ path: "/bacong-logo.png", x: 9.3, y: 0.2, w: 0.5, h: 0.5 });

                const failRows = [['Subject / Learning Area', 'No. of Failures']];
                report.content.failuresBySubject.forEach((f: any) => {
                    failRows.push([f.subjectName, String(f.failedCount)]);
                });

                failSlide.addTable(failRows, { x: 0.5, y: 1.5, w: 8, colW: [6, 2], border: {pt: 1, color: "9CA3AF"}, headerStyles: { fill: { color: "991B1B" }, color: "FFFFFF" } });
            }
        };

        // School Head Slides
        const addHeadSlides = () => {
            const report = grouped[EducationLevel.SCHOOL_HEAD];
            if (!report) return;

            const slide = pres.addSlide();
            slide.addText("School Profile Summary", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1E3A8A" });
            slide.addImage({ path: "/bacong-logo.png", x: 9.3, y: 0.2, w: 0.5, h: 0.5 });

            // Enrollment
            slide.addText("Enrollment", { x: 0.5, y: 1.2, fontSize: 14, bold: true });
            slide.addTable([
                ['BOSY', 'EOSY (Prev)', 'Trend'],
                [String(report.content['enrollment_bosy'] || 0), String(report.content['enrollment_eosy'] || 0), String(report.content['enrollment_trend'] || '-')]
            ], { x: 0.5, y: 1.5, w: 8, border: { pt: 1, color: "E5E7EB" }, headerStyles: { fill: "3B82F6", color: "FFFFFF" } });

            // Personnel
            slide.addText("Personnel", { x: 0.5, y: 3.2, fontSize: 14, bold: true });
            slide.addTable([
                ['Teaching (M)', 'Teaching (F)', 'Non-Teach (M)', 'Non-Teach (F)'],
                [
                    String(report.content['personnel_teach_m'] || 0), 
                    String(report.content['personnel_teach_f'] || 0),
                    String(report.content['personnel_non_m'] || 0),
                    String(report.content['personnel_non_f'] || 0)
                ]
            ], { x: 0.5, y: 3.5, w: 8, border: { pt: 1, color: "E5E7EB" }, headerStyles: { fill: "10B981", color: "FFFFFF" } });
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

        pres.writeFile({ fileName: `${selectedSchool}_MEA_Report.pptx` });
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
        const report = reports.find(r => r.level === level);
        if (!report) return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center opacity-60">
                <p className="font-semibold text-gray-400">{title}</p>
                <p className="text-sm text-gray-400">No data submitted yet.</p>
            </div>
        );

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
                            {report.content[`enroll_total_Q1`] || report.content[`k_total_Q1`] || report.content[`als_total_Q1`] || 0} (Latest)
                        </span>
                    </div>
                    {report.content.failuresBySubject && Array.isArray(report.content.failuresBySubject) && report.content.failuresBySubject.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                             <span className="text-red-600 font-medium text-xs uppercase">Failures Reported:</span>
                             <ul className="mt-1 space-y-1">
                                {report.content.failuresBySubject.slice(0, 3).map((f: any, i: number) => (
                                    <li key={i} className="flex justify-between text-xs">
                                        <span className="text-gray-600 truncate max-w-[150px]">{f.subjectName}</span>
                                        <span className="font-bold text-red-500">{f.failedCount}</span>
                                    </li>
                                ))}
                                {report.content.failuresBySubject.length > 3 && (
                                    <li className="text-xs text-gray-400 italic">+ {report.content.failuresBySubject.length - 3} more</li>
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
            <div className="flex items-center justify-between mb-8">
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
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 flex items-center">
                            <School className="w-4 h-4 mr-2 text-blue-900" /> Select School
                        </div>
                        <div className="p-2 h-[600px] overflow-y-auto custom-scrollbar">
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
                            <p className="text-sm">Please select a school from the list to view data.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-900">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedSchool}</h3>
                                    <p className="text-sm text-gray-500">
                                        {loading ? 'Fetching data...' : `${reports.length} report(s) found`}
                                    </p>
                                </div>
                                <button 
                                    onClick={generatePptx}
                                    disabled={loading || reports.length === 0}
                                    className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                                    Download .PPTX
                                </button>
                            </div>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
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