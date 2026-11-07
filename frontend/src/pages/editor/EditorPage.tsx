import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { InstagramPhoneMockup } from '@/components/ui/InstagramPhoneMockup';
import type { ScriptScene, GeneratedPost, PostType } from '@/types';
import {
  Download,
  Send,
  Plus,
  RefreshCw,
  Sliders,
  Video,
  Cpu,
} from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { activeDraft, updatePost, addPost, addToast, triggerConfetti } = useApp();
  const navigate = useNavigate();

  const [currentPost, setCurrentPost] = useState<Partial<GeneratedPost>>(
    activeDraft || {
      id: 'post-draft-edit',
      title: '5 AI Tools Every Creator Needs in 2026',
      postType: 'reel' as PostType,
      caption: `Still spending hours editing social reels?\n\nHere are 5 structured AI workflows that save time and increase reach.\n\nSave this reel for your next batching session.`,
      hashtags: ['#AITools', '#ContentCreator', '#ProductivityHacks', '#InstagramReels', '#GrowthStrategy'],
      mediaUrls: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      ],
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      scenes: [
        {
          id: 'sc-1',
          sceneNumber: 1,
          duration: 3,
          title: 'High-Impact Hook',
          visualPrompt: 'Futuristic glowing glass laptop with ambient Instagram lighting',
          spokenAudio: 'Stop wasting hours creating reels when AI can script and edit them in 60 seconds.',
          onScreenText: 'STOP SPENDING HOURS ON REELS',
          textPosition: 'center',
          transition: 'zoom',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'sc-2',
          sceneNumber: 2,
          duration: 4,
          title: 'The AI Workflow Breakdown',
          visualPrompt: 'Clean UI mockups showing automated scene timeline and video cuts',
          spokenAudio: 'Tool number one automates your video script directly into high-converting scenes.',
          onScreenText: 'TOOL 1: AI SCENE GENERATOR',
          textPosition: 'top',
          transition: 'slide',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'sc-3',
          sceneNumber: 3,
          duration: 3,
          title: 'Call to Action',
          visualPrompt: 'Phone screen with profile follow button and notification badge',
          spokenAudio: 'Comment AUTOMATE and I will send you the complete prompt vault for free.',
          onScreenText: 'REPLY AUTOMATE FOR ACCESS',
          textPosition: 'bottom',
          transition: 'fade',
          imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        },
      ],
    }
  );

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('Viral Hook Kinetic');
  const [isExporting, setIsExporting] = useState(false);

  const scenes = currentPost.scenes || [];
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const handleUpdateScene = (updates: Partial<ScriptScene>) => {
    const updatedScenes = scenes.map((s, idx) =>
      idx === activeSceneIndex ? { ...s, ...updates } : s
    );
    setCurrentPost((prev) => ({ ...prev, scenes: updatedScenes }));
  };

  const handleAddScene = () => {
    const newScene: ScriptScene = {
      id: `sc-${Date.now()}`,
      sceneNumber: scenes.length + 1,
      duration: 3,
      title: `Scene ${scenes.length + 1}`,
      visualPrompt: 'Product showcase with aesthetic studio lighting',
      spokenAudio: 'Here is another game-changing trick you should know.',
      onScreenText: 'NEW SCENE INSIGHT',
      textPosition: 'center',
      transition: 'fade',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    };
    setCurrentPost((prev) => ({
      ...prev,
      scenes: [...(prev.scenes || []), newScene],
    }));
    setActiveSceneIndex(scenes.length);
    addToast('Scene added to timeline.', 'success');
  };

  const handleRegenerateScene = async () => {
    addToast('Regenerating scene...', 'info');
    await new Promise((r) => setTimeout(r, 800));
    handleUpdateScene({
      onScreenText: 'INCREASE RETENTION IMMEDIATELY',
      spokenAudio: 'Top creators use this exact formula to trigger algorithmic boost.',
    });
    addToast('Scene regenerated with new hook & audio.', 'success');
  };

  const handleExportMP4 = async () => {
    setIsExporting(true);
    addToast('Compiling 9:16 vertical video via MoviePy & FFmpeg engine...', 'info');
    await new Promise((r) => setTimeout(r, 1400));
    setIsExporting(false);
    triggerConfetti();
    addToast('MP4 video exported successfully.', 'success');
  };

  const handleSendToPublisher = () => {
    if (currentPost.id && currentPost.id.startsWith('post-')) {
      updatePost(currentPost.id, currentPost);
    } else {
      addPost(currentPost);
    }
    navigate('/publisher');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl ig-gradient text-white shadow-xs">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <input
              type="text"
              value={currentPost.title}
              onChange={(e) => setCurrentPost((prev) => ({ ...prev, title: e.target.value }))}
              className="text-sm font-bold text-zinc-900 dark:text-white bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-rose-500 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-zinc-500">
              {scenes.length} Scenes · Total duration:{' '}
              {scenes.reduce((acc, s) => acc + (s.duration || 3), 0)}s · Vertical 9:16
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleExportMP4}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-white/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-rose-500" />}
            <span>Export MP4</span>
          </button>

          <button
            onClick={handleSendToPublisher}
            className="px-5 py-2 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Publisher</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Phone Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Timeline & Scene Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Timeline Scrubber */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Timeline Scenes ({scenes.length})
              </span>
              <button
                onClick={handleAddScene}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scene</span>
              </button>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id || idx}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`relative p-3 rounded-2xl border min-w-[140px] shrink-0 cursor-pointer transition-all ${
                    idx === activeSceneIndex
                      ? 'bg-rose-500/10 border-rose-500 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded ig-gradient text-white">
                      Scene {scene.sceneNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400">{scene.duration}s</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{scene.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Scene Inspector */}
          {currentScene && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-500" />
                    <span>Scene {currentScene.sceneNumber}: {currentScene.title}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Adjust on-screen text, position, and timing</p>
                </div>

                <button
                  onClick={handleRegenerateScene}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs text-rose-500 font-semibold border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI Regenerate</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  On-Screen Highlighted Text
                </label>
                <input
                  type="text"
                  value={currentScene.onScreenText}
                  onChange={(e) => handleUpdateScene({ onScreenText: e.target.value })}
                  placeholder="e.g. STOP SPENDING HOURS ON REELS"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-bold tracking-wide"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Position</label>
                  <select
                    value={currentScene.textPosition}
                    onChange={(e) =>
                      handleUpdateScene({ textPosition: e.target.value as 'top' | 'center' | 'bottom' })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Duration ({currentScene.duration}s)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={currentScene.duration}
                    onChange={(e) => handleUpdateScene({ duration: Number(e.target.value) })}
                    className="w-full accent-rose-500 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Transition</label>
                  <select
                    value={currentScene.transition}
                    onChange={(e) =>
                      handleUpdateScene({
                        transition: e.target.value as 'fade' | 'slide' | 'zoom' | 'cut' | 'whip_pan',
                      })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="zoom">Dynamic Zoom</option>
                    <option value="slide">Slide In</option>
                    <option value="fade">Smooth Fade</option>
                    <option value="whip_pan">Whip Pan</option>
                    <option value="cut">Jump Cut</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Spoken Voiceover Audio
                </label>
                <textarea
                  rows={2}
                  value={currentScene.spokenAudio}
                  onChange={(e) => handleUpdateScene({ spokenAudio: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Reel Visual Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Viral Hook Kinetic',
                    'Aesthetic Minimalist',
                    'Clean High Contrast',
                    'Corporate Authority',
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        addToast(`Applied template: ${tpl}`, 'info');
                      }}
                      className={`p-2.5 rounded-xl text-left border text-[11px] font-medium transition-all ${
                        selectedTemplate === tpl
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                          : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Caption & Hashtags Editor */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Instagram Caption & Hashtags
            </h4>
            <textarea
              rows={3}
              value={currentPost.caption}
              onChange={(e) => setCurrentPost((prev) => ({ ...prev, caption: e.target.value }))}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
            />
            <div className="flex flex-wrap gap-1.5">
              {currentPost.hashtags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-white/5 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Real-Time Phone Preview Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Interactive Canvas
            </span>
            <span className="text-[10px] text-rose-500 font-medium">
              Scene {activeSceneIndex + 1} of {scenes.length}
            </span>
          </div>

          <InstagramPhoneMockup
            post={currentPost}
            currentScene={currentScene}
            mode={currentPost.postType === 'carousel' ? 'post' : 'reel'}
          />
        </div>
      </div>
    </div>
  );
};
