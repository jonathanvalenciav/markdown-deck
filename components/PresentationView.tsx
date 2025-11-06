import React, { useState, useEffect, useCallback } from 'react';
import MarkdownPreview from './MarkdownPreview';
import { AssetMap, MarkdownFile } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, FontSizeIcon, MinusIcon, PlusIcon } from './Icons';

interface PresentationViewProps {
    markdownFiles: MarkdownFile[];
    assetMap: AssetMap;
    onExit: () => void;
    onImageClick: (src: string) => void;
}

const MIN_FONT_LEVEL = -2;
const MAX_FONT_LEVEL = 2;

const PresentationView: React.FC<PresentationViewProps> = ({ markdownFiles, assetMap, onExit, onImageClick }) => {
    const [slides, setSlides] = useState<string[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [fontSizeLevel, setFontSizeLevel] = useState(0);

    useEffect(() => {
        // Join files with a double newline to ensure separation and prevent
        // content from one file merging with a heading from the next.
        const combinedContent = markdownFiles.map(f => f.content).join('\n\n');
        
        // Split content by H1 (`# `) or H2 (`## `) headings. The regex uses a positive 
        // lookahead `(?=...)` to split *before* the heading, keeping the heading as part
        // of the resulting slide. The `m` flag enables multiline mode, so `^` matches
        // the start of each line, not just the entire string.
        const generatedSlides = combinedContent.split(/(?=^#{1,2} )/m).filter(slide => slide.trim() !== '');
        
        if (generatedSlides.length > 0) {
            setSlides(generatedSlides);
        } else if (combinedContent.trim() !== '') {
            // Fallback for content that doesn't use H1/H2 headings for slides.
            setSlides([combinedContent]);
        } else {
            setSlides([]);
        }
        setCurrentSlideIndex(0);
    }, [markdownFiles]);

    const totalSlides = slides.length;

    const goToPrevious = useCallback(() => {
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
    }, []);

    const goToNext = useCallback(() => {
        setCurrentSlideIndex(prev => Math.min(totalSlides - 1, prev + 1));
    }, [totalSlides]);

    const handleIncreaseFontSize = useCallback(() => {
        setFontSizeLevel(prev => Math.min(MAX_FONT_LEVEL, prev + 1));
    }, []);

    const handleDecreaseFontSize = useCallback(() => {
        setFontSizeLevel(prev => Math.max(MIN_FONT_LEVEL, prev - 1));
    }, []);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'Escape') {
                onExit();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious, onExit]);
    
    if (totalSlides === 0) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-800 text-white">
                <p>No slides to display.</p>
                <button onClick={onExit} className="mt-4 px-4 py-2 border border-white/50 rounded-md">
                    Return to Editor
                </button>
            </div>
        );
    }

    const currentSlideContent = slides[currentSlideIndex] || '';
    const isTitleSlide = currentSlideContent.trim().startsWith('# ');

    return (
        <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-neutral-800 text-white group p-4 sm:p-8">
            <button
                onClick={onExit}
                className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-black/30 rounded-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
                aria-label="Exit presentation"
                title="Exit (Esc)"
            >
                <CloseIcon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Exit</span>
            </button>
            
            <div className={`w-full h-full text-neutral-900 rounded-lg shadow-2xl border border-neutral-200 overflow-y-auto p-8 md:p-12 transition-all duration-300 flex flex-col ${isTitleSlide ? 'justify-center bg-gradient-to-br from-white to-sky-50' : 'bg-white'}`}>
                <div className={isTitleSlide ? '' : 'my-auto'}>
                    <MarkdownPreview
                        key={currentSlideIndex}
                        content={currentSlideContent}
                        assetMap={assetMap}
                        isTitleSlide={isTitleSlide}
                        onImageClick={onImageClick}
                        fontSizeLevel={fontSizeLevel}
                    />
                </div>
            </div>
            
            <div className="absolute bottom-5 w-full flex justify-between items-center px-8 z-10">
                <button
                    onClick={goToPrevious}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity"
                    aria-label="Previous Slide"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-2 bg-black/40 text-white/90 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                        onClick={handleDecreaseFontSize}
                        disabled={fontSizeLevel === MIN_FONT_LEVEL}
                        className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease font size"
                    >
                        <MinusIcon className="w-5 h-5" />
                    </button>
                    
                    <FontSizeIcon className="w-5 h-5" />
                    
                     <button
                        onClick={handleIncreaseFontSize}
                        disabled={fontSizeLevel === MAX_FONT_LEVEL}
                        className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase font size"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="w-px h-5 bg-white/20 mx-2"></div>
                    
                    <div className="text-sm">
                        {currentSlideIndex + 1} / {totalSlides}
                    </div>
                </div>

                <button
                    onClick={goToNext}
                    disabled={currentSlideIndex === totalSlides - 1}
                    className="p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity"
                    aria-label="Next Slide"
                >
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default PresentationView;