import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import JSZip from 'jszip';

// 아이콘 컴포넌트
const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> );
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> );
const RegenerateIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> );
const ErrorIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> );
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const AutopilotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 1-9.5 2.5v11l9.5 5 9.5-5v-11z"/><path d="m12 22 9.5-5"/><path d="m3.5 18.5 9.5-5"/><path d="m3.5 3.5 9.5 5 9.5-5"/></svg>;
const MasterAutopilotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m12 8-2 4 4 2 2-4-4-2z"/><path d="M12 12v10"/></svg>;
const LogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" /><line x1="12" x2="12" y1="18" y2="18" /><line x1="12" x2="12" y1="14" y2="14" /></svg>;
const ScrollToTopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>;


// Social Icons
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const TelegramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C3.73 6.66 5.14 6.32 6.9 6.2c1.7-.1 3.1-.2 4.7-.2h.4c1.6 0 3 .1 4.6.2c1.8.13 3.18.47 4.4 1.1c1.26.63 2.1 1.7 2.4 3.2c.3 1.5.4 3.1.4 4.6c0 1.6-.1 3.1-.4 4.6c-.3 1.5-1.14 2.57-2.4 3.2c-1.22.63-2.62.97-4.4 1.1c-1.6.1-3 .2-4.6.2h-.4c-1.6 0-3-.1-4.6.2c-1.8-.12-3.2-.46-4.5-1.1C3.6 19.26 2.8 18.16 2.5 17Z"/><path d="m10 15 5-3-5-3z"/></svg>;
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


// বিভিন্ন ধরনের ডেটার জন্য টাইপ নির্ধারণ
type ReferenceFile = { name: string; size: string; dataUrl?: string | undefined; file?: File | null | undefined; };
type SceneResult = { scene_description: string; image_prompt: string; video_prompt?: string; imageUrl?: string; imageStatus: 'pending' | 'loading' | 'completed' | 'failed' | 'retrying'; error?: string; retryCount?: number; rephrasedForSafety?: boolean; safetyRetryCount?: number; };
type DetailedError = { id: number; timestamp: string; title: string; message: string; operation: string; details?: string; };
type Notification = { id: number; message: string; };
type NotificationLogItem = { id: number; timestamp: string; message: string; };
type StylePreset = { name: string; themes: string[]; modifiers: string[]; angle: string; };
type TTSConfig = { voice: string; tone: string; speed: number; };
type CharacterProfile = { id: string; userDescription: string; aiDescription: string; image: ReferenceFile | null; };
type VideoGenerationStatus = { status: 'idle' | 'generating' | 'polling' | 'complete' | 'failed'; videoUrl?: string; error?: string; progressMessage?: string; };
type AudioChunk = { id: number; text: string; status: 'pending' | 'generating' | 'complete' | 'failed'; audioUrl?: string; audioBytes?: Uint8Array; error?: string; };
type TTSVoice = { conceptualName: string; apiName: string; gender: 'Male' | 'Female' | 'Child'; category: string; language: 'English' | 'Bengali'; tones: string[]; color: string; use_case: string; };

// IndexedDB Project Data Type
type ProjectData = {
    projectName: string;
    script: string;
    results: SceneResult[];
    videoDuration: number;
    videoDurationSec: number;
    imageCount: number;
    aspectRatio: string;
    selectedThemes: string[];
    selectedModifiers: string[];
    cameraAngle: string;
    scriptType: string;
    fileName: string;
    referenceFiles: ReferenceFile[];
    characterProfiles: CharacterProfile[];
    videoModel: string;
    videoPromptBasis: string;
    includeDialogue: boolean;
    includeAmbient: boolean;
    includeSfx: boolean;
};

// IndexedDB Helper
class DbHelper {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'AI-AutomationerDB';
    private readonly DB_VERSION = 1;
    private readonly STORE_NAME = 'projects';

    constructor() { this.init(); }

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => reject('IndexedDB initialization error');
            request.onsuccess = () => { this.db = request.result; resolve(); };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'projectName' });
                }
            };
        });
    }
    
    private async getDb(): Promise<IDBDatabase> {
        if (!this.db) { await this.init(); }
        return this.db!;
    }

    public async saveProject(projectData: ProjectData): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(projectData);
            request.onerror = () => reject('Error saving project');
            request.onsuccess = () => resolve();
        });
    }

    public async loadProject(projectName: string): Promise<ProjectData | undefined> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(projectName);
            request.onerror = () => reject('Error loading project');
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    public async deleteProject(projectName: string): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(projectName);
            request.onerror = () => reject('Error deleting project');
            request.onsuccess = () => resolve();
        });
    }
    
    public async getAllProjectNames(): Promise<string[]> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAllKeys();
            request.onerror = () => reject('Error fetching project names');
            request.onsuccess = () => resolve(request.result as string[]);
        });
    }

    public async clearAllProjects(): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();
            request.onerror = () => reject('Error clearing projects');
            request.onsuccess = () => resolve();
        });
    }
}
const dbHelper = new DbHelper();


// স্টাইল এবং থিমের তালিকা
const themeOptions = [ "Realistic", "Horror", "Mystery", "History", "Documentary", "Fitness", "Anatomy", "Real Footage", "CCTV", "Found Footage", "Fantasy", "Sci-Fi", "Cinematic", "Motivational", "Thriller", "Comedy", "Romance", "Vlog", "Educational", "Animation" ];
const styleModifiers = [ "Photorealistic", "Cinematic", "Studio Light", "Dramatic Lighting", "4K", "HDR", "Surreal", "Ethereal", "Dreamy", "Haze", "Fantasy Art", "Anime", "Gaming", "Pencil Drawing", "Charcoal Sketch", "Pastel Painting", "Digital Art", "Art Deco", "Impressionist", "Renaissance Painting", "Pop Art", "Minimalist", "Modern Logo", "Motion Blur", "Soft Focus", "Bokeh", "Macro Lens", "Wide Angle", "Fisheye Lens", "VHS Grain", "Film Grain", "Toon Realism", "3D Animation", "Vibrant Colors", "Monochrome", "Low Poly", "Isometric" ];
const cameraAngles = [
    { value: "Default", description: "Let the AI decide the best shot for the scene." },
    { value: "Point of View / First Person", description: "Shows the scene from a character's eyes. Good for immersive or horror content." },
    { value: "Low Angle Shot", description: "Makes the subject look powerful or imposing. Used in action and drama." },
    { value: "High Angle Shot", description: "Makes the subject look vulnerable or small. Good for emotional scenes." },
    { value: "Bird's Eye View", description: "A shot from directly above. Great for establishing a location or showing scale." },
    { value: "Dutch Angle", description: "A tilted shot that creates a sense of unease or disorientation." },
    { value: "Over-the-Shoulder Shot", description: "Often used in conversations to show perspective." },
    { value: "Dynamic", description: "Implies camera movement like panning, tracking, or drone shots. Good for action." },
    { value: "Cinematic Close-up", description: "Focuses tightly on a character's face to show emotion." },
    { value: "Wide Shot / Establishing Shot", description: "Shows the entire scene and characters' relationship to it." },
    { value: "Macro Lens", description: "Extremely close-up shot to show fine details." }
];
const ttsTones = [ "All Tones", "Neutral", "Documentary", "History", "Fact", "Odd Story", "Crime Story", "Horror Story", "Sleeping Story", "Kids Bedtime Story", "Dynamic", "Motivational", "Taunting", "Sad", "Islamic History", "Ancient", "Nature/Geography", "Cheerful", "Happy", "Angry", "Excited", "Fearful", "Whispering", "Shouting", "Formal", "Calm" ];

const ttsVoices: TTSVoice[] = [
    // --- FEMALE VOICES ---
    { conceptualName: 'Zephyr', apiName: 'Zephyr', gender: 'Female', category: 'Narration', language: 'English', tones: ['Cheerful', 'Happy', 'Neutral'], color: '#FF69B4', use_case: 'A bright, higher-pitch female voice, excellent for upbeat and clear narration.' },
    { conceptualName: 'Kore', apiName: 'Kore', gender: 'Female', category: 'Formal', language: 'English', tones: ['Formal', 'Fact', 'Documentary', 'Motivational'], color: '#FF69B4', use_case: 'A firm, middle-pitch female voice suitable for professional presentations and factual content.' },
    { conceptualName: 'Leda', apiName: 'Leda', gender: 'Female', category: 'Creative', language: 'English', tones: ['Happy', 'Cheerful', 'Kids Bedtime Story'], color: '#FF69B4', use_case: 'A youthful, higher-pitched female voice, perfect for energetic and bright content.' },
    { conceptualName: 'Aoede', apiName: 'Aoede', gender: 'Female', category: 'Narration', language: 'English', tones: ['Neutral', 'Calm'], color: '#FF69B4', use_case: 'A breezy, middle-pitch female voice for a light and pleasant narration style.' },
    { conceptualName: 'Callirrhoe', apiName: 'Callirrhoe', gender: 'Female', category: 'Creative', language: 'English', tones: ['Neutral', 'Calm', 'Happy'], color: '#FF69B4', use_case: 'An easy-going, middle-pitch female voice for casual vlogs or friendly explainers.' },
    { conceptualName: 'Autonoe', apiName: 'Autonoe', gender: 'Female', category: 'Creative', language: 'English', tones: ['Happy', 'Cheerful', 'Dynamic'], color: '#FF69B4', use_case: 'A bright, middle-pitch female voice, great for engaging and cheerful content.' },
    { conceptualName: 'Despina', apiName: 'Despina', gender: 'Female', category: 'Narration', language: 'English', tones: ['Calm', 'Neutral', 'Sleeping Story', 'Sad'], color: '#FF69B4', use_case: 'A smooth, middle-pitch female voice, ideal for relaxing and gentle narration.' },
    { conceptualName: 'Erinome', apiName: 'Erinome', gender: 'Female', category: 'Narration', language: 'English', tones: ['Fact', 'Documentary', 'Neutral', 'Formal'], color: '#FF69B4', use_case: 'A clear, middle-pitch female voice for informative and straightforward content.' },
    { conceptualName: 'Laomedeia', apiName: 'Laomedeia', gender: 'Female', category: 'Creative', language: 'English', tones: ['Happy', 'Cheerful', 'Excited', 'Dynamic'], color: '#FF69B4', use_case: 'An upbeat, higher-pitch female voice for energetic advertisements or vlogs.' },
    { conceptualName: 'Achernar', apiName: 'Achernar', gender: 'Female', category: 'Storytelling', language: 'English', tones: ['Sleeping Story', 'Kids Bedtime Story', 'Calm', 'Sad', 'Whispering'], color: '#FF69B4', use_case: 'A soft, higher-pitch female voice, perfect for bedtime stories and gentle narratives.' },
    { conceptualName: 'Pulcherrima', apiName: 'Pulcherrima', gender: 'Female', category: 'Narration', language: 'English', tones: ['Motivational', 'Dynamic', 'Formal'], color: '#FF69B4', use_case: 'A forward, middle-pitch female voice for confident and persuasive content.' },
    { conceptualName: 'Vindemiatrix', apiName: 'Vindemiatrix', gender: 'Female', category: 'Storytelling', language: 'English', tones: ['Calm', 'Sleeping Story', 'Sad', 'Kids Bedtime Story'], color: '#FF69B4', use_case: 'A gentle, middle-pitch female voice for soothing and heartfelt stories.' },
    { conceptualName: 'Sulafat', apiName: 'Sulafat', gender: 'Female', category: 'Storytelling', language: 'English', tones: ['Happy', 'Cheerful', 'Calm', 'Kids Bedtime Story'], color: '#FF69B4', use_case: 'A warm, middle-pitch female voice, ideal for friendly and comforting narration.' },

    // --- MALE VOICES ---
    { conceptualName: 'Puck', apiName: 'Puck', gender: 'Male', category: 'Creative', language: 'English', tones: ['Happy', 'Cheerful', 'Dynamic', 'Kids Bedtime Story'], color: '#1E90FF', use_case: 'An upbeat, middle-pitch male voice, great for animations and friendly content.' },
    { conceptualName: 'Charon', apiName: 'Charon', gender: 'Male', category: 'Narration', language: 'English', tones: ['Documentary', 'History', 'Fact', 'Nature/Geography', 'Formal', 'Ancient', 'Islamic History'], color: '#1E90FF', use_case: 'An informative, lower-pitch male voice, perfect for deep documentaries and historical content.' },
    { conceptualName: 'Fenrir', apiName: 'Fenrir', gender: 'Male', category: 'Dynamic', language: 'English', tones: ['Excited', 'Dynamic', 'Motivational', 'Shouting', 'Angry'], color: '#1E90FF', use_case: 'An excitable, lower-middle pitch male voice for high-energy trailers or action-packed narration.' },
    { conceptualName: 'Orus', apiName: 'Orus', gender: 'Male', category: 'Formal', language: 'English', tones: ['Formal', 'Fact', 'Motivational', 'History'], color: '#1E90FF', use_case: 'A firm, lower-middle pitch male voice for authoritative and serious content.' },
    { conceptualName: 'Enceladus', apiName: 'Enceladus', gender: 'Male', category: 'Storytelling', language: 'English', tones: ['Whispering', 'Fearful', 'Odd Story', 'Horror Story', 'Sleeping Story', 'Calm'], color: '#1E90FF', use_case: 'A breathy, lower-pitch male voice for ASMR, mysterious, or horror narratives.' },
    { conceptualName: 'Iapetus', apiName: 'Iapetus', gender: 'Male', category: 'Narration', language: 'English', tones: ['Fact', 'Documentary', 'Neutral'], color: '#1E90FF', use_case: 'A clear, lower-middle pitch male voice for straightforward and informative narration.' },
    { conceptualName: 'Umbriel', apiName: 'Umbriel', gender: 'Male', category: 'Creative', language: 'English', tones: ['Neutral', 'Calm'], color: '#1E90FF', use_case: 'An easy-going, lower-middle pitch male voice for casual and relaxed content.' },
    { conceptualName: 'Algieba', apiName: 'Algieba', gender: 'Male', category: 'Narration', language: 'English', tones: ['Calm', 'Sleeping Story', 'Sad', 'Neutral'], color: '#1E90FF', use_case: 'A smooth, lower-pitch male voice, perfect for deep, calming meditation or sleep stories.' },
    { conceptualName: 'Algenib', apiName: 'Algenib', gender: 'Male', category: 'Character', language: 'English', tones: ['Horror Story', 'Crime Story', 'Ancient', 'Fearful', 'Whispering', 'Taunting'], color: '#1E90FF', use_case: 'A gravelly, lower-pitch male voice for villains, horror stories, or ancient characters.' },
    { conceptualName: 'Rasalgethi', apiName: 'Rasalgethi', gender: 'Male', category: 'Narration', language: 'English', tones: ['Documentary', 'History', 'Fact', 'Formal', 'Ancient'], color: '#1E90FF', use_case: 'An informative, middle-pitch male voice, ideal for educational and historical content.' },
    { conceptualName: 'Alnilam', apiName: 'Alnilam', gender: 'Male', category: 'Formal', language: 'English', tones: ['Formal', 'Fact', 'Motivational'], color: '#1E90FF', use_case: 'A firm, lower-middle pitch male voice for powerful and assertive narration.' },
    { conceptualName: 'Schedar', apiName: 'Schedar', gender: 'Male', category: 'Narration', language: 'English', tones: ['Neutral', 'Calm', 'Formal'], color: '#1E90FF', use_case: 'An even, lower-middle pitch male voice for stable and balanced narration.' },
    { conceptualName: 'Gacrux', apiName: 'Gacrux', gender: 'Male', category: 'Storytelling', language: 'English', tones: ['History', 'Documentary', 'Ancient', 'Islamic History'], color: '#1E90FF', use_case: 'A mature, middle-pitch male voice, like a seasoned storyteller for historical epics.' },
    { conceptualName: 'Achird', apiName: 'Achird', gender: 'Male', category: 'Creative', language: 'English', tones: ['Happy', 'Cheerful', 'Neutral'], color: '#1E90FF', use_case: 'A friendly, lower-middle pitch male voice for conversational and welcoming content.' },
    { conceptualName: 'Zubenelgenubi', apiName: 'Zubenelgenubi', gender: 'Male', category: 'Creative', language: 'English', tones: ['Neutral', 'Calm'], color: '#1E90FF', use_case: 'A casual, lower-middle pitch male voice for relaxed, everyday narration.' },
    { conceptualName: 'Sadachbia', apiName: 'Sadachbia', gender: 'Male', category: 'Dynamic', language: 'English', tones: ['Dynamic', 'Excited', 'Happy'], color: '#1E90FF', use_case: 'A lively, lower-pitch male voice for energetic and engaging content.' },
    { conceptualName: 'Sadaltager', apiName: 'Sadaltager', gender: 'Male', category: 'Narration', language: 'English', tones: ['Fact', 'Documentary', 'History', 'Formal'], color: '#1E90FF', use_case: 'A knowledgeable, middle-pitch male voice for expert commentary and explainers.' },
];


// Helper ফাংশন
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); });
const formatBytes = (bytes: number, decimals = 2) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]; }
const getDeviceId = () => { let deviceId = localStorage.getItem('deviceId'); if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('deviceId', deviceId); } return deviceId; };
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }
const pcmToWav = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number) => { const dataSize = pcmData.length; const buffer = new ArrayBuffer(44 + dataSize); const view = new DataView(buffer); const writeString = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) { view.setUint8(offset + i, str.charCodeAt(i)); } }; const blockAlign = numChannels * (bitsPerSample / 8); const byteRate = sampleRate * blockAlign; writeString(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(8, 'WAVE'); writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); writeString(36, 'data'); view.setUint32(40, dataSize, true); new Uint8Array(buffer, 44).set(pcmData); return new Blob([view], { type: 'audio/wav' }); };
const splitScriptIntoMeaningfulChunks = (text: string, maxChunkLength = 2800): string[] => {
    if (!text) return [];

    const paragraphs = text.split(/(\r\n|\n){2,}/).filter(p => p && p.trim().length > 0);
    if (paragraphs.length === 0) return [];
    
    const chunks: string[] = [];
    let currentChunk = paragraphs[0];

    for (let i = 1; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        if (currentChunk.length + paragraph.length + 2 > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk += "\n\n" + paragraph;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
};
const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
const jsonValidator = (text: string): boolean => {
    if (!text || text.trim() === '') return false;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleaned) return false;
    try {
        JSON.parse(cleaned);
        return true;
    } catch {
        return false;
    }
};

const getErrorMessageSummary = (log: DetailedError): { en: string; bn: string } => {
    const message = log.message.toLowerCase();
    const details = log.details ? log.details.toLowerCase() : '';

    if (message.includes('all api keys have been disabled') || message.includes('all keys permanently failed')) {
        return {
            en: 'All API Keys Exhausted. All enabled API keys have reached their free usage limit for today. Please wait for the daily reset, add new keys, or upgrade to a paid plan.',
            bn: 'সমস্ত API Key ব্যবহৃত হয়ে গেছে। আপনার সব فعال API Key-এর আজকের বিনামূল্যে ব্যবহারের সীমা শেষ। অনুগ্রহ করে দৈনিক রিসেটের জন্য অপেক্ষা করুন, নতুন Key যোগ করুন, বা পেইড প্ল্যানে আপগ্রেড করুন।',
        };
    }
    if (message.includes('quota') || message.includes('limit: 0') || message.includes('resource_exhausted')) {
        return {
            en: 'API Quota Exceeded. The free usage limit for this API key has been reached for today. Please wait for it to reset, use another key, or upgrade to a paid plan.',
            bn: 'API কোটা শেষ। এই API Key-এর জন্য আজকের বিনামূল্যে ব্যবহারের সীমা শেষ হয়ে গেছে। দয়া করে কোটা রিসেট হওয়ার জন্য অপেক্ষা করুন, অন্য Key ব্যবহার করুন, অথবা পেইড প্ল্যানে আপগ্রেড করুন।',
        };
    }
    if (message.includes('api key not valid') || message.includes('api_key_invalid')) {
        return {
            en: 'Invalid API Key. The provided API key is incorrect or has been disabled. Please check the key in your API Key Management section.',
            bn: 'অবৈধ API Key। আপনার দেওয়া API Key-টি ভুল অথবা নিষ্ক্রিয় করা হয়েছে। দয়া করে API Key Management সেকশনে আপনার Key-টি পরীক্ষা করুন।',
        };
    }
    if (message.includes('paused_by_circuit_breaker')) {
        return {
            en: 'Paused by Circuit Breaker. The process was automatically stopped after multiple consecutive API failures to protect your resources. Check previous errors to identify the root cause.',
            bn: 'সার্কিট ব্রেকার দ্বারা থামানো হয়েছে। একাধিকবার API ব্যর্থ হওয়ার কারণে আপনার রিসোর্স बचाने জন্য প্রক্রিয়াটি স্বয়ংক্রিয়ভাবে বন্ধ করা হয়েছে। মূল কারণ জানতে পূর্ববর্তী error-গুলো দেখুন।',
        };
    }
     if (message.includes('safety') || message.includes('blocked')) {
        return {
            en: 'Content blocked by Safety Policy. The AI refused to generate the content based on the prompt due to safety filters. Please try rephrasing the prompt for the failed item.',
            bn: 'সেফটি পলিসির কারণে কন্টেন্ট ব্লক করা হয়েছে। সেফটি ফিল্টারের কারণে AI আপনার দেওয়া প্রম্পটের উপর ভিত্তি করে কন্টেন্ট তৈরি করতে রাজি হয়নি। দয়া করে ব্যর্থ হওয়া আইটেমের প্রম্পটটি পরিবর্তন করে আবার চেষ্টা করুন।',
        };
    }
    if (message.includes('network error') || message.includes('fetch')) {
        return {
            en: 'Network Error. Could not connect to the Google API server. Please check your internet connection.',
            bn: 'নেটওয়ার্ক সমস্যা। Google API সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।',
        };
    }
    return {
        en: 'An unexpected error occurred. Please check the technical details for more information.',
        bn: 'একটি অপ্রত্যাশিত সমস্যা ঘটেছে। আরও তথ্যের জন্য অনুগ্রহ করে টেকনিক্যাল বিবরণ দেখুন।',
    };
};


// Custom Audio Player Component
const AudioPlayer = ({ src, onDownload, title }: { src: string, onDownload: () => void, title?: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };
    
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setCurrentTime(Number(e.target.value));
        }
    };

    return (
        <div className="custom-audio-player">
             <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
            <button onClick={handlePlayPause} className="player-play-btn">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="player-progress-bar-container">
                {title && <strong>{title}:&nbsp;</strong>}
                 <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="player-seek-slider"
                />
                <span className="player-time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <button onClick={onDownload} className="player-download-btn" title="Download Audio">
                <DownloadIcon />
            </button>
        </div>
    );
};


// Confirmation Modal Component
const ConfirmationModal = ({ onConfirm, onCancel, imageCount, isAutopilot } : { onConfirm: () => void, onCancel: () => void, imageCount: number, isAutopilot: boolean }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Confirm Generation</h3>
            <p>You are about to generate prompts and <strong>{imageCount} images</strong>. This may take some time.</p>
            {isAutopilot && <p className="autopilot-warning"><strong>Autopilot is ON.</strong> The app will automatically retry failed images and download the ZIP/prompts when complete.</p>}
            <p>Do you want to proceed?</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
                <button onClick={onConfirm} className="confirm-btn">Confirm & Generate</button>
            </div>
        </div>
    </div>
);

// Mismatch Warning Modal Component
const MismatchWarningModal = ({ onConfirm, onCancel, fromModel, toModel }: { onConfirm: () => void; onCancel: () => void; fromModel: string; toModel: string; }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Prompt Mismatch Warning</h3>
            <p>Your video prompts were generated for the "<strong>{fromModel}</strong>" model, but you are about to generate videos with "<strong>{toModel}</strong>".</p>
            <p>The prompt style may not be optimal. You can cancel to review and edit the video prompts, or proceed with the generation anyway.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel & Edit</button>
                <button onClick={onConfirm} className="confirm-btn">Proceed Anyway</button>
            </div>
        </div>
    </div>
);


// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ projectName, onConfirm, onCancel } : { projectName: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Delete Project</h3>
            <p>Are you sure you want to permanently delete the project "<strong>{projectName}</strong>"?</p>
            <p>This action cannot be undone.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
                <button onClick={onConfirm} className="confirm-btn delete-confirm-btn">Delete</button>
            </div>
        </div>
    </div>
);

// Clear All Projects Confirmation Modal Component
const ClearAllProjectsConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Clear All Projects</h3>
            <p>Are you sure you want to permanently delete <strong>ALL</strong> saved projects from your browser?</p>
            <p>This action cannot be undone. Your settings and API keys will not be affected.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
                <button onClick={onConfirm} className="confirm-btn delete-confirm-btn">Confirm & Delete All</button>
            </div>
        </div>
    </div>
);

// LogViewer Component with corrected React.ReactElement type
const LogViewer = React.forwardRef<HTMLDivElement, { title: string, icon: React.ReactElement, logs: (DetailedError | NotificationLogItem)[], onClear: () => void, type: 'error' | 'notification' }>(({ title, icon, logs, onClear, type }, ref) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    if (logs.length === 0) return null;

    const isErrorLog = (log: any): log is DetailedError => type === 'error';

    const handleCopy = (log: DetailedError | NotificationLogItem) => {
        const textToCopy = isErrorLog(log)
            ? `Timestamp: ${log.timestamp}\nOperation: ${log.operation}\nTitle: ${log.title}\nMessage: ${log.message}\n\nDetails:\n${log.details}`
            : `Timestamp: ${log.timestamp}\nMessage: ${log.message}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(log.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div ref={ref} className={`log-card ${type}-log-card card`}>
            <div className="log-header">
                <h3>{icon} {title} ({logs.length})</h3>
                <button onClick={onClear} className="clear-log-btn">Clear Log</button>
            </div>
            <div className="log-list">
                {logs.map(log => {
                    const summary = isErrorLog(log) ? getErrorMessageSummary(log) : null;
                    return (
                        <details key={log.id} className="log-item" open style={{ position: 'relative' }}>
                             {isErrorLog(log) && (
                                <button
                                    onClick={() => handleCopy(log)}
                                    title="Copy Log Details"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    {copiedId === log.id ? <CheckIcon /> : <CopyIcon />}
                                </button>
                            )}
                            <summary>
                                <span className="log-timestamp">{log.timestamp}</span>
                                {isErrorLog(log) && <strong className="log-operation">{log.operation}</strong>}
                                <span className="log-title">{isErrorLog(log) ? log.title : log.message}</span>
                            </summary>
                            {isErrorLog(log) && (
                                <div className="log-details">
                                    <div style={{
                                         background: 'rgba(255, 255, 255, 0.05)',
                                         border: '1px solid var(--border)',
                                         borderRadius: 'var(--base-radius)',
                                         padding: '0.75rem',
                                         margin: '0.75rem 0 0 0',
                                         fontSize: '0.9rem',
                                         whiteSpace: 'pre-wrap'
                                    }}>
                                        <p><strong>[EN] Summary:</strong> {summary?.en}</p>
                                        <p><strong>[BN] সারসংক্ষেপ:</strong> {summary?.bn}</p>
                                    </div>
                                    <p><strong>Message:</strong> {log.message}</p>
                                    {log.details && <pre><strong>Technical Details:</strong><code>{log.details}</code></pre>}
                                </div>
                            )}
                        </details>
                    )
                })}
            </div>
        </div>
    );
});


// মূল অ্যাপ কম্পונেন্ট
function App() {
    // State ভ্যারিয়েবলগুলো
    const [appLocked, setAppLocked] = useState(true);
    const [emailInput, setEmailInput] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [lockError, setLockError] = useState('');
    const [lockSuccess, setLockSuccess] = useState('');
    const [lockMessage, setLockMessage] = useState('Please enter your details to access the application.');
    const [verifying, setVerifying] = useState(false);
    const [script, setScript] = useState('');
    const scriptRef = useRef(script);
    useEffect(() => { scriptRef.current = script; }, [script]);
    const [results, setResults] = useState<SceneResult[]>([]);
    const [errorLog, setErrorLog] = useState<DetailedError[]>([]);
    const [notificationLog, setNotificationLog] = useState<NotificationLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number>(1);
    const [videoDurationSec, setVideoDurationSec] = useState<number>(0);
    const [imageCount, setImageCount] = useState<number>(12);
    const [aspectRatio, setAspectRatio] = useState<string>('16:9');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
    const [cameraAngle, setCameraAngle] = useState<string>('Default');
    const [scriptType, setScriptType] = useState('text');
    const [fileName, setFileName] = useState('');
    const [themesVisible, setThemesVisible] = useState(false);
    const [modifiersVisible, setModifiersVisible] = useState(false);
    const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
    const [isRephrasing, setIsRephrasing] = useState(false);
    const [rephrasingProgress, setRephrasingProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const refImageInputRef = useRef<HTMLInputElement>(null);
    const [theme, setTheme] = useState('dark');
    const [palette, setPalette] = useState('dark');
    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [newApiKey, setNewApiKey] = useState('');
    const [enabledApiKeys, setEnabledApiKeys] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageModel, setImageModel] = useState('imagen-4.0-generate-001');
    const stopGenerationRef = useRef(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0);
    const [copiedInfo, setCopiedInfo] = useState<string | null>(null);
    const [projectName, setProjectName] = useState('My AI Project');
    const [savedProjects, setSavedProjects] = useState<string[]>([]);
    const [scriptIdea, setScriptIdea] = useState('');
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isGeneratingVideoPrompts, setIsGeneratingVideoPrompts] = useState(false);
    const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]);
    const [isAnalyzingCharacter, setIsAnalyzingCharacter] = useState<string | null>(null);
    const [isAnalyzingScriptContent, setIsAnalyzingScriptContent] = useState(false);
    const characterImageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [aboutVisible, setAboutVisible] = useState(false);
    const [usageVisible, setUsageVisible] = useState(false);
    const [apiUsageVisible, setApiUsageVisible] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('poorly drawn hands, blurry, watermark, text, signature, deformed, ugly, bad anatomy');
    const [useNegativePrompt, setUseNegativePrompt] = useState(true);
    const [stylePresets, setStylePresets] = useState<StylePreset[]>([]);
    const [newPresetName, setNewPresetName] = useState('');
    const [videoModel, setVideoModel] = useState('Veo 3.1');
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [videoPromptBasis, setVideoPromptBasis] = useState('image-driven');
    const [includeDialogue, setIncludeDialogue] = useState(false);
    const [includeAmbient, setIncludeAmbient] = useState(false);
    const [includeSfx, setIncludeSfx] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
    const [voiceoverScript, setVoiceoverScript] = useState('');
    const voiceoverScriptRef = useRef(voiceoverScript);
    useEffect(() => { voiceoverScriptRef.current = voiceoverScript; }, [voiceoverScript]);
    const [customTtsPrompt, setCustomTtsPrompt] = useState('');
    const [ttsConfig, setTtsConfig] = useState<TTSConfig>({ voice: 'Zephyr', tone: 'Neutral', speed: 1.0 });
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [generatedAudioBytes, setGeneratedAudioBytes] = useState<Uint8Array | null>(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
    const [isAuditioning, setIsAuditioning] = useState<string | null>(null);
    const [currentAudition, setCurrentAudition] = useState<AudioBufferSourceNode | null>(null);
    const [isAutoConfiguringVoice, setIsAutoConfiguringVoice] = useState(false);
    const stopAudioGenerationRef = useRef(false);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const [isAutopilot, setIsAutopilot] = useState(false);
    const [isFittingScript, setIsFittingScript] = useState(false);
    const [forceSpeed, setForceSpeed] = useState(false);
    const [isGeneratingSample, setIsGeneratingSample] = useState(false);
    const [sampleAudioUrl, setSampleAudioUrl] = useState<string | null>(null);
    const resultsRef = useRef<SceneResult[]>(results);
    useEffect(() => { resultsRef.current = results; }, [results]);
    const enabledApiKeysRef = useRef(enabledApiKeys);
    useEffect(() => { enabledApiKeysRef.current = enabledApiKeys; }, [enabledApiKeys]);
    const currentApiKeyIndexRef = useRef(currentApiKeyIndex);
    useEffect(() => { currentApiKeyIndexRef.current = currentApiKeyIndex; }, [currentApiKeyIndex]);
    const [isDraggingRef, setIsDraggingRef] = useState(false);
    const [isDraggingChar, setIsDraggingChar] = useState<string | null>(null);
    const [storageUsage, setStorageUsage] = useState({ used: '0', percentage: 0 });
    const [selectedTone, setSelectedTone] = useState('All Tones');
    const [apiKeyCooldowns, setApiKeyCooldowns] = useState<{ [key: string]: number }>({});
    const [showClearAllProjectsConfirm, setShowClearAllProjectsConfirm] = useState(false);
    const consecutiveApiFailuresRef = useRef(0);
    const [isPausedByCircuitBreaker, setIsPausedByCircuitBreaker] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [generateUniqueStory, setGenerateUniqueStory] = useState(false);
    const [disabledKeysForSession, setDisabledKeysForSession] = useState<string[]>([]);
    const [allKeysPermanentlyFailed, setAllKeysPermanentlyFailed] = useState(false);
    const allKeysPermanentlyFailedRef = useRef(allKeysPermanentlyFailed);
    useEffect(() => { allKeysPermanentlyFailedRef.current = allKeysPermanentlyFailed; }, [allKeysPermanentlyFailed]);


    // Refs for scrolling to logs
    const notificationLogRef = useRef<HTMLDivElement>(null);
    const errorLogRef = useRef<HTMLDivElement>(null);


    // Video Generation States
    const [hasVeoApiKey, setHasVeoApiKey] = useState(false);
    const [selectedScenesForVideo, setSelectedScenesForVideo] = useState<number[]>([]);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState<{ [key: number]: VideoGenerationStatus }>({});
    const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
    const [showMismatchWarning, setShowMismatchWarning] = useState(false);
    const stopVideoGenerationRef = useRef(false);

    // Audio Chunk Generation States
    const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
    const [isGeneratingChunks, setIsGeneratingChunks] = useState(false);
    const stopChunkGenerationRef = useRef(false);
    const audioChunksRef = useRef(audioChunks);
    useEffect(() => { audioChunksRef.current = audioChunks; }, [audioChunks]);
    const [isMergingAudio, setIsMergingAudio] = useState(false);

    // Master Autopilot States
    const [isAutopilotModalVisible, setIsAutopilotModalVisible] = useState(false);
    const [autopilotProgress, setAutopilotProgress] = useState<{ step: number; totalSteps: number; stepId: number, message: string; isError: boolean } | null>(null);
    const [autopilotCompleted, setAutopilotCompleted] = useState(false);
    const [rephraseInAutopilot, setRephraseInAutopilot] = useState(true);
    const [useAiToAutoConfigureVoiceover, setUseAiToAutoConfigureVoiceover] = useState(true);
    const [useUserSelectedVoiceInAutopilot, setUseUserSelectedVoiceInAutopilot] = useState(true);
    const [autopilotVoiceGender, setAutopilotVoiceGender] = useState<'any' | 'male' | 'female'>('any');
    const [autopilotElapsedTime, setAutopilotElapsedTime] = useState(0);
    const autopilotTimerRef = useRef<number | null>(null);
    const autopilotStopRef = useRef(false);
    const [autopilotSteps, setAutopilotSteps] = useState([
        { id: 1, text: 'Rephrase Script for Copyright' },
        { id: 2, text: 'Analyze Script, Characters & Style' },
        { id: 3, text: 'Generate Image Prompts & Images' },
        { id: 4, text: 'Generate Video Prompts' },
        { id: 5, text: 'Prepare & Download Assets (Images & Prompts)' },
        { id: 6, text: 'Generate & Download Voiceover' },
    ]);
    const [isAutopilotPaused, setIsAutopilotPaused] = useState(false);
    const autopilotPauseRef = useRef(false);


    const getAiClient = (apiKeyOverride?: string) => {
        if (apiKeyOverride) {
            return new GoogleGenAI({ apiKey: apiKeyOverride });
        }
        const activeKeys = enabledApiKeysRef.current;
        if (activeKeys.length === 0) { throw new Error("No API Key available. Please add and enable a key in 'API Key Management'."); }
        const keyIndex = currentApiKeyIndexRef.current % activeKeys.length;
        const apiKey = activeKeys[keyIndex];
        return new GoogleGenAI({ apiKey });
    };
    
    const handleError = (error: any, operation: string, context: Record<string, any> = {}) => {
        let title = `Error during ${operation}`;
        let message = "An unknown error occurred.";
        let originalError = error;
    
        if (error instanceof Error) {
            message = error.message;
            if (message.includes('fetch')) {
                title = 'Network Error';
                message = 'Could not connect to API. Check internet connection.';
            }
        } else if (typeof error === 'string') {
            message = error;
        }
    
        // Attempt to parse Google API error structure
        if (error?.message) {
            try {
                const parsed = JSON.parse(error.message);
                if (parsed.error?.message) {
                    message = parsed.error.message;
                    originalError = parsed.error; // Keep the detailed error object
                }
            } catch (e) {/* Not a JSON string */}
        }
    
        const newError: DetailedError = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            title,
            message,
            operation,
            details: JSON.stringify({ error: originalError, context }, null, 2),
        };
        setErrorLog(prev => [newError, ...prev]);
        showNotification(`${title}: ${message.substring(0, 50)}...`, true);
    };

    const executeGenerativeAiTask = async (
        model: string, 
        contents: any, 
        operation: string,
        validator?: (text: string) => boolean
    ): Promise<GenerateContentResponse> => {
        const TOTAL_MAX_ATTEMPTS_PER_TASK = 5;
        let success = false;
        let totalAttempts = 0;
        let result: any = null;
    
        while (!success && totalAttempts < TOTAL_MAX_ATTEMPTS_PER_TASK) {
            if (stopGenerationRef.current) throw new Error("stopped");
            if (allKeysPermanentlyFailedRef.current) throw new Error("All API keys have been disabled due to permanent errors. Please check your keys.");

            totalAttempts++;
    
            const activeKeys = enabledApiKeysRef.current.filter(k => !disabledKeysForSession.includes(k));
            if (activeKeys.length === 0) { 
                 if (enabledApiKeysRef.current.length > 0 && disabledKeysForSession.length >= enabledApiKeysRef.current.length) {
                    throw new Error("All available API keys have been disabled due to permanent errors. Please check your keys.");
                }
                throw new Error("No enabled & active API keys.");
            }
    
            let selectedKey: string | null = null;
            const now = Date.now();
            let nextAvailableKeyIndex = -1;
    
            for (let i = 0; i < activeKeys.length; i++) {
                const keyIndex = (currentApiKeyIndexRef.current + i) % activeKeys.length;
                const key = activeKeys[keyIndex];
                const cooldownExpiry = apiKeyCooldowns[key];
                if (!cooldownExpiry || now > cooldownExpiry) {
                    nextAvailableKeyIndex = keyIndex;
                    break;
                }
            }
    
            if (nextAvailableKeyIndex !== -1) {
                const previousKey = activeKeys[currentApiKeyIndexRef.current];
                selectedKey = activeKeys[nextAvailableKeyIndex];
                setCurrentApiKeyIndex(nextAvailableKeyIndex);
                if (previousKey !== selectedKey) {
                    showNotification(`Switching to API Key: ...${selectedKey.slice(-4)}`);
                }
            } else {
                let soonestExpiry = Infinity;
                Object.values(apiKeyCooldowns).forEach((expiry: number) => {
                    if (expiry < soonestExpiry) soonestExpiry = expiry;
                });
                const waitTime = Math.max(0, soonestExpiry - now);
                showNotification(`All keys on cooldown. Waiting ${Math.round(waitTime / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime + 500));
                continue;
            }
    
            try {
                const ai = getAiClient(selectedKey);
                result = await ai.models.generateContent({ model, contents });
                
                if (validator && !validator(result.text)) {
                    throw new Error("Content validation failed: AI returned invalid format or empty response.");
                }

                success = true;
                consecutiveApiFailuresRef.current = 0;
            } catch (e: any) {
                const failedKey = selectedKey;
                const isContentError = e.message.includes("Content validation failed");
                
                if (isContentError) {
                    handleError(e, `Content Error on ${operation}`, { apiKey: failedKey, attempt: totalAttempts });
                } else {
                    handleError(e, `API Error on ${operation}`, { apiKey: failedKey, attempt: totalAttempts });
                }
                
                const isPermanentFailure = e.message?.includes('limit: 0') || e.message?.includes('API key not valid') || e.message?.includes('API_KEY_INVALID');
                if (isPermanentFailure) {
                    setDisabledKeysForSession(prev => {
                        const newDisabled = [...new Set([...prev, failedKey])];
                        if (newDisabled.length >= enabledApiKeysRef.current.length) {
                            setAllKeysPermanentlyFailed(true);
                        }
                        return newDisabled;
                    });
                    showNotification(`API Key ...${failedKey.slice(-4)} is invalid or has billing issues. Disabling for this session.`, true);
                } else {
                    setApiKeyCooldowns(prev => ({ ...prev, [failedKey]: Date.now() + 61000 }));
                    consecutiveApiFailuresRef.current++;
                    if (consecutiveApiFailuresRef.current >= 3) {
                        const circuitBreakerMsg = "Circuit Breaker: Paused due to 3 consecutive API errors. Check your keys and logs.";
                        showNotification(circuitBreakerMsg, true);
                        setIsPausedByCircuitBreaker(true);
                        stopGenerationRef.current = true;
                        throw new Error("PAUSED_BY_CIRCUIT_BREAKER");
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    
        if (!success) {
            const finalError = new Error(`Failed operation "${operation}" after ${TOTAL_MAX_ATTEMPTS_PER_TASK} attempts across all keys.`);
            handleError(finalError, `Total Failure on ${operation}`);
            throw finalError;
        }
    
        return result;
    };


    // ফাংশনগুলো
    const showNotification = (message: string, isError: boolean = false) => {
        const id = Date.now();
        const timestamp = new Date().toLocaleTimeString();
        setNotifications(prev => [...prev, { id, message }]);
        if (!isError) {
            setNotificationLog(prev => [{ id, timestamp, message }, ...prev]);
        }
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };
    
    const loadSavedProjects = async () => {
        try {
            const projects = await dbHelper.getAllProjectNames();
            setSavedProjects(projects.sort());
        } catch (e: any) {
            handleError(e, "loading project list");
        }
    };

    const calculateStorageUsage = async () => {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const usageMB = (estimate.usage || 0) / 1024 / 1024;
            const quotaMB = (estimate.quota || 0) / 1024 / 1024;
            const percentage = quotaMB > 0 ? Math.min((usageMB / quotaMB) * 100, 100) : 0;
            setStorageUsage({ used: usageMB.toFixed(2), percentage });
        }
    };


    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        if (userEmail) setEmailInput(userEmail);
        if (userName) setUsername(userName);
        const validateExistingSession = async () => {
            const expiryDateStr = localStorage.getItem('expiryDate');
            const userPhone = localStorage.getItem('userPhone');
            if (userEmail && expiryDateStr && userName) {
                const expiryDate = new Date(expiryDateStr);
                if (new Date() < expiryDate) {
                    setVerifying(true);
                    setLockMessage("Verifying your license...");
                    const webAppUrl = 'https://script.google.com/macros/s/AKfycbw48T5zd0wizhXYRdiHXywc7Id9RsiNeEmLgst83xCzOvexr2DC8ZhWf1klP2RNFcPWxQ/exec';
                    const deviceId = getDeviceId();
                    try {
                        const response = await fetch(webAppUrl, { method: 'POST', mode: 'cors', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ email: userEmail, username: userName, phoneNumber: userPhone || '', deviceId: deviceId }), redirect: 'follow' });
                        const result = await response.json();
                        if (result.success) {
                            localStorage.setItem('expiryDate', result.expiryDate);
                            setAppLocked(false);
                        } else {
                            setAppLocked(true);
                            setLockMessage(result.message || "Your license is no longer valid. Please log in again.");
                            localStorage.removeItem('userEmail');
                            localStorage.removeItem('expiryDate');
                            localStorage.removeItem('userName');
                            localStorage.removeItem('userPhone');
                        }
                    } catch (error) {
                        setAppLocked(true);
                        setLockMessage('Could not connect to the verification server. Please check your internet connection.');
                    } finally {
                        setVerifying(false);
                    }
                } else {
                    setAppLocked(true);
                    setLockMessage("Your license has expired. Please log in again.");
                    localStorage.clear();
                }
            } else {
                setAppLocked(true);
                setLockMessage('Please enter your details to access the application.');
            }
        };
        validateExistingSession();
    }, []);
    useEffect(() => { const savedTheme = localStorage.getItem('appTheme') || 'dark'; setTheme(savedTheme); const savedPalette = localStorage.getItem('appPalette') || 'dark'; setPalette(savedPalette); const savedKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]'); const savedEnabledKeys = JSON.parse(localStorage.getItem('enabledApiKeys') || '[]'); setApiKeys(savedKeys); setEnabledApiKeys(savedEnabledKeys); const savedPresets = JSON.parse(localStorage.getItem('stylePresets') || '[]'); setStylePresets(savedPresets); loadSavedProjects(); calculateStorageUsage(); }, []);
    useEffect(() => { document.body.setAttribute('data-theme', theme); document.body.setAttribute('data-palette', palette); localStorage.setItem('appTheme', theme); localStorage.setItem('appPalette', palette); }, [theme, palette]);
    useEffect(() => { const totalSeconds = (videoDuration * 60) + (videoDurationSec || 0); if (totalSeconds > 0) { setImageCount(Math.ceil(totalSeconds / 5)); } else { setImageCount(1); } }, [videoDuration, videoDurationSec]);
    
    // Effect to check Veo API key status on mount
    useEffect(() => {
        const checkVeoKey = async () => {
            if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
                setHasVeoApiKey(true);
            }
        };
        checkVeoKey();
    }, []);

    // Effect for scroll-to-top button visibility
    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScrollButton && window.pageYOffset > 400) {
                setShowScrollButton(true);
            } else if (showScrollButton && window.pageYOffset <= 400) {
                setShowScrollButton(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        return () => {
            window.removeEventListener('scroll', checkScrollTop);
        };
    }, [showScrollButton]);
    
    useEffect(() => {
        const handleGlobalDragEnd = () => {
            setIsDraggingRef(false);
            setIsDraggingChar(null);
        };

        window.addEventListener('drop', handleGlobalDragEnd, true);
        window.addEventListener('dragend', handleGlobalDragEnd, true);

        return () => {
            window.removeEventListener('drop', handleGlobalDragEnd, true);
            window.removeEventListener('dragend', handleGlobalDragEnd, true);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleUnlock = async () => { setLockError(''); setLockSuccess(''); const email = emailInput.trim(); if (!email || !/\S+@\S+\.\S+/.test(email) || !username.trim() || !phoneNumber.trim()) { setLockError('Please enter a valid email, your name, and your phone number.'); return; } setVerifying(true); const webAppUrl = 'https://script.google.com/macros/s/AKfycbw48T5zd0wizhXYRdiHXywc7Id9RsiNeEmLgst83xCzOvexr2DC8ZhWf1klP2RNFcPWxQ/exec'; const deviceId = getDeviceId(); try { const response = await fetch(webAppUrl, { method: 'POST', mode: 'cors', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ email: email, username: username.trim(), phoneNumber: phoneNumber.trim(), deviceId: deviceId }), redirect: 'follow' }); const result = await response.json(); if (result.success) { localStorage.setItem('userEmail', result.email); localStorage.setItem('expiryDate', result.expiryDate); localStorage.setItem('userName', username.trim()); if (phoneNumber.trim()) { localStorage.setItem('userPhone', phoneNumber.trim()); } setAppLocked(false); showNotification("Application unlocked successfully!"); } else { const message = result.message || 'Verification failed. Please try again.'; if (message.includes('pending') || message.includes('successful')) { setLockSuccess(message); } else { setLockError(message); } } } catch (error) { console.error("Verification error:", error); setLockError('Could not connect to the verification server. Check your internet connection.'); } finally { setVerifying(false); } };
    const handleAddApiKey = () => { if (newApiKey && !apiKeys.includes(newApiKey)) { const updatedKeys = [...apiKeys, newApiKey]; setApiKeys(updatedKeys); localStorage.setItem('apiKeys', JSON.stringify(updatedKeys)); handleToggleApiKey(newApiKey, true); setNewApiKey(''); showNotification("API Key added and enabled."); } };
    const handleRemoveApiKey = (keyToRemove: string) => { const updatedKeys = apiKeys.filter(key => key !== keyToRemove); const updatedEnabled = enabledApiKeys.filter(key => key !== keyToRemove); setApiKeys(updatedKeys); setEnabledApiKeys(updatedEnabled); localStorage.setItem('apiKeys', JSON.stringify(updatedKeys)); localStorage.setItem('enabledApiKeys', JSON.stringify(updatedEnabled)); showNotification("API Key removed."); };
    const handleToggleApiKey = (key: string, forceEnable = false) => { setEnabledApiKeys(prev => { const isEnabled = prev.includes(key); let newEnabledKeys; if (forceEnable) { newEnabledKeys = [...new Set([...prev, key])]; } else { newEnabledKeys = isEnabled ? prev.filter(k => k !== key) : [...prev, key]; } localStorage.setItem('enabledApiKeys', JSON.stringify(newEnabledKeys)); return newEnabledKeys; }); };
    const handleThemeChange = (theme: string) => { setSelectedThemes(prev => prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]); };
    const handleModifierChange = (modifier: string) => { setSelectedModifiers(prev => prev.includes(modifier) ? prev.filter(m => m !== modifier) : [...prev, modifier]); };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { setFileName(file.name); const reader = new FileReader(); reader.onload = (e) => { setScript(e.target?.result as string); }; reader.readAsText(file); } };
    const handleDeleteReferenceFile = (fileName: string) => { setReferenceFiles(prev => prev.filter(f => f.name !== fileName)); };
    const copyToClipboard = (text: string, identifier: string) => { navigator.clipboard.writeText(text); showNotification("Copied to clipboard!"); setCopiedInfo(identifier); setTimeout(() => { setCopiedInfo(null); }, 2000); };
    
    const processUploadedFiles = async (files: File[]) => {
        const newFiles: ReferenceFile[] = [];
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const dataUrl = await fileToBase64(file);
                newFiles.push({ name: file.name, size: formatBytes(file.size), dataUrl, file });
            }
        }
        setReferenceFiles(prev => [...prev, ...newFiles]);
        if (newFiles.length > 0) {
            autoDetectStyles(newFiles[0].file!);
        }
    };

    const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        processUploadedFiles(Array.from(files));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingRef(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processUploadedFiles(Array.from(files));
        }
    };
    
    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    processUploadedFiles([file]);
                }
            }
        }
    };
    
    const autoDetectStyles = async (file: File) => {
        setIsAnalyzing(true);
        showNotification('Analyzing reference image... Est. time: ~10s');
        try {
            const base64Data = (await fileToBase64(file)).split(',')[1];
            const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
            const visionPrompt = `Analyze this image to identify its primary themes and artistic modifiers. Your response MUST be a single, comma-separated string of keywords. You MUST ONLY use keywords from these two lists, prioritizing the most dominant visual elements:\n- Themes: ${themeOptions.join(', ')}\n- Modifiers: ${styleModifiers.join(', ')}\n\nYour response should be only the keywords. Example response: Horror, Cinematic, 4K, Film Grain`;
            
            const response = await executeGenerativeAiTask('gemini-2.5-flash', { parts: [imagePart, { text: visionPrompt }] }, 'image style analysis');

            const keywordsText = response.text;
            if (keywordsText) {
                const keywords = keywordsText.split(',').map((k: string) => k.trim());
                setSelectedThemes(prev => [...new Set([...prev, ...keywords.filter((k: string) => themeOptions.includes(k))])]);
                setSelectedModifiers(prev => [...new Set([...prev, ...keywords.filter((k: string) => styleModifiers.includes(k))])]);
                showNotification("Styles auto-detected from image!");
            }
        } catch (e: any) {
            if (e.message !== "stopped") handleError(e, 'image analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const generateImage = async (index: number, prompt: string, apiKey: string): Promise<string> => {
        setResults(prev => prev.map((r, i) => i === index ? { ...r, imageStatus: 'loading', error: undefined } : r));
        const ai = new GoogleGenAI({ apiKey });
        let imageUrl = '';
    
        if (imageModel === 'imagen-4.0-generate-001') {
            let finalPrompt = prompt;
            if (useNegativePrompt && negativePrompt.trim()) {
                finalPrompt = `${prompt}, negative prompt: ${negativePrompt.trim()}`;
            }
    
            const config: {
                numberOfImages: number;
                outputMimeType: 'image/jpeg';
                aspectRatio: any;
            } = {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as any,
            };
    
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: config,
            });
    
            if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image?.imageBytes) {
                throw new Error("Image generation failed, likely due to a safety policy violation. The response did not contain image data.");
            }
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        } else { // gemini-2.5-flash-image
            let finalPrompt = prompt;
            if (useNegativePrompt && negativePrompt.trim()) {
                 finalPrompt = `${prompt}, do not include the following: ${negativePrompt.trim()}`;
            }
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: finalPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
                    break;
                }
            }
            if (!imageUrl) { throw new Error("Nano Banana model did not return an image."); }
        }
        setResults(prev => prev.map((r, i) => i === index ? { ...r, imageUrl, imageStatus: 'completed' } : r));
        return imageUrl;
    };
    
    const handleRegenerateImage = (index: number) => { const prompt = results[index].image_prompt; executeSingleImageGeneration(index, prompt); showNotification(`Regenerating image for Scene ${index + 1}...`); };
    const handlePromptChange = (index: number, newPrompt: string, type: 'image' | 'video') => {
        setResults(prev => prev.map((r, i) => {
            if (i === index) {
                return type === 'image' ? { ...r, image_prompt: newPrompt } : { ...r, video_prompt: newPrompt };
            }
            return r;
        }));
    };
    const handleStopGeneration = () => { stopGenerationRef.current = true; showNotification("Stopping generation process..."); };
    
    const autoConfigureVoiceover = async (scriptText: string, genderPreference: 'any' | 'male' | 'female' = 'any', keepExistingVoice: boolean = false) => {
        if (!scriptText.trim()) return;
        setIsAutoConfiguringVoice(true);
        showNotification("AI is auto-configuring voiceover settings... Est. time: ~20s");
        try {
            const filteredVoices = ttsVoices.filter(v => 
                genderPreference === 'any' || v.gender.toLowerCase() === genderPreference
            );
            const availableVoices = filteredVoices.map(v => `${v.conceptualName} (${v.gender}, API: ${v.apiName})`).join('; ');
    
            const prompt = `You are an expert script analyst and voiceover director. Your task is to analyze the following script and automatically generate the optimal configuration for an AI Text-to-Speech (TTS) engine.
    
    **Available TTS Voices:**
    ${availableVoices}
    
    **Your instructions are:**
    1.  **Extract Voiceover Text:** Read the script and extract only the dialogue and narration parts suitable for a single voiceover. Omit all scene headings, action descriptions, camera directions (e.g., "EXT. FOREST - DAY"), and character names in parentheses. The result should be a clean, readable script for the TTS engine.
    2.  **Select the Best Voice:** Based on the script's theme, tone, and content, choose the most appropriate voice from the **Available TTS Voices** list. You must return its unique name (e.g., "Aria (Narrator)").
    3.  **Suggest Speaking Speed:** Recommend an ideal speaking speed as a number between 0.7 (very slow) and 1.3 (very fast). The default is 1.0.
    4.  **Create a Custom Prompt:** Write a detailed, descriptive custom prompt for the AI voice. This prompt should guide the emotion, tone, and delivery style. For example: "Spoken with a sense of urgency and fear, as if being chased." or "A calm, reassuring narrator telling a bedtime story."
    5.  **Format the Output:** You MUST return your response as a single, valid JSON object. Do not include any other text, explanations, or markdown formatting. The JSON object must have these exact keys: "voiceoverScript", "selectedVoice", "suggestedSpeed", "customPrompt".
    
    **Here is the script:**
    ---
    ${scriptText}
    ---`;
            const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'auto-configure voiceover', jsonValidator);

            const responseText = result.text;
            const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanedJson);
            
            if (parsedData.voiceoverScript) setVoiceoverScript(parsedData.voiceoverScript);
            if (parsedData.customPrompt) setCustomTtsPrompt(parsedData.customPrompt);
            if (!keepExistingVoice && parsedData.selectedVoice && ttsVoices.some(v => v.conceptualName === parsedData.selectedVoice)) {
                setTtsConfig(prev => ({ ...prev, voice: parsedData.selectedVoice }));
            }
            if (typeof parsedData.suggestedSpeed === 'number') {
                setTtsConfig(prev => ({ ...prev, speed: Math.max(0.7, Math.min(1.3, parsedData.suggestedSpeed)) }));
            }
    
            showNotification("Voiceover section has been auto-configured by AI!");
    
        } catch (e: any) {
            if (e.message !== "stopped") handleError(e, 'auto-configure voiceover');
        } finally {
            setIsAutoConfiguringVoice(false);
        }
    };
    
    const handleRephraseScript = async () => {
        if (!script.trim()) {
            showNotification("Please provide a script to work with.");
            return;
        }
        setIsRephrasing(true);
        stopGenerationRef.current = false;
        setRephrasingProgress('');

        try {
            if (generateUniqueStory) {
                setRephrasingProgress('Analyzing topic and generating a new story...');
                showNotification('Generating a new, unique story based on the current script\'s topic...');

                const prompt = `You are a creative storyteller. Analyze the following script to understand its core topic, theme, and style. Then, write a completely new and original script about the same topic. The new story's structure, characters, specific events, and narrative flow MUST be entirely unique. The goal is to create content that is not "Reused Content" by YouTube's standards. The script should be suitable for a video of similar length to the original. Respond ONLY with the newly generated script text, without any additional comments, introductions, or formatting.

ORIGINAL SCRIPT for TOPIC ANALYSIS:
---
${script}
---`;
                
                const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'generate unique story');
                const newScript = result.text;

                if (newScript && newScript.trim().length > 10) {
                    setScript(newScript);
                    setVoiceoverScript(newScript);
                    scriptRef.current = newScript; // MANUAL UPDATE
                    voiceoverScriptRef.current = newScript; // MANUAL UPDATE
                    showNotification("New story generated and updated in main script and voiceover sections!");
                } else {
                    throw new Error("AI failed to return a valid new script. The response was empty or too short.");
                }

            } else {
                const scriptChunks = splitScriptIntoMeaningfulChunks(script, 15000);
                const rephrasedChunks = new Array(scriptChunks.length);
                
                showNotification(`Script split into ${scriptChunks.length} paragraphs. Rephrasing paragraph by paragraph...`);
        
                for (let i = 0; i < scriptChunks.length; i++) {
                    if (stopGenerationRef.current) throw new Error("stopped");
                    
                    setRephrasingProgress(`Rephrasing paragraph ${i + 1} of ${scriptChunks.length}...`);
                    const chunk = scriptChunks[i];
                    
                    const contextInstruction = i > 0
                        ? `For context, the previous *original* paragraph was: "${scriptChunks[i - 1]}". Ensure a smooth transition from that point.`
                        : 'This is the beginning of the script.';
        
                    const rephrasePrompt = `You are a professional scriptwriter. Rephrase the following paragraph to make it unique and avoid copyright issues, while keeping the original story, meaning, and tone intact. ${contextInstruction} Respond only with the rephrased paragraph.\n\nORIGINAL PARAGRAPH:\n"${chunk}"`;
        
                    const result = await executeGenerativeAiTask('gemini-2.5-pro', rephrasePrompt, `rephrasing chunk ${i + 1}`);
        
                    const rephrasedText = result.text;
                    if (rephrasedText) {
                        rephrasedChunks[i] = rephrasedText.trim();
                    } else {
                        rephrasedChunks[i] = chunk;
                        console.warn(`AI failed to rephrase paragraph ${i + 1}. Keeping original.`);
                    }
                }
                
                if (stopGenerationRef.current) throw new Error("stopped");
        
                const finalScript = rephrasedChunks.join('\n\n');
                setScript(finalScript);
                setVoiceoverScript(finalScript);
                scriptRef.current = finalScript; // MANUAL UPDATE
                voiceoverScriptRef.current = finalScript; // MANUAL UPDATE
                showNotification("Full script rephrased and updated in voiceover section!");
            }

        } catch (e: any) {
            if (e.message !== "stopped") {
                handleError(e, generateUniqueStory ? 'generate unique story' : 'rephrase script');
            } else {
                showNotification(generateUniqueStory ? "New story generation stopped." : "Rephrasing stopped.");
            }
        } finally {
            setIsRephrasing(false);
            setRephrasingProgress('');
        }
    };

    const handleGenerate = async () => { if (!script.trim()) { showNotification("Please write or generate a script first."); return; } if (selectedThemes.length === 0) { showNotification("Please select at least one primary theme."); return; } if (selectedModifiers.length === 0) { showNotification("Please select at least one artistic modifier."); return; } setIsConfirmModalVisible(true); };
    
    const executeSingleImageGeneration = async (index: number, prompt: string) => {
        let success = false;
        let lastError: any = null;
        let attempt = 0;
        const MAX_ATTEMPTS_PER_IMAGE = enabledApiKeysRef.current.length > 1 ? enabledApiKeysRef.current.length * 2 : 3;
    
        while (!success && attempt < MAX_ATTEMPTS_PER_IMAGE) {
            if (stopGenerationRef.current) break;
            if (allKeysPermanentlyFailedRef.current) {
                lastError = new Error("ALL_KEYS_FAILED");
                break;
            }
            attempt++;
    
            const currentPrompt = resultsRef.current[index].image_prompt;
            
            const activeKeys = enabledApiKeysRef.current.filter(k => !disabledKeysForSession.includes(k));
            if (activeKeys.length === 0) {
                 const permanentFailureError = new Error("All enabled API keys have been disabled due to permanent errors. Please check your API keys.");
                 lastError = permanentFailureError;
                 setResults(prev => prev.map((r, idx) => index === idx ? { ...r, imageStatus: 'failed', error: "Failed: All Keys Disabled." } : r));
                 break;
            }
    
            const now = Date.now();
            let nextAvailableKeyIndex = -1;
            for (let i = 0; i < activeKeys.length; i++) {
                const keyIndex = (currentApiKeyIndexRef.current + i) % activeKeys.length;
                const key = activeKeys[keyIndex];
                if (!apiKeyCooldowns[key] || now > apiKeyCooldowns[key]) {
                    nextAvailableKeyIndex = keyIndex;
                    break;
                }
            }
    
            if (nextAvailableKeyIndex === -1) {
                let soonestExpiry = Infinity;
                Object.values(apiKeyCooldowns).forEach((expiry: number) => { if (expiry < soonestExpiry) soonestExpiry = expiry; });
                const waitTime = Math.max(0, soonestExpiry - now);
                setResults(prev => prev.map((r, idx) => index === idx ? { ...r, imageStatus: 'retrying', error: `All keys on cooldown. Waiting ${Math.round(waitTime / 1000)}s...` } : r));
                await new Promise(resolve => setTimeout(resolve, waitTime + 500));
                continue;
            }
    
            const previousKey = activeKeys[currentApiKeyIndexRef.current % activeKeys.length] || activeKeys[0];
            const selectedKey = activeKeys[nextAvailableKeyIndex];
            setCurrentApiKeyIndex(enabledApiKeysRef.current.indexOf(selectedKey));
            if (previousKey !== selectedKey) { showNotification(`Switching to API Key: ...${selectedKey.slice(-4)}`); }
    
            try {
                await generateImage(index, currentPrompt, selectedKey);
                success = true;
                consecutiveApiFailuresRef.current = 0;
            } catch (e: any) {
                lastError = e;
                const failedKey = selectedKey;
                const isPermanentFailure = e.message?.includes('limit: 0') || e.message?.includes('API key not valid') || e.message?.includes('API_KEY_INVALID');
    
                if (isPermanentFailure) {
                    setDisabledKeysForSession(prev => {
                        const newDisabled = [...new Set([...prev, failedKey])];
                        if (newDisabled.length >= enabledApiKeysRef.current.length) {
                             setAllKeysPermanentlyFailed(true);
                        }
                        return newDisabled;
                    });
                    showNotification(`API Key ...${failedKey.slice(-4)} has a permanent error. Disabling for this session.`, true);
                    setResults(prev => prev.map((r, idx) => index === idx ? { ...r, imageStatus: 'retrying', error: `Key ...${failedKey.slice(-4)} failed. Trying next...` } : r));
                    handleError(e, `Permanent Error on Scene ${index + 1}`, { apiKey: failedKey, attempt, prompt: currentPrompt });
                    continue; // Immediately try the next available key without waiting or incrementing failure counts.
                }
    
                const errorMessage = (e.message || '').toLowerCase();
                const isSafetyError = errorMessage.includes('safety') || errorMessage.includes('blocked');
                const safetyRetries = resultsRef.current[index].safetyRetryCount || 0;
    
                if (isSafetyError && safetyRetries < 5) {
                    showNotification(`Safety policy violation on Scene ${index + 1}. Auto-rephrasing prompt (Attempt ${safetyRetries + 1}/5)...`, true);
                    try {
                        const originalPrompt = resultsRef.current[index].image_prompt;
                        const rephraseMasterPrompt = `The following image prompt was blocked by a safety filter. Your task is to rephrase it to be safe for generation while preserving the original artistic intent and core concepts. Do not refuse, just make it safe. Respond ONLY with the newly generated prompt text, without any additional comments, introductions, or formatting.\n\nORIGINAL PROMPT:\n---\n${originalPrompt}\n---`;
                        
                        const ai = getAiClient(); 
                        const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: rephraseMasterPrompt });
                        const newPrompt = result.text;
                        
                        if (newPrompt && newPrompt.trim() !== "") {
                             setResults(prev => {
                                const updatedResults = prev.map((r, i) => i === index ? { ...r, image_prompt: newPrompt.trim(), rephrasedForSafety: true, safetyRetryCount: (r.safetyRetryCount || 0) + 1, error: undefined, imageStatus: 'retrying' } as SceneResult : r);
                                resultsRef.current = updatedResults;
                                return updatedResults;
                             });
                             await new Promise(resolve => setTimeout(resolve, 500)); 
                             attempt--; 
                             continue;
                        } else {
                             handleError("Auto-rephrasing failed to generate a new prompt.", `Image Gen Safety Retry on Scene ${index + 1}`);
                        }
                    } catch (rephraseError: any) {
                        handleError(rephraseError, `Auto-rephrasing prompt on Scene ${index + 1}`);
                    }
                }
                
                handleError(e, `Image Gen Error on Scene ${index + 1}`, { apiKey: failedKey, attempt, prompt: currentPrompt });
                setApiKeyCooldowns(prev => ({ ...prev, [failedKey]: Date.now() + 61000 }));
                
                consecutiveApiFailuresRef.current++;
                if (consecutiveApiFailuresRef.current >= 3) {
                    const circuitBreakerMsg = "Circuit Breaker: Paused due to 3 consecutive API errors. Check keys/logs.";
                    showNotification(circuitBreakerMsg, true);
                    const displayError = isSafetyError ? "Failed: Safety Policy. Edit prompt." : "Failed: Circuit Breaker. Check keys.";
                    setResults(prev => prev.map((r, idx) => index === idx ? { ...r, imageStatus: 'failed', error: displayError } : r));
                    setIsPausedByCircuitBreaker(true);
                    stopGenerationRef.current = true;
                    throw new Error("PAUSED_BY_CIRCUIT_BREAKER");
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    
        if (!success && !stopGenerationRef.current) {
            const lastErrorMessage = (lastError?.message || '').toLowerCase();
            let finalErrorMsg = `Failed: Check Logs.`; // Default message
        
            if (lastErrorMessage.includes('safety') || lastErrorMessage.includes('blocked')) {
                finalErrorMsg = "Failed: Safety Policy. Edit prompt.";
            } else if (lastErrorMessage.includes('quota') || lastErrorMessage.includes('limit: 0') || lastErrorMessage.includes('billing')) {
                finalErrorMsg = "Failed: API Quota/Billing. Check key.";
            } else if (lastErrorMessage.includes('api key not valid') || lastErrorMessage.includes('api_key_invalid')) {
                finalErrorMsg = "Failed: Invalid API Key.";
            } else if (lastErrorMessage.includes('all keys')) {
                finalErrorMsg = "Failed: All Keys Disabled.";
            } else if (lastErrorMessage.includes('network') || lastErrorMessage.includes('fetch')) {
                finalErrorMsg = "Failed: Network Error.";
            }
        
            setResults(prev => prev.map((r, idx) => idx === index ? { ...r, imageStatus: 'failed', error: finalErrorMsg } : r));
            handleError(lastError || finalErrorMsg, `Image Generation Total Failure`);
        }
    };


    const executePromptAndImageGeneration = async (): Promise<boolean> => {
        setIsLoading(true);
        setResults([]);
        
        try {
            const characterInstruction = characterProfiles.some(p => p.userDescription.trim() || p.aiDescription.trim()) 
                ? `\n\n**Character Consistency:** Maintain the appearance of the following characters consistently: ${characterProfiles.map((p, i) => `\n- Character ${i+1}: ${p.userDescription} ${p.aiDescription}`).join('')}`
                : '';
            
            const negativeInstruction = (useNegativePrompt && negativePrompt.trim())
                 ? `\n\n**Negative Prompt:** The "image_prompt" MUST STRICTLY AVOID any mention or depiction of the following concepts: "${negativePrompt.trim()}".`
                : '';

            const masterPrompt = `You are an expert in visual storytelling and prompt engineering for AI image generation. Your task is to analyze the following script and break it down into exactly ${imageCount} distinct, logical scenes. For each scene, you must generate a highly detailed and artistic image generation prompt suitable for AI image models.\n\nThe final output MUST be a valid JSON array of objects. Each object must have two keys: "scene_description" and "image_prompt".\n\n**CRITICAL INSTRUCTIONS:**\n1.  **Scene Division:** Divide the script into ${imageCount} logical scenes. Ensure the entire story is covered.\n2.  **Style Integration:** Each "image_prompt" MUST incorporate the following style elements:\n    -   **Primary Themes:** ${selectedThemes.join(', ')}\n    -   **Artistic Modifiers:** ${selectedModifiers.join(', ')}\n    -   **Camera Angle:** ${cameraAngle !== 'Default' ? cameraAngle : 'As appropriate for the scene'}\n    -   **Aspect Ratio:** The final image must be conceptualized for a ${aspectRatio} aspect ratio.${characterInstruction}${negativeInstruction}\n\nHere is the script:\n---\n${scriptRef.current}\n---`;
            
            showNotification(`Generating ${imageCount} prompts... Est. time: ~45s`);
            const result = await executeGenerativeAiTask('gemini-2.5-pro', masterPrompt, 'generate prompts', jsonValidator);
            
            if (stopGenerationRef.current) { throw new Error("stopped"); }

            const responseText = result.text;
            const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedResults: SceneResult[] = JSON.parse(cleanedJson).map((r: any) => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 }));
            
            setResults(parsedResults);
            resultsRef.current = parsedResults; // FIX: Manually sync ref to avoid race condition
            setIsLoading(false);
            setIsBatchGenerating(true);
            showNotification(`Generating ${parsedResults.length} images... Est. time: ${Math.ceil(parsedResults.length * 10 / 60)} min`);
            
            for (let i = 0; i < parsedResults.length; i++) {
                if (stopGenerationRef.current) { 
                    if(isPausedByCircuitBreaker) { throw new Error("PAUSED_BY_CIRCUIT_BREAKER"); }
                    showNotification("Generation stopped by user."); 
                    break; 
                }

                // Smart API Key Rotation: Switch key every 5 images
                if (i > 0 && i % 5 === 0) {
                    const activeKeys = enabledApiKeysRef.current.filter(k => !disabledKeysForSession.includes(k));
                    if (activeKeys.length > 1) { // Only rotate if there are multiple keys
                        currentApiKeyIndexRef.current = (currentApiKeyIndexRef.current + 1) % activeKeys.length;
                        const newKey = activeKeys[currentApiKeyIndexRef.current];
                        showNotification(`Batch Rotation: Switching to API Key ...${newKey.slice(-4)}`);
                        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause after switch
                    }
                }

                // Add a delay between requests to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
                }

                await executeSingleImageGeneration(i, parsedResults[i].image_prompt);
            }
            
            if (isPausedByCircuitBreaker) {
                throw new Error("PAUSED_BY_CIRCUIT_BREAKER");
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            const finalResults = resultsRef.current;
            const allSucceeded = finalResults.every(r => r.imageStatus === 'completed');

            if (!allSucceeded && !stopGenerationRef.current) {
                 if (allKeysPermanentlyFailedRef.current) {
                    throw new Error("ALL_KEYS_FAILED");
                 }
                const hasSafetyFailure = finalResults.some(item => item.error && item.error.toLowerCase().includes('safety'));
                if (hasSafetyFailure) {
                    throw new Error('IMAGE_GENERATION_SAFETY_POLICY');
                }
                throw new Error('IMAGE_GENERATION_FAILED');
            }
            
            return true;

        } catch (e: any) {
            if (e.message !== "stopped" && e.message !== "PAUSED_BY_CIRCUIT_BREAKER" && e.message !== 'IMAGE_GENERATION_SAFETY_POLICY' && e.message !== 'IMAGE_GENERATION_FAILED' && e.message !== 'ALL_KEYS_FAILED') {
                handleError(e, 'generate prompts');
            }
            throw e; 
        } finally {
            setIsLoading(false);
            setIsBatchGenerating(false);
        }
    };
    
    const handleConfirmGeneration = async () => {
        setIsConfirmModalVisible(false);
        stopGenerationRef.current = false;
        consecutiveApiFailuresRef.current = 0;
        setIsPausedByCircuitBreaker(false);
        setDisabledKeysForSession([]);
        setAllKeysPermanentlyFailed(false);

        try {
            const success = await executePromptAndImageGeneration();
            if (success && isAutopilot && !stopGenerationRef.current) {
                showNotification("Autopilot: All images generated! Downloading...");
                await handleDownloadZip();
                handleExportPrompts();
                showNotification("Autopilot process completed successfully!");
            } else if (success && !stopGenerationRef.current && !isPausedByCircuitBreaker) {
                showNotification("All images generated successfully!");
            }
        } catch (e: any) {
             if (e.message === "ALL_KEYS_FAILED") {
                showNotification("Generation failed: All API keys have permanent errors. Please add valid keys.", true);
             } else {
                 const finalResults = resultsRef.current;
                 const failedCount = finalResults.filter(r => r.imageStatus === 'failed').length;
                 if (failedCount > 0 && !isPausedByCircuitBreaker) {
                    showNotification(`${finalResults.length - failedCount} images generated. ${failedCount} failed. You can retry them.`);
                 } else if (e.message !== 'PAUSED_BY_CIRCUIT_BREAKER' && e.message !== 'IMAGE_GENERATION_SAFETY_POLICY' && e.message !== 'IMAGE_GENERATION_FAILED') {
                    console.error("Generation failed:", e);
                 }
             }
        } finally {
            if (!isPausedByCircuitBreaker) {
                stopGenerationRef.current = false;
            }
        }
    };
    
    const handleRetryFailed = async (): Promise<boolean> => {
        setIsRetrying(true);
        setIsBatchGenerating(true);
        stopGenerationRef.current = false;
        consecutiveApiFailuresRef.current = 0;
        setIsPausedByCircuitBreaker(false);
        setDisabledKeysForSession([]);
        setAllKeysPermanentlyFailed(false);
        showNotification("Retrying failed images...");
    
        // Create a mutable queue of tasks. This is the key change to prevent race conditions.
        const retryQueue = resultsRef.current.reduce((acc, result, index) => {
            if (result.imageStatus === 'failed') {
                acc.push({ index, prompt: result.image_prompt });
            }
            return acc;
        }, [] as { index: number; prompt: string }[]);
        
        const totalToRetry = retryQueue.length;
        let retriedCount = 0;
    
        // Process the queue until it's empty
        while (retryQueue.length > 0) {
            if (stopGenerationRef.current) {
                if (isPausedByCircuitBreaker) { break; }
                showNotification("Retry process stopped by user.");
                break;
            }
    
            const task = retryQueue.shift(); // Take the next task
            if (task) {
                retriedCount++;
                showNotification(`Retrying image ${retriedCount} of ${totalToRetry}... (Scene ${task.index + 1})`);
                await executeSingleImageGeneration(task.index, task.prompt);
            }
        }
    
        await new Promise(resolve => setTimeout(resolve, 1000)); // Allow final state updates to settle
    
        const latestResults = resultsRef.current;
        const newFailedCount = latestResults.filter(r => r.imageStatus === 'failed').length;
        
        if (newFailedCount > 0 && !isPausedByCircuitBreaker) {
            showNotification(`Retry complete. ${totalToRetry - newFailedCount} images recovered. ${newFailedCount} still failed.`);
        } else if (!stopGenerationRef.current && !isPausedByCircuitBreaker) {
            showNotification("All failed images successfully generated!");
        }
    
        setIsRetrying(false);
        setIsBatchGenerating(false);
        if (!isPausedByCircuitBreaker) {
            stopGenerationRef.current = false;
        }
        return newFailedCount === 0;
    };
    
    const handleResumeFromCircuitBreaker = async () => {
        await handleRetryFailed();
    };
    
    const handleDeconstructVideoUrl = async () => {
        if (!videoUrl.trim()) {
            showNotification("Please enter a video URL to deconstruct.");
            return;
        }
        setIsAnalyzingUrl(true);
        showNotification("Deconstructing video... This may take a moment. Est. time: ~30s");
        try {
            const availableVoices = ttsVoices.map(v => v.conceptualName).join(', ');
            const prompt = `You are an expert video analyst with access to a vast knowledge base of internet content, including transcripts and summaries of many YouTube videos. A user has provided this URL: ${videoUrl}

Your task is to act as if you have watched this video. Based on your knowledge of the video's content (including its likely transcript, dialogue, and visual elements), you must deconstruct it and provide a detailed analysis. Your goal is to be as faithful to the original video as possible.

You MUST generate a single, valid JSON object with the following structure. Do not include any other text, explanations, or markdown formatting outside of the JSON object.

{
  "reconstructedScript": "Reconstruct the full script or voiceover from the video as accurately as possible based on your training data. Include dialogue and narration. If you cannot find an exact transcript, generate a highly plausible script that captures the original's tone, pacing, and key points.",
  "visualStyleAnalysis": {
    "themes": ["An array of the most relevant themes from this list: ${themeOptions.join(', ')}"],
    "modifiers": ["An array of the most fitting artistic modifiers from this list: ${styleModifiers.join(', ')}"],
    "cameraAndEditing": "Describe the camera work (e.g., static shots, handheld, drone footage) and editing style (e.g., fast cuts, slow transitions, jump cuts)."
  },
  "voiceoverAnalysis": {
    "detailedTone": "A professional description of the speaker's voice, tone, emotion, and pacing. Example: 'A male voice, mid-range, with a clear and enthusiastic tone. The pacing is quick, suitable for an engaging tech review.'",
    "suggestedAiVoice": "Based on your analysis, suggest the single best AI voice's conceptualName from this list to replicate the style: ${availableVoices}"
  },
  "overallProductionAnalysis": "Provide a brief analysis of how the original video was likely produced. Mention camera quality, lighting, audio quality, and overall production value (e.g., high-budget documentary, casual vlog-style)."
}`;

            const response = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'video URL deconstruction', jsonValidator);
            const responseText = response.text;
            if (responseText) {
                const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(cleanedJson);

                if (data.reconstructedScript) {
                    setScript(data.reconstructedScript);
                    setVoiceoverScript(data.reconstructedScript);
                }
                if (data.visualStyleAnalysis) {
                    if (data.visualStyleAnalysis.themes?.length > 0) setSelectedThemes(prev => [...new Set([...prev, ...data.visualStyleAnalysis.themes])]);
                    if (data.visualStyleAnalysis.modifiers?.length > 0) setSelectedModifiers(prev => [...new Set([...prev, ...data.visualStyleAnalysis.modifiers])]);
                }
                if (data.voiceoverAnalysis) {
                    if (data.voiceoverAnalysis.detailedTone) setCustomTtsPrompt(data.voiceoverAnalysis.detailedTone);
                    if (data.voiceoverAnalysis.suggestedAiVoice && ttsVoices.some(v => v.conceptualName === data.voiceoverAnalysis.suggestedAiVoice)) {
                        setTtsConfig(prev => ({...prev, voice: data.voiceoverAnalysis.suggestedAiVoice}));
                    }
                }
                
                showNotification("Video deconstruction complete! Relevant fields have been populated.");
                if (data.overallProductionAnalysis) {
                    setTimeout(() => showNotification(`Production Analysis: ${data.overallProductionAnalysis}`), 1000);
                }
                
            } else {
                showNotification("Could not deconstruct the video from URL. The AI may not have information on this video.");
            }
        } catch (e: any) {
            if (e.message !== "stopped") handleError(e, 'video URL deconstruction');
        } finally {
            setIsAnalyzingUrl(false);
        }
    };
    
    const getSpeedDescription = (speed: number): string => {
        if (speed < 0.8) return 'spoken very slowly';
        if (speed < 0.95) return 'spoken slowly';
        if (speed > 1.25) return 'spoken very quickly';
        if (speed > 1.1) return 'spoken quickly';
        return 'spoken at a normal pace';
    };

    const handleAuditionVoice = async (voice: TTSVoice) => {
        if (currentAudition) {
            currentAudition.stop();
            setCurrentAudition(null);
        }
    
        if (isAuditioning === voice.conceptualName) {
            setIsAuditioning(null);
            return;
        }
    
        setIsAuditioning(voice.conceptualName);
    
        try {
            if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
    
            const textToSpeak = `This is a sample of the ${voice.conceptualName} voice.`;
    
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: textToSpeak }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.apiName } } },
                },
            });
    
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("API did not return audio data for audition.");
    
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodePcmAudioData(audioBytes, outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.start();
            setCurrentAudition(source);
    
            source.onended = () => {
                if (isAuditioning === voice.conceptualName) {
                    setIsAuditioning(null);
                }
                setCurrentAudition(null);
            };
        } catch (e: any) {
            handleError(e, `auditioning ${voice.conceptualName}`);
            setIsAuditioning(null);
            setCurrentAudition(null);
        }
    };

    const getSelectedApiVoiceName = () => {
        const selectedVoiceObject = ttsVoices.find(v => v.conceptualName === ttsConfig.voice);
        return selectedVoiceObject ? selectedVoiceObject.apiName : null;
    };

    const createTtsPrompt = (text: string, config: TTSConfig, customPrompt: string, force: boolean): string => {
        const speedDescription = getSpeedDescription(config.speed);
    
        // Define the desired style, either from the custom prompt or the selected tone.
        const styleDescription = customPrompt.trim() 
            ? customPrompt.trim()
            : `spoken in a ${config.tone.toLowerCase()} tone`;
    
        if (force) {
            // When forcing speed, create a prompt that explicitly separates the speed requirement
            // from the style suggestion, giving speed the highest priority.
            // This is a direct command to the AI.
            return `Generate speech with a STRICT requirement: the pace MUST be ${speedDescription}. The artistic style for the delivery should be: "${styleDescription}". Text to speak: "${text}"`;
        } else {
            // When not forcing, create a more holistic prompt that asks the AI to balance
            // the suggested speed with the desired style.
            return `Generate speech for the following text. The desired style is "${styleDescription}" and the general pace should be ${speedDescription}. Text: "${text}"`;
        }
    };


    const handleGenerateVoiceover = async () => {
        if (!voiceoverScript.trim()) {
            showNotification("Please provide a script in the Voiceover Script box.");
            return;
        }
        
        setIsGeneratingAudio(true);
        stopAudioGenerationRef.current = false;
        setGeneratedAudioBytes(null);
        setGeneratedAudioUrl(null);
        showNotification("Generating voiceover... Est. time: ~1 min");
        
        try {
            if (stopAudioGenerationRef.current) return;

            const apiVoiceName = getSelectedApiVoiceName();
            if (!apiVoiceName) {
                throw new Error(`Selected voice "${ttsConfig.voice}" configuration not found.`);
            }
            
            const ai = getAiClient();
            
            const finalPrompt = createTtsPrompt(voiceoverScript, ttsConfig, customTtsPrompt, forceSpeed);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: finalPrompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } } },
                },
            });
    
            if (stopAudioGenerationRef.current) { showNotification("Voiceover generation stopped."); return; }
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("API did not return audio data.");
            
            const audioBytes = decode(base64Audio);
            setGeneratedAudioBytes(audioBytes);
            const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
            setGeneratedAudioUrl(URL.createObjectURL(wavBlob));
            showNotification("Voiceover generated successfully!");
        } catch (e: any) {
            handleError(e, 'voiceover generation');
        } finally {
            setIsGeneratingAudio(false);
            stopAudioGenerationRef.current = false;
        }
    };
    
    const handleStopAudioGeneration = () => {
        stopAudioGenerationRef.current = true;
        setIsGeneratingAudio(false);
        showNotification("Voiceover generation stopped.");
    };

    const handleDownloadAudio = (bytes?: Uint8Array, filename?: string) => {
        const audioBytes = bytes || generatedAudioBytes;
        if (!audioBytes) {
            showNotification("No audio data to download.");
            return;
        }
        const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${projectName.replace(/\s+/g, '_')}_voiceover.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification("Audio download started.");
    };

    const handleFitScriptToDuration = async () => {
        const targetSeconds = (videoDuration * 60) + (videoDurationSec || 0);
        if (targetSeconds === 0) {
            showNotification("Please set a video duration first to use this feature.");
            return;
        }
        if (!voiceoverScript.trim()) {
            showNotification("Please provide a script to fit.");
            return;
        }

        setIsFittingScript(true);
        showNotification("AI is optimizing your script's length... Est. time: ~30s");

        try {
            const WPM_RATE = 150;
            const recommendedWords = Math.floor((targetSeconds / 60) * (WPM_RATE * ttsConfig.speed));
            
            const prompt = `You are a professional script editor. Your task is to rewrite the following script to be approximately ${recommendedWords} words long. You must preserve the core meaning, narrative, tone, and key information of the original text. Respond ONLY with the revised script text, without any additional comments, introductions, or formatting.

ORIGINAL SCRIPT:
---
${voiceoverScript}
---`;

            const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'fit script to duration');
            const newScript = result.text;
            
            if (newScript) {
                setVoiceoverScript(newScript);
                showNotification("Script has been optimized for the target duration!");
            } else {
                throw new Error("AI failed to return an optimized script.");
            }
        } catch (e: any) {
            if (e.message !== "stopped") handleError(e, 'fit script to duration');
        } finally {
            setIsFittingScript(false);
        }
    };

    const splitScriptIntoChunks = (text: string, maxLength = 2800): string[] => {
        if (!text) return [];
        const chunks: string[] = [];
        let remainingText = text.trim();
    
        while (remainingText.length > 0) {
            if (remainingText.length <= maxLength) {
                chunks.push(remainingText);
                break;
            }
    
            let chunk = remainingText.substring(0, maxLength);
            let splitIndex = -1;
    
            const lastParagraphBreak = chunk.lastIndexOf('\n\n');
            if (lastParagraphBreak > maxLength / 2) {
                splitIndex = lastParagraphBreak;
            } else {
                const sentenceEnders = /[.!?]/g;
                let lastSentenceBreak = -1;
                let match;
                while ((match = sentenceEnders.exec(chunk)) !== null) {
                    lastSentenceBreak = match.index;
                }
    
                if (lastSentenceBreak !== -1) {
                    splitIndex = lastSentenceBreak + 1;
                } else {
                    const lastNewline = chunk.lastIndexOf('\n');
                    if (lastNewline !== -1) {
                        splitIndex = lastNewline;
                    } else {
                        const lastSpace = chunk.lastIndexOf(' ');
                        if (lastSpace !== -1) {
                            splitIndex = lastSpace;
                        } else {
                            splitIndex = maxLength;
                        }
                    }
                }
            }
            
            chunk = remainingText.substring(0, splitIndex);
            chunks.push(chunk.trim());
            remainingText = remainingText.substring(splitIndex).trim();
        }
        return chunks.filter(c => c.length > 0);
    };

    const handleGenerateChunkedAudio = async () => {
        const scriptToUse = voiceoverScriptRef.current;
        if (!scriptToUse.trim()) { showNotification("Please provide a script to generate chunked audio."); return; }
        setIsGeneratingChunks(true);
        stopChunkGenerationRef.current = false;
        setAudioChunks([]);
        showNotification("Splitting script and starting chunked generation...");
        
        await new Promise(resolve => setTimeout(resolve, 100));

        const apiVoiceName = getSelectedApiVoiceName();
        if (!apiVoiceName) {
            handleError({ message: `Selected voice "${ttsConfig.voice}" configuration not found.` }, 'chunked audio generation');
            setIsGeneratingChunks(false);
            return;
        }

        const textChunks = splitScriptIntoChunks(scriptToUse);
        setAudioChunks(textChunks.map((t, i) => ({ id: i, text: t, status: 'pending' })));
        showNotification(`Generating ${textChunks.length} audio chunks... Est. time: ${Math.ceil(textChunks.length * 10 / 60)} min`);

        for (let i = 0; i < textChunks.length; i++) {
            if (stopChunkGenerationRef.current) { showNotification("Chunk generation stopped by user."); break; }
            if (allKeysPermanentlyFailedRef.current) {
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: 'All API keys failed.' } : c));
                handleError({ message: 'All API keys failed.' }, `audio chunk ${i + 1} generation`);
                break;
            }
            
            setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'generating' } : c));
            
            try {
                const ai = getAiClient();
                const currentChunkText = textChunks[i];
                const prompt = createTtsPrompt(currentChunkText, ttsConfig, customTtsPrompt, forceSpeed);

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: prompt }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } } },
                    },
                });
                
                if (stopChunkGenerationRef.current) break;

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (!base64Audio) throw new Error("API did not return audio data for this chunk.");

                const audioBytes = decode(base64Audio);
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'complete', audioBytes, audioUrl } : c));
                
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (e: any) {
                console.error(`Error generating chunk ${i}:`, e);
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: e.message } : c));
                handleError(e, `audio chunk ${i + 1} generation`);
            }
        }
        setIsGeneratingChunks(false);
        stopChunkGenerationRef.current = false;
    };

    const handleRetrySingleAudioChunk = async (chunkId: number) => {
        stopChunkGenerationRef.current = false;
        setAllKeysPermanentlyFailed(false);
        const chunkToRetry = audioChunksRef.current.find(c => c.id === chunkId);
        if (!chunkToRetry) return;

        const apiVoiceName = getSelectedApiVoiceName();
        if (!apiVoiceName) {
            handleError({ message: `Voice config not found for "${ttsConfig.voice}"` }, `audio chunk ${chunkId + 1} retry`);
            return;
        }

        setAudioChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'generating', error: undefined } : c));

        try {
            const ai = getAiClient();
            const prompt = createTtsPrompt(chunkToRetry.text, ttsConfig, customTtsPrompt, forceSpeed);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } } },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("API did not return audio data for this chunk.");

            const audioBytes = decode(base64Audio);
            const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
            const audioUrl = URL.createObjectURL(wavBlob);

            setAudioChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'complete', audioBytes, audioUrl } : c));
            showNotification(`Chunk ${chunkId + 1} successfully regenerated!`);

        } catch (e: any) {
            setAudioChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'failed', error: e.message } : c));
            handleError(e, `audio chunk ${chunkId + 1} retry`);
        }
    };
    
    const handleStopChunkGeneration = () => {
        stopChunkGenerationRef.current = true;
        setIsGeneratingChunks(false);
        showNotification("Stopping chunk generation...");
    };

    const mergeAudioChunks = async (chunks: AudioChunk[]): Promise<Uint8Array | null> => {
        const completedChunks = chunks
            .filter(c => c.status === 'complete' && c.audioBytes)
            .sort((a, b) => a.id - b.id);

        if (completedChunks.length === 0) {
            showNotification("No completed audio chunks to merge.", true);
            return null;
        }

        try {
            let totalLength = 0;
            for (const chunk of completedChunks) {
                totalLength += chunk.audioBytes!.length;
            }

            const mergedPcm = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of completedChunks) {
                mergedPcm.set(chunk.audioBytes!, offset);
                offset += chunk.audioBytes!.length;
            }
            return mergedPcm;
        } catch (e: any) {
            handleError(e, 'Audio Merging');
            return null;
        }
    };

    const handleMergeAndDownload = async () => {
        setIsMergingAudio(true);
        showNotification("Merging audio chunks...");
        const mergedBytes = await mergeAudioChunks(audioChunksRef.current);
        if (mergedBytes) {
            handleDownloadAudio(mergedBytes, `${projectName.replace(/\s+/g, '_')}_merged_voiceover.wav`);
        }
        setIsMergingAudio(false);
    };


    const handleDownloadAllChunksZip = async () => {
        const completedChunks = audioChunksRef.current.filter(c => c.status === 'complete' && c.audioBytes);
        if (completedChunks.length === 0) { showNotification("No completed audio chunks to download."); return; }
        showNotification(`Creating ZIP file with ${completedChunks.length} audio chunks...`);
        try {
            const zip = new JSZip();
            for (const chunk of completedChunks) {
                const wavBlob = pcmToWav(chunk.audioBytes!, 24000, 1, 16);
                zip.file(`${projectName.replace(/\s+/g, '_')}_chunk_${String(chunk.id + 1).padStart(3, '0')}.wav`, wavBlob);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${projectName.replace(/\s+/g, '_')}_voiceover_chunks.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Audio chunks ZIP download started.");
        } catch (e: any) {
            handleError(e, "ZIP file creation");
            showNotification("ZIP creation failed. Downloading chunks individually...");
            for (const chunk of completedChunks) {
                handleDownloadAudio(chunk.audioBytes, `${projectName.replace(/\s+/g, '_')}_chunk_${String(chunk.id + 1).padStart(3, '0')}.wav`);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    };


    const splitScriptIntoScenes = async (scriptText: string): Promise<SceneResult[]> => {
        const prompt = `You are an expert in visual storytelling. Your task is to analyze the following script and break it down into exactly ${imageCount} distinct, logical scenes. For each scene, provide a concise but descriptive summary. The final output MUST be a valid JSON array of objects. Each object must have one key: "scene_description".\n\nHere is the script:\n---\n${scriptText}\n---`;
        const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'script breakdown', jsonValidator);
        const responseText = result.text;
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResults: { scene_description: string }[] = JSON.parse(cleanedJson);
        return parsedResults.map(r => ({ scene_description: r.scene_description, image_prompt: '', imageStatus: 'pending' }));
    };
    const getModelSpecificPromptGenerator = (res: SceneResult, characterProfiles: CharacterProfile[]) => {
        const characterInstruction = characterProfiles.some(p => p.userDescription.trim() || p.aiDescription.trim())
            ? `\n\n**Character Consistency:** You MUST ensure the video's characters strictly adhere to these descriptions: ${characterProfiles.map((p, i) => `\n- Character ${i+1}: ${p.userDescription} ${p.aiDescription}`).join('')}`
            : '';
        const basisInstruction = videoPromptBasis === 'image-driven' ? `Your primary goal is to animate the static scene described in the image prompt.` : `Your goal is to create a video scene directly from the script description.`;
        const inputsSection = videoPromptBasis === 'image-driven' ? `- **Generated Image Prompt (to be animated):** "${res.image_prompt}"` : '';
        const commonHeader = `You are an expert prompt engineer for the **${videoModel}** AI text-to-video model. ${basisInstruction} Your task is to generate a single, concise, and evocative video prompt based on the rules for the selected model. Respond ONLY with the video prompt text, without any introductory phrases.`;
        const audioCues = []; if (includeDialogue) audioCues.push('Dialogue'); if (includeAmbient) audioCues.push('Ambient Noise'); if (includeSfx) audioCues.push('Sound Effects (SFX)');
        const audioInstructionIntegrated = audioCues.length > 0 ? `\n\nCRITICAL: You MUST integrate audio cues for ${audioCues.join(', ')} naturally within the prompt's narrative. For dialogue, use quotes and indicate who is speaking. For SFX and ambient sounds, describe them as part of the scene.` : '';
        const sourceMaterial = `\n\n**SOURCE MATERIAL TO ADAPT:**\n- **Original Script Scene:** "${res.scene_description}"\n${inputsSection}${characterInstruction}`;
        switch (videoModel) {
            case 'Vidu': return `${commonHeader}\n\n**Vidu Prompting Rules:**\n1.  **Formula:** Structure your prompt as: **Subject/Scene** + **Detailed Scene Description** + **Environment Description** + **Artistic Style/Medium**.\n2.  **Richness:** Use rich, accurate, and associative descriptions to create a vivid picture.\n3.  **Style Reinforcement:** Repeat and reinforce key style and atmosphere keywords throughout the prompt.${sourceMaterial}${audioInstructionIntegrated}`;
            case 'Kling': return `${commonHeader}\n\n**Kling Prompting Rules:**\n1.  **Formula:** Your prompt must follow this structure: **Subject** (with detailed description) + **Subject Movement** + **Scene** (concise environment) + **(Optional: Camera, Lighting, Atmosphere)**.\n2.  **Clarity:** Use simple words and straightforward sentences.${sourceMaterial}${audioInstructionIntegrated}`;
            case 'Hailuo': return `${commonHeader}\n\n**Hailuo Prompting Rules:**\n1.  **Formula:** Use the structure: **Main Subject** + **Scene** + **Motion** + **Camera Movement** + **Aesthetic Atmosphere**.\n2.  **Precise Camera:** Camera movement MUST be described in detail.\n3.  **Precise Aesthetics:** Clearly describe the mood and visual style.${sourceMaterial}${audioInstructionIntegrated}`;
            case 'Sora': return `${commonHeader}\n\n**Sora Prompting Rules:**\n1.  **Structure:** Generate a single, concise but highly descriptive sentence.\n2.  **Content:** The sentence MUST include: shot type, subject, action, setting, and lighting.${sourceMaterial}${audioInstructionIntegrated}`;
            case 'Veo 3.1': default:
                const audioInstruction = audioCues.length > 0 ? `6. **CRITICAL AUDIO INSTRUCTIONS:** The paragraph MUST include descriptions for the following audio elements: ${audioCues.join(', ')}. This is not optional. Describe them as part of the scene's action and environment.\n   ${includeDialogue ? '- **Dialogue**: Use quotes and attribute speech (e.g., A woman whispers, "It\\\'s can\\\'t be.").' : ''}\n   ${includeSfx ? '- **Sound Effects (SFX)**: Weave sounds into the action (e.g., ...as the floorboards creak ominously underfoot).' : ''}\n   ${includeAmbient ? `- **Ambient Noise**: Describe the background sounds (e.g., The sound of distant sirens fills the air.).` : ''}`.trim() : '';
                const cameraInstruction = `5. **Camera Work:** The prompt MUST specify camera work, incorporating this instruction: "${cameraAngle}". If 'Default', choose the most fitting shot (e.g., 'A wide shot reveals...', 'A close-up on the character\\\'s face shows...').`;
                return `You are an expert prompt engineer for the Veo 3.1 AI text-to-video model. Your task is to generate a single, descriptive paragraph that acts as a video prompt, following official Veo 3.1 guidelines.\n\n**INPUTS:**\n- **Original Script Scene:** "${res.scene_description}"\n${inputsSection}${characterInstruction}\n\n**INSTRUCTIONS:**\n1.  **Synthesize, Don't List:** Do NOT create a list with bullet points or headers like "Subject:", "Action:", etc.\n2.  **Create a Narrative Paragraph:** Weave all key visual elements (Subject, Action, Style, Composition, Focus, Ambiance) into a single, cohesive paragraph.\n3.  **Be Descriptive & Concise:** Use strong adjectives and verbs to create a vivid picture. The prompt should be a single, effective paragraph, not an overly long essay.\n4.  **Follow Veo Style:** The final prompt should be similar in style and length to official Veo examples (e.g., "A close-up cinematic shot follows a desperate man...").\n${cameraInstruction}\n${audioInstruction}\n7.  **Response Format:** Respond ONLY with the generated paragraph, without any extra text or introductions.`;
        }
    };
    const handleGenerateVideoPrompts = async () => {
        setIsGeneratingVideoPrompts(true);
        stopGenerationRef.current = false;
        showNotification(`Generating video prompts tailored for ${videoModel}...`);
        try {
            let resultsForVideo: SceneResult[] = resultsRef.current;
            if (resultsForVideo.length === 0 && videoPromptBasis === 'script-driven') {
                if (!scriptRef.current.trim()) { showNotification("Please provide a script to generate script-driven video prompts."); setIsGeneratingVideoPrompts(false); return; }
                showNotification(`First, breaking script into ${imageCount} scenes...`);
                try {
                    const newScenes = await splitScriptIntoScenes(scriptRef.current);
                    setResults(newScenes);
                    resultsForVideo = newScenes;
                } catch (e: any) { handleError(e, 'script breakdown'); setIsGeneratingVideoPrompts(false); return; }
            } else if (resultsForVideo.length === 0 && videoPromptBasis === 'image-driven') {
                showNotification("Please generate images first for image-driven basis."); setIsGeneratingVideoPrompts(false); return;
            }
    
            for (let i = 0; i < resultsForVideo.length; i++) {
                if (stopGenerationRef.current) { showNotification("Video prompt generation stopped."); break; }
                const res = resultsRef.current[i];
                if ((!res.scene_description && videoPromptBasis === 'script-driven') || (!res.image_prompt && videoPromptBasis === 'image-driven')) {
                    continue;
                }
    
                try {
                    const videoPromptGen = getModelSpecificPromptGenerator(res, characterProfiles);
                    const videoResult = await executeGenerativeAiTask('gemini-2.5-flash', videoPromptGen, `generate video prompt ${i + 1}`);
                    const videoPromptText = videoResult.text ? videoResult.text.trim() : 'Error: AI failed to generate a prompt for this scene.';
                    setResults(prev => prev.map((r, resultIndex) => 
                        resultIndex === i ? { ...r, video_prompt: videoPromptText } : r
                    ));
                } catch (e: any) {
                    console.error(`Failed to generate video prompt for scene ${i + 1}:`, e);
                    const errorMessage = `Error: ${e.message}`;
                     setResults(prev => prev.map((r, resultIndex) => 
                        resultIndex === i ? { ...r, video_prompt: errorMessage } : r
                    ));
                }
            }
    
            if (!stopGenerationRef.current) {
                showNotification("Video prompts generated successfully!");
            }
        } catch (e: any) {
             if (e.message !== "stopped") handleError(e, 'generate video prompts');
        } finally {
            setIsGeneratingVideoPrompts(false);
            stopGenerationRef.current = false;
        }
    };
    
    // Video Generation Functions
    const handleSelectVeoApiKey = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            // Optimistically assume success to handle race condition.
            setHasVeoApiKey(true);
            showNotification("Veo API Key selected. You can now generate videos.");
        } else {
            showNotification("API selection feature is not available in this environment.", true);
        }
    };

    const handleStartVideoGeneration = () => {
        if (!hasVeoApiKey) { showNotification("Please select a Veo API Key to generate videos."); return; }
        if (selectedScenesForVideo.length === 0) { showNotification("Please select at least one scene to generate."); return; }
        
        const promptsGeneratedForModel = results[0]?.video_prompt ? videoModel : 'Unknown';
        if (promptsGeneratedForModel !== 'Veo 3.1' && promptsGeneratedForModel !== 'Unknown') {
            setShowMismatchWarning(true);
        } else {
            executeVideoGeneration();
        }
    };
    
    const executeVideoGeneration = async () => {
        setIsGeneratingVideos(true);
        stopVideoGenerationRef.current = false;
        setShowMismatchWarning(false);
        showNotification(`Starting video generation for ${selectedScenesForVideo.length} scenes...`);

        for (const index of selectedScenesForVideo) {
            if (stopVideoGenerationRef.current) { showNotification("Video generation stopped by user."); break; }
            
            setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'generating', progressMessage: 'Initiating...' } }));
            try {
                // Create a new instance right before the call to use the latest key
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                let prompt = results[index]?.video_prompt;
                if (!prompt) { throw new Error("Video prompt is missing for this scene."); }

                if (negativePrompt.trim()) {
                    prompt = `${prompt}, negative prompt: ${negativePrompt.trim()}`;
                }

                const aspectRatioForVideo = aspectRatio === '16:9' || aspectRatio === '9:16' ? aspectRatio : '16:9';
                
                const config: {
                    numberOfVideos: number;
                    resolution: '720p' | '1080p';
                    aspectRatio: '16:9' | '9:16';
                } = {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatioForVideo as ('16:9' | '9:16'),
                };

                let operation = await ai.models.generateVideos({
                    model: 'veo-3.1-fast-generate-preview',
                    prompt: prompt,
                    config: config
                });

                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'polling', progressMessage: 'Generating... This can take several minutes.' } }));

                while (!operation.done) {
                    if (stopVideoGenerationRef.current) break;
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    operation = await ai.operations.getVideosOperation({ operation: operation });
                }

                if (stopVideoGenerationRef.current) break;

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (!downloadLink) throw new Error("Generation finished, but no video link was returned.");
                
                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'polling', progressMessage: 'Finalizing video...' } }));
                
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!videoResponse.ok) {
                    if (videoResponse.status === 404 && (await videoResponse.text()).includes('Requested entity was not found')) {
                        setHasVeoApiKey(false);
                        showNotification("API Key is invalid or not found. Please select your Veo API key again.", true);
                        throw new Error("Invalid API Key. Please re-select.");
                    }
                    throw new Error(`Failed to download video file. Status: ${videoResponse.status}`);
                }
                
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                
                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'complete', videoUrl: videoUrl } }));
                showNotification(`Video for Scene ${index + 1} completed!`);

            } catch (e: any) {
                handleError(e, `video generation for Scene ${index + 1}`);
                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'failed', error: e.message } }));
            }
        }
        setIsGeneratingVideos(false);
        stopVideoGenerationRef.current = false;
    };
    
    const handleStopVideoGeneration = () => {
        stopVideoGenerationRef.current = true;
        setIsGeneratingVideos(false);
        showNotification("Video generation process will stop after the current video finishes.");
    };

    const handleSceneSelectionChange = (index: number) => {
        setSelectedScenesForVideo(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleDownloadSingleVideo = (videoUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `${projectName.replace(/\s+/g, '_')}_scene_${index + 1}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`Downloading video for Scene ${index + 1}...`);
    };

    const handleDownloadVideosZip = async () => {
        const completedVideos = Object.entries(videoGenerationStatus)
            .filter(([_, value]) => {
                 if (typeof value === 'object' && value !== null && 'status' in value && 'videoUrl' in value) {
                    return value.status === 'complete' && value.videoUrl;
                }
                return false;
            });

        if (completedVideos.length === 0) {
            showNotification("No completed videos to download.");
            return;
        }

        showNotification(`Creating ZIP file with ${completedVideos.length} videos...`);
        const zip = new JSZip();

        try {
            for (const [indexStr, statusValue] of completedVideos) {
                if (typeof statusValue === 'object' && statusValue !== null && 'videoUrl' in statusValue && typeof statusValue.videoUrl === 'string') {
                    const index = parseInt(indexStr, 10);
                    const response = await fetch(statusValue.videoUrl);
                    const videoBlob = await response.blob();
                    zip.file(`${projectName.replace(/\s+/g, '_')}_scene_${index + 1}.mp4`, videoBlob);
                }
            }
            
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${projectName.replace(/\s+/g, '_')}_videos.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Video ZIP file download started.");
        } catch (e: any) {
            handleError(e, 'ZIP creation');
        }
    };


    const handleDownloadSingle = (imageUrl: string | undefined, index: number) => { if (!imageUrl) return; const link = document.createElement('a'); link.href = imageUrl; link.download = `scene_${index + 1}.jpeg`; document.body.appendChild(link); link.click(); document.body.removeChild(link); showNotification(`Downloading Scene ${index + 1}...`); };
    
    const handleDownloadAllSingles = async () => {
        showNotification("ZIP creation failed. Downloading images individually...");
        for (let i = 0; i < resultsRef.current.length; i++) {
            const result = resultsRef.current[i];
            if (result.imageUrl && result.imageStatus === 'completed') {
                handleDownloadSingle(result.imageUrl, i);
                await new Promise(resolve => setTimeout(resolve, 300)); // Stagger downloads
            }
        }
    };
    
    const handleDownloadZip = async () => { 
        const completedImages = resultsRef.current.filter(r => r.imageStatus === 'completed' && r.imageUrl);
        if (completedImages.length === 0) {
            showNotification("No completed images to download.");
            return;
        }
        showNotification("Creating ZIP file..."); 
        try {
            const zip = new JSZip(); 
            completedImages.forEach((result, index) => { 
                const base64Data = result.imageUrl!.split(',')[1]; 
                zip.file(`scene_${index + 1}.jpeg`, base64Data, { base64: true }); 
            }); 
            const content = await zip.generateAsync({ type: "blob" }); 
            const link = document.createElement('a'); 
            link.href = URL.createObjectURL(content); 
            link.download = `${projectName.replace(/\s+/g, '_')}_scenes.zip`; 
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link); 
            showNotification("ZIP file download started.");
        } catch (e: any) {
            handleError(e, "ZIP file creation");
            await handleDownloadAllSingles();
        }
    };
    
    const handleSaveProject = async () => {
        if (!projectName.trim()) { showNotification("Please enter a project name."); return; }
        try {
            const projectData: ProjectData = {
                projectName: projectName.trim(),
                script,
                results,
                videoDuration,
                videoDurationSec,
                imageCount,
                aspectRatio,
                selectedThemes,
                selectedModifiers,
                cameraAngle,
                scriptType,
                fileName,
                referenceFiles: referenceFiles.map(({ name, size }) => ({ name, size })),
                characterProfiles: characterProfiles.map(p => ({
                    id: p.id,
                    userDescription: p.userDescription,
                    aiDescription: p.aiDescription,
                    image: p.image ? { name: p.image.name, size: p.image.size } : null
                })),
                videoModel,
                videoPromptBasis,
                includeDialogue,
                includeAmbient,
                includeSfx,
            };
    
            await dbHelper.saveProject(projectData);
            showNotification(`Project "${projectName.trim()}" saved successfully!`);
            await loadSavedProjects();
            await calculateStorageUsage();
        } catch (e: any) {
            showNotification(`Error saving project: ${e.message}. The project might be too large.`);
            handleError({ message: "Failed to save the project to IndexedDB. It might be too large.", stack: e.stack }, "Save Project");
        }
    };
    
    const handleLoadProject = async (name?: string) => {
        const projectToLoad = name || projectName.trim();
        if (!projectToLoad) { showNotification("Please enter or select a project name to load."); return; }
        
        try {
            const projectData = await dbHelper.loadProject(projectToLoad);
            if (projectData) {
                const loadedRefFiles: ReferenceFile[] = (projectData.referenceFiles || []).map((f: any) => ({
                    name: f.name,
                    size: f.size,
                    dataUrl: '', 
                    file: null
                }));
                const loadedCharProfiles: CharacterProfile[] = (projectData.characterProfiles || [{ userDescription: '', aiDescription: '', image: null }]).map((p: any) => ({
                    id: crypto.randomUUID(),
                    userDescription: p.userDescription,
                    aiDescription: p.aiDescription,
                    image: p.image ? { name: p.image.name, size: p.image.size, dataUrl: '', file: null } : null,
                }));
    
                setProjectName(projectData.projectName);
                setScript(projectData.script);
                setResults(projectData.results || []);
                setVideoDuration(projectData.videoDuration);
                setVideoDurationSec(projectData.videoDurationSec || 0);
                setImageCount(projectData.imageCount);
                setAspectRatio(projectData.aspectRatio);
                setSelectedThemes(projectData.selectedThemes);
                setSelectedModifiers(projectData.selectedModifiers);
                setCameraAngle(projectData.cameraAngle);
                setScriptType(projectData.scriptType);
                setFileName(projectData.fileName);
                setReferenceFiles(loadedRefFiles);
                setCharacterProfiles(loadedCharProfiles.length > 0 ? loadedCharProfiles : [{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]);
                if (projectData.videoModel) setVideoModel(projectData.videoModel);
                if (projectData.videoPromptBasis) setVideoPromptBasis(projectData.videoPromptBasis);
                setIncludeDialogue(projectData.includeDialogue || false);
                setIncludeAmbient(projectData.includeAmbient || false);
                setIncludeSfx(projectData.includeSfx || false);
                showNotification(`Project "${projectData.projectName}" loaded successfully!`);
            } else {
                showNotification(`No project found with the name "${projectToLoad}".`);
            }
        } catch (e: any) {
            showNotification(`Error loading project: ${e.message}`);
            handleError(e, 'load project');
        }
    };
    const handleConfirmDelete = async () => { if (!projectToDelete) return; try { await dbHelper.deleteProject(projectToDelete); showNotification(`Project "${projectToDelete}" deleted.`); await loadSavedProjects(); if (projectName === projectToDelete) { setProjectName(''); } await calculateStorageUsage(); } catch (e: any) { showNotification(`Error deleting project: ${e.message}`); handleError({ message: e.message, stack: e.stack }, "Delete Project"); } finally { setProjectToDelete(null); } };
    const handleCancelDelete = () => { setProjectToDelete(null); };
    const handleDeleteProject = (name: string) => { setProjectToDelete(name); };
    const handleGenerateScript = async () => {  if (!scriptIdea.trim()) { handleError({ message: "Please enter a story idea first."}, "Generate Script"); return; } setIsGeneratingScript(true); showNotification("Generating script from your idea... Est. time: ~45s"); try { const prompt = `You are a creative scriptwriter. Based on the following idea, write a short story script broken down into approximately ${imageCount} logical scenes. The script should be suitable for visual adaptation. Respond ONLY with the script text itself, without any introductions or extra formatting.\n\nIDEA: "${scriptIdea}"`; const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'generate script'); const newScript = result.text; if (newScript) { setScript(newScript); showNotification("Script generated successfully!"); } else { throw new Error("AI failed to return a script."); } } catch (e: any) { if (e.message !== "stopped") handleError(e, 'generate script'); } finally { setIsGeneratingScript(false); } };
    
    const analyzeCharacterImage = async (file: File, characterId: string) => { setIsAnalyzingCharacter(characterId); showNotification("Analyzing character image... Est. time: ~15s"); try { const base64Data = (await fileToBase64(file)).split(',')[1]; const imagePart = { inlineData: { mimeType: file.type, data: base64Data } }; const visionPrompt = "Analyze this person's appearance in extreme detail for an AI image generator to recreate them consistently. Describe their facial structure, eye color and shape, hair color and style, skin tone, estimated age, body type, and the style and color of their clothing. Be objective and descriptive."; const response = await executeGenerativeAiTask('gemini-2.5-flash', { parts: [imagePart, { text: visionPrompt }] }, 'character image analysis'); const description = response.text; if (description) { setCharacterProfiles(prev => prev.map(p => p.id === characterId ? { ...p, aiDescription: `\n\n--- AI Analysis from Image ---\n${description}` } : p)); showNotification("Character analysis appended to description!"); } else { showNotification("Character analysis did not return any text."); } } catch (e: any) { if (e.message !== "stopped") handleError(e, 'character image analysis'); } finally { setIsAnalyzingCharacter(null); } };
    
    const processCharacterImageFiles = async (files: File[], characterId: string) => {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            const dataUrl = await fileToBase64(file);
            const newFile: ReferenceFile = { name: file.name, size: formatBytes(file.size), dataUrl, file };
            setCharacterProfiles(prev => prev.map(p => p.id === characterId ? { ...p, image: newFile } : p));
            await analyzeCharacterImage(file, characterId);
        }
    };
    const handleCharacterImageUpload = (event: React.ChangeEvent<HTMLInputElement>, characterId: string) => { const files = event.target.files; if (files) processCharacterImageFiles(Array.from(files), characterId); };
    const handleCharacterImageDrop = (e: React.DragEvent<HTMLDivElement>, characterId: string) => { e.preventDefault(); e.stopPropagation(); setIsDraggingChar(null); const files = e.dataTransfer.files; if (files) processCharacterImageFiles(Array.from(files), characterId); };
    const handleCharacterImagePaste = async (e: React.ClipboardEvent<HTMLDivElement>, characterId: string) => { const items = e.clipboardData.items; for (const item of items) { if (item.type.includes('image')) { const file = item.getAsFile(); if (file) processCharacterImageFiles([file], characterId); } } };

    const handleAnalyzeScript = async (options: { configureVoice: boolean; genderPreference?: 'any' | 'male' | 'female', keepExistingVoice?: boolean } = { configureVoice: true, genderPreference: 'any', keepExistingVoice: false }) => {
        if (!scriptRef.current.trim()) {
            showNotification("Please provide a script to analyze.");
            return;
        }
        setIsAnalyzingScriptContent(true);
        stopGenerationRef.current = false;
        showNotification("Analyzing script to extract characters... Est. time: ~30s");
        try {
            const prompt = `Analyze the following script to identify all key characters. Your response MUST be a valid JSON object. The JSON object should have one key: "characters". The "characters" key should contain an array of objects, one for each distinct character found. Each character object should have two keys: "name" (a string) and "description" (a string summarizing their appearance, personality, or key actions as described in the script). If no characters with names or specific dialogue/actions are present, you MUST return an empty array for "characters". Do not invent characters from vague descriptions (e.g., 'a narrator'). Your response must be strictly {"characters": []} in this case.\n\nHere is the script:\n---\n${scriptRef.current}\n---`;
            const result = await executeGenerativeAiTask('gemini-2.5-pro', prompt, 'analyze script characters', jsonValidator);
            if (stopGenerationRef.current) {
                showNotification("Analysis stopped.");
                return;
            }
            const responseText = result.text;
            const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanedJson);
            if (parsedData.characters && parsedData.characters.length > 0) {
                const analysisHeader = "\n\n--- AI Script Analysis ---\n";
                const newProfiles = parsedData.characters.map((c: { name: string, description: string }) => ({
                    id: crypto.randomUUID(),
                    userDescription: `Name: ${c.name}`,
                    aiDescription: `${analysisHeader}Description: ${c.description}`,
                    image: null
                }));
                setCharacterProfiles(newProfiles);
                showNotification(`Script analyzed! ${newProfiles.length} character profiles have been created/updated.`);
            } else {
                showNotification("Analysis complete, but no distinct characters were found to add to the profile.");
                setCharacterProfiles([{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]);
            }
    
            if (options.configureVoice) {
                await autoConfigureVoiceover(scriptRef.current, options.genderPreference, options.keepExistingVoice);
            }
    
        } catch (e: any) {
            if (e.message !== "stopped") handleError(e, 'analyze script');
        } finally {
            setIsAnalyzingScriptContent(false);
        }
    };

    const handleAddCharacter = () => { setCharacterProfiles(prev => [...prev, { id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]); };
    const handleRemoveCharacter = (id: string) => { setCharacterProfiles(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev); };
    const handleCharacterDescriptionChange = (id: string, value: string) => { setCharacterProfiles(prev => prev.map(p => p.id === id ? { ...p, userDescription: value } : p)); };

    const handleSavePreset = () => { if (!newPresetName.trim()) { showNotification("Please enter a name for the preset."); return; } if (stylePresets.some(p => p.name === newPresetName.trim())) { showNotification("A preset with this name already exists."); return; } const newPreset: StylePreset = { name: newPresetName.trim(), themes: selectedThemes, modifiers: selectedModifiers, angle: cameraAngle }; const updatedPresets = [...stylePresets, newPreset]; setStylePresets(updatedPresets); localStorage.setItem('stylePresets', JSON.stringify(updatedPresets)); setNewPresetName(''); showNotification(`Preset "${newPreset.name}" saved!`); };
    const handleLoadPreset = (preset: StylePreset) => { setSelectedThemes(preset.themes); setSelectedModifiers(preset.modifiers); setCameraAngle(preset.angle); showNotification(`Preset "${preset.name}" loaded!`); };
    const handleDeletePreset = (presetName: string) => { const updatedPresets = stylePresets.filter(p => p.name !== presetName); setStylePresets(updatedPresets); localStorage.setItem('stylePresets', JSON.stringify(updatedPresets)); showNotification(`Preset "${presetName}" deleted.`); };
    const handleExportPrompts = () => {
        const currentResults = resultsRef.current;
        if (currentResults.length === 0) {
            showNotification("No prompts to export.");
            return;
        }
        let content = `Project: ${projectName}\n\n--- PROMPTS ---\n\n`;
        currentResults.forEach((result, index) => {
            content += `SCENE ${index + 1}\n`;
            content += `Description: ${result.scene_description}\n`;
            content += `Image Prompt: ${result.image_prompt}\n`;
            if (result.video_prompt) {
                content += `Video Prompt (${videoModel}): ${result.video_prompt}\n`;
            }
            content += '--------------------------------------------------\n\n';
        });
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${projectName.replace(/\s+/g, '_')}_prompts.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Prompts exported to .txt file.");
    };
    
    const handleConfirmClearAllProjects = async () => {
        try {
            await dbHelper.clearAllProjects();
            setSavedProjects([]);
            setProjectName('My AI Project');
            setScript('');
            setResults([]);
            await calculateStorageUsage();
            showNotification("All projects have been cleared from the browser.");
        } catch (e: any) {
             showNotification(`Error clearing projects: ${e.message}`);
             handleError({ message: e.message, stack: e.stack }, "Clear All Projects");
        } finally {
            setShowClearAllProjectsConfirm(false);
        }
    };
    const handleAudioAutopilot = async (isMasterAutopilot = false) => {
        const currentVoiceoverScript = voiceoverScriptRef.current;
        if (!currentVoiceoverScript.trim()) {
            const message = "Audio Autopilot: Please provide a script first.";
            if (!isMasterAutopilot) showNotification(message, true);
            throw new Error(message);
        }
    
        if (!isMasterAutopilot) {
            showNotification("Audio Autopilot started...");
            const steps = [
                "1. Analyzing script to extract dialogue.",
                "2. Selecting best voice, tone, and speed.",
                "3. Generating audio (in chunks).",
                "4. Merging and downloading final audio file."
            ];
            showNotification(`Autopilot will perform:\n${steps.join('\n')}`);
            // Standalone audio pilot defaults to 'any' gender to avoid confusion.
            await autoConfigureVoiceover(currentVoiceoverScript, 'any');
        }
    
        await handleGenerateChunkedAudio();
    
        if (stopChunkGenerationRef.current) {
            throw new Error("stopped");
        }
    
        await new Promise(resolve => setTimeout(resolve, 200));
    
        const completedChunks = audioChunksRef.current.filter(c => c.status === 'complete');
        if (completedChunks.length > 0) {
            if (audioChunksRef.current.some(c => c.status === 'failed')) {
                throw new Error("AUDIO_GENERATION_FAILED");
            }
    
            if (!isMasterAutopilot) showNotification("Audio generation complete. Now merging...");
            
            const mergedBytes = await mergeAudioChunks(audioChunksRef.current);
            if (mergedBytes) {
                handleDownloadAudio(mergedBytes, `${projectName.replace(/\s+/g, '_')}_voiceover.wav`);
                if (!isMasterAutopilot) showNotification("Audio Autopilot finished successfully!");
            } else {
                const message = "Audio Autopilot: Merging failed.";
                if (!isMasterAutopilot) showNotification(message, true);
                throw new Error(message);
            }
        } else {
             throw new Error("AUDIO_GENERATION_FAILED");
        }
    };
    
    const handleGenerateSample = async () => {
        if (!voiceoverScript.trim()) {
            showNotification("Please provide a script to sample.");
            return;
        }
        setIsGeneratingSample(true);
        setSampleAudioUrl(null);
        showNotification("Generating 15s audio sample...");

        try {
            const apiVoiceName = getSelectedApiVoiceName();
            if (!apiVoiceName) {
                throw new Error(`Selected voice "${ttsConfig.voice}" configuration not found.`);
            }

            const ai = getAiClient();
            const sampleText = voiceoverScript.substring(0, 250); // Approx 15 seconds
            const samplePrompt = createTtsPrompt(sampleText, ttsConfig, customTtsPrompt, forceSpeed);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: samplePrompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } } },
                },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("API did not return audio data for sample.");
            
            const audioBytes = decode(base64Audio);
            const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
            const url = URL.createObjectURL(wavBlob);
            setSampleAudioUrl(url);
            showNotification("Audio sample ready!");

        } catch(e: any) {
            handleError(e, "audio sample generation");
        } finally {
            setIsGeneratingSample(false);
        }
    };

    const handleRetryFailedAudioChunks = async (): Promise<boolean> => {
        stopChunkGenerationRef.current = false;
        setAllKeysPermanentlyFailed(false);
        const failedChunks = audioChunksRef.current.filter(c => c.status === 'failed');
        if (failedChunks.length === 0) return true;
    
        showNotification(`Retrying ${failedChunks.length} failed audio chunks...`);
    
        const apiVoiceName = getSelectedApiVoiceName();
        if (!apiVoiceName) {
            throw new Error(`Selected voice "${ttsConfig.voice}" configuration not found.`);
        }
    
        for (const chunk of failedChunks) {
            if (stopChunkGenerationRef.current) {
                showNotification("Chunk retry stopped by user.");
                break;
            }
            if (allKeysPermanentlyFailedRef.current) {
                 setAudioChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'failed', error: 'All API keys failed.' } : c));
                 handleError({ message: 'All API keys failed.' }, `audio chunk ${chunk.id + 1} retry`);
                 break;
            }
            
            const i = chunk.id;
            setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'generating', error: undefined } : c));
            
            try {
                const ai = getAiClient();
                const currentChunkText = chunk.text;
                const prompt = createTtsPrompt(currentChunkText, ttsConfig, customTtsPrompt, forceSpeed);
    
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: prompt }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } } },
                    },
                });
                
                if (stopChunkGenerationRef.current) break;
    
                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (!base64Audio) throw new Error("API did not return audio data for this chunk.");
    
                const audioBytes = decode(base64Audio);
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'complete', audioBytes, audioUrl } : c));
                
                await new Promise(resolve => setTimeout(resolve, 500));
    
            } catch (e: any) {
                console.error(`Error retrying chunk ${i}:`, e);
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: e.message } : c));
                handleError(e, `audio chunk ${i + 1} retry`);
            }
        }
        const stillFailedCount = audioChunksRef.current.filter(c => c.status === 'failed').length;
        return stillFailedCount === 0;
    };


    // --- Master Autopilot Functions ---
    const enabledStepsConfig = [
        { id: 1, text: 'Rephrasing Script for Copyright...', enabled: () => rephraseInAutopilot, task: handleRephraseScript },
        { id: 2, text: 'Analyzing Script, Characters & Style...', enabled: () => true, task: () => handleAnalyzeScript({ configureVoice: useAiToAutoConfigureVoiceover, genderPreference: autopilotVoiceGender, keepExistingVoice: useUserSelectedVoiceInAutopilot }) },
        { id: 3, text: 'Generating Image Prompts & Images...', enabled: () => true, task: executePromptAndImageGeneration },
        { id: 4, text: 'Generating Video Prompts...', enabled: () => true, task: handleGenerateVideoPrompts },
        { id: 5, text: 'Preparing & Downloading Assets...', enabled: () => true, task: async () => { await handleDownloadZip(); handleExportPrompts(); } },
        { id: 6, text: 'Generating & Downloading Voiceover...', enabled: () => true, task: () => handleAudioAutopilot(true) }
    ];

    const handleOpenAutopilotModal = () => {
        if (!script.trim()) {
            showNotification("Please provide a script before starting the Autopilot.");
            return;
        }
        // Sync the Autopilot's first step with the main UI's choice.
        if (generateUniqueStory) {
            setRephraseInAutopilot(true);
        }
        setIsAutopilotModalVisible(true);
        if (!autopilotProgress || autopilotCompleted || (autopilotProgress && autopilotProgress.isError && autopilotProgress.stepId !== 3 && autopilotProgress.stepId !== 6)) {
             autopilotStopRef.current = false;
             autopilotPauseRef.current = false;
             setIsAutopilotPaused(false);
             setAutopilotProgress(null);
             setAutopilotCompleted(false);
             setAutopilotElapsedTime(0);
        }
    };

    const runAutopilotSteps = async (startingStepId = 1) => {
        if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current);
        autopilotTimerRef.current = window.setInterval(() => setAutopilotElapsedTime(prev => prev + 1), 1000);

        const activeSteps = enabledStepsConfig.filter(s => s.enabled());
        const totalSteps = activeSteps.length;
        const startingStepIndex = activeSteps.findIndex(s => s.id === startingStepId);

        if (startingStepIndex === -1) {
            throw new Error(`Could not find starting step ${startingStepId} in active steps.`);
        }
        
        try {
            for (let i = startingStepIndex; i < activeSteps.length; i++) {
                const step = activeSteps[i];
                const stepCounter = activeSteps.findIndex(s => s.id === step.id);
                setAutopilotProgress({ step: stepCounter + 1, totalSteps, stepId: step.id, message: step.text, isError: false });
                
                while (autopilotPauseRef.current) {
                    if (autopilotStopRef.current) throw new Error('stopped');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (step.id === 5) {
                    const completedImages = resultsRef.current.filter(r => r.imageStatus === 'completed');
                    if (completedImages.length === 0) {
                        throw new Error('NO_IMAGES_COMPLETED');
                    }
                }

                if (autopilotStopRef.current) throw new Error('stopped');
                await step.task();
                if (autopilotStopRef.current) throw new Error('stopped');

                // Step Verification
                if (step.id === 3) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Allow state to settle
                    const allImagesSuccess = resultsRef.current.every(r => r.imageStatus === 'completed');
                    if (!allImagesSuccess) throw new Error('IMAGE_GENERATION_FAILED');
                }
                if (step.id === 6) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Allow state to settle
                    const allAudioSuccess = audioChunksRef.current.every(c => c.status === 'complete');
                     if (!allAudioSuccess) throw new Error('AUDIO_GENERATION_FAILED');
                }
            }
            setAutopilotProgress({ step: totalSteps, totalSteps, stepId: activeSteps[activeSteps.length -1].id, message: 'Autopilot Complete!', isError: false });
            setAutopilotCompleted(true);
            showNotification("Master Autopilot finished successfully!");
        } catch (err: any) {
            const currentStepId = autopilotProgress ? autopilotProgress.stepId : 1;
            let errorMessage = `Error: ${err.message}`;

            switch(err.message) {
                case 'stopped':
                    errorMessage = 'Process stopped by user.';
                    showNotification("Master Autopilot stopped by user.");
                    break;
                case 'PAUSED_BY_CIRCUIT_BREAKER':
                    errorMessage = "Paused due to API quota/key errors. Check your API keys and retry.";
                    break;
                 case "ALL_KEYS_FAILED":
                    errorMessage = "All available API keys have permanent errors. Please add a valid key and retry.";
                    break;
                case 'IMAGE_GENERATION_SAFETY_POLICY':
                    errorMessage = "Paused: Generation failed for one or more items due to safety policy violations. Please review and edit the failed prompts before retrying.";
                    break;
                case 'IMAGE_GENERATION_FAILED':
                    errorMessage = "Paused: Image generation failed for one or more items. Please check the Error Log and retry.";
                    break;
                case 'NO_IMAGES_COMPLETED':
                    errorMessage = "Paused: There are no completed images to download. Please resolve image generation errors and retry.";
                    break;
                case 'AUDIO_GENERATION_FAILED':
                    errorMessage = "Paused: Audio generation failed for one or more chunks. You can retry the failed step.";
                    break;
                default:
                    handleError(err, `Master Autopilot (Step ${currentStepId})`);
                    break;
            }

            setAutopilotProgress(prev => ({ ...prev!, message: errorMessage, isError: true }));

        } finally {
             if (autopilotTimerRef.current && (autopilotCompleted || (autopilotProgress && autopilotProgress.isError) || isAutopilotPaused)) {
                clearInterval(autopilotTimerRef.current);
             }
        }
    };

    const handleStartMasterAutopilot = () => {
        setAutopilotCompleted(false);
        setAutopilotProgress(null);
        autopilotStopRef.current = false;
        autopilotPauseRef.current = false;
        setIsAutopilotPaused(false);
        consecutiveApiFailuresRef.current = 0;
        setIsPausedByCircuitBreaker(false);
        setDisabledKeysForSession([]);
        setAllKeysPermanentlyFailed(false);
        setAutopilotElapsedTime(0);

        // This is the core logic fix. We override the modal's default state
        // if the user has already made a choice in the main UI.
        const firstStepShouldBeEnabled = rephraseInAutopilot || generateUniqueStory;

        const dynamicEnabledStepsConfig = enabledStepsConfig.map(step => {
            if (step.id === 1) {
                // Return a new step object with the overridden `enabled` function
                return { ...step, enabled: () => firstStepShouldBeEnabled };
            }
            return step;
        });

        const firstActiveStep = dynamicEnabledStepsConfig.find(s => s.enabled());
        
        if (firstActiveStep) {
            runAutopilotSteps(firstActiveStep.id);
        } else {
            // This case handles if the user unchecks the first step AND `generateUniqueStory` is false.
            // We need to find the *next* available step.
            const nextStep = enabledStepsConfig.find(s => s.id > 1 && s.enabled());
            if (nextStep) {
                 runAutopilotSteps(nextStep.id);
            } else {
                showNotification("No autopilot steps are enabled to run.", true);
                handleError({ message: "No active steps for Autopilot." }, "Master Autopilot Start");
            }
        }
    };
    
    const handleRetryAndResumeAutopilot = async () => {
        if (!autopilotProgress || !autopilotProgress.isError) return;
    
        const failedStepId = autopilotProgress.stepId;
        setAutopilotProgress(prev => ({ ...prev!, isError: false, message: `Recovering step...` }));
        
        autopilotStopRef.current = false;
        stopGenerationRef.current = false;
        stopChunkGenerationRef.current = false;
        consecutiveApiFailuresRef.current = 0;
        setIsPausedByCircuitBreaker(false);
        setAllKeysPermanentlyFailed(false);
        setDisabledKeysForSession([]);
    
        try {
            let stepSuccess = false;
    
            if (failedStepId === 3) {
                if (resultsRef.current.length === 0) {
                    showNotification("No prompts found. Retrying prompt and image generation from scratch...");
                    stepSuccess = await executePromptAndImageGeneration();
                } else {
                    showNotification("Retrying failed images...");
                    stepSuccess = await handleRetryFailed();
                }
            } else if (failedStepId === 6) {
                showNotification("Retrying failed audio chunks...");
                const retrySuccess = await handleRetryFailedAudioChunks();
                if (!retrySuccess) {
                    throw new Error("Some audio chunks still failed after retry.");
                }
    
                showNotification("Merging audio...");
                const mergedBytes = await mergeAudioChunks(audioChunksRef.current);
                if (mergedBytes) {
                    handleDownloadAudio(mergedBytes, `${projectName.replace(/\s+/g, '_')}_voiceover.wav`);
                    stepSuccess = true;
                } else {
                    throw new Error("Merging failed after successful retry.");
                }
            }
    
            if (autopilotStopRef.current) throw new Error('stopped');
    
            if (stepSuccess) {
                showNotification("Step successfully recovered! Resuming Autopilot...");
                const activeSteps = enabledStepsConfig.filter(s => s.enabled());
                const currentStepIndexInActive = activeSteps.findIndex(s => s.id === failedStepId);
                const nextStep = activeSteps[currentStepIndexInActive + 1];
    
                if (nextStep) {
                    runAutopilotSteps(nextStep.id);
                } else {
                    const totalSteps = activeSteps.length;
                    setAutopilotProgress({ step: totalSteps, totalSteps: totalSteps, stepId: failedStepId, message: 'Autopilot Complete!', isError: false });
                    setAutopilotCompleted(true);
                    showNotification("Master Autopilot finished successfully!");
                }
            } else {
                 showNotification("Some items still failed. Please check logs or retry manually.", true);
                 setAutopilotProgress(prev => ({ ...prev!, message: "Retry failed. Please check errors and API keys.", isError: true }));
            }
    
        } catch (err: any) {
             if (err.message !== 'stopped') {
                handleError(err, `Autopilot Retry (Step ${failedStepId})`);
                setAutopilotProgress(prev => ({ ...prev!, message: `Retry failed: ${err.message}`, isError: true }));
            } else {
                setAutopilotProgress(prev => ({ ...prev!, message: 'Retry stopped by user.', isError: true }));
            }
        }
    };


    const handleStopAutopilot = () => {
        autopilotStopRef.current = true;
        autopilotPauseRef.current = false;
        setIsAutopilotPaused(false);
        stopGenerationRef.current = true;
        stopChunkGenerationRef.current = true;
        stopAudioGenerationRef.current = true;
        stopVideoGenerationRef.current = true;
        setIsRephrasing(false);
        if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current);
        setAutopilotProgress(prev => ({...prev!, message: "Autopilot stopped by user.", isError: true}));
        showNotification("Stopping Autopilot...");
    };

    const handlePauseResumeAutopilot = () => {
        const willBePaused = !isAutopilotPaused;
        setIsAutopilotPaused(willBePaused);
        autopilotPauseRef.current = willBePaused;
    
        if (willBePaused) {
            if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current);
            setAutopilotProgress(prev => ({...prev!, message: 'Autopilot Paused by user.'}));
            showNotification("Autopilot Paused.");
        } else {
            if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current);
            autopilotTimerRef.current = window.setInterval(() => setAutopilotElapsedTime(prev => prev + 1), 1000);
            const currentStepMessage = enabledStepsConfig.find(s => s.id === autopilotProgress?.stepId)?.text || 'Resuming...';
            setAutopilotProgress(prev => ({...prev!, message: currentStepMessage}));
            showNotification("Autopilot Resumed.");
        }
    };
    
    const handleSkipAutopilotStage = () => {
        if (!autopilotProgress) return;
        
        showNotification(`Skipping step: ${autopilotProgress.message}...`);

        const activeSteps = enabledStepsConfig.filter(s => s.enabled());
        const currentStepIndexInActive = activeSteps.findIndex(s => s.id === autopilotProgress.stepId);
        const nextStep = activeSteps[currentStepIndexInActive + 1];

        if (nextStep) {
            runAutopilotSteps(nextStep.id);
        } else {
            const totalSteps = activeSteps.length;
            setAutopilotProgress({ step: totalSteps, totalSteps: totalSteps, stepId: autopilotProgress.stepId, message: 'Autopilot Complete!', isError: false });
            setAutopilotCompleted(true);
            showNotification("Master Autopilot finished successfully!");
        }
    };

    // Audio duration calculation
    const WPM_RATE = 150;
    const wordCount = voiceoverScript.trim().split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = wordCount > 0 ? (wordCount / (WPM_RATE * ttsConfig.speed)) * 60 : 0;
    const targetSeconds = (videoDuration * 60) + (videoDurationSec || 0);
    const recommendedWords = targetSeconds > 0 ? Math.floor((targetSeconds / 60) * (WPM_RATE * ttsConfig.speed)) : 0;
    const isTTSBusy = isGeneratingSample || isGeneratingAudio || isGeneratingChunks;
    const currentAutopilotStepDetails = autopilotProgress ? autopilotSteps.find(s => s.id === autopilotProgress.stepId) : null;


    if (appLocked) { return ( <div className="lock-screen"><div className="lock-card"><h1>Application Access</h1><p>{lockMessage}</p><div className="form-group"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Full Name" required /><input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Your Registered Email" required /><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Your Phone Number (Required)" required /></div><div className="login-actions"><button onClick={handleUnlock} disabled={verifying}>{verifying ? 'Verifying...' : 'Login / Register'}</button></div>{lockError && <p className="lock-error">{lockError}</p>}{lockSuccess && <p className="lock-success">{lockSuccess}</p>}<div className="contact-links"><p>Need Help? Contact Developer</p><div className="social-links-login"><a href="https://t.me/tasints" target="_blank" rel="noopener noreferrer" className="social-link"><TelegramIcon /> Telegram</a><a href="https://wa.me/message/K4UWIP55B2XGP1" target="_blank" rel="noopener noreferrer" className="social-link"><WhatsAppIcon /> WhatsApp</a></div></div></div></div> ); }

    return (
        <main>
            {isRephrasing && <div className="progress-indicator">{rephrasingProgress}</div>}
            <div className="notification-container" style={{ pointerEvents: 'none' }}>
                {notifications.map(n => <div key={n.id} className="notification" style={{ pointerEvents: 'auto' }}>{n.message}</div>)}
            </div>
            {previewImage && ( <div className="image-preview-modal" onClick={() => setPreviewImage(null)}> <span className="close-preview">&times;</span> <img src={previewImage} alt="Preview" /> </div> )}
            {isConfirmModalVisible && <ConfirmationModal onConfirm={handleConfirmGeneration} onCancel={() => { setIsConfirmModalVisible(false); showNotification("Generation cancelled by user."); }} imageCount={imageCount} isAutopilot={isAutopilot} />}
            {projectToDelete && <DeleteConfirmationModal projectName={projectToDelete} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
            {showClearAllProjectsConfirm && <ClearAllProjectsConfirmationModal onConfirm={handleConfirmClearAllProjects} onCancel={() => setShowClearAllProjectsConfirm(false)} />}
            {showMismatchWarning && <MismatchWarningModal onConfirm={executeVideoGeneration} onCancel={() => setShowMismatchWarning(false)} fromModel={videoModel} toModel="Veo 3.1" />}
            {isAutopilotModalVisible && (() => {
                const autopilotProgressPercentage = autopilotCompleted
                    ? 1
                    : autopilotProgress
                    ? (autopilotProgress.step - 1) / autopilotProgress.totalSteps
                    : 0;
                const autopilotProgressText = autopilotCompleted
                    ? '100%'
                    : autopilotProgress
                    ? `${Math.round(((autopilotProgress.step - 1) / autopilotProgress.totalSteps) * 100)}%`
                    : '0%';
                
                const dynamicAutopilotSteps = autopilotSteps.map(step => {
                    if (step.id === 1) {
                        return { ...step, text: generateUniqueStory ? 'Generate New Unique Story' : 'Rephrase Script for Copyright' };
                    }
                    return step;
                });

                return (
                 <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal-content autopilot-modal-content">
                        <div className="autopilot-header">
                            <h3><MasterAutopilotIcon /> Master Autopilot</h3>
                            <div className="autopilot-timer-display">Elapsed Time: <strong>{formatTime(autopilotElapsedTime)}</strong></div>
                        </div>
                        
                        <div className="autopilot-main-content">
                            <div className="autopilot-progress-status-container">
                                <div className="autopilot-progress-ring">
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                                        <circle
                                            cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 54}
                                            strokeDashoffset={(2 * Math.PI * 54) * (1 - autopilotProgressPercentage)}
                                            strokeLinecap="round"
                                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
                                        />
                                    </svg>
                                    <div className="autopilot-progress-text">
                                        {autopilotProgressText}
                                    </div>
                                </div>
                                <div className="autopilot-workflow">
                                    <ol>
                                        {dynamicAutopilotSteps.map(step => {
                                            const isEnabled = (step.id !== 1 || rephraseInAutopilot);
                                            if (!isEnabled) return null;
                                            
                                            const isCompleted = autopilotCompleted || (autopilotProgress ? step.id < autopilotProgress.stepId : false);
                                            const isActive = autopilotProgress ? step.id === autopilotProgress.stepId && !autopilotCompleted && !autopilotProgress.isError : false;
                                            const isError = autopilotProgress ? step.id === autopilotProgress.stepId && autopilotProgress.isError : false;
                                            
                                            let className = '';
                                            if (isCompleted) className = 'completed';
                                            if (isActive) className = 'active';
                                            if (isError) className = 'error';

                                            return (
                                                <li key={step.id} className={className}>
                                                    {isCompleted ? <CheckIcon /> : <div className="step-placeholder-icon"></div>}
                                                    {step.text}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>
                            </div>

                            <div className="autopilot-controls-config-panel">
                                <div className="autopilot-config-box">
                                     <div className="config-item-autopilot">
                                        <input type="checkbox" id="rephrase-autopilot" checked={rephraseInAutopilot} onChange={(e) => setRephraseInAutopilot(e.target.checked)} disabled={!!autopilotProgress}/>
                                        <label htmlFor="rephrase-autopilot">{generateUniqueStory ? 'Generate New Unique Story' : 'Rephrase Script for Copyright'}</label>
                                    </div>
                                    <div className="config-item-autopilot">
                                        <input type="checkbox" id="auto-config-voice-autopilot" checked={useAiToAutoConfigureVoiceover} onChange={(e) => setUseAiToAutoConfigureVoiceover(e.target.checked)} disabled={!!autopilotProgress}/>
                                        <label htmlFor="auto-config-voice-autopilot">Use AI to Auto-Configure Voiceover</label>
                                    </div>
                                    <div className="config-item-autopilot sub-option-autopilot">
                                        <input 
                                            type="checkbox" 
                                            id="use-user-voice-autopilot" 
                                            checked={useUserSelectedVoiceInAutopilot} 
                                            onChange={(e) => setUseUserSelectedVoiceInAutopilot(e.target.checked)} 
                                            disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}
                                        />
                                        <label htmlFor="use-user-voice-autopilot">Use User Selected Voice</label>
                                    </div>
                                </div>

                                <div className="autopilot-config-box voice-gender-box">
                                    <p className="config-title">Voice Gender Preference:</p>
                                    <div className="autopilot-voice-pref-radios">
                                        <label><input type="radio" name="autopilot-gender" value="any" checked={autopilotVoiceGender === 'any'} onChange={(e) => setAutopilotVoiceGender(e.target.value as any)} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Any</label>
                                        <label><input type="radio" name="autopilot-gender" value="male" checked={autopilotVoiceGender === 'male'} onChange={(e) => setAutopilotVoiceGender(e.target.value as any)} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Male</label>
                                        <label><input type="radio" name="autopilot-gender" value="female" checked={autopilotVoiceGender === 'female'} onChange={(e) => setAutopilotVoiceGender(e.target.value as any)} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Female</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {autopilotProgress && (
                            <div className={`autopilot-current-step-status ${autopilotProgress.isError ? 'error' : ''} ${autopilotCompleted ? 'completed' : ''}`}>
                                <div className="status-indicator-bar">
                                    {autopilotCompleted ? <CheckIcon/> : autopilotProgress.isError ? <ErrorIcon/> : <div className="loader small-loader"></div>}
                                </div>
                                <span style={{ flexGrow: 1 }}><strong>{autopilotCompleted ? 'Master Autopilot Complete!' : `Step ${autopilotProgress.step}/${autopilotProgress.totalSteps}: ${dynamicAutopilotSteps.find(s => s.id === autopilotProgress.stepId)?.text || '...'}`}</strong><br/>{autopilotProgress.message}</span>
                                {autopilotProgress && !autopilotCompleted && !autopilotProgress.isError && (
                                     <button 
                                        onClick={handleSkipAutopilotStage} 
                                        style={{
                                            marginLeft: 'auto',
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--border)',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer'
                                        }}
                                        title="Skip this stage and move to the next one"
                                    >
                                        Skip This Stage
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="confirmation-modal-actions">
                             <button onClick={() => setIsAutopilotModalVisible(false)} className="cancel-btn">
                                {autopilotProgress && !autopilotCompleted && !autopilotProgress.isError ? 'Hide' : 'Close'}
                            </button>
                            {autopilotCompleted ? (
                                 <button onClick={() => { setIsAutopilotModalVisible(false); setAutopilotProgress(null); setAutopilotCompleted(false); }} className="confirm-btn">OK</button>
                            ) : autopilotProgress && autopilotProgress.isError ? (
                                <>
                                    <button onClick={handleStopAutopilot} className="stop-button">Cancel Autopilot</button>
                                    <button 
                                        onClick={handleSkipAutopilotStage}
                                        style={{
                                            backgroundColor: 'var(--border)',
                                            color: 'var(--text-secondary)',
                                        }}
                                        className="cancel-btn"
                                    >
                                        Skip This Stage
                                    </button>
                                    {(autopilotProgress.stepId === 3 || autopilotProgress.stepId === 6) && <button onClick={handleRetryAndResumeAutopilot} className="confirm-btn">Retry & Resume</button>}
                                </>
                            ) : autopilotProgress ? (
                                <>
                                    <button onClick={handlePauseResumeAutopilot} className="confirm-btn">{isAutopilotPaused ? 'Resume' : 'Pause'}</button>
                                    <button onClick={handleStopAutopilot} className="stop-button">Stop Autopilot</button>
                                </>
                            ) : (
                                <button onClick={handleStartMasterAutopilot} className="confirm-btn">
                                    Start Autopilot
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}
            
            <div className="app-header">
                <h1>ULTIMATE AI AUTOMATIONER</h1>
                <p className="developed-by">Developed by <a href="https://techseekeracademy.com/" target="_blank" rel="noopener noreferrer"><span className="tech">TECH</span> <span className="seeker">SEEKER</span> <span className="academy">ACADEMY</span></a></p>
            </div>
            
            <div className="top-bar">
                <button className="master-autopilot-btn" onClick={handleOpenAutopilotModal} disabled={!script.trim() || enabledApiKeys.length === 0}><MasterAutopilotIcon/> Master Autopilot</button>
                <div className="top-bar-controls">
                    <div className="log-shortcuts">
                        <button onClick={() => notificationLogRef.current?.scrollIntoView({ behavior: 'smooth' })} title="Go to Notification Log"><LogIcon/> Notifications</button>
                        <button onClick={() => errorLogRef.current?.scrollIntoView({ behavior: 'smooth' })} title="Go to Error Log"><ErrorIcon/> Errors</button>
                    </div>
                    <div className="theme-selector"><div className="palette-switcher"><span>Palette:</span><button onClick={() => setPalette('black-purple')} className={palette === 'black-purple' ? 'active' : ''}>B&P</button><button onClick={() => setPalette('cyan')} className={palette === 'cyan' ? 'active' : ''}>Cyan</button><button onClick={() => setPalette('green')} className={palette === 'green' ? 'active' : ''}>Green</button><button onClick={() => setPalette('purple')} className={palette === 'purple' ? 'active' : ''}>Purple</button><button onClick={() => setPalette('orange')} className={palette === 'orange' ? 'active' : ''}>Orange</button><button onClick={() => setPalette('dark')} className={palette === 'dark' ? 'active' : ''}>Dark</button></div><div className="theme-toggle"><span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span><label className="switch"><input type="checkbox" checked={theme === 'light'} onChange={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} /><span className="slider"></span></label></div></div>
                </div>
            </div>

            <div className="global-settings">
                 <div className="card project-card"><h2>Project Management</h2><div className="project-actions-top"><div className="input-group"><input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter Project Name" /><button onClick={handleSaveProject} disabled={!projectName.trim()}>Save</button><button onClick={() => handleLoadProject()} disabled={!projectName.trim()}>Load</button></div></div><div className="storage-info"><div className="storage-bar"><div className="storage-bar-fill" style={{ width: `${storageUsage.percentage}%` }}></div></div><p className="storage-text">{storageUsage.used} MB Used / {(100 - storageUsage.percentage).toFixed(0)}% Free</p></div><button onClick={() => setShowClearAllProjectsConfirm(true)} className="clear-storage-btn" title="Clear all saved projects from browser"><TrashIcon/> Clear All Projects</button>{savedProjects.length > 0 && (<div className="saved-projects-list"><h3>Saved Projects</h3><ul>{savedProjects.map(name => (<li key={name}><span className="project-name">{name}</span><div className="project-item-actions"><button onClick={() => handleLoadProject(name)} className="load-btn-small">Load</button><button onClick={() => handleDeleteProject(name)} className="remove-btn" title="Delete project">×</button></div></li>))}</ul></div>)}</div>
                 <div className="card api-key-section"><h2>API Key Management</h2><p className="description">{enabledApiKeys.length === 0 ? <span className="api-key-warning">You must add and enable at least one API key to unlock the app.</span> : "Add your Gemini API keys below and enable one to start using the app."}</p><div className="input-group"><input type="password" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="Add new API Key"/><button onClick={handleAddApiKey}>Add</button></div><div className="api-key-list"><ul>{apiKeys.map(key => (<li key={key} className={enabledApiKeys.includes(key) ? 'enabled' : ''}><span className="key-text">{key.substring(0, 4)}...{key.substring(key.length - 4)}</span><div className="api-key-actions"><label className="switch"><input type="checkbox" checked={enabledApiKeys.includes(key)} onChange={() => handleToggleApiKey(key)} /><span className="slider"></span></label><button onClick={(e) => { e.stopPropagation(); handleRemoveApiKey(key); }} className="remove-btn">×</button></div></li>))}</ul></div></div>
            </div>
            
            <div className="workspace">
                <fieldset disabled={enabledApiKeys.length === 0} className="control-panel">
                    <div className="card config-section">
                        <h2>Configuration</h2>
                        <div className="config-grid">
                            <div className="config-item duration-group">
                                <label htmlFor="durationMin">Video Duration</label>
                                <div className="duration-inputs">
                                    <div className="duration-input-wrapper"><label htmlFor="durationMin">Min</label><input type="number" id="durationMin" min="0" value={videoDuration} onChange={(e) => setVideoDuration(parseInt(e.target.value, 10) || 0)} /></div>
                                    <span className="duration-separator">:</span>
                                    <div className="duration-input-wrapper"><label htmlFor="durationSec">Sec</label><input type="number" id="durationSec" min="0" max="59" value={videoDurationSec} onChange={(e) => setVideoDurationSec(parseInt(e.target.value, 10) || 0)} /></div>
                                </div>
                            </div>
                            <div className="config-item"><label htmlFor="imageCount">Number of Images</label><input type="number" id="imageCount" min="1" value={imageCount} onChange={(e) => setImageCount(parseInt(e.target.value, 10) || 1)} title="Manually editable. Auto-calculated from duration." /></div>
                            <div className="config-item"><label htmlFor="imageModel">Image Model</label><select id="imageModel" value={imageModel} onChange={(e) => setImageModel(e.target.value)}><option value="imagen-4.0-generate-001">Imagen 4 (High Quality)</option><option value="gemini-2.5-flash-image">Nano Banana (Fast)</option></select></div>
                            <div className="config-item"><label htmlFor="aspectRatio">Aspect Ratio</label><select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} disabled={imageModel === 'gemini-2.5-flash-image'} title={imageModel === 'gemini-2.5-flash-image' ? "Aspect ratio is not supported by Nano Banana model" : ""}><option value="16:9">16:9 (Widescreen)</option><option value="9:16">9:16 (Portrait)</option><option value="1:1">1:1 (Square)</option><option value="4:3">4:3 (Classic TV)</option></select></div>
                            <div className="config-item"><label htmlFor="cameraAngle">Camera Angle</label><select id="cameraAngle" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)}>{cameraAngles.map(angle => <option key={angle.value} value={angle.value} title={angle.description}>{angle.value}</option>)}</select></div>
                        </div>
                    </div>

                    <div className="card video-analyzer-card">
                        <h2>AI Video Deconstructor</h2>
                        <p className="description">Paste a video link. AI will use its knowledge to reconstruct the video's script, voice, and style, then auto-fill the relevant sections.</p>
                        <div className="input-group">
                            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
                            <button onClick={handleDeconstructVideoUrl} disabled={isAnalyzingUrl}>{isAnalyzingUrl ? 'Deconstructing...' : 'Deconstruct Video'}</button>
                        </div>
                    </div>

                    <div className="card script-assistant-card">
                        <h2>AI Script Assistant</h2>
                        <p className="description">Don't have a script? Just write a simple idea and let AI generate a script for you.</p>
                        <div className="input-group">
                            <input type="text" value={scriptIdea} onChange={(e) => setScriptIdea(e.target.value)} placeholder="e.g., A sci-fi story about a robot who discovers music." />
                            {isGeneratingScript ? (
                                <button onClick={() => stopGenerationRef.current = true} className="stop-button">Stop</button>
                            ) : (
                                <button onClick={handleGenerateScript} disabled={!scriptIdea.trim()}>Generate Script</button>
                            )}
                        </div>
                    </div>
                    
                    <div className="card script-section">
                        <h2>Script Input</h2>
                        {scriptType === 'text' ? (
                            <textarea rows={10} value={script} onChange={(e) => setScript(e.target.value)} placeholder="Once upon a time..."/>
                        ) : (
                            <div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".srt,.txt" style={{display: 'none'}} />
                                <button onClick={() => fileInputRef.current?.click()}>Upload .SRT / .TXT File</button>
                                {fileName && <p style={{marginTop: '10px', fontSize: '0.9rem'}}>Selected file: {fileName}</p>}
                            </div>
                        )}
                        <div className="style-item" style={{backgroundColor: 'var(--bg-main)', padding: '0.5rem', border: `1px solid var(--border)`}}>
                            <input type="checkbox" id="generateUniqueStory" checked={generateUniqueStory} onChange={(e) => setGenerateUniqueStory(e.target.checked)} />
                            <label htmlFor="generateUniqueStory" title="Instead of rephrasing the current script, this generates a completely new story on the same topic to ensure originality.">
                                Generate a new, unique story
                            </label>
                        </div>
                        <div className="script-actions">
                             {isRephrasing ? (
                                <button onClick={() => { stopGenerationRef.current = true; setIsRephrasing(false); }} className="stop-button">Stop</button>
                            ) : (
                                <button onClick={handleRephraseScript} disabled={!script.trim()}>
                                    {generateUniqueStory ? 'Generate New Story' : 'Rephrase for Copyright'}
                                </button>
                            )}
                            {isAnalyzingScriptContent ? (
                                <button onClick={() => stopGenerationRef.current = true} className="stop-button">Stop</button>
                            ) : (
                                <button onClick={() => handleAnalyzeScript()} disabled={!script.trim()}>Analyze & Prepare</button>
                            )}
                        </div>
                    </div>

                    <div className="card ref-image-section">
                        <h2>Style Reference (Manual)</h2>
                        <div className={`drop-zone ${isDraggingRef ? 'drag-over' : ''}`} onDragOver={(e) => {e.preventDefault(); e.stopPropagation(); setIsDraggingRef(true);}} onDragLeave={(e) => {e.preventDefault(); e.stopPropagation(); setIsDraggingRef(false);}} onDrop={handleDrop} onPaste={handlePaste}>
                            <p>Drag & Drop images here, or click button to upload. You can also paste images from clipboard.</p>
                             <input type="file" ref={refImageInputRef} onChange={handleReferenceImageUpload} accept="image/*" multiple style={{display: 'none'}} />
                             <button onClick={() => refImageInputRef.current?.click()} disabled={!!isAnalyzing} style={{marginTop: '1rem'}}>{isAnalyzing ? 'Analyzing Image...' : 'Upload Images'}</button>
                             <div className="reference-files-grid">{referenceFiles.map(file => (<div key={file.name} className="ref-file-item"> {file.dataUrl ? <img src={file.dataUrl} alt={file.name} className="ref-file-preview" /> : <div className="ref-file-placeholder" title={file.name}><ImageIcon/><span>{file.name.substring(0,10)}...</span></div> }<button onClick={() => handleDeleteReferenceFile(file.name)} className="ref-delete-btn">×</button></div>))}</div>
                        </div>
                    </div>
                    
                    <div className="card character-profile-card">
                        <div className="card-header">
                            <h2>Character Profile (for Consistency)</h2>
                            <button onClick={handleAddCharacter} className="add-character-btn">+</button>
                        </div>
                        <p className="description">Describe your characters. Upload images, and AI will add detailed analysis to reinforce consistency.</p>
                        <div className="character-profiles-container">
                            {characterProfiles.map((profile, index) => (
                                <div key={profile.id} className="character-profile-item">
                                    <div className="character-header"><h3>Character {index + 1}</h3>{characterProfiles.length > 1 && <button onClick={() => handleRemoveCharacter(profile.id)} className="remove-btn">×</button>}</div>
                                    <textarea rows={4} value={profile.userDescription} onChange={(e) => handleCharacterDescriptionChange(profile.id, e.target.value)} placeholder={`e.g., A young detective named Kai...`}/>
                                    {profile.aiDescription && <pre className="ai-description">{profile.aiDescription}</pre>}
                                    <div className={`drop-zone ${isDraggingChar === profile.id ? 'drag-over' : ''}`} onDragOver={(e) => {e.preventDefault(); e.stopPropagation(); setIsDraggingChar(profile.id);}} onDragLeave={(e) => {e.preventDefault(); e.stopPropagation(); setIsDraggingChar(null);}} onDrop={(e) => handleCharacterImageDrop(e, profile.id)} onPaste={(e) => handleCharacterImagePaste(e, profile.id)}>
                                         <input type="file" ref={el => { if (el) { characterImageInputRefs.current[profile.id] = el; } }} onChange={(e) => handleCharacterImageUpload(e, profile.id)} accept="image/*" style={{display: 'none'}} />
                                        <button onClick={() => characterImageInputRefs.current[profile.id]?.click()} disabled={isAnalyzingCharacter === profile.id}>{isAnalyzingCharacter === profile.id ? 'Analyzing...' : 'Upload Image'}</button>
                                        {profile.image ? (
                                            <div className="ref-file-item">
                                                <img src={profile.image.dataUrl} alt="Character Reference" className="ref-file-preview" />
                                                <button onClick={() => setCharacterProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, image: null } : p))} className="ref-delete-btn">×</button>
                                            </div>
                                        ) : <p>Drop or Paste Image</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card style-section">
                        <h2>Choose Theme & Styles</h2>
                        <div className="collapsible">
                            <button className="collapsible-header" onClick={() => setThemesVisible(!themesVisible)}>Primary Themes (Select multiple) {themesVisible ? '[-]' : '[+]'}</button>
                            {themesVisible && (<div className="style-grid collapsible-content">{themeOptions.map(theme => (<div key={theme} className="style-item"><input type="checkbox" id={theme} checked={selectedThemes.includes(theme)} onChange={() => handleThemeChange(theme)} /><label htmlFor={theme}>{theme}</label></div>))}</div>)}
                        </div>
                        <div className="collapsible">
                            <button className="collapsible-header" onClick={() => setModifiersVisible(!modifiersVisible)}>Artistic Modifiers {modifiersVisible ? '[-]' : '[+]'}</button>
                            {modifiersVisible && (<div className="style-grid collapsible-content">{styleModifiers.map(modifier => (<div key={modifier} className="style-item"><input type="checkbox" id={modifier} checked={selectedModifiers.includes(modifier)} onChange={() => handleModifierChange(modifier)} /><label htmlFor={modifier}>{modifier}</label></div>))}</div>)}
                        </div>
                    </div>

                    <div className="card">
                        <h2>Advanced Styling</h2>
                        <div className="negative-prompt-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="useNegativePrompt"
                                checked={useNegativePrompt}
                                onChange={(e) => setUseNegativePrompt(e.target.checked)}
                                style={{ width: 'auto', marginRight: '8px', flexShrink: 0 }}
                            />
                             <label htmlFor="useNegativePrompt" style={{ margin: 0 }}>Use Negative Prompt</label>
                        </div>
                        <textarea id="negativePrompt" rows={3} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g., poorly drawn hands, blurry, watermark, text" disabled={!useNegativePrompt}/>
                        <p className="description">Describe elements to exclude from your images.</p>
                    </div>

                    <div className="card">
                        <h2>Style Presets</h2>
                        <div className="input-group">
                            <input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="New Preset Name" />
                            <button onClick={handleSavePreset}>Save Style</button>
                        </div>
                        <div className="preset-list">{stylePresets.map(preset => (<div key={preset.name} className="preset-item"><span>{preset.name}</span><div className="preset-actions"><button onClick={() => handleLoadPreset(preset)}>Load</button><button onClick={() => handleDeletePreset(preset.name)} className="remove-btn">×</button></div></div>))}</div>
                    </div>

                    <div className="card main-actions-card">
                         <div className="autopilot-toggle">
                            <label htmlFor="autopilot">Autopilot Mode</label>
                            <label className="switch">
                                <input type="checkbox" id="autopilot" checked={isAutopilot} onChange={() => setIsAutopilot(p => !p)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        {isPausedByCircuitBreaker ? (
                            <button onClick={handleResumeFromCircuitBreaker} className="retry-button">Resume Generation</button>
                        ) : (isLoading || isBatchGenerating) ? (
                            <><button className="stop-button" onClick={handleStopGeneration}>Stop Generation</button><span>Generating... Please wait.</span></>
                        ) : (
                            <button className="generate-button" onClick={handleGenerate} disabled={isLoading || isRephrasing || isGeneratingScript || !!isAnalyzing}>Generate Prompts & Images</button>
                        )}
                        {!isPausedByCircuitBreaker && results.some(r => r.imageStatus === 'failed') && !isBatchGenerating && (
                            <button onClick={handleRetryFailed} disabled={isRetrying} className="retry-button">
                                {isRetrying ? 'Retrying...' : `Retry ${results.filter(r => r.imageStatus === 'failed').length} Failed Images`}
                            </button>
                        )}
                    </div>
                </fieldset>

                <div className="output-panel">
                    <div className="card results-section">
                        <div className="results-header"><h2>Generated Prompts & Images ({results.filter(r => r.imageStatus === 'completed').length}/{results.length || imageCount} ready)</h2></div>
                        {results.length > 0 ? (
                            results.map((result, index) => (
                            <div key={index} className="result-item">
                                <div className="result-content">
                                    <h3>Scene {index + 1}</h3>
                                    <p>{result.scene_description}</p>
                                    <div className="prompt-box"><div className="prompt-header"><ImageIcon /><span>Image Prompt</span><button className="copy-btn" title="Copy image prompt" onClick={() => copyToClipboard(result.image_prompt, `image-${index}`)}>{copiedInfo === `image-${index}` ? <CheckIcon /> : <CopyIcon />}</button></div><textarea className="prompt-text-area" value={result.image_prompt} onChange={(e) => handlePromptChange(index, e.target.value, 'image')} /></div>
                                    {result.video_prompt && (<div className="prompt-box"><div className="prompt-header"><VideoIcon /><span>Video Prompt ({videoModel})</span><button className="copy-btn" title="Copy video prompt" onClick={() => copyToClipboard(result.video_prompt || '', `video-${index}`)}>{copiedInfo === `video-${index}` ? <CheckIcon /> : <CopyIcon />}</button></div><textarea className="prompt-text-area video-prompt-area" value={result.video_prompt} onChange={(e) => handlePromptChange(index, e.target.value, 'video')} /></div>)}
                                </div>
                                <div className="image-preview-container" onClick={() => result.imageUrl && setPreviewImage(result.imageUrl)}>
                                    {result.imageStatus === 'loading' && <div className="loader"></div>}
                                    {result.imageStatus === 'completed' && result.imageUrl && <img src={result.imageUrl} alt={`Generated Scene ${index + 1}`} />}
                                    {result.imageStatus === 'retrying' && <div className="error-placeholder" title={result.error}>Retrying...</div>}
                                    {result.imageStatus === 'failed' && <div className="error-placeholder" title={result.error}>{result.error ? result.error : 'Failed'}</div>}
                                </div>
                                <div className="result-actions">
                                    <button title="Download Image" onClick={() => handleDownloadSingle(result.imageUrl, index)} disabled={!result.imageUrl}><DownloadIcon /></button>
                                    <button title="Regenerate Image" onClick={() => handleRegenerateImage(index)} disabled={isBatchGenerating}><RegenerateIcon /></button>
                                </div>
                            </div>))
                        ) : (
                            <div className="placeholder-text">
                                <p>Your generated images and prompts will appear here.</p>
                                <p>Complete the steps in the control panel on the left and click "Generate" to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="post-production-wrapper">
                <div className="card">
                    <div className="video-prompt-card" style={{padding:0, border: 'none', background: 'transparent'}}>
                        <h2>Video Prompt Options</h2>
                        <div className="config-grid">
                            <div className="config-item"><label htmlFor="videoModel">Target Video Model</label><select id="videoModel" value={videoModel} onChange={(e) => setVideoModel(e.target.value)}><option value="Veo 3.1">Veo 3.1 (Google)</option><option value="Sora">Sora (OpenAI)</option><option value="Kling">Kling (Kuaishou)</option><option value="Vidu">Vidu (ShengShu)</option><option value="Hailuo">Hailuo (Alibaba)</option></select></div>
                            <div className="config-item"><label htmlFor="videoPromptBasis">Prompt Generation Basis</label><select id="videoPromptBasis" value={videoPromptBasis} onChange={(e) => setVideoPromptBasis(e.target.value)}><option value="image-driven">Image-Driven (Animate Scene)</option><option value="script-driven">Script-Driven (New Interpretation)</option></select></div>
                            <div className="config-item audio-cues-group"><label>Include Audio Cues</label><div className="audio-cues-options"><div className="style-item"><input type="checkbox" id="dialogue" checked={includeDialogue} onChange={(e) => setIncludeDialogue(e.target.checked)} /><label htmlFor="dialogue">Dialogue</label></div><div className="style-item"><input type="checkbox" id="ambient" checked={includeAmbient} onChange={(e) => setIncludeAmbient(e.target.checked)} /><label htmlFor="ambient">Ambient Sound</label></div><div className="style-item"><input type="checkbox" id="sfx" checked={includeSfx} onChange={(e) => setIncludeSfx(e.target.checked)} /><label htmlFor="sfx">Sound FX</label></div></div></div>
                        </div>
                    </div>
                    <div className="button-group">
                        {isGeneratingVideoPrompts ? (
                             <button onClick={() => stopGenerationRef.current = true} className="stop-button">Stop</button>
                        ) : (
                            <button onClick={handleGenerateVideoPrompts} disabled={isGeneratingVideoPrompts || (results.length === 0 && videoPromptBasis === 'image-driven') || !script.trim()}>
                                {isGeneratingVideoPrompts ? 'Generating...' : 'Generate Video Prompts'}
                            </button>
                        )}
                        <button onClick={handleDownloadZip} disabled={results.filter(r => r.imageStatus === 'completed').length === 0}>Download All as ZIP</button>
                        <button onClick={handleExportPrompts} disabled={results.length === 0}>Export All Prompts</button>
                    </div>
                </div>
                
                <div className={`card tts-card ${isAutoConfiguringVoice ? 'configuring' : ''}`}>
                    {isAutoConfiguringVoice && (
                        <div className="configuring-overlay">
                            <div className="loader"></div>
                            <p>AI is auto-configuring voiceover settings...</p>
                        </div>
                    )}

                    <div className="card-header tts-main-header">
                        <h2><AudioIcon /> AI Voiceover Generation</h2>
                        <button onClick={() => handleAudioAutopilot().catch(e => {
                             if (e.message !== 'stopped') {
                                console.error("Audio Autopilot failed:", e);
                            }
                        })} className="autopilot-audio-btn" disabled={isTTSBusy || !voiceoverScript.trim()}>
                            <AutopilotIcon/> Audio Autopilot
                        </button>
                    </div>

                    <div className="voiceover-script-header">
                        <h3>Voiceover Script</h3>
                        <button onClick={() => setVoiceoverScript(script)}>Copy from Main Script</button>
                    </div>
                    <textarea rows={8} value={voiceoverScript} onChange={(e) => setVoiceoverScript(e.target.value)} placeholder="Enter the text to be converted to speech here..." />

                    <div className="audio-estimator-info">
                        <div><span>Word Count:</span> <strong>{wordCount} {recommendedWords > 0 ? `/ ~${recommendedWords}` : ''}</strong></div>
                        <div><span>Est. Duration:</span> <strong>{formatTime(estimatedSeconds)}</strong></div>
                        <div><span>Target Duration:</span> <strong>{formatTime(targetSeconds)}</strong></div>
                    </div>
                    <button onClick={handleFitScriptToDuration} disabled={isFittingScript || targetSeconds === 0 || !voiceoverScript.trim()}>
                        {isFittingScript ? 'Optimizing...' : 'Fit Script to Duration'}
                    </button>
                    
                    <div className="voice-library">
                        <div className="voice-library-header">
                             <div className="config-item">
                                <label htmlFor="ttsTone">Tone / Emotion</label>
                                <select id="ttsTone" value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
                                    {ttsTones.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                                </select>
                            </div>
                        </div>
                        <h4 className="voice-list-heading">Select a Voice</h4>
                        <div className="voice-selector-list">
                            {ttsVoices
                                .filter(v => v.language === 'English' && (selectedTone === 'All Tones' || v.tones.includes(selectedTone)))
                                .map(voice => (
                                    <div 
                                        key={voice.conceptualName}
                                        title={voice.use_case}
                                        className={`voice-selector-item gender-${voice.gender.toLowerCase()} ${ttsConfig.voice === voice.conceptualName ? 'selected' : ''} ${isAuditioning === voice.conceptualName ? 'auditioning' : ''}`} 
                                        onClick={() => setTtsConfig(prev => ({ ...prev, voice: voice.conceptualName }))}
                                    >
                                        <div className="voice-info">
                                            <div>
                                                <strong>{voice.conceptualName}</strong>
                                                <span className={`gender-tag gender-${voice.gender.toLowerCase()}-bg`}>{voice.gender}</span>
                                                <span className="language-tag">{voice.language}</span>
                                            </div>
                                            <small><em>Use Case: {voice.use_case} (API: {voice.apiName})</em></small>
                                        </div>
                                        <button 
                                            className="audition-btn" 
                                            onClick={(e) => { e.stopPropagation(); handleAuditionVoice(voice); }}
                                            disabled={isAuditioning != null && isAuditioning !== voice.conceptualName}
                                        >
                                            {isAuditioning === voice.conceptualName ? <StopIcon /> : <PlayIcon />}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>


                    <div className="tts-advanced-controls">
                        <div className="speed-control">
                            <span>Slow</span>
                            <input type="range" min="0.7" max="1.3" step="0.01" value={ttsConfig.speed} onChange={(e) => setTtsConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }))} />
                            <span>Fast</span>
                            <span className="speed-value">{ttsConfig.speed.toFixed(2)}x</span>
                        </div>
                        
                        <div>
                            <label htmlFor="customTtsPrompt">Custom Voice Prompt (Overrides Tone)</label>
                            <textarea id="customTtsPrompt" rows={2} value={customTtsPrompt} onChange={(e) => setCustomTtsPrompt(e.target.value)} placeholder="e.g., spoken by an old, wise narrator with a sense of wonder." />
                        </div>

                        <div className="force-speed-toggle">
                            <label htmlFor="forceSpeed">Force Speed Slider Setting</label>
                            <label className="switch">
                                <input type="checkbox" id="forceSpeed" checked={forceSpeed} onChange={(e) => setForceSpeed(e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="tts-actions">
                         {(isGeneratingAudio || isGeneratingChunks) &&
                            <button onClick={isGeneratingAudio ? handleStopAudioGeneration : handleStopChunkGeneration} className="stop-button main-stop-button">
                                Stop Generation
                            </button>
                        }
                        <div className="tts-action-group wide-button">
                             <button onClick={handleGenerateSample} disabled={isTTSBusy || !voiceoverScript.trim()}>
                                {isGeneratingSample ? 'Generating...' : 'Generate Sample (15s)'}
                            </button>
                        </div>
                        {sampleAudioUrl && (
                            <div className="generation-result-item">
                                <AudioPlayer src={sampleAudioUrl} title="Sample" onDownload={() => {
                                    const link = document.createElement('a');
                                    link.href = sampleAudioUrl;
                                    link.download = `${projectName.replace(/\s+/g, '_')}_sample.wav`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }} />
                            </div>
                        )}
                       <div className="tts-action-pair">
                            <div className="tts-action-group generate-group">
                                <button className="generate-full-btn" onClick={handleGenerateVoiceover} disabled={isTTSBusy || !voiceoverScript.trim()}>
                                    {isGeneratingAudio ? 'Generating...' : 'Generate Full Audio (Single File)'}
                                </button>
                                {generatedAudioUrl && (
                                    <div className="generation-result-item">
                                        <AudioPlayer src={generatedAudioUrl} title="Full Audio" onDownload={() => handleDownloadAudio()} />
                                    </div>
                                )}
                            </div>
                             <button onClick={() => handleDownloadAudio()} disabled={!generatedAudioBytes} className="download-button paired-download-btn">
                                <DownloadIcon /> Download
                            </button>
                        </div>

                        <div className="tts-action-group">
                            <button className="generate-full-btn" onClick={handleGenerateChunkedAudio} disabled={isTTSBusy || !voiceoverScript.trim()}>
                                {isGeneratingChunks ? 'Generating...' : 'Generate Full Audio (In Chunks)'}
                            </button>
                            {audioChunks.length > 0 && (
                                <div className="generation-result-item full-width">
                                    <h4>Audio Chunks ({audioChunks.filter(c => c.status === 'complete').length}/{audioChunks.length})</h4>
                                    <div className="audio-chunk-list">
                                        {audioChunks.map(chunk => (
                                            <div key={chunk.id} className={`audio-chunk-item ${chunk.status}`}>
                                                <div className="audio-chunk-controls">
                                                    {chunk.status === 'pending' && <span>Chunk {chunk.id + 1}: Pending...</span>}
                                                    {chunk.status === 'generating' && <><div className="loader small"></div><span>Chunk {chunk.id + 1}: Generating...</span></>}
                                                    {chunk.status === 'failed' && <>
                                                        <span className="error-placeholder" title={chunk.error}>Chunk {chunk.id + 1}: Failed</span>
                                                        <button title="Retry Chunk" onClick={() => handleRetrySingleAudioChunk(chunk.id)} className="result-actions" style={{ padding: '0', width: '30px', height: '30px', flexShrink: 0 }}><RegenerateIcon /></button>
                                                    </>}
                                                    {chunk.status === 'complete' && chunk.audioUrl && (
                                                        <AudioPlayer src={chunk.audioUrl} title={`Chunk ${chunk.id + 1}`} onDownload={() => handleDownloadAudio(chunk.audioBytes, `${projectName}_chunk_${chunk.id + 1}.wav`)} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                     <div className="chunk-download-actions">
                                        <button onClick={handleMergeAndDownload} disabled={isTTSBusy || isMergingAudio || audioChunks.filter(c => c.status === 'complete').length === 0}>
                                            {isMergingAudio ? 'Merging...' : 'Merge & Download'}
                                        </button>
                                        <button onClick={handleDownloadAllChunksZip} disabled={isTTSBusy || audioChunks.filter(c => c.status === 'complete').length === 0}>
                                            Download as ZIP
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card video-generation-card">
                    <h2><VideoIcon /> Veo Video Generation</h2>
                    <div className="veo-api-key-section">
                        <p className={`api-key-status ${hasVeoApiKey ? 'selected' : 'not-selected'}`}>
                            Status: {hasVeoApiKey ? 'API Key Selected' : 'API Key Not Selected'}
                        </p>
                        <button onClick={handleSelectVeoApiKey}>Select Veo API Key</button>
                        <p className="description">Veo requires a project with billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">Learn more</a>.</p>
                    </div>
                    
                    <div className="main-actions">
                         {isGeneratingVideos ? (
                            <button className="stop-button" onClick={handleStopVideoGeneration}>Stop Generation</button>
                        ) : (
                            <button onClick={handleStartVideoGeneration} disabled={!hasVeoApiKey || selectedScenesForVideo.length === 0}>
                                Generate {selectedScenesForVideo.length} Selected Videos
                            </button>
                        )}
                        <button onClick={handleDownloadVideosZip} disabled={Object.values(videoGenerationStatus).filter(s => s.status === 'complete').length === 0}>
                            Download Completed as ZIP
                        </button>
                    </div>
                    
                    {results.length > 0 && (
                        <div className="video-generation-list">
                            {results.map((result, index) => result.video_prompt && (
                                <div key={index} className="video-gen-scene-item">
                                    <div className="video-gen-selector">
                                        <input 
                                            type="checkbox" 
                                            id={`scene-select-${index}`} 
                                            checked={selectedScenesForVideo.includes(index)} 
                                            onChange={() => handleSceneSelectionChange(index)}
                                            style={{width: 'auto'}}
                                        />
                                        <label htmlFor={`scene-select-${index}`}><h3>Scene {index + 1}</h3></label>
                                    </div>

                                    <div className="video-gen-content">
                                         <textarea className="prompt-text-area video-prompt-area" value={result.video_prompt} onChange={(e) => handlePromptChange(index, e.target.value, 'video')} />
                                    </div>

                                    <div className="video-gen-status">
                                        {videoGenerationStatus[index]?.status === 'generating' && <div className="status-indicator generating"><div className="loader small"></div><span>{videoGenerationStatus[index]?.progressMessage}</span></div>}
                                        {videoGenerationStatus[index]?.status === 'polling' && <div className="status-indicator generating"><div className="loader small"></div><span>{videoGenerationStatus[index]?.progressMessage}</span></div>}
                                        {videoGenerationStatus[index]?.status === 'complete' && videoGenerationStatus[index]?.videoUrl && (
                                            <div className="video-complete-container">
                                                <video src={videoGenerationStatus[index]?.videoUrl} loop muted playsInline />
                                                <button onClick={() => handleDownloadSingleVideo(videoGenerationStatus[index]!.videoUrl!, index)} className="video-download-btn"><DownloadIcon /></button>
                                            </div>
                                        )}
                                        {videoGenerationStatus[index]?.status === 'failed' && <div className="status-indicator failed" title={videoGenerationStatus[index]?.error}><ErrorIcon /><span>Failed</span></div>}
                                        {(!videoGenerationStatus[index] || videoGenerationStatus[index]?.status === 'idle') && <div className="status-indicator">Idle</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="logs-and-info-wrapper">
                 <div className="logs-container">
                    <LogViewer ref={notificationLogRef} title="Notification Log" icon={<LogIcon/>} logs={notificationLog} onClear={() => setNotificationLog([])} type="notification" />
                    <LogViewer ref={errorLogRef} title="Error Log" icon={<ErrorIcon/>} logs={errorLog} onClear={() => setErrorLog([])} type="error" />
                </div>

                <div className="card usage-guide-card collapsible">
                     <h2 onClick={() => setUsageVisible(!usageVisible)}>
                        <div className="collapsible-title"><InfoIcon /> Usage Guide</div>
                        <span>{usageVisible ? '[-]' : '[+]'}</span>
                    </h2>
                    {usageVisible && (
                        <div className="collapsible-content">
                            <table className="usage-table">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Master Autopilot</strong></td>
                                        <td>The core feature. Provide a script, and it will automatically handle rephrasing, analysis, image/video prompt generation, and voiceover creation.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Project Management</strong></td>
                                        <td>Save and load your entire project state, including scripts, settings, and generated results, directly in your browser.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>API Key Management</strong></td>
                                        <td>Add multiple Gemini API keys. The app will automatically rotate between them to avoid rate limits and retry on failures.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Script Assistant</strong></td>
                                        <td>Generate a complete script from a simple idea or rephrase your existing script to avoid copyright issues.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Style & Character Control</strong></td>
                                        <td>Use reference images, detailed character profiles, and a vast library of themes/modifiers to ensure visual consistency.</td>
                                    </tr>
                                     <tr>
                                        <td><strong>AI Voiceover</strong></td>
                                        <td>Generate high-quality voiceovers from your script. Choose from a library of voices, control tone and speed, or use AI to auto-configure the best settings. You can generate audio in chunks for long scripts to ensure reliability.</td>
                                    </tr>
                                </tbody>
                            </table>
                             <div className="important-note">
                                <strong>Important:</strong> All project data is stored locally in your browser's IndexedDB. Clearing your browser data will delete your saved projects. API keys are also stored locally. Learn more about IndexedDB <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank" rel="noopener noreferrer">here</a>.
                            </div>
                        </div>
                    )}
                </div>

                <div className="card usage-guide-card collapsible">
                     <h2 onClick={() => setApiUsageVisible(!apiUsageVisible)}>
                        <div className="collapsible-title"><InfoIcon /> API Usage & Limits Guide</div>
                        <span>{apiUsageVisible ? '[-]' : '[+]'}</span>
                    </h2>
                    {apiUsageVisible && (
                        <div className="collapsible-content">
                             <p>This app uses the Google Gemini API. Your usage is subject to certain limits, especially on the free tier provided by Google AI Studio.</p>
                            <table className="usage-table">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th>Model Used</th>
                                        <th>Free Tier Limit (per minute)</th>
                                        <th>Notes / Cost Factor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Image Generation (High Quality)</strong></td>
                                        <td>Imagen 4</td>
                                        <td>~5 Requests</td>
                                        <td>Paid plans are charged per image. Cost depends on resolution.</td>
                                    </tr>
                                     <tr>
                                        <td><strong>Image Generation (Fast)</strong></td>
                                        <td>Nano Banana</td>
                                        <td>~15 Requests</td>
                                        <td>Cheaper than Imagen. Good for quick previews.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Script/Text Analysis & Gen</strong></td>
                                        <td>Gemini 2.5 Pro</td>
                                        <td>~15 Requests</td>
                                        <td>Paid plans are charged per 1,000 characters (input + output).</td>
                                    </tr>
                                    <tr>
                                        <td><strong>AI Voiceover (TTS)</strong></td>
                                        <td>TTS Model</td>
                                        <td>~15 Requests</td>
                                        <td>Paid plans are charged per 1,000 characters.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Video Generation</strong></td>
                                        <td>Veo 3.1</td>
                                        <td>N/A (Requires Paid Plan)</td>
                                        <td>Requires a Veo-enabled API key with a billing account. Charged per second of video generated.</td>
                                    </tr>
                                </tbody>
                            </table>
                             <div className="important-note">
                                <strong>Important:</strong> The limits above are estimates and can change. The "per minute" quota resets every 60 seconds. For large-scale projects, it is highly recommended to set up a <a href="https://cloud.google.com/billing/docs/how-to/create-billing-account" target="_blank" rel="noopener noreferrer">Google Cloud Billing Account</a> to avoid interruptions. This app is designed to cycle through multiple API keys to help manage free tier limits.
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="card about-card collapsible">
                    <h2 onClick={() => setAboutVisible(!aboutVisible)}>
                        <div className="collapsible-title"><InfoIcon /> About This App & Developer</div>
                        <span>{aboutVisible ? '[-]' : '[+]'}</span>
                    </h2>
                    {aboutVisible && (
                        <div className="collapsible-content">
                            <h3>About This Application</h3>
                            <p>This Ultimate AI Automationer was created to empower creators, filmmakers, and storytellers by simplifying the complex process of turning a script into a visual and auditory experience. By leveraging the power of powerful AI, this tool automates everything from scene breakdown, prompt generation, to image creation and voiceover synthesis. The goal is to save you countless hours of manual work, allowing you to focus on what truly matters: your creativity.</p>
                            
                            <h3>About Me</h3>
                            <p>Hello! I'm <strong>Tasin</strong>, a creative strategist and tech enthusiast passionate about the intersection of technology and creativity.</p>
                            <p>As a YouTuber, AI-Driven Content Creator, and Prompt Engineer, I explore the cutting edge of digital innovation. The <a href="https://techseekeracademy.com/" target="_blank" rel="noopener noreferrer"><span className="tech">Tech</span> <span className="seeker">Seeker</span> <span className="academy">Academy</span></a> and YouTube channel <a href="https://www.youtube.com/@TechSeekerAcademy" target="_blank" rel="noopener noreferrer"><span className="tech">Tech</span> <span className="seeker">Seeker</span></a> is your guide to the future, offering in-depth tech reviews, tutorials on AI and automation, and strategies to enhance your creative workflow.</p>
                            <p>My goal is to educate and empower fellow creators and enthusiasts by making complex technologies accessible and practical. Join me as we explore the tools and ideas shaping our world.</p>
                            
                            <div className="social-links">
                                <a href="https://web.facebook.com/techseekeracademy" target="_blank" rel="noopener noreferrer" className="social-link"><FacebookIcon /> Facebook</a>
                                <a href="https://www.youtube.com/@techseeker-tasin" target="_blank" rel="noopener noreferrer" className="social-link"><YoutubeIcon /> YouTube</a>
                                <a href="https://techseekeracademy.com/" target="_blank" rel="noopener noreferrer" className="social-link"><WebsiteIcon /> Website</a>
                                <a href="https://t.me/tasints" target="_blank" rel="noopener noreferrer" className="social-link"><TelegramIcon /> Telegram</a>
                                <a href="https://wa.me/message/K4UWIP55B2XGP1" target="_blank" rel="noopener noreferrer" className="social-link"><WhatsAppIcon /> WhatsApp</a>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {showScrollButton && (
                <button onClick={scrollToTop} className="scroll-to-top-btn" title="Scroll to top">
                    <ScrollToTopIcon />
                </button>
            )}

        </main>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);