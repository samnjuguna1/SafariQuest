// ── Progress Bar Animation ──
setTimeout(() => {
  document.getElementById('progressFill').style.width = '53%';
}, 300);

// ── Destination Tags ──
const destinations = [
  'Kenya', 'Tanzania', 'Uganda', 'Rwanda',
  'Ethiopia', 'Somalia', 'Namibia', 'South Africa'
];

const tagsContainer = document.getElementById('destTags');

destinations.forEach((name, i) => {
  const tag = document.createElement('span');
  tag.className = 'dest-tag';
  tag.textContent = '✓ ' + name;
  tag.style.animationDelay = (i * 0.05) + 's';
  tagsContainer.appendChild(tag);
});

// ── Sidebar Navigation ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Heart / Favourite Toggle ──
document.querySelectorAll('.reco-heart').forEach(btn => {
  let liked = false;

  btn.addEventListener('click', function () {
    liked = !liked;
    const svg = this.querySelector('svg');
    svg.style.fill   = liked ? '#ef4444' : 'transparent';
    svg.style.stroke = '#ef4444';

    this.style.transform = 'scale(1.2)';
    setTimeout(() => { this.style.transform = ''; }, 200);
  });
});
