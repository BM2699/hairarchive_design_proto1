/* ===== Fade sections in when in view ===== */
const sections = document.querySelectorAll('.section');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.2 });
sections.forEach(s => sectionObserver.observe(s));

/* ===== Landing hover loop ===== */
const question = document.getElementById('question');
const investigateBtn = document.getElementById('investigate');
const landing = document.getElementById('landing');
const altWords = ["forget", "savor", "remember", "let go"];
let wordIndex = 0, interval, revealTimeout;

question.addEventListener('mouseenter', () => {
  interval = setInterval(() => {
    question.textContent = altWords[wordIndex++ % altWords.length];
  }, 800);
  // Reveal the investigate button after 1s of hover
  revealTimeout = setTimeout(() => {
    landing.classList.add('active');
  }, 1000);
});
question.addEventListener('mouseleave', () => {
  clearInterval(interval);
  clearTimeout(revealTimeout);
  question.textContent = "?";
});

investigateBtn.addEventListener('click', () => {
  document.querySelector('#background').scrollIntoView({ behavior: 'smooth' });
});

/* down-arrow removed */

/* ===== Section 2: Scroll reveal (copy only) ===== */
const scroller = document.getElementById('scroller');
const bgSection = document.getElementById('background');
const bgCopy = document.getElementById('bgCopy');
const bgVisuals = document.getElementById('bgVisuals');

function clamp(n, min, max){ return Math.max(min, Math.min(n, max)); }

// Keyword -> images config
// To add images: upload images to the /images folder, then add 'url' property to each image object
// Example: { key: '50', images: [{ caption: 'About 50 strands per day', url: 'images/50-strands.png' }] }
const keywordConfig = [
  { 
    key: '50', 
    images: [{ 
      caption: 'Source: Goren, Andy & Shapiro, J. & Sinclair, Rodney & Lonky, Neal & Situm, Mirna & Bulat, Vedrana & Bolanča, Željana & McCoy, John. (2016). Prevalence of hair shedding among women. Dermatologic therapy. 30. 10.1111/dth.12415.', 
      url: 'images/50-strands.png' 
    }] 
  },
  { 
    key: '100', 
    images: [{ 
      caption: 'Source: Goren, Andy & Shapiro, J. & Sinclair, Rodney & Lonky, Neal & Situm, Mirna & Bulat, Vedrana & Bolanča, Željana & McCoy, John. (2016). Prevalence of hair shedding among women. Dermatologic therapy. 30. 10.1111/dth.12415.', 
      url: 'images/100-strands.png' 
    }] 
  },
  { 
    key: 'waste', 
    images: [
      { url: 'images/waste_1.webp' },
      { url: 'images/waste_2.jpg' },
      { url: 'images/waste_3.jpg' }
    ] 
  },
  { 
    key: 'resource', 
    images: [
      { url: 'images/resource_1.jpg' },
      { url: 'images/resource_2.jpeg' }
    ] 
  },
  { 
    key: 'evidence', 
    images: [
      { url: 'images/evidence_1.png' },
      { url: 'images/evidence_2.webp' },
      { url: 'images/evidence_3.jpg' }
    ] 
  },
  { 
    key: 'protective when attached', 
    images: [
      { url: 'images/protective_1.jpeg' },
      { url: 'images/protective_2.mp4' },
      { url: 'images/protective_3.webp' }
    ] 
  },
  { 
    key: 'adaptive when challenged', 
    images: [
      { url: 'images/adaptive_1.webp' },
      { url: 'images/adaptive_2.webp' }
    ] 
  },
  { 
    key: 'regenrative when lost', 
    images: [
      { url: 'images/regenerative_1.webp' },
      { url: 'images/regenerative_2.webp' }
    ] 
  },
];

const triggeredKeys = new Set();
let wordSpans = [];
let buttonFadeInitiated = false; // Track if button fade has been initiated

function buildWordSpans(){
  if (!bgCopy) {
    console.log('bgCopy not found');
    return;
  }
  wordSpans = []; // Reset array
  
  // Define phrases that should reveal together (all words at once)
  const phraseRevealLines = [
    'protective when attached',
    'adaptive when challenged',
    'regenrative when lost'
  ];
  
  // Wrap each word in spans for reveal (only in .reveal-line paragraphs, not buttons)
  const lines = Array.from(bgCopy.querySelectorAll('.reveal-line'));
  console.log('Found reveal lines:', lines.length);
  lines.forEach(line => {
    const lineText = line.textContent.trim();
    
    // Check if this line should be revealed as a phrase
    const isPhraseLine = phraseRevealLines.some(phrase => 
      lineText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (isPhraseLine) {
      // Reveal entire line as one phrase
      const span = document.createElement('span');
      span.className = 'word phrase';
      span.textContent = lineText;
      line.textContent = '';
      line.appendChild(span);
      wordSpans.push(span);
    } else {
      // Reveal word by word
      const tokens = line.textContent.split(/(\s+)/); // keep spaces
      line.textContent = '';
      tokens.forEach(tok => {
        if (/\s+/.test(tok)) { 
          line.appendChild(document.createTextNode(tok)); 
          return; 
        }
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = tok;
        line.appendChild(span);
        wordSpans.push(span);
      });
    }
  });
  console.log('Built word spans:', wordSpans.length);
}

function normalizedWord(span){
  return span.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function checkKeywordTriggers(){
  if (!bgCopy || wordSpans.length === 0) return;
  
  const words = wordSpans.map(normalizedWord);
  keywordConfig.forEach(entry => {
    if (triggeredKeys.has(entry.key)) return; // Already triggered
    
    // For multi-word keywords, check if all words in the phrase are revealed
    const keyWords = entry.key.toLowerCase().split(/\s+/);
    const keyTokens = keyWords.map(w => w.replace(/[^a-z0-9]+/g, ''));
    
    // Check if this is a multi-word phrase
    if (keyWords.length > 1) {
      // Find consecutive matching words
      for (let i = 0; i <= words.length - keyTokens.length; i++) {
        let allRevealed = true;
        let allMatch = true;
        
        for (let j = 0; j < keyTokens.length; j++) {
          if (!wordSpans[i+j] || !wordSpans[i+j].classList.contains('revealed')) {
            allRevealed = false;
            break;
          }
          if (words[i+j] !== keyTokens[j]) {
            allMatch = false;
            break;
          }
        }
        
        if (allRevealed && allMatch) {
          console.log('Multi-word keyword triggered:', entry.key);
          revealImagesForKey(entry);
          triggeredKeys.add(entry.key);
          break;
        }
      }
      // Additional check: if the line was built as a single "phrase" span
      // then the normalized stored word will be the concatenation of the words
      // (e.g. "protectivewhenattached"). Detect that too.
      const normalizedConcat = keyTokens.join('');
      for (let i = 0; i < words.length; i++) {
        if (words[i] === normalizedConcat && wordSpans[i].classList.contains('revealed')) {
          console.log('Multi-word phrase (single-span) keyword triggered:', entry.key);
          revealImagesForKey(entry);
          triggeredKeys.add(entry.key);
          break;
        }
      }
    } else {
      // Single word keyword - check each revealed word
      const normalizedKey = entry.key.toLowerCase().replace(/[^a-z0-9]+/g, '');
      
      for (let i = 0; i < words.length; i++) {
        if (wordSpans[i].classList.contains('revealed')) {
          const wordText = wordSpans[i].textContent.toLowerCase();
          const normalizedWord = words[i];
          
          // Check exact match first
          if (normalizedWord === normalizedKey) {
            console.log('Keyword triggered:', entry.key);
            revealImagesForKey(entry);
            triggeredKeys.add(entry.key);
            break;
          }
          
          // For numeric keywords like "50" or "100", check if they appear at word boundaries
          if (/^\d+$/.test(entry.key)) {
            const startsWithPattern = new RegExp('^' + entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:-|$)');
            const endsWithPattern = new RegExp('(?:^|-)' + entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
            
            if (wordText.match(startsWithPattern) || wordText.match(endsWithPattern)) {
              console.log('Keyword triggered:', entry.key, 'in word:', wordText);
              revealImagesForKey(entry);
              triggeredKeys.add(entry.key);
              break;
            }
          } else {
            // For non-numeric keywords, use substring matching
            if (normalizedWord.includes(normalizedKey)) {
              console.log('Keyword triggered:', entry.key);
              revealImagesForKey(entry);
              triggeredKeys.add(entry.key);
              break;
            }
          }
        }
      }
    }
  });
}

function revealImagesForKey(entry){
  if (!bgVisuals) {
    console.log('bgVisuals not found');
    return;
  }
  
  console.log('Revealing images for keyword:', entry.key, 'Images:', entry.images);
  
  // Fade out all currently visible images first
  const visibleItems = bgVisuals.querySelectorAll('.visItem.visible');
  console.log('Fading out', visibleItems.length, 'visible items');
  visibleItems.forEach(item => {
    item.classList.remove('visible');
    // Remove after fade out completes
    setTimeout(() => {
      if (!item.classList.contains('visible')) {
        item.remove();
      }
    }, 800); // Match transition duration
  });
  
  if (!entry.images || entry.images.length === 0) {
    console.log('No images found for entry:', entry.key);
    return;
  }
  
  // Create container for all images (stacked vertically)
  const container = document.createElement('div');
  container.className = 'visItem';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '1rem';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  
  // Create each media item as a separate rectangle
  entry.images.forEach((img, index) => {
    const mediaRect = document.createElement('div');
    mediaRect.className = 'media-rect';
    
    // Create tooltip if caption exists
    if (img.caption) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = img.caption;
      mediaRect.appendChild(tooltip);
    }
    
    // Determine media type and create appropriate element
    const url = img.url || '';
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    
    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.src = url;
      videoEl.controls = true;
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'contain';
      videoEl.onerror = function() {
        console.log('Video failed to load:', url);
      };
      mediaRect.appendChild(videoEl);
    } else if (url) {
      const imgEl = document.createElement('img');
      imgEl.src = url;
      imgEl.alt = img.caption || entry.key;
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.objectFit = 'contain';
      imgEl.onerror = function() {
        console.log('Image failed to load:', url);
      };
      mediaRect.appendChild(imgEl);
    }
    
    container.appendChild(mediaRect);
  });
  
  bgVisuals.appendChild(container);
  console.log('Media container added for keyword:', entry.key, 'with', entry.images.length, 'items');
  
  // Wait one frame for DOM to be ready
  requestAnimationFrame(() => {
    // Add visible class - CSS should handle the transition
    setTimeout(() => {
      container.classList.add('visible');
      console.log('Added visible class to container');
      
      // Check after a frame to see if opacity changed
      requestAnimationFrame(() => {
        const computed = window.getComputedStyle(container);
        const opacityValue = parseFloat(computed.opacity);
        console.log('Computed opacity:', computed.opacity, 'Class list:', container.classList.toString());
        
        // If opacity is still 0, there's a CSS issue - force with inline style
        if (opacityValue < 0.1) {
          console.warn('Opacity still 0, forcing with inline style');
          container.style.removeProperty('opacity');
          setTimeout(() => {
            container.style.setProperty('opacity', '1', 'important');
            console.log('Forced opacity to 1. New computed:', window.getComputedStyle(container).opacity);
          }, 50);
        } else {
          console.log('Opacity successfully changed to:', computed.opacity);
        }
      });
    }, 200);
  });
}

function handleBackgroundScroll(){
  if (!bgSection) {
    console.log('bgSection not found');
    return;
  }
  if (wordSpans.length === 0) {
    console.log('No word spans found');
    return;
  }
  
  const viewportH = scroller ? scroller.clientHeight : (window.innerHeight || document.documentElement.clientHeight);
  const sectionTopAbs = bgSection.offsetTop; // relative to scroller
  const sectionHeight = bgSection.offsetHeight;
  const scrollPos = scroller ? scroller.scrollTop : window.scrollY;
  
  // Calculate progress: words reveal as user scrolls through the section
  // Similar to Niice.nl pattern: text stays sticky while words reveal progressively
  const sectionStart = sectionTopAbs;
  const scrollableDistance = sectionHeight - viewportH;
  
  // Calculate how much has scrolled through the section
  const scrolledThrough = scrollPos - sectionStart;
  
  // Only start revealing when section enters viewport
  if (scrolledThrough < 0) {
    wordSpans.forEach(span => span.classList.remove('revealed'));
    // Don't check keywords when section is not in view
    return;
  }
  
  // Calculate reveal distance - use most of the scrollable space
  // This ensures all words reveal while the copy stays sticky (like Niice pattern)
  // The sticky element will remain visible throughout the scroll
  const revealDistance = Math.max(scrollableDistance * 0.85, viewportH * 2); // Use 85% of scroll space, minimum 2 viewports
  
  // Progress: 0 when section enters, 1 when all words should be revealed
  // This ensures all words are revealed while the copy is still sticky
  const progress = clamp(scrolledThrough / revealDistance, 0, 1);

  const totalWords = wordSpans.length;
  const revealCount = Math.floor(progress * totalWords);
  
  // Debug on first few calls
  if (Math.floor(progress * 100) % 20 === 0) {
    console.log('Scroll progress:', Math.floor(progress * 100) + '%', 'Revealing:', revealCount, '/', totalWords);
  }
  
  // Reveal words progressively
  for (let i = 0; i < totalWords; i++){
    if (i < revealCount) {
      wordSpans[i].classList.add('revealed');
    } else {
      wordSpans[i].classList.remove('revealed');
    }
  }
  
  // Check for keyword triggers after words are revealed - this ensures images appear as keywords are revealed
  checkKeywordTriggers();
  
  // Check if "lost" word is revealed - fade in last paragraph and button
  // Find a span that contains the word 'lost' (works for single-word spans or
  // multi-word phrase spans like "regenrative when lost" which were wrapped
  // as a single span). We look for 'lost' as a substring in the normalized
  // content and ensure that span is revealed.
  const lostWord = wordSpans.find(span => {
    const normalized = normalizedWord(span);
    return normalized.includes('lost');
  });
  
  const fadeLine = bgCopy.querySelector('.fade-line');
  const fadeButton = bgCopy.querySelector('.fade-element');
  
  if (lostWord && lostWord.classList.contains('revealed')) {
    // "lost" is revealed - fade in the paragraph
    if (fadeLine) {
      fadeLine.classList.add('faded-in');
    }
    // Fade in button slightly after paragraph starts fading
    if (fadeButton && !buttonFadeInitiated) {
      // Initiate button fade only once
      buttonFadeInitiated = true;
      setTimeout(() => {
        fadeButton.classList.add('faded-in');
      }, 300); // 300ms delay after paragraph starts fading
    }
  } else {
    // Hide fade elements if "lost" not yet revealed
    if (fadeLine) fadeLine.classList.remove('faded-in');
    if (fadeButton) fadeButton.classList.remove('faded-in');
    buttonFadeInitiated = false; // Reset flag when hiding
  }
}

// Initialize - try both DOMContentLoaded and load
function initBackgroundSection() {
  console.log('Initializing background section...');
  console.log('bgSection:', bgSection);
  console.log('bgCopy:', bgCopy);
  if (!bgSection || !bgCopy) {
    console.log('Missing elements:', { bgSection: !!bgSection, bgCopy: !!bgCopy });
    return;
  }
  buildWordSpans();
  // Ensure words start hidden
  wordSpans.forEach(span => span.classList.remove('revealed'));
  // Call handler after a brief delay to ensure layout is complete
  setTimeout(() => {
    console.log('Calling handleBackgroundScroll after delay...');
    handleBackgroundScroll();
  }, 100);
  
  // Also call on next frame
  requestAnimationFrame(() => {
    console.log('Calling handleBackgroundScroll on next frame...');
    handleBackgroundScroll();
  });
  
  console.log('Initialization complete. Word spans:', wordSpans.length);
  
  // Test: reveal first few words to verify mechanism works
  if (wordSpans.length > 0) {
    setTimeout(() => {
      // Reveal first 5 words to test
      for (let i = 0; i < Math.min(5, wordSpans.length); i++) {
        wordSpans[i].classList.add('revealed');
      }
      console.log('Test: Revealed first 5 words');
      console.log('First word element:', wordSpans[0]);
      console.log('First word computed style:', window.getComputedStyle(wordSpans[0]).opacity);
      console.log('First word has revealed class:', wordSpans[0].classList.contains('revealed'));
    }, 500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgroundSection);
} else {
  initBackgroundSection();
}

window.addEventListener('load', initBackgroundSection);
// Listen to scroll on both the scroller container and window
if (scroller) {
  scroller.addEventListener('scroll', handleBackgroundScroll, { passive: true });
} else {
  window.addEventListener('scroll', handleBackgroundScroll, { passive: true });
}
window.addEventListener('resize', handleBackgroundScroll);

// Begin button scroll
document.getElementById('beginFromBg')?.addEventListener('click', () => {
  document.querySelector('#scene')?.scrollIntoView({ behavior: 'smooth' });
});

/* ===== Photo upload preview ===== */
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
let hasPhoto = false;
let uploadedFile = null; // Store the actual file for upload

// Handle photo upload
if (photoInput) {
    photoInput.addEventListener('change', e => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        uploadedFile = file; // Store file for later upload
        
        const reader = new FileReader();
        reader.onload = ev => {
            photoPreview.src = ev.target.result;
            photoPreview.style.display = 'block';
            hasPhoto = true;
            
            // Update investigate preview
            const traceDisplay = document.getElementById('traceDisplay');
            if (traceDisplay) {
                traceDisplay.innerHTML = `<img src="${photoPreview.src}" alt="Uploaded hair" style="max-width:100%; max-height:100%;">`;
            }
        };
        reader.readAsDataURL(file);
    });
}

/* ===== Prompts (expand/collapse) - accessible interactive prompts ===== */
const promptElements = Array.from(document.querySelectorAll('.prompt'));
function closeAllPrompts() {
  promptElements.forEach(pp => {
    // Prefer explicit id lookup, fall back to next textarea sibling
    const id = pp.dataset.prompt + 'Text';
    let ta = document.getElementById(id);
    if (!ta) {
      const maybe = pp.nextElementSibling;
      if (maybe && maybe.tagName && maybe.tagName.toLowerCase() === 'textarea') ta = maybe;
    }
    if (ta) ta.classList.add('hidden');
    pp.setAttribute('aria-expanded', 'false');
  });
}

promptElements.forEach(p => {
  // Ensure attributes exist (in case HTML wasn't updated)
  if (!p.hasAttribute('tabindex')) p.setAttribute('tabindex', '0');
  if (!p.hasAttribute('role')) p.setAttribute('role', 'button');
  if (!p.hasAttribute('aria-expanded')) p.setAttribute('aria-expanded', 'false');

  const togglePrompt = () => {
    const id = p.dataset.prompt + 'Text';
    let ta = document.getElementById(id);
    if (!ta) {
      const maybe = p.nextElementSibling;
      if (maybe && maybe.tagName && maybe.tagName.toLowerCase() === 'textarea') ta = maybe;
    }
    if (!ta) return;

    const isOpen = !ta.classList.contains('hidden');
    // Close others first (only one open at a time)
    closeAllPrompts();

    if (!isOpen) {
      ta.classList.remove('hidden');
      p.setAttribute('aria-expanded', 'true');
      // focus textarea and move cursor to end
      ta.focus();
      try { ta.selectionStart = ta.selectionEnd = ta.value.length; } catch (e) {}
    } else {
      p.setAttribute('aria-expanded', 'false');
      ta.classList.add('hidden');
    }
  };

  p.addEventListener('click', togglePrompt);
  p.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      togglePrompt();
    }
  });
});

/* ===== Next buttons (in-section) ===== */
document.querySelectorAll('.next').forEach(btn => {
  btn.addEventListener('click', () => {
    const nextSection = btn.closest('.section')?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ===== Review population on entry ===== */
const reviewContainer = document.getElementById('reviewContainer');
const reviewSection = document.getElementById('review');

// Helper function to get the prompt question text for a given textarea
function getPromptText(textareaId) {
  // Find the textarea element
  const textarea = document.getElementById(textareaId);
  if (!textarea) return null;
  
  // Find the prompt element that comes before this textarea
  // Check if previous sibling is the prompt
  let promptElement = textarea.previousElementSibling;
  
  // If previous sibling is a prompt, use it
  if (promptElement && promptElement.classList.contains('prompt')) {
    // Get the text content, removing HTML tags and normalizing whitespace
    let text = promptElement.textContent.trim();
    // Replace multiple spaces/newlines with single space
    text = text.replace(/\s+/g, ' ');
    return text;
  }
  
  // If not found as sibling, try finding by data-prompt attribute
  // Map textarea IDs to data-prompt values
  const idToPromptMap = {
    'originText': 'origin',
    'emotionText': 'emotion',
    'connectionText': 'connection',
    'connectionText-1': 'connection-1',
    'connectionText-2': 'connection-2',
    'connectionText-3': 'connection-3',
    'connectionText-4': 'connection-4',
    'connectionText-5': 'connection-5'
  };
  
  const promptId = idToPromptMap[textareaId];
  if (promptId) {
    promptElement = document.querySelector(`[data-prompt="${promptId}"]`);
    if (promptElement && promptElement.classList.contains('prompt')) {
      let text = promptElement.textContent.trim();
      text = text.replace(/\s+/g, ' ');
      return text;
    }
  }
  
  return null;
}

const reviewObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      reviewContainer.innerHTML = '';
      
      // Collect origin and emotion responses with full prompt text
      ['origin', 'emotion'].forEach(key => {
        const textareaId = key + 'Text';
        const val = document.getElementById(textareaId)?.value.trim();
        if (val) {
          const promptText = getPromptText(textareaId) || key;
          const div = document.createElement('div');
          div.className = 'reviewItem';
          div.innerHTML = `<h3 style="margin-bottom:.4rem;">${promptText}</h3><p style="text-align:left;">${val}</p>`;
          reviewContainer.appendChild(div);
        }
      });
      
      // Gather all connection* textareas with full prompt text
      const connectionTextareas = Array.from(document.querySelectorAll('textarea[id^="connectionText"]'));
      connectionTextareas.forEach(ta => {
        const val = ta.value.trim();
        if (val) {
          const promptText = getPromptText(ta.id) || ta.id;
          const div = document.createElement('div');
          div.className = 'reviewItem';
          div.innerHTML = `<h3 style="margin-bottom:.4rem;">${promptText}</h3><p style="text-align:left;">${val}</p>`;
          reviewContainer.appendChild(div);
        }
      });
    }
  });
},{ threshold: 0.3 });
reviewObserver.observe(reviewSection);

/* ===== Submit / Overlay ===== */
// Generic overlay close handler (works for static and dynamically created buttons)
function closeOverlay() {
  document.getElementById('overlay').style.display = 'none';
}

// Attach to initial close button
document.getElementById('closeOverlay')?.addEventListener('click', closeOverlay);

// Submit handler
document.getElementById('submitArchive')?.addEventListener('click', async () => {
  const submitBtn = document.getElementById('submitArchive');
  const overlay = document.getElementById('overlay');
  const overlayContent = overlay.querySelector('.overlayContent');
  
  // Validate that we have an image
  if (!uploadedFile) {
    alert('Please upload an image before submitting.');
    return;
  }
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    // Collect all 8 prompt responses separately
    const origin = document.getElementById('originText')?.value.trim() || null;
    const emotion = document.getElementById('emotionText')?.value.trim() || null;
    const connection = document.getElementById('connectionText')?.value.trim() || null;
    const connection_1 = document.getElementById('connectionText-1')?.value.trim() || null;
    const connection_2 = document.getElementById('connectionText-2')?.value.trim() || null;
    const connection_3 = document.getElementById('connectionText-3')?.value.trim() || null;
    const connection_4 = document.getElementById('connectionText-4')?.value.trim() || null;
    const connection_5 = document.getElementById('connectionText-5')?.value.trim() || null;
    
    // Check if Supabase client is available
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized. Please check your Supabase configuration.');
    }
    
    // Submit to Supabase with all 8 prompt responses
    const result = await window.supabaseClient.submitArchive({
      file: uploadedFile,
      origin: origin,
      emotion: emotion,
      connection: connection,
      connection_1: connection_1,
      connection_2: connection_2,
      connection_3: connection_3,
      connection_4: connection_4,
      connection_5: connection_5
    });
    
    console.log('Archive submitted successfully:', result);
    
    // Show success overlay
    overlayContent.innerHTML = '<p>Your strand has joined the archive.</p><button id="closeOverlay" class="btn primary">Close</button>';
    overlay.style.display = 'flex';
    
    // Re-attach close handler to dynamically created button
    document.getElementById('closeOverlay')?.addEventListener('click', closeOverlay);
    
  } catch (error) {
    console.error('Error submitting to archive:', error);
    
    // Show error message
    overlayContent.innerHTML = `<p>Error: ${error.message || 'Failed to submit to archive. Please try again.'}</p><button id="closeOverlay" class="btn primary">Close</button>`;
    overlay.style.display = 'flex';
    
    // Re-attach close handler to dynamically created button
    document.getElementById('closeOverlay')?.addEventListener('click', closeOverlay);
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Release to Archive';
  }
});

/* ===== Keep for Myself (lightweight print-to-PDF) ===== */
document.getElementById('downloadPDF')?.addEventListener('click', () => {
  const win = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
  win.document.write('<html><head><title>Your Strand</title></head><body>');
  win.document.write('<h2 style="font-family: Cormorant Garamond, serif;">Your Hair Archive Reflection</h2>');
  reviewContainer.querySelectorAll('.reviewItem').forEach(item => {
    win.document.write(item.outerHTML);
  });
  win.document.write('</body></html>');
  win.document.close();
  win.print();
});

// Adjusting the fade-in duration for the elements
const fadeInDuration = 1500; // Duration in milliseconds

let keywordFound = false; // Track if a keyword was found

function fadeInElements() {
  // Add your fade-in logic here
  // For example, you can add a class that triggers a CSS transition
  bgVisuals.classList.add('fade-in');
}

// ...existing code...

function checkKeywordTriggers(){
  if (!bgCopy || wordSpans.length === 0) return;
  
  const words = wordSpans.map(normalizedWord);
  keywordConfig.forEach(entry => {
    if (triggeredKeys.has(entry.key)) return; // Already triggered
    
    // For multi-word keywords, check if all words in the phrase are revealed
    const keyWords = entry.key.toLowerCase().split(/\s+/);
    const keyTokens = keyWords.map(w => w.replace(/[^a-z0-9]+/g, ''));
    
    // Check if this is a multi-word phrase
    if (keyWords.length > 1) {
      // Find consecutive matching words
      for (let i = 0; i <= words.length - keyTokens.length; i++) {
        let allRevealed = true;
        let allMatch = true;
        
        for (let j = 0; j < keyTokens.length; j++) {
          if (!wordSpans[i+j] || !wordSpans[i+j].classList.contains('revealed')) {
            allRevealed = false;
            break;
          }
          if (words[i+j] !== keyTokens[j]) {
            allMatch = false;
            break;
          }
        }
        
        if (allRevealed && allMatch) {
          console.log('Multi-word keyword triggered:', entry.key);
          revealImagesForKey(entry);
          triggeredKeys.add(entry.key);
          keywordFound = true; // Set keyword found flag
          return; // Exit the forEach loop
        }
      }
      // Additional check: if the line was built as a single "phrase" span
      // then the normalized stored word will be the concatenation of the words
      // (e.g. "protectivewhenattached"). Detect that too.
      const normalizedConcat = keyTokens.join('');
      for (let i = 0; i < words.length; i++) {
        if (words[i] === normalizedConcat && wordSpans[i].classList.contains('revealed')) {
          console.log('Multi-word phrase (single-span) keyword triggered:', entry.key);
          revealImagesForKey(entry);
          triggeredKeys.add(entry.key);
          keywordFound = true; // Set keyword found flag
          return; // Exit the forEach loop
        }
      }
    } else {
      // Single word keyword - check each revealed word
      const normalizedKey = entry.key.toLowerCase().replace(/[^a-z0-9]+/g, '');
      
      for (let i = 0; i < words.length; i++) {
        if (wordSpans[i].classList.contains('revealed')) {
          const wordText = wordSpans[i].textContent.toLowerCase();
          const normalizedWord = words[i];
          
          // Check exact match first
          if (normalizedWord === normalizedKey) {
            console.log('Keyword triggered:', entry.key);
            revealImagesForKey(entry);
            triggeredKeys.add(entry.key);
            keywordFound = true; // Set keyword found flag
            return; // Exit the forEach loop
          }
          
          // For numeric keywords like "50" or "100", check if they appear at word boundaries
          if (/^\d+$/.test(entry.key)) {
            const startsWithPattern = new RegExp('^' + entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:-|$)');
            const endsWithPattern = new RegExp('(?:^|-)' + entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
            
            if (wordText.match(startsWithPattern) || wordText.match(endsWithPattern)) {
              console.log('Keyword triggered:', entry.key, 'in word:', wordText);
              revealImagesForKey(entry);
              triggeredKeys.add(entry.key);
              keywordFound = true; // Set keyword found flag
              return; // Exit the forEach loop
            }
          } else {
            // For non-numeric keywords, use substring matching
            if (normalizedWord.includes(normalizedKey)) {
              console.log('Keyword triggered:', entry.key);
              revealImagesForKey(entry);
              triggeredKeys.add(entry.key);
              keywordFound = true; // Set keyword found flag
              return; // Exit the forEach loop
            }
          }
        }
      }
    }
  });
  
  // If a keyword was found, fade in the elements
  if (keywordFound) {
    // Fade in the elements with a delay
    setTimeout(() => {
      fadeInElements();
    }, fadeInDuration);
  }
}
