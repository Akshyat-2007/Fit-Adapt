// FitAdapt Client Utilities

// Toggle mobile navigation menu (Section 9.2)
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Simple toast notification system
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white');
  toast.className = `${bgClass} px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center justify-between transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-3 text-white/80 hover:text-white font-bold">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Convert any YouTube link (watch?v=, youtu.be/, embed/) to embed and direct watch URLs
function parseYouTubeUrls(rawUrl) {
  if (!rawUrl) return { embedUrl: '', watchUrl: '' };

  let videoId = '';
  if (rawUrl.includes('/embed/')) {
    videoId = rawUrl.split('/embed/')[1].split('?')[0];
  } else if (rawUrl.includes('watch?v=')) {
    videoId = rawUrl.split('watch?v=')[1].split('&')[0];
  } else if (rawUrl.includes('youtu.be/')) {
    videoId = rawUrl.split('youtu.be/')[1].split('?')[0];
  }

  if (videoId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  return { embedUrl: rawUrl, watchUrl: rawUrl };
}

// Modal helper for video viewing with direct external fallback
function openVideoModal(url, title, description) {
  const { embedUrl, watchUrl } = parseYouTubeUrls(url);

  let modal = document.getElementById('video-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity';
    modal.onclick = function(e) {
      if (e.target === modal) closeVideoModal();
    };
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform">
        <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <i data-lucide="play-circle" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 id="modal-title" class="font-bold text-gray-900 dark:text-white text-base sm:text-lg"></h3>
              <span class="text-xs text-brand-600 dark:text-brand-400 font-medium">Guided Exercise Demonstration</span>
            </div>
          </div>
          <button onclick="closeVideoModal()" aria-label="Close modal" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center font-bold text-lg">&times;</button>
        </div>

        <div class="relative w-full aspect-video bg-black">
          <iframe id="modal-iframe" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>

        <div class="p-4 sm:p-5 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p id="modal-desc" class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 sm:max-w-md"></p>
          <a id="modal-external-link" href="#" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 shrink-0">
            <span>Watch on YouTube</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('modal-title').innerText = title || 'Exercise Technique';
  document.getElementById('modal-iframe').src = embedUrl;
  document.getElementById('modal-external-link').href = watchUrl;
  
  const descEl = document.getElementById('modal-desc');
  if (descEl) {
    descEl.innerText = description || 'Practice smooth pacing. Rest immediately if breathing becomes strained or acute pain occurs.';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('modal-iframe').src = '';
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
  }
});
