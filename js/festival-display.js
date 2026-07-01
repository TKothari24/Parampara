// Festival display functionality

// Hardcoded festival data with descriptions matching the new design
const hardcodedFestivals = {
  currentMonth: [
    {
      id: 'diwali',
      name: 'Diwali',
      description: 'The Festival of Lights celebrating the victory of light over darkness with diyas, sweets and decorations.',
      month: 10
    },
    {
      id: 'holi',
      name: 'Holi',
      description: 'The Festival of Colors celebrating the arrival of spring with vibrant powders, water and joy.',
      month: 3
    },
    {
      id: 'dussehra',
      name: 'Dussehra',
      description: 'Celebrates the victory of good over evil with effigies, processions and festive rituals.',
      month: 10
    },
    {
      id: 'janmashtami',
      name: 'Janmashtami',
      description: 'Marks the birth of Lord Krishna with devotional songs, fasting and midnight celebrations.',
      month: 8
    },
    {
      id: 'raksha-bandhan',
      name: 'Raksha Bandhan',
      description: 'Honors the bond between siblings with sacred threads and gifts.',
      month: 8
    }
  ],
  nextMonth: [
    {
      id: 'raksha-bandhan',
      name: 'Raksha Bandhan',
      description: 'Celebrates the bond between brothers and sisters with threads of protection and love.',
      month: 8
    },
    {
      id: 'janmashtami',
      name: 'Janmashtami',
      description: 'Celebrates the birth of Lord Krishna, symbolizing divine love and spiritual wisdom.',
      month: 8
    },
    {
      id: 'ganesh-chaturthi',
      name: 'Ganesh Chaturthi',
      description: 'Celebrates the birth of Lord Ganesha with elaborate decorations, prayers and community celebrations.',
      month: 8
    }
  ]
};

async function fetchAndDisplayFestivals() {
  // Use hardcoded data instead of fetching from Supabase
  console.log('Using hardcoded festival data');
  
  // Display current month festivals
  displayFestivalList(hardcodedFestivals.currentMonth, 'Popular Indian Festivals');
  
  // Display next month festivals  
  displayNextMonthFestivals(hardcodedFestivals.nextMonth);
}

// Display festivals in a list using existing CSS with traditional styling
function displayFestivalList(festivals, title = 'Popular Indian Festivals') {
  let container = document.getElementById('festival-list');
  
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'festival-list';
    container.className = 'section';
    
    // Add to page after hero section or before footer
    const heroSection = document.querySelector('.hero');
    const footer = document.querySelector('.footer');
    
    if (heroSection && heroSection.nextSibling) {
      heroSection.parentNode.insertBefore(container, heroSection.nextSibling);
    } else if (footer) {
      footer.parentNode.insertBefore(container, footer);
    } else {
      document.body.appendChild(container);
    }
  }

  if (!festivals || festivals.length === 0) {
    container.innerHTML = `
      <div class="traditional-festival-header">
        <h2 class="festival-title">${title}</h2>
        <div class="festival-divider"></div>
      </div>
      <div class="no-festivals-message">
        <p>No festivals found for this month.</p>
      </div>
    `;
    return;
  }

  // Get current month name for display
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Use existing festival-product-card CSS classes with traditional enhancements
  const festivalHtml = festivals.map(festival => {
    const imageUrl = festivalImages[festival.name] || 'images/placeholder.png';
    return `
      <div class="festival-product-card traditional-festival-card">
        <div class="festival-card-wrapper">
          <div class="festival-image-container">
            <img src="${imageUrl}" alt="${festival.name}" onerror="this.onerror=null;this.src='images/placeholder.png';">
            <div class="festival-overlay"></div>
          </div>
          <div class="festival-content">
            <h3 class="festival-name">${festival.name || 'Unknown Festival'}</h3>
            <div class="festival-description">${festival.description || 'No description available'}</div>
            <button class="shop-btn festival-action-btn" onclick="viewFestivalProducts('${festival.id}', '${festival.name}')">
              <span>View Products</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="traditional-festival-header">
      <h2 class="festival-title">${title}</h2>
      <div class="festival-divider">
        <div class="divider-left"></div>
        <div class="divider-center">🪔</div>
        <div class="divider-right"></div>
      </div>
    </div>
    <div class="this-month-festival-container">
      <div class="festival-products-grid traditional-festival-grid">
        ${festivalHtml}
      </div>
    </div>
  `;
}

// Display featured festival using existing CSS
function displayFeaturedFestival(festival) {
  // Remove featured festival container if it exists
  const existingContainer = document.getElementById('featured-festival');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Don't create new featured festival section
  return;
}

// Display next month festivals using existing CSS - only if festivals exist
function displayNextMonthFestivals(festivals) {
  let container = document.getElementById('next-month-festivals');
  
  // Remove container if no festivals
  if (!festivals || festivals.length === 0) {
    if (container) {
      container.remove();
    }
    return;
  }

  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'next-month-festivals';
    container.className = 'section';
    
    const festivalList = document.getElementById('festival-list');
    if (festivalList && festivalList.nextSibling) {
      festivalList.parentNode.insertBefore(container, festivalList.nextSibling);
    } else {
      document.body.appendChild(container);
    }
  }

  const nextMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });
  
  // Use existing festival-product-card CSS classes with traditional styling
  const festivalHtml = festivals.map(festival => {
    const imageUrl = festivalImages[festival.name] || 'images/placeholder.png';
    return `
      <div class="festival-product-card traditional-festival-card">
        <div class="festival-card-wrapper">
          <div class="festival-image-container">
            <img src="${imageUrl}" alt="${festival.name}" onerror="this.onerror=null;this.src='images/placeholder.png';">
            <div class="festival-overlay"></div>
          </div>
          <div class="festival-content">
            <h3 class="festival-name">${festival.name || 'Unknown Festival'}</h3>
            <div class="festival-description">${festival.description || 'No description available'}</div>
            <button class="shop-btn festival-action-btn" onclick="viewFestivalProducts('${festival.id}', '${festival.name}')">
              <span>View Products</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="upcoming-festival-header">
      <h2>Upcoming Festivals</h2>
      <div class="festival-divider">
        <div class="divider-left"></div>
        <div class="divider-center">🌟</div>
        <div class="divider-right"></div>
      </div>
    </div>
    <div class="festival-products-grid traditional-festival-grid">
      ${festivalHtml}
    </div>
  `;
}

// Navigate to festival products page
function viewFestivalProducts(festivalId, festivalName) {
  console.log('View products for festival:', festivalId, festivalName);
  // Navigate to shop-fest-products.html with festival parameter
  console.log("I am in")
  window.location.href = `shop-fest-products.html?festival=${festivalId}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add traditional festival styles
  addTraditionalFestivalStyles();
  // Small delay to ensure Supabase is ready
  setTimeout(fetchAndDisplayFestivals, 500);
});

// Add traditional festival styling
function addTraditionalFestivalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Traditional Festival Header Styles */
    .traditional-festival-header {
      text-align: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      position: static;
    }
    
    .festival-title {
      font-size: 2.8rem;
      font-weight: 700;
      font-family: 'Georgia', serif;
      color: #d2691e;
      margin-bottom: 0.8rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      letter-spacing: 0.5px;
      position: relative;
      display: block;
      visibility: visible;
    }
    
    @keyframes titleShimmer {
      0%, 100% { 
        background-position: 0% 50%;
        transform: scale(1);
      }
      50% { 
        background-position: 100% 50%;
        transform: scale(1.02);
      }
    }
    
    .festival-subtitle {
      font-size: 1.4rem;
      font-weight: 500;
      color: #d2691e;
      margin-bottom: 1.5rem;
      font-style: italic;
      opacity: 0.9;
      animation: subtitleGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes subtitleGlow {
      0% { 
        color: #d2691e;
        text-shadow: 0 0 10px rgba(210, 105, 30, 0.3);
      }
      100% { 
        color: #ff8c00;
        text-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
      }
    }
    
    .festival-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1rem 0;
      position: relative;
    }
    
    .divider-left, .divider-right {
      height: 3px;
      background: linear-gradient(90deg, transparent, #ff8c00, #ffd700, #ff8c00, transparent);
      flex: 1;
      max-width: 120px;
      animation: dividerPulse 2s ease-in-out infinite alternate;
    }
    
    @keyframes dividerPulse {
      0% { 
        background: linear-gradient(90deg, transparent, #ff8c00, #ffd700, #ff8c00, transparent);
        height: 3px;
      }
      100% { 
        background: linear-gradient(90deg, transparent, #ffd700, #ff6b35, #ffd700, transparent);
        height: 4px;
      }
    }
    
    .divider-center {
      font-size: 2.5rem;
      margin: 0 1.5rem;
      animation: lampGlow 2.5s ease-in-out infinite alternate;
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
    }
    
    @keyframes lampGlow {
      0% { 
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        transform: scale(1);
      }
      100% { 
        filter: drop-shadow(0 0 15px rgba(255, 140, 0, 0.9));
        transform: scale(1.1);
      }
    }
    
    /* Traditional Festival Grid Layout */
    .traditional-festival-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    /* Traditional Festival Card Styles */
    .traditional-festival-card {
      background: #fff5e6;
      border: 1px solid #e8d4b8;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      padding: 1.5rem;
    }
    
    .traditional-festival-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-color: #d4a574;
    }
    
    .festival-card-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .festival-image-container {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
      width: 100%;
      height: 180px;
    }
    
    .festival-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      transition: transform 0.3s ease;
    }
    
    .traditional-festival-card:hover .festival-image-container img {
      transform: scale(1.05);
    }
    
    .festival-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(212,165,116,0.1), rgba(234,212,186,0.1));
      border-radius: 8px;
    }
    
    .festival-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .festival-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #8b4513;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    
    .festival-description {
      font-size: 0.95rem;
      color: #6b3410;
      margin-bottom: 1.5rem;
      line-height: 1.5;
      flex: 1;
      display: flex;
      align-items: center;
      text-align: center;
    }
    
    .festival-action-btn {
      background: #d4a574;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(212,165,116,0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: auto;
    }
    
    .festival-action-btn:hover {
      background: #c19660;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(212,165,116,0.4);
    }
    
    .festival-action-btn i {
      transition: transform 0.3s ease;
      font-size: 0.8rem;
    }
    
    .festival-action-btn:hover i {
      transform: translateX(2px);
    }
    
    /* This Month Festival Container with Unified Animation */
    .this-month-festival-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem 2rem 1rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(145deg, #fff5e6, #ffe4cc);
      border-radius: 20px;
      box-shadow: 0 8px 16px rgba(212, 165, 116, 0.12);
      position: relative;
      overflow: hidden;
      animation: subtleWarmFlow 8s ease-in-out infinite;
    }
    
    @keyframes subtleWarmFlow {
      0% { 
        background: linear-gradient(145deg, #fff5e6, #ffe4cc);
        box-shadow: 0 8px 16px rgba(212, 165, 116, 0.12);
      }
      20% { 
        background: linear-gradient(145deg, #ffe4cc, #ffe0b2);
        box-shadow: 0 10px 18px rgba(212, 165, 116, 0.15);
      }
      40% { 
        background: linear-gradient(145deg, #ffe0b2, #ffecb3);
        box-shadow: 0 10px 20px rgba(255, 193, 7, 0.18);
      }
      60% { 
        background: linear-gradient(145deg, #ffecb3, #ffe8d3);
        box-shadow: 0 12px 22px rgba(255, 193, 7, 0.20);
      }
      80% { 
        background: linear-gradient(145deg, #ffe8d3, #ffd4a3);
        box-shadow: 0 10px 18px rgba(230, 162, 118, 0.16);
      }
      100% { 
        background: linear-gradient(145deg, #ffd4a3, #fff5e6);
        box-shadow: 0 8px 16px rgba(212, 165, 116, 0.12);
      }
    }
    
    .this-month-festival-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%);
      animation: gentleSparkle 8s ease-in-out infinite;
      pointer-events: none;
    }
    
    @keyframes gentleSparkle {
      0%, 100% { 
        transform: scale(0.9) rotate(0deg); 
        opacity: 0.2; 
      }
      25% { 
        transform: scale(1.05) rotate(90deg); 
        opacity: 0.3;
      }
      50% { 
        transform: scale(1.1) rotate(180deg); 
        opacity: 0.4;
      }
      75% { 
        transform: scale(1.05) rotate(270deg); 
        opacity: 0.3;
      }
    }
    
    /* Upcoming Festival Header */
    .upcoming-festival-header {
      text-align: center;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      position: relative;
    }
    
    .upcoming-festival-header h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #8b4513;
      margin-bottom: 1rem;
    }
    
    /* No Festivals Message */
    .no-festivals-message {
      text-align: center;
      padding: 3rem;
      background: linear-gradient(135deg, #fff8dc, #ffe4b5);
      border-radius: 20px;
      border: 2px solid #d2691e;
      color: #8b4513;
      font-size: 1.1rem;
      font-style: italic;
    }
    
    /* Featured Festival Specific Styles */
    .featured-festival-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .featured-festival-container {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .featured-spotlight-card {
      max-width: 350px;
      background: linear-gradient(135deg, #ffefd5, #ffe4b5);
      border: 3px solid #d2691e;
      box-shadow: 0 12px 40px rgba(210, 105, 30, 0.3);
      position: relative;
    }
    
    .featured-spotlight-card::before {
      background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
    }
    
    .featured-spotlight-card:hover {
      transform: translateY(-15px) scale(1.03);
      box-shadow: 0 20px 60px rgba(210, 105, 30, 0.4);
    }
    
    .featured-image-container {
      position: relative;
      border-radius: 22px;
      overflow: hidden;
      margin-bottom: 1.2rem;
    }
    
    .featured-image-container img {
      height: 220px;
      border-radius: 22px;
    }
    
    .featured-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #d2691e, #ff8c00);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(210, 105, 30, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .featured-action-btn {
      background: linear-gradient(135deg, #d2691e, #ff8c00);
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      box-shadow: 0 6px 20px rgba(210, 105, 30, 0.4);
    }
    
    .featured-action-btn:hover {
      background: linear-gradient(135deg, #ff8c00, #ffa500);
      box-shadow: 0 8px 25px rgba(210, 105, 30, 0.5);
    }
    
    .featured-spotlight-card .festival-name {
      font-size: 1.8rem;
      color: #8b4513;
      margin-bottom: 1rem;
    }
    
    .featured-spotlight-card .festival-description {
      font-size: 1.1rem;
      color: #6b3410;
      margin-bottom: 2rem;
      line-height: 1.7;
    }
  `;
  document.head.appendChild(style);
}

// Make functions available globally
window.fetchAndDisplayFestivals = fetchAndDisplayFestivals;
window.viewFestivalProducts = viewFestivalProducts;
