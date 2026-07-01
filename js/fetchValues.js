  async function fetchStates() {
    const stateGrid = document.querySelector('#stateCards');
    stateGrid.innerHTML = '<p>Loading...</p>';

    // your Supabase project
    const SUPABASE_URL = "https://dtelpnugwnknweyirsmt.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZWxwbnVnd25rbndleWlyc210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDE2NjUsImV4cCI6MjA3Mzc3NzY2NX0.yTGm_dEpuWRCCJwn_LKuQoY2hf3iOelbte_GnuPP0go";

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


    // get states from DB
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching states:', error);
      stateGrid.innerHTML = '<p>Failed to load states.</p>';
      return;
    }

    if (!data || data.length === 0) {
      stateGrid.innerHTML = '<p>No states found.</p>';
      return;
    }

    // clear and insert cards
    stateGrid.innerHTML = '';
    data.forEach(state => {
      const stateCard = document.createElement('div');
      stateCard.classList.add('state-card');
      stateCard.dataset.state = state.name;
      stateCard.innerHTML = `
        <a href="product-view.html?state_id=${state.id}&name=${state.name}">
          ${state.name}
        </a>
        <i class="fa-solid fa-location-dot"></i>
      `;
      // Make the whole card clickable to the same destination as the name link
      const link = stateCard.querySelector('a');
      if (link) {
        stateCard.style.cursor = 'pointer';
        stateCard.addEventListener('click', (e) => {
          // If clicked anywhere on the card, navigate to the same URL
          const href = link.getAttribute('href');
          if (href) window.location.href = href;
        });
      }
      stateGrid.appendChild(stateCard);
    });
  }

  // run on page load
  fetchStates();