// Initialize Supabase client
let supabaseClient = null;
if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  console.log('Supabase client initialized');
} else {
  console.warn('Supabase client not initialized. Make sure Supabase CDN and keys are loaded.');
}

// Supabase Storage base URL for images
const getStorageUrl = (path) => {
  if (!window.SUPABASE_URL) return path;
  return `${window.SUPABASE_URL}/storage/v1/object/public/archive-images/${path}`;
};

// Load items from Supabase and display in archive grid
async function loadArchiveItems() {
  try {
    console.log('Loading archive items from Supabase...');
    
    // Fetch from Supabase instead of JSON
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    
    const { data: items, error } = await supabaseClient
      .from('archive_items')
      .select('*')
      .order('id');
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!items || items.length === 0) {
      throw new Error('No items found in database');
    }
    
    console.log(`Loaded ${items.length} items from Supabase:`, items);
    
    const container = document.getElementById('archiveContainer');
    if (!container) {
      console.error('archiveContainer not found!');
      return;
    }
    
    container.innerHTML = '';
    
    items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'archive-list-item';
      itemEl.dataset.id = item.id;
      
      // Store ID internally but don't display it
      itemEl.dataset.itemId = item.id;
      
      // Create cells directly (no container needed since we use display: contents)
      const traitCell = document.createElement('div');
      traitCell.className = 'archive-cell';
      // Add quotation marks around inherited trait text
      const traitText = item.inheritedtrait || '';
      traitCell.textContent = traitText ? `"${traitText}"` : '';
      
      const locationCell = document.createElement('div');
      locationCell.className = 'archive-cell';
      // Handle both 'location/source' (from JSON) and 'location_source' (from Supabase)
      const locationText = item.location_source || item['location/source'] || '';
      locationCell.textContent = locationText ? `"${locationText}"` : '';
      
      const dateCell = document.createElement('div');
      dateCell.className = 'archive-cell';
      dateCell.textContent = item.dateofsample || '';
      
      // Append cells directly to itemEl in correct order: Inherited Trait, Location/Source, Date of Sample
      itemEl.appendChild(traitCell);
      itemEl.appendChild(locationCell);
      itemEl.appendChild(dateCell);
      
      // Store image paths for hover and click - use Supabase Storage URLs
      const outlineImagePath = getStorageUrl(`outlines/${item.id}.png`);
      const originalImagePath = getStorageUrl(`originals/${item.id}.png`);
      
      // Hover effect: show outline image centered, dim other rows
      const previewContainer = document.getElementById('previewImageContainer');
      const previewImage = document.getElementById('previewImage');
      
      itemEl.addEventListener('mouseenter', () => {
        // Query all items fresh on each hover to ensure we get all items
        const allItems = document.querySelectorAll('.archive-list-item');
        
        if (previewImage && previewContainer) {
          previewImage.src = outlineImagePath;
          previewImage.style.display = 'block';
          previewContainer.classList.add('visible');
        }
        
        // First, remove hovered and add dimmed to ALL items (except active ones and the current hovered item)
        allItems.forEach(otherItem => {
          if (otherItem !== itemEl) {
            if (!otherItem.classList.contains('active')) {
              otherItem.classList.remove('hovered');
              otherItem.classList.add('dimmed');
            }
          }
        });
        
        // Then add hovered class to current item (keeps text black) and remove dimmed
        // But don't override active state
        if (!itemEl.classList.contains('active')) {
          itemEl.classList.add('hovered');
        }
        itemEl.classList.remove('dimmed');
      });
      
      itemEl.addEventListener('mouseleave', () => {
        // Query all items fresh on each mouseleave
        const allItems = document.querySelectorAll('.archive-list-item');
        
        if (previewContainer) {
          previewContainer.classList.remove('visible');
          setTimeout(() => {
            if (!previewContainer.classList.contains('visible')) {
              previewImage.style.display = 'none';
            }
          }, 300);
        }
        
        // Remove hovered class from current item (unless it's active)
        if (!itemEl.classList.contains('active')) {
          itemEl.classList.remove('hovered');
        }
        
        // Check if there's an active item
        const activeItem = document.querySelector('.archive-list-item.active');
        
        if (activeItem) {
          // If there's an active item, keep all non-active items dimmed
          allItems.forEach(otherItem => {
            if (otherItem !== activeItem && !otherItem.classList.contains('active')) {
              otherItem.classList.add('dimmed');
            }
          });
        } else {
          // If no active item, remove dimmed from all items
          allItems.forEach(otherItem => {
            otherItem.classList.remove('dimmed');
          });
        }
      });
      
      // Click: open modal with original image, update URL, dim other rows
      itemEl.addEventListener('click', () => {
        // Query all items fresh on click
        const allItems = document.querySelectorAll('.archive-list-item');
        
        // Mark this row as active (keep black) - remove dimmed and hovered FIRST
        itemEl.classList.add('active');
        itemEl.classList.remove('hovered');
        itemEl.classList.remove('dimmed'); // Ensure active item is not dimmed
        
        // Dim all other rows (grey text) - remove active and hovered
        allItems.forEach(otherItem => {
          if (otherItem !== itemEl) {
            otherItem.classList.remove('active');
            otherItem.classList.remove('hovered');
            otherItem.classList.add('dimmed'); // Add dimmed to make text grey
          }
        });
        
        // Open modal after setting states
        openImageModal(item);
        
        // Update URL
        const itemId = item.id;
        const newUrl = `${window.location.pathname}?item=${itemId}`;
        window.history.pushState({ item: itemId }, '', newUrl);
      });
      
      container.appendChild(itemEl);
    });
    console.log(`Displayed ${items.length} archive items`);
  } catch (error) {
    console.error('Error loading archive items:', error);
    const container = document.getElementById('archiveContainer');
    if (container) {
      let errorMessage = 'Error loading archive items. ';
      
      // Provide helpful error messages
      if (error.message.includes('Supabase client not initialized')) {
        errorMessage += 'Supabase client is not initialized. Make sure the Supabase CDN script and keys are loaded in archive.html.';
      } else if (error.message.includes('No items found')) {
        errorMessage += 'No items found in the database. Please run the SQL setup script in Supabase.';
      } else {
        errorMessage += error.message;
      }
      
      container.innerHTML = `
        <div style="text-align: center; color: var(--ink); padding: 3rem 2rem; max-width: 600px; margin: 0 auto;">
          <p style="margin-bottom: 1rem; font-size: 1.1rem;">${errorMessage}</p>
          <p style="color: var(--muted); font-size: 0.9rem;">Check the browser console for more details.</p>
        </div>
      `;
    }
  }
}

// Open modal with full-size original image
function openImageModal(item) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalInfo = document.getElementById('modalInfo');
  
  if (!modal || !modalImage || !modalInfo) return;
  
  // Show original image in modal - use Supabase Storage URL
  modalImage.src = getStorageUrl(`originals/${item.id}.png`);
  modalImage.alt = item.id;
  
  // Handle both field name formats
  const locationSource = item.location_source || item['location/source'] || 'N/A';
  
  modalInfo.innerHTML = `
    <h3>${item.id}</h3>
    <p><strong>Inherited Trait:</strong> ${item.inheritedtrait || 'N/A'}</p>
    <p><strong>Date of Sample:</strong> ${item.dateofsample || 'N/A'}</p>
    <p><strong>Location/Source:</strong> ${locationSource}</p>
  `;
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Note: State management (active/dimmed) is handled by the click handler
  // This function just opens the modal
}

// Close modal and reset row states
function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset all rows - remove active and dimmed classes
    // Keep hovered class if an item is currently hovered
    const allItems = document.querySelectorAll('.archive-list-item');
    allItems.forEach(item => {
      item.classList.remove('active');
      item.classList.remove('dimmed');
      // Don't remove hovered - let the hover handlers manage that
    });
    
    // If no item is hovered, ensure all items return to default black
    // (hover handlers will manage the hovered state)
    const hoveredItem = document.querySelector('.archive-list-item.hovered');
    if (!hoveredItem) {
      // All items should return to default black (no classes needed)
      // The default CSS will handle this
    }
    
    // Clear URL parameter
    window.history.pushState({}, '', window.location.pathname);
  }
}

// Already defined above

// Initialize modal close handlers
function initModalHandlers() {
  const modal = document.getElementById('imageModal');
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      // Close if clicking on the modal background (not on the content)
      if (e.target.id === 'imageModal') {
        closeImageModal();
      }
    });
    
    // Prevent closing when clicking on the modal content
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeImageModal();
    }
  });
}

// Initialize hair trail effect (reuse from main script)
(function initHairTrail(){
  const canvas = document.getElementById('hairCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hairs = [];
  const colors = ['#1a1a1a', '#d1b16f', '#a3a7ab', '#8b5a2b', '#5f4631'];
  const shapes = ['line', 'coil', 'wavy'];
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas(){
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function spawnHair(clientX, clientY){
    const size = (12 + Math.random() * 20) * dpr;
    const hair = {
      x: clientX * dpr,
      y: clientY * dpr,
      vx: (Math.random() * 0.6 - 0.3) * dpr,
      vy: (-Math.random() * 0.6) * dpr,
      size,
      rotation: (Math.random() * Math.PI / 2) - (Math.PI / 4),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      resting: false,
      ground: canvas.height - (Math.random() * 40 * dpr)
    };
    hairs.push(hair);
    if (hairs.length > 450) {
      hairs.splice(0, hairs.length - 450);
    }
  }

  function updateHair(hair){
    if (!hair.resting) {
      hair.vy += 0.18 * dpr;
      hair.vx *= 0.99;
      hair.x += hair.vx;
      hair.y += hair.vy;

      if (hair.y >= hair.ground) {
        hair.y = hair.ground;
        hair.vx *= 0.35;
        hair.vy = 0;
        hair.resting = true;
      }

      if (hair.x <= 0) hair.x = 0;
      if (hair.x >= canvas.width) hair.x = canvas.width;
    }
  }

  function drawHair(hair){
    ctx.save();
    ctx.translate(hair.x, hair.y);
    ctx.rotate(hair.rotation);
    ctx.strokeStyle = hair.color;
    ctx.lineWidth = 1.4 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (hair.shape === 'line') {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -hair.size);
      ctx.stroke();
    } else if (hair.shape === 'coil') {
      const turns = 3;
      const steps = turns * 20;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * Math.PI * 2;
        const radius = (hair.size * 0.05) + t * (hair.size * 0.08);
        const px = Math.cos(angle) * radius;
        const py = -t * hair.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      const segments = 18;
      const amplitude = hair.size * 0.12;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const px = Math.sin(t * Math.PI * 3) * amplitude;
        const py = -t * hair.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < hairs.length; i++) {
      updateHair(hairs[i]);
      drawHair(hairs[i]);
    }
    requestAnimationFrame(render);
  }

  let lastSpawn = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastSpawn < 35) return;
    lastSpawn = now;
    const spawnCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < spawnCount; i++) {
      const jitterX = e.clientX + (Math.random() * 8 - 4);
      const jitterY = e.clientY + (Math.random() * 8 - 4);
      spawnHair(jitterX, jitterY);
    }
  }, { passive: true });

  requestAnimationFrame(render);
})();

// Initialize scroll snap and click-to-scroll functionality
function initScrollSnap() {
  const aboutSection = document.getElementById('about');
  const archiveSection = document.getElementById('archiveGrid');
  
  // Click on About section to scroll to Archive (only on empty space, not on links/buttons)
  if (aboutSection) {
    aboutSection.addEventListener('click', (e) => {
      const clickedElement = e.target;
      
      // Don't trigger if clicking on links, buttons, or gallery
      const isInteractiveElement = clickedElement.tagName === 'A' ||
                                   clickedElement.tagName === 'BUTTON' ||
                                   clickedElement.id === 'installationGallery' ||
                                   clickedElement.closest('a') ||
                                   clickedElement.closest('button') ||
                                   clickedElement.closest('#installationGallery');
      
      // Allow clicking anywhere else in the section to scroll
      if (!isInteractiveElement && archiveSection) {
        e.preventDefault();
        archiveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  // Handle URL parameters on load
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('item');
  if (itemId && archiveSection) {
    // Wait for items to load, then scroll and open
    setTimeout(() => {
      archiveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Then find and click the item
      setTimeout(() => {
        const itemEl = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemEl) {
          itemEl.click();
        }
      }, 800);
    }, 500);
  }
}

// Installation Gallery functionality
function initInstallationGallery() {
  const installationLink = document.getElementById('installationLink');
  const gallery = document.getElementById('installationGallery');
  const galleryImage = document.getElementById('galleryImage');
  const prevButton = document.getElementById('galleryPrev');
  const nextButton = document.getElementById('galleryNext');
  
  if (!installationLink || !gallery || !galleryImage) return;
  
  const images = [
    'images/DSC01114.jpg',
    'images/DSC01111.jpg',
    'images/DSC01100.jpg'
  ];
  
  let currentImageIndex = 0;
  
  // Show first image
  galleryImage.src = images[currentImageIndex];
  
  // Toggle gallery on link click
  installationLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent section scroll
    
    if (gallery.classList.contains('visible')) {
      gallery.classList.remove('visible');
    } else {
      gallery.classList.add('visible');
      currentImageIndex = 0;
      galleryImage.src = images[currentImageIndex];
    }
  });
  
  // Navigate to previous image
  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      galleryImage.src = images[currentImageIndex];
    });
  }
  
  // Navigate to next image
  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentImageIndex = (currentImageIndex + 1) % images.length;
      galleryImage.src = images[currentImageIndex];
    });
  }
}

// About section background reveal effect
function initAboutBackgroundReveal() {
  const aboutSection = document.getElementById('about');
  const aboutOverlay = document.getElementById('aboutOverlay');
  
  if (!aboutSection || !aboutOverlay) return;
  
  const overlayHalfWidth = aboutOverlay.clientWidth / 2;
  
  aboutSection.addEventListener('mousemove', (e) => {
    const rect = aboutSection.getBoundingClientRect();
    const leftPosition = e.clientX - rect.left;
    const topPosition = e.clientY - rect.top;
    
    aboutOverlay.style.left = (leftPosition - overlayHalfWidth) + 'px';
    aboutOverlay.style.top = (topPosition - overlayHalfWidth) + 'px';
  });
}

// Load archive on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  console.log('About section:', document.getElementById('about'));
  console.log('Archive grid section:', document.getElementById('archiveGrid'));
  console.log('Archive container:', document.getElementById('archiveContainer'));
  initModalHandlers();
  initScrollSnap();
  initInstallationGallery();
  initAboutBackgroundReveal();
  loadArchiveItems();
});


