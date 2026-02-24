
import { ChangeDetectionStrategy, Component, AfterViewInit } from '@angular/core';

declare var feather: any;

@Component({
  selector: 'app-footer',
  template: `
<footer class="bg-gray-900 text-white">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">Product</h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Features</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Examples</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-4">Company</h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-emerald-400 transition-colors">About Us</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Careers</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Blog</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-4">Support</h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Help Center</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Contact Us</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Status</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-4">Legal</h3>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
          <li><a href="#" class="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
      <p class="text-gray-400">&copy; {{ currentYear }} AI Website Builder. All rights reserved.</p>
      <div class="flex space-x-6 mt-4 sm:mt-0">
        <a href="#" class="text-gray-400 hover:text-white"><i data-feather="twitter"></i></a>
        <a href="#" class="text-gray-400 hover:text-white"><i data-feather="github"></i></a>
        <a href="#" class="text-gray-400 hover:text-white"><i data-feather="linkedin"></i></a>
      </div>
    </div>
  </div>
</footer>
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements AfterViewInit {
  currentYear = new Date().getFullYear();

  ngAfterViewInit() {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }
}
