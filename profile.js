/**
 * SafariQuest — profile.js
 * Fetches and displays real user profile data from Supabase
 * Includes photo upload to Supabase Storage
 */

let currentPhotoType = null; // 'avatar' or 'cover'

(async function initProfile() {
  // Wait for auth to be ready
  await new Promise(resolve => {
    if (window.SQ) resolve();
    else window.addEventListener('load', resolve);
  });

  const user = SQ.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Show loading
  showLoading(true);

  // Fetch profile data
  let profile = null;
  try {
    profile = await SQ.getProfile();
  } catch (err) {
    console.error('Failed to fetch profile:', err);
  }

  // Fetch user bookings for stats
  let bookings = [];
  try {
    bookings = await SQ.listUserBookings();
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
  }

  // Fetch saved destinations
  let savedDestinations = [];
  try {
    savedDestinations = await SQ.listUserSavedDestinations(100);
  } catch (err) {
    console.error('Failed to fetch saved destinations:', err);
  }

  // Populate profile data
  populateProfileData(user, profile, bookings, savedDestinations);
  
  // Setup event listeners
  setupEventListeners();
  
  showLoading(false);
})();

function populateProfileData(user, profile, bookings, savedDestinations) {
  const email = user.email || '';
  const fullName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0];
  const firstName = fullName.split(' ')[0] || 'User';
  const lastName = fullName.split(' ').slice(1).join(' ') || '';
  const initials = getInitials(fullName);
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || '';
  const coverUrl = profile?.cover_url || user.user_metadata?.cover_url || '';
  const phone = profile?.phone || user.user_metadata?.phone || '';
  const location = profile?.location || user.user_metadata?.location || '';
  const country = profile?.country || user.user_metadata?.country || 'Kenya';
  const bio = profile?.bio || user.user_metadata?.bio || '';
  const travelStyle = profile?.travel_style || user.user_metadata?.travel_style || 'Adventure & Culture';
  const dob = profile?.date_of_birth || user.user_metadata?.date_of_birth || '';
  const memberSince = formatMemberSince(user.created_at || profile?.created_at);

  // Update avatar
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarUrl) {
    avatarEl.innerHTML = `<img src="${avatarUrl}" alt="${fullName}">`;
  } else {
    avatarEl.textContent = initials;
  }

  // Update cover photo
  if (coverUrl) {
    const coverEl = document.querySelector('.cover');
    coverEl.style.backgroundImage = `url(${coverUrl})`;
    coverEl.style.backgroundSize = 'cover';
    coverEl.style.backgroundPosition = 'center';
  }

  // Update profile header
  document.getElementById('profileName').textContent = fullName;
  document.getElementById('profileLocation').innerHTML = `📍 ${location || 'Location not set'} · Member since ${memberSince}`;

  // Update stats
  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').length;
  const reviewsCount = bookings.filter(b => b.review_rating).length;
  const savedCount = savedDestinations.length;
  const avgRating = calculateAvgRating(bookings);
  const countriesVisited = countUniqueCountries(bookings);

  document.getElementById('statTrips').textContent = completedBookings;
  document.getElementById('statReviews').textContent = reviewsCount;
  document.getElementById('statSaved').textContent = savedCount;
  document.getElementById('statRating').textContent = avgRating ? `${avgRating}★` : 'N/A';
  document.getElementById('statCountries').textContent = countriesVisited;

  // Update About Me section
  document.getElementById('infoEmail').textContent = email;
  document.getElementById('infoPhone').textContent = phone || 'Not provided';
  document.getElementById('infoLocation').textContent = location || 'Not set';
  document.getElementById('infoTravelStyle').textContent = travelStyle;
  document.getElementById('infoMemberSince').textContent = memberSince;

  // Update form fields
  document.getElementById('inputFirstName').value = firstName;
  document.getElementById('inputLastName').value = lastName;
  document.getElementById('inputEmail').value = email;
  document.getElementById('inputPhone').value = phone;
  document.getElementById('inputCountry').value = country;
  document.getElementById('inputLocation').value = location;
  document.getElementById('inputBio').value = bio;
  document.getElementById('inputTravelStyle').value = travelStyle;
  document.getElementById('inputDOB').value = dob;

  // Update recent trips
  populateRecentTrips(bookings.slice(0, 3));
}

function populateRecentTrips(recentBookings) {
  const tripGrid = document.getElementById('tripGrid');
  tripGrid.innerHTML = '';

  if (recentBookings.length === 0) {
    tripGrid.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--muted);grid-column:1/-1;">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 16px;opacity:0.3;">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p>No trips yet. Start exploring!</p>
        <button class="btn-save" style="max-width:200px;margin:16px auto 0;" onclick="window.location.href='booking.html'">Book a Trip</button>
      </div>
    `;
    return;
  }

  recentBookings.forEach(booking => {
    const tripCard = document.createElement('div');
    tripCard.className = 'trip-card';
    const hasReview = !!booking.review_rating;
    const badgeText = hasReview ? '⭐ Reviewed' : 'Pending Review';
    const badgeClass = hasReview ? 'trip-badge' : 'trip-badge trip-badge-pending';
    
    tripCard.innerHTML = `
      <img class="trip-img" src="${booking.image_url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80'}" alt="${booking.destination_name}" />
      <div class="trip-info">
        <div class="trip-name">${booking.destination_name || 'Safari Trip'}</div>
        <div class="trip-date">${formatDate(booking.check_in)}</div>
        <span class="${badgeClass}">${badgeText}</span>
      </div>
    `;
    tripCard.addEventListener('click', () => {
      window.location.href = `bookings.html?id=${booking.id}`;
    });
    tripGrid.appendChild(tripCard);
  });

  // Add "Log a Trip" card
  const addCard = document.createElement('div');
  addCard.className = 'trip-add-card';
  addCard.innerHTML = `
    <div style="text-align:center;color:var(--muted);">
      <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin:0 auto 8px;">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <div style="font-size:0.85rem;font-weight:600;">Log a Trip</div>
    </div>
  `;
  addCard.addEventListener('click', () => {
    window.location.href = 'booking.html';
  });
  tripGrid.appendChild(addCard);
}

function setupEventListeners() {
  // Avatar upload - open modal
  document.getElementById('avatarEditBtn').addEventListener('click', () => {
    currentPhotoType = 'avatar';
    openPhotoModal('Manage Avatar');
  });

  // Cover photo upload - open modal
  document.getElementById('coverEditBtn').addEventListener('click', () => {
    currentPhotoType = 'cover';
    openPhotoModal('Manage Cover Photo');
  });

  // File input change handler
  document.getElementById('avatarInput').addEventListener('change', handlePhotoUpload);
  document.getElementById('coverInput').addEventListener('change', handlePhotoUpload);
}

function openPhotoModal(title) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('photoModal').classList.add('show');
  
  // Check if user has a photo to show/hide remove button
  const user = SQ.getUser();
  const profile = SQ.getSession()?.user;
  const hasPhoto = currentPhotoType === 'avatar' 
    ? (profile?.user_metadata?.avatar_url || profile?.avatar_url)
    : (profile?.user_metadata?.cover_url || profile?.cover_url);
  
  document.getElementById('removePhotoBtn').style.display = hasPhoto ? 'flex' : 'none';
}

function closePhotoModal() {
  document.getElementById('photoModal').classList.remove('show');
  currentPhotoType = null;
}

function selectPhoto() {
  closePhotoModal();
  if (currentPhotoType === 'avatar') {
    document.getElementById('avatarInput').click();
  } else if (currentPhotoType === 'cover') {
    document.getElementById('coverInput').click();
  }
}

async function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('❌ Please select an image file', 'error');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('❌ Image must be less than 5MB', 'error');
    return;
  }

  showLoading(true);
  try {
    const photoUrl = await uploadPhotoToSupabase(file, currentPhotoType);
    
    if (currentPhotoType === 'avatar') {
      // Update avatar display
      const avatarEl = document.getElementById('profileAvatar');
      avatarEl.innerHTML = `<img src="${photoUrl}" alt="Avatar">`;
      showToast('✅ Avatar updated successfully!');
    } else if (currentPhotoType === 'cover') {
      // Update cover display
      const coverEl = document.querySelector('.cover');
      coverEl.style.backgroundImage = `url(${photoUrl})`;
      coverEl.style.backgroundSize = 'cover';
      coverEl.style.backgroundPosition = 'center';
      showToast('✅ Cover photo updated successfully!');
    }
    
    // Reset file input
    e.target.value = '';
  } catch (err) {
    console.error('Photo upload failed:', err);
    showToast('❌ Failed to upload photo. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

async function uploadPhotoToSupabase(file, photoType) {
  const user = SQ.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${photoType}_${Date.now()}.${fileExt}`;
  const bucketName = 'profile-photos';

  // Upload to Supabase Storage
  const formData = new FormData();
  formData.append('file', file);

  const uploadRes = await fetch(
    `${window.SQ_PUBLIC.url}/storage/v1/object/${bucketName}/${fileName}`,
    {
      method: 'POST',
      headers: {
        'apikey': window.SQ_PUBLIC.anon,
        'Authorization': `Bearer ${SQ.getAccessToken()}`,
      },
      body: file
    }
  );

  if (!uploadRes.ok) {
    const error = await uploadRes.json().catch(() => ({}));
    throw new Error(error.message || 'Upload failed');
  }

  // Get public URL
  const photoUrl = `${window.SQ_PUBLIC.url}/storage/v1/object/public/${bucketName}/${fileName}`;

  // Update profile in database
  const updateData = {
    id: user.id,
    email: user.email,
  };
  
  if (photoType === 'avatar') {
    updateData.avatar_url = photoUrl;
  } else if (photoType === 'cover') {
    updateData.cover_url = photoUrl;
  }

  await SQ.upsertProfile(updateData, SQ.getAccessToken());

  // Update session
  const session = SQ.getSession();
  if (session?.user) {
    session.user.user_metadata = session.user.user_metadata || {};
    if (photoType === 'avatar') {
      session.user.user_metadata.avatar_url = photoUrl;
    } else if (photoType === 'cover') {
      session.user.user_metadata.cover_url = photoUrl;
    }
    SQ.saveSession(session);
  }

  return photoUrl;
}

async function removePhoto() {
  if (!currentPhotoType) return;

  const confirmMsg = currentPhotoType === 'avatar' 
    ? 'Are you sure you want to remove your profile photo?' 
    : 'Are you sure you want to remove your cover photo?';
  
  if (!confirm(confirmMsg)) return;

  closePhotoModal();
  showLoading(true);

  try {
    const user = SQ.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update profile in database
    const updateData = {
      id: user.id,
      email: user.email,
    };
    
    if (currentPhotoType === 'avatar') {
      updateData.avatar_url = null;
    } else if (currentPhotoType === 'cover') {
      updateData.cover_url = null;
    }

    await SQ.upsertProfile(updateData, SQ.getAccessToken());

    // Update session
    const session = SQ.getSession();
    if (session?.user?.user_metadata) {
      if (currentPhotoType === 'avatar') {
        delete session.user.user_metadata.avatar_url;
      } else if (currentPhotoType === 'cover') {
        delete session.user.user_metadata.cover_url;
      }
      SQ.saveSession(session);
    }

    // Update UI
    if (currentPhotoType === 'avatar') {
      const avatarEl = document.getElementById('profileAvatar');
      const fullName = document.getElementById('profileName').textContent;
      avatarEl.textContent = getInitials(fullName);
      avatarEl.innerHTML = avatarEl.textContent;
      showToast('✅ Avatar removed successfully!');
    } else if (currentPhotoType === 'cover') {
      const coverEl = document.querySelector('.cover');
      coverEl.style.backgroundImage = '';
      showToast('✅ Cover photo removed successfully!');
    }
  } catch (err) {
    console.error('Failed to remove photo:', err);
    showToast('❌ Failed to remove photo. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

function getInitials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatMemberSince(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function calculateAvgRating(bookings) {
  const ratings = bookings.filter(b => b.review_rating).map(b => b.review_rating);
  if (ratings.length === 0) return null;
  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return avg.toFixed(1);
}

function countUniqueCountries(bookings) {
  const countries = new Set();
  bookings.forEach(b => {
    if (b.country) countries.add(b.country);
  });
  return countries.size || 1;
}

// Save profile function
async function saveProfile() {
  const user = SQ.getUser();
  if (!user) return;

  const firstName = document.getElementById('inputFirstName').value.trim();
  const lastName = document.getElementById('inputLastName').value.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();
  const country = document.getElementById('inputCountry').value;
  const location = document.getElementById('inputLocation').value.trim();
  const bio = document.getElementById('inputBio').value.trim();
  const travelStyle = document.getElementById('inputTravelStyle').value;
  const dob = document.getElementById('inputDOB').value;

  if (!firstName) {
    showToast('❌ First name is required', 'error');
    return;
  }

  showLoading(true);

  try {
    await SQ.upsertProfile({
      id: user.id,
      email: email,
      full_name: fullName,
      phone: phone,
      country: country,
      location: location,
      bio: bio,
      travel_style: travelStyle,
      date_of_birth: dob
    });

    // Update session
    const session = SQ.getSession();
    if (session?.user?.user_metadata) {
      session.user.user_metadata.full_name = fullName;
      session.user.user_metadata.phone = phone;
      session.user.user_metadata.country = country;
      session.user.user_metadata.location = location;
      session.user.user_metadata.bio = bio;
      session.user.user_metadata.travel_style = travelStyle;
      session.user.user_metadata.date_of_birth = dob;
      SQ.saveSession(session);
    }

    showToast('✅ Profile saved successfully!');
    
    // Reload profile data
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error('Failed to save profile:', err);
    showToast('❌ Failed to save profile. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (show) {
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }
}

function scrollToEditForm() {
  document.getElementById('editProfileCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Security functions
function changePassword() {
  showToast('🔒 Password change feature coming soon!');
}

function manageSessions() {
  showToast('🔐 Session management feature coming soon!');
}

// Make functions available globally
window.saveProfile = saveProfile;
window.scrollToEditForm = scrollToEditForm;
window.changePassword = changePassword;
window.manageSessions = manageSessions;
window.closePhotoModal = closePhotoModal;
window.selectPhoto = selectPhoto;
window.removePhoto = removePhoto;
