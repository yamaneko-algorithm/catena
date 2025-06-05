document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('ruleModal');
  const openBtn = document.getElementById('openModal');
  const closeBtn = document.getElementById('closeModal');

  if (!modal || !openBtn || !closeBtn) {
    console.warn('モーダル用の要素が見つかりません');
    return;
  }

  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Hamburger menu
let button = document.querySelector('.toggle-menu-button');
let menu = document.querySelector('.header-site-menu');
button.addEventListener('click', function () {
  menu.classList.toggle('is-show');
});
