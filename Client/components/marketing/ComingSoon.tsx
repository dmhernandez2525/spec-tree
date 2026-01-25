'use client';

import Section from '@/components/layout/Section';

export function ComingSoon() {
  return (
    <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 py-16 md:py-24 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <Section className="relative">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-purple-200 text-sm font-medium mb-6">
            Coming Soon
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Voice-Driven <span className="text-purple-300">Specification</span>
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Describe your project in natural language and watch your spec tree
            build itself. Powered by PersonaPlex full duplex AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Before */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              Current Experience
            </h3>
            <ul className="space-y-3 text-purple-200/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Click "Add Work Item"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Type title and description
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Wait for AI to generate content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Repeat for each work item
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-400/30">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              With PersonaPlex
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-black/20 rounded-lg px-3 py-2">
                <span className="text-purple-300">You:</span>{" "}
                <span className="text-white/80">
                  "I need user authentication"
                </span>
              </div>
              <div className="bg-purple-600/30 rounded-lg px-3 py-2">
                <span className="text-purple-300">PersonaPlex:</span>{" "}
                <span className="text-white/90">
                  "Got it. Email/password, social login, or SSO?"
                </span>
              </div>
              <div className="bg-black/20 rounded-lg px-3 py-2">
                <span className="text-purple-300">You:</span>{" "}
                <span className="text-white/80">
                  "Email first, then Google"
                </span>
              </div>
              <p className="text-purple-200/60 text-xs italic">
                Work items created as conversation continues...
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-300">&lt;500ms</p>
            <p className="text-xs text-purple-200/70">Response Time</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-300">Full Duplex</p>
            <p className="text-xs text-purple-200/70">Natural Conversation</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-300">100%</p>
            <p className="text-xs text-purple-200/70">Local Processing</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-300">Hands-Free</p>
            <p className="text-xs text-purple-200/70">Voice Control</p>
          </div>
        </div>
      </Section>
    </section>
  );
}
