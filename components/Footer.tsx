import React from 'react';
import { Sparkles, Twitter, Linkedin, Github, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-display">AwardX</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The open-source operating system for awards, competitions, and creative recognition programs. MIT licensed &mdash; fork it, ship it, own it.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/awardx/awardx" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5"/></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5"/></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5"/></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5"/></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Self-Host Guide</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Showcase</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Open Source</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="https://github.com/awardx/awardx" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contributing Guide</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">MIT License</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Community</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Discord Server</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">GitHub Discussions</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AwardX &mdash; Released under the MIT License. Built by the community.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Code of Conduct</a>
            <a href="#" className="hover:text-white">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};