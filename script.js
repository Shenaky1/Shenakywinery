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
  var isFrenchPage = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;

  var lightbox = document.createElement('div');
  lightbox.className = 'wine-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged wine bottle');
  lightbox.innerHTML =
    '<figure class="wine-lightbox-figure">' +
      '<div class="wine-lightbox-bottle"><img class="wine-lightbox-image" alt=""><span class="wine-lightbox-lens" aria-hidden="true"></span></div>' +
      '<figcaption class="wine-lightbox-details">' +
        '<p class="wine-lightbox-vintage"></p>' +
        '<h2 class="wine-lightbox-title"></h2>' +
        '<p class="wine-lightbox-origin"></p>' +
        '<div class="wine-lightbox-zoom" role="img" aria-label="' + (isFrenchPage ? 'Zone agrandie de la bouteille' : 'Magnified bottle area') + '"></div>' +
        '<button class="wine-lightbox-turn" type="button">' + (isFrenchPage ? 'Tourner la bouteille' : 'Turn the bottle') + '</button>' +
        '<div class="wine-lightbox-caption"><span>' + (isFrenchPage ? 'Touchez l’image ou déplacez le curseur pour examiner l’étiquette' : 'Tap the image or move the cursor to examine the label') + '</span><strong class="wine-lightbox-price"></strong></div>' +
      '</figcaption>' +
      '<button class="wine-lightbox-close" type="button" aria-label="Close enlarged bottle">&times;</button>' +
    '</figure>';
  document.body.appendChild(lightbox);

  var enlargedImage = lightbox.querySelector('.wine-lightbox-image');
  var bottleStage = lightbox.querySelector('.wine-lightbox-bottle');
  var lens = lightbox.querySelector('.wine-lightbox-lens');
  var zoomPanel = lightbox.querySelector('.wine-lightbox-zoom');
  var vintageText = lightbox.querySelector('.wine-lightbox-vintage');
  var titleText = lightbox.querySelector('.wine-lightbox-title');
  var originText = lightbox.querySelector('.wine-lightbox-origin');
  var priceText = lightbox.querySelector('.wine-lightbox-price');
  var turnButton = lightbox.querySelector('.wine-lightbox-turn');
  var closeButton = lightbox.querySelector('.wine-lightbox-close');
  var activeSource = null;
  var frontImageUrl = '';
  var backImageUrl = '';
  var showingBack = false;

  function closeBottle() {
    var returnTarget = activeSource;
    if (activeSource) {
      activeSource.classList.remove('is-enlarged-source');
      activeSource.setAttribute('aria-expanded', 'false');
    }
    activeSource = null;
    lightbox.classList.remove('is-open');
    enlargedImage.removeAttribute('src');
    enlargedImage.alt = '';
    zoomPanel.style.backgroundImage = '';
    turnButton.classList.remove('is-available');
    document.body.classList.remove('wine-view-open');
    if (returnTarget) returnTarget.focus();
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
    var card = source.closest('.wine-card');
    var imageUrl = source.currentSrc || source.src;
    frontImageUrl = imageUrl;
    backImageUrl = source.getAttribute('data-back-src') || '';
    showingBack = false;
    source.classList.add('is-enlarged-source');
    source.setAttribute('aria-expanded', 'true');
    enlargedImage.src = imageUrl;
    enlargedImage.alt = source.alt;
    zoomPanel.style.backgroundImage = 'url("' + imageUrl.replace(/"/g, '%22') + '")';
    vintageText.textContent = card.querySelector('.wine-card-copy span').textContent;
    titleText.textContent = card.querySelector('.wine-card-copy h2').textContent;
    originText.textContent = card.querySelector('.wine-card-copy p').textContent;
    priceText.textContent = card.querySelector('.wine-buy-row strong').textContent;
    turnButton.classList.toggle('is-available', Boolean(backImageUrl));
    turnButton.textContent = isFrenchPage ? 'Voir l’étiquette arrière' : 'View back label';
    lightbox.classList.add('is-open');
    document.body.classList.add('wine-view-open');
    closeButton.focus();
  }

  bottleImages.forEach(function (image) {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-expanded', 'false');
    image.setAttribute('aria-label', (image.alt || 'Wine bottle') + ' - enlarge');
    var hint = document.createElement('span');
    hint.className = 'bottle-view-hint';
    hint.textContent = isFrenchPage ? 'Touchez pour agrandir' : 'Click to explore the bottle';
    image.insertAdjacentElement('afterend', hint);
    image.addEventListener('click', function () { openBottle(image); });
    image.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBottle(image);
      }
    });
  });

  closeButton.addEventListener('click', closeBottle);
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeBottle();
  });
  turnButton.addEventListener('click', function () {
    if (!backImageUrl) return;
    enlargedImage.classList.add('is-turning');
    window.setTimeout(function () {
      showingBack = !showingBack;
      var nextUrl = showingBack ? backImageUrl : frontImageUrl;
      enlargedImage.src = nextUrl;
      zoomPanel.style.backgroundImage = 'url("' + nextUrl.replace(/"/g, '%22') + '")';
      turnButton.textContent = showingBack
        ? (isFrenchPage ? 'Voir l’étiquette avant' : 'View front label')
        : (isFrenchPage ? 'Voir l’étiquette arrière' : 'View back label');
      enlargedImage.classList.remove('is-turning');
    }, 220);
  });
  bottleStage.addEventListener('pointerenter', function () {
    bottleStage.classList.add('is-zooming');
  });
  bottleStage.addEventListener('pointerleave', function () {
    bottleStage.classList.remove('is-zooming');
  });
  bottleStage.addEventListener('pointermove', function (event) {
    if (!activeSource || !enlargedImage.complete) return;
    var imageRect = enlargedImage.getBoundingClientRect();
    var stageRect = bottleStage.getBoundingClientRect();
    var x = Math.max(0, Math.min(event.clientX - imageRect.left, imageRect.width));
    var y = Math.max(0, Math.min(event.clientY - imageRect.top, imageRect.height));
    var xPercent = imageRect.width ? (x / imageRect.width) * 100 : 50;
    var yPercent = imageRect.height ? (y / imageRect.height) * 100 : 50;
    var lensWidth = lens.offsetWidth;
    var lensHeight = lens.offsetHeight;
    lens.style.left = (imageRect.left - stageRect.left + x - lensWidth / 2) + 'px';
    lens.style.top = (imageRect.top - stageRect.top + y - lensHeight / 2) + 'px';
    zoomPanel.style.backgroundPosition = xPercent + '% ' + yPercent + '%';
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && activeSource) closeBottle();
  });
}());
