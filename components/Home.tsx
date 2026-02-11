import React, { useState } from 'react';
import { 
    Baby, 
    Accessibility, 
    School, 
    GraduationCap, 
    BookOpen,
    Building2,
    ArrowLeft,
    Presentation
} from 'lucide-react';
import { EducationLevel } from '../types';

interface HomeProps {
    onSelectLevel: (level: EducationLevel) => void;
    onOpenReports: () => void;
}

const Home: React.FC<HomeProps> = ({ onSelectLevel, onOpenReports }) => {
    const [showHighSchoolOptions, setShowHighSchoolOptions] = useState(false);
    
    // Official Bacong District Seal (Public Raw Link)
    const LOGO_URL = "https://raw.githubusercontent.com/Digitaltechstore/MEAGENERATOR/main/SEF%20FUNDED%20(6).png";

    const menuItems = [
        { id: EducationLevel.KINDER, label: 'Kindergarten', icon: Baby, color: 'bg-pink-500' },
        { id: EducationLevel.SPED, label: 'SPED', icon: Accessibility, color: 'bg-purple-500' },
        { id: EducationLevel.ELEM, label: 'Elementary', icon: School, color: 'bg-blue-600' },
        // Special ID for Group
        { id: 'HS_GROUP', label: 'High School (G7-12)', icon: GraduationCap, color: 'bg-indigo-600' },
        { id: EducationLevel.ALS, label: 'ALS', icon: BookOpen, color: 'bg-emerald-600' },
        { id: EducationLevel.SCHOOL_HEAD, label: 'School Head', icon: Building2, color: 'bg-yellow-600' },
    ];

    const highSchoolItems = [
        { id: EducationLevel.JHS, label: 'Junior High School (G7-10)', icon: GraduationCap, color: 'bg-indigo-600' },
        { id: EducationLevel.SHS, label: 'Senior High School (G11-12)', icon: GraduationCap, color: 'bg-indigo-500' },
    ];

    if (showHighSchoolOptions) {
        return (
            <div className="flex flex-col items-center animate-fade-in w-full">
                 <div className="text-center max-w-2xl mx-auto mb-12">
                    <button 
                        onClick={() => setShowHighSchoolOptions(false)}
                        className="mb-6 flex items-center text-gray-500 hover:text-blue-900 transition-colors mx-auto font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Menu
                    </button>
                    <img 
                        src={LOGO_URL} 
                        alt="Bacong District Logo" 
                        className="mx-auto h-20 w-20 object-contain mb-4 drop-shadow-md"
                    />
                    <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
                        High School Department
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Please select your specific grade level range.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
                     {highSchoolItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelectLevel(item.id)}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 ${item.color} group-hover:h-2 transition-all duration-300`}></div>
                                <div className={`p-4 rounded-full ${item.color} bg-opacity-10 group-hover:bg-opacity-20 mb-4 transition-colors`}>
                                    <Icon className={`h-10 w-10 ${item.color.replace('bg-', 'text-')}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                                    {item.label}
                                </h3>
                                <span className="mt-2 text-sm text-gray-400 group-hover:text-gray-500">
                                    Enter Report
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full animate-fade-in pb-12">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <img 
                    src={LOGO_URL} 
                    alt="Bacong District Logo" 
                    className="mx-auto h-28 w-28 object-contain mb-6 drop-shadow-xl"
                />
                <h2 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
                    Select Your Role / Level
                </h2>
                <div className="mt-4 w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                <p className="mt-4 text-lg text-gray-600">
                    Welcome to the <strong>Bacong District</strong> MEA System.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-4 mb-12">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'HS_GROUP') {
                                    setShowHighSchoolOptions(true);
                                } else {
                                    onSelectLevel(item.id as EducationLevel);
                                }
                            }}
                            className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${item.color} group-hover:h-2 transition-all duration-300`}></div>
                            <div className={`p-4 rounded-full ${item.color} bg-opacity-10 group-hover:bg-opacity-20 mb-4 transition-colors`}>
                                <Icon className={`h-10 w-10 ${item.color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {item.label}
                            </h3>
                            <span className="mt-2 text-sm text-gray-400 group-hover:text-gray-500">
                                {item.id === 'HS_GROUP' ? 'Select Grade Level' : 'Enter Report'}
                            </span>
                        </button>
                    );
                })}
            </div>
            
            <div className="mt-4 w-full max-w-3xl px-4">
                 <button 
                    onClick={onOpenReports}
                    className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg flex items-center justify-between group transition-all transform hover:scale-[1.01] border-2 border-transparent hover:border-yellow-400"
                 >
                    <div className="flex items-center text-left">
                        <div className="bg-white/10 p-3 rounded-lg mr-4 border border-white/20">
                            <Presentation className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Generate MEA Slides</h3>
                            <p className="text-blue-200 text-sm">Consolidate school data and export to PowerPoint (.pptx)</p>
                        </div>
                    </div>
                    <ArrowLeft className="h-6 w-6 transform rotate-180 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                 </button>
            </div>
        </div>
    );
};

export default Home;