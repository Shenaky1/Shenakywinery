// Site-wide age gate. Approval is remembered for 30 days on this device.
(function () {
  var STORAGE_KEY = 'shenaky_age_verified_at';
  var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  var isFrench = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;

  function isVerified() {
    try {
      var verifiedAt = Number(localStorage.getItem(STORAGE_KEY));
      return verifiedAt && Date.now() - verifiedAt < THIRTY_DAYS;
    } catch (error) {
      return false;
    }
  }

  function rememberVerification() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (error) {
      // The gate still works for this page if browser storage is unavailable.
    }
  }

  function showAgeGate() {
    if (isVerified()) return;

    var copy = isFrench ? {
      eyebrow: 'Bienvenue chez Shenaky Winery',
      title: 'Avez-vous 21 ans ou plus ?',
      text: 'Vous devez avoir au moins 21 ans pour accéder à ce site consacré au vin.',
      yes: 'Oui, j’ai 21 ans ou plus',
      no: 'Non, j’ai moins de 21 ans',
      denied: 'Désolé, vous devez avoir au moins 21 ans pour visiter ce site.'
    } : {
      eyebrow: 'Welcome to Shenaky Winery',
      title: 'Are you 21 or older?',
      text: 'You must be at least 21 years old to enter this wine website.',
      yes: 'Yes, I am 21 or older',
      no: 'No, I am under 21',
      denied: 'Sorry, you must be at least 21 years old to visit this website.'
    };

    var gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'age-gate-title');
    gate.innerHTML =
      '<div class="age-gate-card">' +
        '<img class="age-gate-logo" src="assets/logo.png" alt="Shenaky Winery">' +
        '<p class="age-gate-eyebrow">' + copy.eyebrow + '</p>' +
        '<h1 id="age-gate-title">' + copy.title + '</h1>' +
        '<p class="age-gate-text">' + copy.text + '</p>' +
        '<div class="age-gate-actions">' +
          '<button type="button" class="age-gate-yes">' + copy.yes + '</button>' +
          '<button type="button" class="age-gate-no">' + copy.no + '</button>' +
        '</div>' +
        '<p class="age-gate-denied" role="alert" hidden>' + copy.denied + '</p>' +
      '</div>';

    document.body.classList.add('age-gate-open');
    document.body.appendChild(gate);

    var yesButton = gate.querySelector('.age-gate-yes');
    var noButton = gate.querySelector('.age-gate-no');
    var deniedMessage = gate.querySelector('.age-gate-denied');

    yesButton.addEventListener('click', function () {
      rememberVerification();
      document.body.classList.remove('age-gate-open');
      gate.remove();
    });

    noButton.addEventListener('click', function () {
      gate.classList.add('age-gate-blocked');
      gate.querySelector('.age-gate-text').hidden = true;
      gate.querySelector('.age-gate-actions').hidden = true;
      deniedMessage.hidden = false;
    });

    yesButton.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAgeGate);
  } else {
    showAgeGate();
  }
}());

document.querySelectorAll('.menu-button').forEach(function(button){
  button.addEventListener('click', function(){
    var nav = button.parentElement.querySelector('.nav-links');
    nav.classList.toggle('open');
    button.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
});

// Enlarge wine bottles without leaving the wine collection. Only one bottle
// can be enlarged at a time; clicking another bottle replaces the open image.
(function () {
  var bottleImages = Array.prototype.slice.call(document.querySelectorAll('.wine-card > img'));
  if (!bottleImages.length) return;

  var lightbox = document.createElement('div');
  lightbox.className = 'wine-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'false');
  lightbox.setAttribute('aria-label', 'Enlarged wine bottle');
  lightbox.innerHTML =
    '<figure class="wine-lightbox-figure">' +
      '<img class="wine-lightbox-image" alt="">' +
      '<button class="wine-lightbox-close" type="button" aria-label="Close enlarged bottle">&times;</button>' +
    '</figure>';
  document.body.appendChild(lightbox);

  var enlargedImage = lightbox.querySelector('.wine-lightbox-image');
  var closeButton = lightbox.querySelector('.wine-lightbox-close');
  var activeSource = null;

  function closeBottle() {
    if (activeSource) {
      activeSource.classList.remove('is-enlarged-source');
      activeSource.setAttribute('aria-expanded', 'false');
    }
    activeSource = null;
    lightbox.classList.remove('is-open');
    enlargedImage.removeAttribute('src');
    enlargedImage.alt = '';
  }

  function openBottle(source) {
    if (activeSource === source) {
      closeBottle();
      return;
    }
    if (activeSource) {
      activeSource.classList.remove('is-enlarged-source');
      activeSource.setAttribute('aria-expanded', 'false');
    }
    activeSource = source;
    source.classList.add('is-enlarged-source');
    source.setAttribute('aria-expanded', 'true');
    enlargedImage.src = source.currentSrc || source.src;
    enlargedImage.alt = source.alt;
    lightbox.classList.add('is-open');
  }

  bottleImages.forEach(function (image) {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-expanded', 'false');
    image.setAttribute('aria-label', (image.alt || 'Wine bottle') + ' - enlarge');
    image.addEventListener('click', function () { openBottle(image); });
    image.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBottle(image);
      }
    });
  });

  closeButton.addEventListener('click', closeBottle);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && activeSource) closeBottle();
  });
}());
