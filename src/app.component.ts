
import { ChangeDetectionStrategy, Component, AfterViewChecked, signal, computed, inject, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { GeminiService, WebsiteCode } from './services/gemini.service';
import { AccessibilityService, AccessibilityReport } from './services/accessibility.service';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

declare var feather: any;

@Component({
  selector: 'app-root',
  template: `
<app-navbar></app-navbar>

<main>
  <!-- Hero Section -->
  <section class="relative py-20 px-4 bg-gradient-to-br from-emerald-50 to-amber-50">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 text-gray-900 font-space">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-amber-500">
            AI Website Builder
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
          Create stunning websites in seconds with artificial intelligence. Just describe your vision, and watch it come to life.
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-emerald-100">
        <div class="mb-6">
          <label for="prompt" class="block text-lg font-medium text-gray-800 mb-3">
            Describe the website you want to create:
          </label>
          <textarea 
              id="prompt" 
              rows="4" 
              [(ngModel)]="prompt"
              [disabled]="isLoading()"
              class="w-full px-6 py-5 text-lg border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all resize-none font-medium"
              placeholder="Example: A modern portfolio website for a photographer with a dark theme, gallery section, and contact form...">
          </textarea>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button (click)="generateWebsite()" [disabled]="isLoading()" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            @if (isLoading()) {
              <div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            } @else {
              <i data-feather="zap" class="w-5 h-5"></i>
              <span>Generate Website</span>
            }
          </button>
          <button (click)="viewExample()" [disabled]="isLoading()" class="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
            <i data-feather="eye" class="w-5 h-5"></i>
            <span>View Example</span>
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="max-w-4xl mx-auto mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {{ error() }}
        </div>
      }
    </div>
  </section>

  <!-- Results Section -->
  @if (isLoading() || generatedCode()) {
    <section id="results" class="py-20 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 font-space">
            Your <span class="text-emerald-600">Generated Website</span>
          </h2>
          <p class="text-xl text-gray-600 mt-4">Here's what our AI has created for you. You can preview it live or view the code.</p>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center min-h-[500px] bg-gray-50/50 rounded-3xl border-2 border-dashed border-emerald-200 animate-pulse">
            <div class="relative w-24 h-24 mb-10">
              <div class="absolute inset-0 border-8 border-emerald-100 rounded-full"></div>
              <div class="absolute inset-0 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div class="absolute inset-4 border-4 border-amber-400 border-b-transparent rounded-full animate-spin-slow"></div>
            </div>
            <div class="text-center space-y-4">
              <p class="text-3xl font-bold text-gray-900 font-space tracking-tight">
                {{ loadingMessage() }}
              </p>
              <p class="text-lg text-gray-500 max-w-md mx-auto">
                Our AI is carefully crafting every line of code to match your vision. This usually takes about 10-20 seconds.
              </p>
            </div>
            
            <!-- Indeterminate Progress Bar -->
            <div class="w-64 h-2 bg-gray-200 rounded-full mt-12 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-amber-500 w-1/2 animate-progress-indeterminate"></div>
            </div>
          </div>
        } @else if (generatedCode()) {
          <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <!-- Tabs -->
            <div class="bg-gray-100 border-b border-gray-200 flex flex-wrap">
              <button (click)="activeTab.set('preview')" [class]="activeTab() === 'preview' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-3 font-semibold transition-colors">Preview</button>
              <button (click)="activeTab.set('html')" [class]="activeTab() === 'html' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-3 font-semibold transition-colors">HTML</button>
              <button (click)="activeTab.set('css')" [class]="activeTab() === 'css' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-3 font-semibold transition-colors">CSS</button>
              <button (click)="activeTab.set('js')" [class]="activeTab() === 'js' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-3 font-semibold transition-colors">JavaScript</button>
              <button (click)="activeTab.set('accessibility')" [class]="activeTab() === 'accessibility' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'" class="px-6 py-3 font-semibold transition-colors">Accessibility</button>
            </div>

            <!-- Content -->
            <div class="p-2 md:p-4">
              @switch (activeTab()) {
                @case ('preview') {
                  <iframe class="w-full h-[70vh] border-0 rounded-lg" [srcdoc]="iframeSrcDoc()"></iframe>
                }
                @case ('html') {
                  <div class="relative">
                    <button (click)="copyToClipboard(generatedCode()?.html || '', 'html')" class="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2 z-10">
                      <i [attr.data-feather]="copiedTab() === 'html' ? 'check' : 'copy'" class="w-4 h-4"></i>
                      {{ copiedTab() === 'html' ? 'Copied!' : 'Copy HTML' }}
                    </button>
                    <pre class="!bg-gray-900 !m-0 rounded-xl h-[70vh] overflow-auto"><code class="language-markup">{{ generatedCode()?.html }}</code></pre>
                  </div>
                }
                @case ('css') {
                  <div class="relative">
                    <button (click)="copyToClipboard(generatedCode()?.css || '', 'css')" class="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2 z-10">
                      <i [attr.data-feather]="copiedTab() === 'css' ? 'check' : 'copy'" class="w-4 h-4"></i>
                      {{ copiedTab() === 'css' ? 'Copied!' : 'Copy CSS' }}
                    </button>
                    <pre class="!bg-gray-900 !m-0 rounded-xl h-[70vh] overflow-auto"><code class="language-css">{{ generatedCode()?.css }}</code></pre>
                  </div>
                }
                @case ('js') {
                   <div class="relative">
                    <button (click)="copyToClipboard(generatedCode()?.javascript || '', 'js')" class="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2 z-10">
                      <i [attr.data-feather]="copiedTab() === 'js' ? 'check' : 'copy'" class="w-4 h-4"></i>
                      {{ copiedTab() === 'js' ? 'Copied!' : 'Copy JS' }}
                    </button>
                    <pre class="!bg-gray-900 !m-0 rounded-xl h-[70vh] overflow-auto"><code class="language-javascript">{{ generatedCode()?.javascript }}</code></pre>
                   </div>
                }
                @case('accessibility') {
                  <div class="p-4 md:p-6 h-[70vh] overflow-auto">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 font-space">Accessibility Report</h3>
                    @if (accessibilitySuggestions(); as report) {
                      <!-- General Suggestions -->
                      <div class="mb-8">
                        <h4 class="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><i data-feather="activity" class="w-6 h-6"></i> General Report</h4>
                        @if (report.general && report.general.length > 0) {
                          <ul class="space-y-4">
                            @for (suggestion of report.general; track $index) {
                              <li class="flex items-start gap-3 p-4 rounded-lg"
                                  [class.bg-blue-50]="suggestion.includes('No obvious') || suggestion.includes('Found potential')"
                                  [class.bg-yellow-50]="suggestion.startsWith('Remember') || suggestion.startsWith('Ensure')"
                                  [class.bg-orange-50]="!suggestion.includes('No obvious') && !suggestion.includes('Found potential') && !suggestion.startsWith('Remember') && !suggestion.startsWith('Ensure')">
                                <div>
                                  <i data-feather="info" class="w-5 h-5 mt-1"
                                    [class.text-blue-600]="suggestion.includes('No obvious') || suggestion.includes('Found potential')"
                                    [class.text-yellow-600]="suggestion.startsWith('Remember') || suggestion.startsWith('Ensure')"
                                    [class.text-orange-600]="!suggestion.includes('No obvious') && !suggestion.includes('Found potential') && !suggestion.startsWith('Remember') && !suggestion.startsWith('Ensure')">
                                  </i>
                                </div>
                                <p class="text-base"
                                    [class.text-blue-800]="suggestion.includes('No obvious') || suggestion.includes('Found potential')"
                                    [class.text-yellow-800]="suggestion.startsWith('Remember') || suggestion.startsWith('Ensure')"
                                    [class.text-orange-800]="!suggestion.includes('No obvious') && !suggestion.includes('Found potential') && !suggestion.startsWith('Remember') && !suggestion.startsWith('Ensure')">
                                  {{ suggestion }}
                                </p>
                              </li>
                            }
                          </ul>
                        } @else {
                          <p class="text-gray-600">No general suggestions.</p>
                        }
                      </div>

                      <!-- Keyboard Navigation -->
                      <div>
                        <h4 class="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><i data-feather="move" class="w-6 h-6"></i> Keyboard Navigation</h4>
                        @if (report.keyboard && report.keyboard.length > 0) {
                          <ul class="space-y-4">
                            @for (suggestion of report.keyboard; track $index) {
                              <li class="flex items-start gap-3 p-4 rounded-lg bg-indigo-50">
                                <div>
                                  <i data-feather="navigation" class="w-5 h-5 mt-1 text-indigo-600"></i>
                                </div>
                                <p class="text-base text-indigo-800" [innerHTML]="suggestion"></p>
                              </li>
                            }
                          </ul>
                        } @else {
                          <p class="text-gray-600">No keyboard navigation suggestions available.</p>
                        }
                      </div>
                    } @else {
                      <p class="text-gray-600">No accessibility suggestions available. Generate a website to see a report.</p>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </section>
  }

  <!-- Features Section -->
  <section class="py-20 px-4 bg-white">
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-space">
                Why Choose <span class="text-emerald-600">AI Website Builder</span>?
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                The most advanced AI website creation platform designed for everyone - from beginners to professionals.
            </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-10">
            <div class="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all">
                <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <i data-feather="user" class="text-emerald-600 w-8 h-8"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">User-Friendly</h3>
                <p class="text-gray-600 text-lg">
                    Extremely optimized for non-technical users. Create professional websites without any coding knowledge.
                </p>
            </div>
            
            <div class="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl border border-amber-100 shadow-lg hover:shadow-xl transition-all">
                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <i data-feather="zap" class="text-amber-600 w-8 h-8"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
                <p class="text-gray-600 text-lg">
                    Generate complete websites in seconds. No more waiting for developers or complex design processes.
                </p>
            </div>
            
            <div class="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all">
                <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <i data-feather="cpu" class="text-emerald-600 w-8 h-8"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">AI-Powered Maintenance</h3>
                <p class="text-gray-600 text-lg">
                    All maintenance is handled by AI. Updates, security, and optimizations happen automatically.
                </p>
            </div>
        </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-emerald-50 to-amber-50">
      <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
              <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-space">
                  Trusted by Industry Experts
              </h2>
              <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                  Recognized as the best AI website builder by leading developers and designers worldwide.
              </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div class="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                  <div class="flex items-center mb-6">
                      <img src="https://picsum.photos/id/1027/48/48" alt="Sarah Johnson" class="w-12 h-12 rounded-full mr-4">
                      <div>
                          <h4 class="font-bold text-lg">Sarah Johnson</h4>
                          <p class="text-emerald-600">Senior Developer at TechCorp</p>
                      </div>
                  </div>
                  <p class="text-gray-700 text-lg italic">
                      "The AI Website Builder is revolutionary. It's the best platform I've seen for rapid website creation with AI technology."
                  </p>
              </div>
              
              <div class="bg-white p-8 rounded-2xl shadow-lg border border-amber-100">
                  <div class="flex items-center mb-6">
                       <img src="https://picsum.photos/id/1005/48/48" alt="Michael Chen" class="w-12 h-12 rounded-full mr-4">
                      <div>
                          <h4 class="font-bold text-lg">Michael Chen</h4>
                          <p class="text-amber-600">Lead Designer at CreativeStudio</p>
                      </div>
                  </div>
                  <p class="text-gray-700 text-lg italic">
                      "As a designer, I'm impressed by how this AI tool maintains design quality while being so accessible to beginners."
                  </p>
              </div>
          </div>
      </div>
  </section>
</main>
<app-footer></app-footer>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent]
})
export class AppComponent implements AfterViewChecked {
  private geminiService = inject(GeminiService);
  private accessibilityService = inject(AccessibilityService);

  prompt: WritableSignal<string> = signal('A modern portfolio website for a photographer with a dark theme, gallery section, and contact form.');
  isLoading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  generatedCode: WritableSignal<WebsiteCode | null> = signal(null);
  accessibilitySuggestions: WritableSignal<AccessibilityReport | null> = signal(null);
  activeTab = signal<'preview' | 'html' | 'css' | 'js' | 'accessibility'>('preview');
  copiedTab = signal<string | null>(null);
  
  loadingMessages = [
    'Analyzing your request...',
    'Designing the layout...',
    'Writing the HTML...',
    'Styling with CSS...',
    'Adding interactivity...',
    'Optimizing accessibility...',
    'Finalizing your website...'
  ];
  loadingMessage = signal(this.loadingMessages[0]);
  private loadingInterval: any;

  constructor() {
    effect(() => {
      // Trigger highlighting when tab changes or code is generated
      this.activeTab();
      this.generatedCode();
      setTimeout(() => {
        Prism.highlightAll();
        if (feather) feather.replace();
      }, 0);
    });
  }

  ngAfterViewChecked() {
    if (feather) feather.replace();
  }

  async generateWebsite() {
    if (!this.prompt().trim() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedCode.set(null);
    this.accessibilitySuggestions.set(null);
    
    // Start loading message cycle
    let messageIndex = 0;
    this.loadingMessage.set(this.loadingMessages[0]);
    this.loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % this.loadingMessages.length;
      this.loadingMessage.set(this.loadingMessages[messageIndex]);
    }, 2500);

    try {
      const result = await this.geminiService.generateWebsiteCode(this.prompt());
      this.generatedCode.set(result);

      const suggestions = this.accessibilityService.check(result.html);
      this.accessibilitySuggestions.set(suggestions);

    } catch (e) {
      console.error(e);
      this.error.set('An error occurred while generating the website. Please try again.');
    } finally {
      this.isLoading.set(false);
      if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
      }
    }
  }

  viewExample() {
    const examples = [
      'A personal blog website for a travel writer, with a clean and minimalist design, focusing on typography and large images.',
      'An e-commerce landing page for a new brand of sustainable sneakers. It should be vibrant, youthful, and include a call-to-action button.',
      'A recipe sharing website with a card-based layout. Each card should show a picture of the dish, the name, and cooking time.',
      'A website for a local coffee shop. It should have a warm and cozy feel, with sections for the menu, location, and our story.'
    ];
    this.prompt.set(examples[Math.floor(Math.random() * examples.length)]);
    this.generatedCode.set(null);
    this.accessibilitySuggestions.set(null);
    this.error.set(null);
  }
  
  iframeSrcDoc = computed(() => {
    const code = this.generatedCode();
    if (!code) {
      return '<!-- Waiting for generated code -->';
    }
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Website</title>
        <style>
          body { margin: 0; font-family: sans-serif; }
          ${code.css}
        </style>
      </head>
      <body>
        ${code.html}
        <script>
          ${code.javascript}
        <\/script>
      </body>
      </html>
    `;
  });

  copyToClipboard(text: string, tab: string) {
    navigator.clipboard.writeText(text);
    this.copiedTab.set(tab);
    setTimeout(() => {
      this.copiedTab.set(null);
      if (feather) feather.replace();
    }, 2000);
  }
}

