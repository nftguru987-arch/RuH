
import { ChangeDetectionStrategy, Component, AfterViewInit } from '@angular/core';

declare var feather: any;

@Component({
  selector: 'app-navbar',
  template: `
<header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      <div class="flex items-center">
        <div class="flex-shrink-0 flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-lg flex items-center justify-center">
                <i data-feather="pen-tool" class="text-white"></i>
            </div>
          <span class="text-2xl font-bold text-gray-800 font-space">AI Website Builder</span>
        </div>
      </div>
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="#" class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">Home</a>
          <a href="#" class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">About</a>
          <a href="#" class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">Contact</a>
        </div>
      </div>
      <div class="hidden md:block">
         <button class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md">
            Get Started
        </button>
      </div>
    </div>
  </nav>
</header>
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements AfterViewInit {
  ngAfterViewInit() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }
}
