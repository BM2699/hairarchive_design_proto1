// Transition animation script
// Shows "TO SHED IS TO ?" and displays 2 random items, then transitions to page

(function() {
  // Only run on initial page load (not on navigation)
  if (sessionStorage.getItem('transitionShown')) {
    // Hide overlay immediately if transition was already shown in this session
    const overlay = document.getElementById('transitionOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    document.body.classList.remove('transitioning');
    return;
  }

  // Mark as shown for this session
  sessionStorage.setItem('transitionShown', 'true');
  
  // Add transitioning class to body
  document.body.classList.add('transitioning');

  const overlay = document.getElementById('transitionOverlay');
  const wordElement = document.getElementById('transitionWord');
  
  if (!overlay || !wordElement) return;

  // Available words
  const words = ['forget', 'savor', 'remember', 'let go'];
  
  // Randomly select 2 unique words
  const selectedWords = [];
  const availableWords = [...words];
  
  for (let i = 0; i < 2 && availableWords.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    selectedWords.push(availableWords[randomIndex]);
    availableWords.splice(randomIndex, 1);
  }

  // If we couldn't get 2 words, use the first 2 from the original array
  if (selectedWords.length < 2) {
    selectedWords.push(...words.slice(0, 2));
  }

  let currentWordIndex = 0;
  const wordDisplayDuration = 1500; // Show each word for 1.5 seconds
  const fadeDuration = 500; // Fade transition duration

  function showNextWord() {
    if (currentWordIndex >= selectedWords.length) {
      // All words shown, fade out overlay with blur
      wordElement.classList.add('fade-out');
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('transitioning');
      }, fadeDuration);
      return;
    }

    // Fade out current word (or question mark) with blur
    wordElement.classList.remove('fade-in');
    wordElement.classList.add('fade-out');
    
    setTimeout(() => {
      // Update to next word
      wordElement.textContent = selectedWords[currentWordIndex];
      wordElement.classList.remove('fade-out');
      wordElement.classList.add('fade-in');
      
      currentWordIndex++;
      
      // Show next word or fade out
      if (currentWordIndex < selectedWords.length) {
        setTimeout(showNextWord, wordDisplayDuration);
      } else {
        // All words shown, fade out with blur
        setTimeout(() => {
          wordElement.classList.remove('fade-in');
          wordElement.classList.add('fade-out');
          setTimeout(() => {
            overlay.classList.add('hidden');
            document.body.classList.remove('transitioning');
          }, fadeDuration);
        }, wordDisplayDuration);
      }
    }, fadeDuration);
  }

  // Start the animation after a brief delay
  setTimeout(() => {
    showNextWord();
  }, 800); // Initial delay before starting word cycle

})();

