// Site-wide age gate. Approval is remembered only for the current browser visit.
(function () {
  var STORAGE_KEY = 'shenaky_age_verified_at';
  var isFrench = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;

  function isVerified() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'yes';
    } catch (error) {
      return false;
    }
  }

  function rememberVerification() {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'yes');
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
  var bottleImages = Array.prototype.slice.call(document.querySelectorAll('.wine-card > img, .home-bottle-row img'));
  if (!bottleImages.length) return;
  var isFrenchPage = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var isTouchView = window.matchMedia && window.matchMedia('(hover: none)').matches;
  var examineHint = isTouchView
    ? (isFrenchPage ? 'Touchez l’image pour agrandir l’étiquette' : 'Tap the image to enlarge the label')
    : (isFrenchPage ? 'Déplacez le curseur pour examiner l’étiquette' : 'Move the cursor to examine the label');

  var wineExperiences = {
    '2024-red-blend': {
      glass: 'assets/guide-glass-bordeaux.svg',
      glassEn: 'Bordeaux or universal glass', glassFr: 'Verre de Bordeaux ou universel',
      tastingEn: 'Dark fruit, gentle spice, and a smooth finish.',
      tastingFr: 'Fruits noirs, épices douces et finale souple.',
      serveEn: 'Serve slightly cool, 60 to 65°F. Open 20 minutes before serving.',
      serveFr: 'Servir légèrement frais, entre 16 et 18 °C. Ouvrir 20 minutes avant le service.',
      pairEn: 'Beef, burgers, or barbecue.', pairFr: 'Bœuf, hamburgers ou grillades.',
      recipeImage: 'assets/recipes/red-blend-steak-frites.webp',
      recipeTitleEn: 'Steak Frites with Herb Butter', recipeTitleFr: 'Steak-frites au beurre maître d’hôtel',
      recipeIntroEn: 'A French bistro classic. Beef and herb butter suit the wine’s dark-fruit character, while the crisp fries provide contrast.',
      recipeIntroFr: 'Un classique du bistrot français. Le bœuf et le beurre aux herbes accompagnent les fruits noirs du vin, tandis que les frites apportent du contraste.',
      ingredientsEn: ['Steak', 'Pommes frites', 'Butter and parsley', 'Salt and black pepper'],
      ingredientsFr: ['Steak', 'Pommes frites', 'Beurre et persil', 'Sel et poivre noir'],
      methodEn: 'Cook the steak to your preferred doneness, rest it briefly, then serve with crisp fries and parsley butter.',
      methodFr: 'Cuire le steak selon la cuisson désirée, le laisser reposer, puis servir avec des frites croustillantes et un beurre persillé.'
    },
    '2025-merlot': {
      glass: 'assets/guide-glass-bordeaux.svg',
      glassEn: 'Bordeaux or universal glass', glassFr: 'Verre de Bordeaux ou universel',
      tastingEn: 'Plum and black cherry with a soft, rounded finish.',
      tastingFr: 'Prune et cerise noire, avec une finale souple et ronde.',
      serveEn: 'Serve slightly cool, 60 to 65°F. Let the wine breathe for 15 minutes.',
      serveFr: 'Servir légèrement frais, entre 16 et 18 °C. Laisser respirer 15 minutes.',
      pairEn: 'Beef, lamb, pasta, or mushrooms.', pairFr: 'Bœuf, agneau, pâtes ou champignons.',
      recipeImage: 'assets/recipes/merlot-magret-canard.webp',
      recipeTitleEn: 'Magret de Canard with Mushrooms', recipeTitleFr: 'Magret de canard aux champignons',
      recipeIntroEn: 'A French pairing in which tender duck and earthy mushrooms complement Merlot’s plum and black-cherry character.',
      recipeIntroFr: 'Un accord français où le canard tendre et les champignons accompagnent les notes de prune et de cerise noire du Merlot.',
      ingredientsEn: ['Duck breast', 'Mixed mushrooms', 'Shallot', 'Thyme and red-wine jus'],
      ingredientsFr: ['Magret de canard', 'Champignons variés', 'Échalote', 'Thym et jus au vin rouge'],
      methodEn: 'Render the duck skin until crisp, finish to medium, rest, then slice and serve with sautéed mushrooms and jus.',
      methodFr: 'Faire fondre la graisse côté peau jusqu’à ce qu’elle soit croustillante, terminer la cuisson rosée, laisser reposer, puis servir avec les champignons et le jus.'
    },
    '2024-merlot': null,
    '2024-sauvignon-blanc': {
      glass: 'assets/guide-glass-white.svg',
      glassEn: 'White wine glass', glassFr: 'Verre à vin blanc',
      tastingEn: 'Citrus and green apple with a crisp finish.',
      tastingFr: 'Agrumes et pomme verte, avec une finale vive.',
      serveEn: 'Serve chilled, 45 to 50°F.', serveFr: 'Servir frais, entre 7 et 10 °C.',
      pairEn: 'Seafood, salads, or goat cheese.', pairFr: 'Fruits de mer, salades ou fromage de chèvre.',
      recipeImage: 'assets/recipes/sauvignon-chevre-chaud.webp',
      recipeTitleEn: 'Salade de Chèvre Chaud', recipeTitleFr: 'Salade de chèvre chaud',
      recipeIntroEn: 'A French bistro favorite. Tangy warm goat cheese echoes Sauvignon Blanc’s freshness and citrus character.',
      recipeIntroFr: 'Un classique du bistrot français. Le chèvre chaud, frais et acidulé, accompagne la vivacité et les agrumes du Sauvignon Blanc.',
      ingredientsEn: ['Goat cheese', 'Baguette rounds', 'Mixed greens', 'Walnuts and vinaigrette'],
      ingredientsFr: ['Fromage de chèvre', 'Tranches de baguette', 'Salade verte', 'Noix et vinaigrette'],
      methodEn: 'Toast the goat cheese on baguette rounds until warm, then serve over lightly dressed greens with walnuts.',
      methodFr: 'Faire dorer le chèvre sur les tranches de baguette, puis servir sur une salade légèrement assaisonnée avec des noix.'
    },
    '2025-symphony': {
      glass: 'assets/guide-glass-aromatic.svg',
      glassEn: 'Aromatic white wine glass', glassFr: 'Verre à vin blanc aromatique',
      tastingEn: 'Floral aromas and ripe peach with a fresh finish.',
      tastingFr: 'Arômes floraux et pêche mûre, avec une finale fraîche.',
      serveEn: 'Serve chilled, 45 to 50°F.', serveFr: 'Servir frais, entre 7 et 10 °C.',
      pairEn: 'Spiced dishes, poultry, or soft cheese.', pairFr: 'Plats épicés, volaille ou fromage à pâte molle.',
      recipeImage: 'assets/recipes/symphony-poulet-roti.webp',
      recipeTitleEn: 'Herbes de Provence Roast Chicken', recipeTitleFr: 'Poulet rôti aux herbes de Provence',
      recipeIntroEn: 'French country cooking with herbs and golden roast chicken provides a gentle savory counterpoint to this aromatic white wine.',
      recipeIntroFr: 'La cuisine de campagne française, avec ses herbes et son poulet doré, apporte un contrepoint savoureux à ce vin blanc aromatique.',
      ingredientsEn: ['Chicken', 'Baby potatoes', 'Herbes de Provence', 'Garlic and olive oil'],
      ingredientsFr: ['Poulet', 'Pommes de terre grenaille', 'Herbes de Provence', 'Ail et huile d’olive'],
      methodEn: 'Season with garlic and herbs, then roast with the vegetables until the chicken is golden and reaches 165°F.',
      methodFr: 'Assaisonner avec l’ail et les herbes, puis rôtir avec les légumes jusqu’à ce que le poulet soit doré et atteigne 74 °C à cœur.'
    },
    '2023-riesling-ice-wine': {
      glass: 'assets/guide-glass-dessert.svg',
      glassEn: 'Small dessert wine glass', glassFr: 'Petit verre à vin de dessert',
      tastingEn: 'Concentrated sweetness with apricot and honeyed notes.',
      tastingFr: 'Douceur concentrée, avec des notes d’abricot et de miel.',
      serveEn: 'Serve well chilled, 42 to 46°F. A 2 oz pour is ideal.',
      serveFr: 'Servir bien frais, entre 6 et 8 °C. Une portion de 60 ml est idéale.',
      pairEn: 'On its own after dinner; apple or pear tart; cheesecake or crème brûlée; blue cheese; foie gras or pâté.',
      pairFr: 'Seul après le dîner ; tarte aux pommes ou aux poires ; cheesecake ou crème brûlée ; fromage bleu ; foie gras ou pâté.',
      recipeImage: 'assets/ice-on-ice-lemon.webp?v=20260916-1',
      recipeTitleEn: 'Ice on Ice', recipeTitleFr: 'Ice on Ice',
      recipeIntroEn: 'A refreshing summer way to enjoy Shenaky Riesling Ice Wine.',
      recipeIntroFr: 'Une façon rafraîchissante de déguster le Riesling Ice Wine Shenaky en été.',
      ingredientsEn: ['3 oz Riesling Ice Wine', '1 oz chilled sparkling water', 'Large ice cubes', 'Fresh mint and a lemon wheel'],
      ingredientsFr: ['90 ml de Riesling Ice Wine', '30 ml d’eau pétillante bien fraîche', 'Gros glaçons', 'Menthe fraîche et rondelle de citron'],
      methodEn: 'Pour over ice, gently stir, and enjoy.',
      methodFr: 'Verser sur les glaçons, remuer délicatement et déguster.',
      pairingImage: 'assets/recipes/ice-wine-pear-tart.webp',
      pairingTitleEn: 'Ice Wine with Tarte Bourdaloue', pairingTitleFr: 'Ice Wine et tarte Bourdaloue',
      pairingIntroEn: 'This classic French pear and almond tart complements the wine’s ripe-fruit character. Serve a small, well-chilled pour so the pairing remains balanced.',
      pairingIntroFr: 'Cette tarte française classique aux poires et aux amandes accompagne le caractère de fruits mûrs du vin. Servir une petite portion bien fraîche pour préserver l’équilibre.'
    }
  };
  wineExperiences['2024-merlot'] = wineExperiences['2025-merlot'];

  var lightbox = document.createElement('div');
  lightbox.className = 'wine-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged wine bottle');
  lightbox.innerHTML =
    '<figure class="wine-lightbox-figure">' +
      '<div class="wine-lightbox-bottle"><img class="wine-lightbox-image" alt=""><span class="wine-lightbox-lens" aria-hidden="true"></span></div>' +
      '<figcaption class="wine-lightbox-details">' +
        '<p class="wine-lightbox-count" aria-live="polite"></p>' +
        '<p class="wine-lightbox-vintage"></p>' +
        '<h2 class="wine-lightbox-title"></h2>' +
        '<p class="wine-lightbox-origin"></p>' +
        '<div class="wine-lightbox-zoom" role="img" aria-label="' + (isFrenchPage ? 'Zone agrandie de la bouteille' : 'Magnified bottle area') + '"></div>' +
        '<button class="wine-lightbox-turn" type="button">' + (isFrenchPage ? 'Tourner la bouteille' : 'Turn the bottle') + '</button>' +
        '<div class="wine-lightbox-caption"><span>' + examineHint + '</span><strong class="wine-lightbox-price"></strong></div>' +
        '<div class="wine-lightbox-buy"><button type="button" class="wine-lightbox-add-cart"></button></div>' +
        '<section class="wine-lightbox-guide" aria-labelledby="wine-lightbox-guide-title">' +
          '<div class="wine-lightbox-section-heading"><span>' + (isFrenchPage ? 'Guide des vins' : 'Wine Guide') + '</span><h3 id="wine-lightbox-guide-title">' + (isFrenchPage ? 'Comment le déguster' : 'How to Enjoy') + '</h3></div>' +
          '<div class="wine-lightbox-guide-main"><figure><img class="wine-lightbox-glass" alt=""><figcaption class="wine-lightbox-glass-name"></figcaption></figure><div><p class="wine-lightbox-tasting"></p><p class="wine-lightbox-serve"></p></div></div>' +
          '<p class="wine-lightbox-pairing"></p>' +
        '</section>' +
        '<section class="wine-lightbox-recipe" aria-labelledby="wine-lightbox-recipe-title">' +
          '<img class="wine-lightbox-recipe-image" alt="" loading="lazy">' +
          '<div class="wine-lightbox-recipe-copy"><span>' + (isFrenchPage ? 'Suggestion de service' : 'Serving Inspiration') + '</span><h3 id="wine-lightbox-recipe-title" class="wine-lightbox-recipe-title"></h3><p class="wine-lightbox-recipe-intro"></p><ul class="wine-lightbox-recipe-list"></ul><p class="wine-lightbox-recipe-method"></p></div>' +
        '</section>' +
        '<section class="wine-lightbox-recipe wine-lightbox-classic-pairing" aria-labelledby="wine-lightbox-pairing-title" hidden>' +
          '<img class="wine-lightbox-recipe-image wine-lightbox-pairing-image" alt="" loading="lazy">' +
          '<div class="wine-lightbox-recipe-copy"><span>' + (isFrenchPage ? 'Accord classique' : 'Classic Pairing') + '</span><h3 id="wine-lightbox-pairing-title" class="wine-lightbox-recipe-title wine-lightbox-pairing-title"></h3><p class="wine-lightbox-recipe-intro wine-lightbox-pairing-intro"></p></div>' +
        '</section>' +
      '</figcaption>' +
      '<button class="wine-lightbox-nav wine-lightbox-prev" type="button" aria-label="' + (isFrenchPage ? 'Vin précédent' : 'Previous wine') + '">&#8249;</button>' +
      '<button class="wine-lightbox-nav wine-lightbox-next" type="button" aria-label="' + (isFrenchPage ? 'Vin suivant' : 'Next wine') + '">&#8250;</button>' +
      '<button class="wine-lightbox-close" type="button" aria-label="Close enlarged bottle">&times;</button>' +
    '</figure>';
  document.body.appendChild(lightbox);

  var enlargedImage = lightbox.querySelector('.wine-lightbox-image');
  var bottleStage = lightbox.querySelector('.wine-lightbox-bottle');
  var lens = lightbox.querySelector('.wine-lightbox-lens');
  var zoomPanel = lightbox.querySelector('.wine-lightbox-zoom');
  var vintageText = lightbox.querySelector('.wine-lightbox-vintage');
  var countText = lightbox.querySelector('.wine-lightbox-count');
  var titleText = lightbox.querySelector('.wine-lightbox-title');
  var originText = lightbox.querySelector('.wine-lightbox-origin');
  var priceText = lightbox.querySelector('.wine-lightbox-price');
  var addCartButton = lightbox.querySelector('.wine-lightbox-add-cart');
  var glassImage = lightbox.querySelector('.wine-lightbox-glass');
  var glassName = lightbox.querySelector('.wine-lightbox-glass-name');
  var tastingText = lightbox.querySelector('.wine-lightbox-tasting');
  var serveText = lightbox.querySelector('.wine-lightbox-serve');
  var pairingText = lightbox.querySelector('.wine-lightbox-pairing');
  var recipeImage = lightbox.querySelector('.wine-lightbox-recipe-image');
  var recipeTitle = lightbox.querySelector('.wine-lightbox-recipe-title');
  var recipeIntro = lightbox.querySelector('.wine-lightbox-recipe-intro');
  var recipeList = lightbox.querySelector('.wine-lightbox-recipe-list');
  var recipeMethod = lightbox.querySelector('.wine-lightbox-recipe-method');
  var classicPairing = lightbox.querySelector('.wine-lightbox-classic-pairing');
  var classicPairingImage = lightbox.querySelector('.wine-lightbox-pairing-image');
  var classicPairingTitle = lightbox.querySelector('.wine-lightbox-pairing-title');
  var classicPairingIntro = lightbox.querySelector('.wine-lightbox-pairing-intro');
  var turnButton = lightbox.querySelector('.wine-lightbox-turn');
  var closeButton = lightbox.querySelector('.wine-lightbox-close');
  var previousButton = lightbox.querySelector('.wine-lightbox-prev');
  var nextButton = lightbox.querySelector('.wine-lightbox-next');
  var activeSource = null;
  var frontImageUrl = '';
  var backImageUrl = '';
  var showingBack = false;
  var swipeStartX = null;
  var swipeStartY = null;
  var activeProductKey = '';

  function inferProductKey(card, preview) {
    var productNode = card ? card.querySelector('[data-vs-product-key]') : null;
    if (productNode) return productNode.getAttribute('data-vs-product-key') || '';
    if (!preview) return '';
    var title = (preview.getAttribute('data-title') || '').toLowerCase();
    var vintage = preview.getAttribute('data-vintage') || '';
    if (title.indexOf('merlot') !== -1) return vintage === '2024' ? '2024-merlot' : '2025-merlot';
    if (title.indexOf('symphony') !== -1) return '2025-symphony';
    if (title.indexOf('sauvignon') !== -1) return '2024-sauvignon-blanc';
    if (title.indexOf('red blend') !== -1) return '2024-red-blend';
    if (title.indexOf('ice wine') !== -1) return '2023-riesling-ice-wine';
    return '';
  }

  function renderExperience(productKey) {
    var experience = wineExperiences[productKey] || wineExperiences['2024-red-blend'];
    var languageSuffix = isFrenchPage ? 'Fr' : 'En';
    var ingredients = experience['ingredients' + languageSuffix] || [];
    glassImage.src = experience.glass;
    glassImage.alt = experience['glass' + languageSuffix];
    glassName.textContent = experience['glass' + languageSuffix];
    tastingText.innerHTML = '<strong>' + (isFrenchPage ? 'Caractère typique :' : 'Typical character:') + '</strong> ' + experience['tasting' + languageSuffix];
    serveText.innerHTML = '<strong>' + (isFrenchPage ? 'Service :' : 'Serve:') + '</strong> ' + experience['serve' + languageSuffix];
    pairingText.innerHTML = '<strong>' + (isFrenchPage ? 'À déguster avec :' : 'Enjoy with:') + '</strong> ' + experience['pair' + languageSuffix];
    recipeImage.src = experience.recipeImage;
    recipeImage.alt = experience['recipeTitle' + languageSuffix];
    recipeTitle.textContent = experience['recipeTitle' + languageSuffix];
    recipeIntro.textContent = experience['recipeIntro' + languageSuffix];
    recipeList.innerHTML = ingredients.map(function (ingredient) { return '<li>' + ingredient + '</li>'; }).join('');
    recipeMethod.textContent = experience['method' + languageSuffix];
    classicPairing.hidden = !experience.pairingImage;
    if (experience.pairingImage) {
      classicPairingImage.src = experience.pairingImage;
      classicPairingImage.alt = experience['pairingTitle' + languageSuffix];
      classicPairingTitle.textContent = experience['pairingTitle' + languageSuffix];
      classicPairingIntro.textContent = experience['pairingIntro' + languageSuffix];
    } else {
      classicPairingImage.removeAttribute('src');
      classicPairingImage.alt = '';
      classicPairingTitle.textContent = '';
      classicPairingIntro.textContent = '';
    }
  }

  function closeBottle() {
    var returnTarget = activeSource;
    if (activeSource) {
      activeSource.classList.remove('is-enlarged-source');
      activeSource.setAttribute('aria-expanded', 'false');
    }
    activeSource = null;
    lightbox.classList.remove('is-open');
    enlargedImage.classList.remove('is-touch-zoomed');
    enlargedImage.removeAttribute('src');
    enlargedImage.alt = '';
    zoomPanel.style.backgroundImage = '';
    turnButton.classList.remove('is-available');
    document.body.classList.remove('wine-view-open');
    if (returnTarget) returnTarget.focus();
  }

  function openBottle(source, preserveFocus) {
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
    var preview = source.closest('.home-bottle-preview');
    activeProductKey = inferProductKey(card, preview);
    var imageUrl = source.currentSrc || source.src;
    frontImageUrl = imageUrl;
    backImageUrl = source.getAttribute('data-back-src') || '';
    showingBack = false;
    enlargedImage.classList.remove('is-touch-zoomed');
    source.classList.add('is-enlarged-source');
    source.setAttribute('aria-expanded', 'true');
    enlargedImage.src = imageUrl;
    enlargedImage.alt = source.alt;
    zoomPanel.style.backgroundImage = 'url("' + imageUrl.replace(/"/g, '%22') + '")';
    vintageText.textContent = card ? card.querySelector('.wine-card-copy span').textContent : preview.getAttribute('data-vintage');
    titleText.textContent = card ? card.querySelector('.wine-card-copy h2').textContent : preview.getAttribute('data-title');
    originText.textContent = card ? card.querySelector('.wine-card-copy p').textContent : preview.getAttribute('data-origin');
    priceText.textContent = card ? card.querySelector('.wine-buy-row strong').textContent : preview.getAttribute('data-price');
    renderExperience(activeProductKey);
    addCartButton.textContent = isFrenchPage ? 'Ajouter au panier' : 'Add to cart';
    addCartButton.disabled = !card;
    addCartButton.hidden = !card;
    var activeIndex = bottleImages.indexOf(source);
    countText.textContent = (activeIndex + 1) + ' / ' + bottleImages.length;
    turnButton.classList.toggle('is-available', Boolean(backImageUrl));
    turnButton.textContent = isFrenchPage ? 'Voir l’étiquette arrière' : 'View back label';
    lightbox.classList.add('is-open');
    document.body.classList.add('wine-view-open');
    if (!preserveFocus) closeButton.focus();
  }

  function showRelativeBottle(direction) {
    if (!activeSource) return;
    var activeIndex = bottleImages.indexOf(activeSource);
    var nextIndex = (activeIndex + direction + bottleImages.length) % bottleImages.length;
    openBottle(bottleImages[nextIndex], true);
  }

  bottleImages.forEach(function (image) {
    var preview = image.closest('.home-bottle-preview');
    var control = preview || image;
    control.setAttribute('aria-haspopup', 'dialog');
    control.setAttribute('aria-expanded', 'false');
    control.setAttribute('aria-label', (image.alt || 'Wine bottle') + (isFrenchPage ? ', ouvrir la vue agrandie' : ', open enlarged view'));

    if (preview) {
      preview.setAttribute('role', 'button');
      preview.addEventListener('click', function (event) {
        event.preventDefault();
        openBottle(image);
      });
      return;
    }

    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    var hint = document.createElement('a');
    hint.className = 'bottle-view-hint';
    var wineTitle = (image.closest('.wine-card').querySelector('.wine-card-copy h2').textContent || '').toLowerCase();
    var guideAnchor = wineTitle.indexOf('red blend') !== -1 ? 'red-blend'
      : wineTitle.indexOf('merlot') !== -1 ? 'merlot'
      : wineTitle.indexOf('sauvignon') !== -1 ? 'sauvignon-blanc'
      : wineTitle.indexOf('symphony') !== -1 ? 'symphony'
      : 'riesling-ice-wine';
    var productNode = image.closest('.wine-card').querySelector('[data-vs-product-key]');
    var productKey = productNode ? productNode.getAttribute('data-vs-product-key') : '';
    hint.href = (isFrenchPage ? 'fr-wine-guide.html' : 'wine-guide.html')
      + (productKey ? '?product=' + encodeURIComponent(productKey) : '')
      + '#' + guideAnchor;
    hint.textContent = isFrenchPage ? 'Comment le déguster' : 'How to Enjoy';
    hint.setAttribute('aria-label', (isFrenchPage ? 'Conseils de dégustation pour ' : 'Serving guide for ') + (image.alt || 'wine'));
    hint.addEventListener('click', function (event) {
      event.preventDefault();
      openBottle(image);
    });
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
  previousButton.addEventListener('click', function () { showRelativeBottle(-1); });
  nextButton.addEventListener('click', function () { showRelativeBottle(1); });
  addCartButton.addEventListener('click', function () {
    if (!activeSource) return;
    var card = activeSource.closest('.wine-card');
    var sourceButton = card ? card.querySelector('.add-cart') : null;
    if (!sourceButton) return;
    sourceButton.click();
    addCartButton.textContent = isFrenchPage ? 'Ajouté au panier' : 'Added to cart';
    window.setTimeout(function () {
      addCartButton.textContent = isFrenchPage ? 'Ajouter au panier' : 'Add to cart';
    }, 1200);
  });
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
  bottleStage.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'touch') {
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
    }
  });
  bottleStage.addEventListener('pointerup', function (event) {
    if (event.pointerType !== 'touch' || swipeStartX === null) return;
    var distanceX = event.clientX - swipeStartX;
    var distanceY = event.clientY - swipeStartY;
    swipeStartX = null;
    swipeStartY = null;
    if (Math.abs(distanceX) > 45 && Math.abs(distanceX) > Math.abs(distanceY)) {
      enlargedImage.classList.remove('is-touch-zoomed');
      showRelativeBottle(distanceX < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(distanceX) < 18 && Math.abs(distanceY) < 18) {
      enlargedImage.classList.toggle('is-touch-zoomed');
    }
  });
  bottleStage.addEventListener('pointercancel', function () {
    swipeStartX = null;
    swipeStartY = null;
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
    if (event.key === 'ArrowLeft' && activeSource) showRelativeBottle(-1);
    if (event.key === 'ArrowRight' && activeSource) showRelativeBottle(1);
  });
}());

// Restore the wine-page position after closing a focused Wine Guide.
(function () {
  if (!document.querySelector('.wine-card')) return;
  try {
    var savedData = JSON.parse(sessionStorage.getItem('shenaky_wine_return') || 'null');
    if (!savedData || !savedData.href || typeof savedData.scrollY !== 'number') return;
    var savedUrl = new URL(savedData.href, window.location.href);
    if (savedUrl.pathname !== window.location.pathname) return;
    window.setTimeout(function () {
      window.scrollTo(0, savedData.scrollY);
      sessionStorage.removeItem('shenaky_wine_return');
    }, 0);
  } catch (error) {
    // Normal browser scroll restoration still applies.
  }
}());

// Show only the selected wine when a Wine Guide link includes a wine anchor.
(function () {
  var grid = document.querySelector('.wine-guide-grid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.wine-guide-card[id]'));
  var isFrenchGuide = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var heroHeading = document.querySelector('.wine-guide-hero h1');
  var heroIntro = document.querySelector('.wine-guide-hero p');
  var signature = document.querySelector('.wine-guide-signature');
  var defaultHeading = heroHeading ? heroHeading.textContent : '';
  var defaultIntro = heroIntro ? heroIntro.textContent : '';

  var products = {
    '2024-red-blend': {
      guide: 'red-blend', vintage: '2024', name: 'Red Blend',
      originEn: 'Contra Costa', originFr: 'Contra Costa', price: 25,
      image: 'assets/wines/2024-red-blend.webp?v=20260902-1'
    },
    '2025-merlot': {
      guide: 'merlot', vintage: '2025', name: 'Merlot',
      originEn: 'Contra Costa', originFr: 'Contra Costa', price: 25,
      image: 'assets/wines/2025-merlot-approved.webp'
    },
    '2024-merlot': {
      guide: 'merlot', vintage: '2024', name: 'Merlot',
      originEn: 'Contra Costa', originFr: 'Contra Costa', price: 25,
      image: 'assets/wines/2024-merlot.webp?v=20260902-1'
    },
    '2024-sauvignon-blanc': {
      guide: 'sauvignon-blanc', vintage: '2024', name: 'Sauvignon Blanc',
      originEn: 'California', originFr: 'Californie', price: 25,
      image: 'assets/wines/2024-sauvignon-blanc-corrected.webp?v=20260907-2'
    },
    '2025-symphony': {
      guide: 'symphony', vintage: '2025', name: 'Symphony',
      originEn: 'California · Silver Medal', originFr: 'Californie · Médaille d’argent', price: 25,
      image: 'assets/wines/2025-symphony-corrected.webp?v=20260907-2'
    },
    '2023-riesling-ice-wine': {
      guide: 'riesling-ice-wine', vintage: '2023 · 375 ml · 12.6% ABV',
      vintageFr: '2023 · 375 ml · 12,6 % alc./vol.', name: 'Riesling Ice Wine',
      originEn: 'American · Gold Medal', originFr: 'États-Unis · Médaille d’or', price: 35,
      image: 'assets/wines/2023-riesling-ice-wine-approved.webp?v=20260917-3'
    }
  };

  var backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'wine-guide-all-link wine-guide-back-button';
  backButton.textContent = isFrenchGuide ? '← Retour à Nos vins' : '← Back to Our Wines';
  backButton.setAttribute('aria-label', isFrenchGuide ? 'Fermer et retourner à la page Nos vins' : 'Close and return to Our Wines');
  backButton.hidden = true;
  grid.parentNode.insertBefore(backButton, grid);

  function returnToWines() {
    var winesPage = isFrenchGuide ? 'fr-wines.html' : 'wines.html';
    var referrerMatches = false;
    try {
      var referrer = document.referrer ? new URL(document.referrer) : null;
      referrerMatches = Boolean(referrer)
        && referrer.origin === window.location.origin
        && referrer.pathname.slice(-winesPage.length) === winesPage;
    } catch (error) {
      referrerMatches = false;
    }

    if (referrerMatches && window.history.length > 1) {
      window.history.back();
      return;
    }

    var savedReturn = '';
    try {
      var savedData = JSON.parse(sessionStorage.getItem('shenaky_wine_return') || 'null');
      savedReturn = savedData && savedData.href ? savedData.href : '';
    } catch (error) {
      savedReturn = '';
    }
    window.location.href = savedReturn || winesPage;
  }

  backButton.addEventListener('click', returnToWines);

  function selectedCard() {
    var id = window.location.hash.slice(1);
    if (!id) return null;
    try {
      id = decodeURIComponent(id);
    } catch (error) {
      return null;
    }
    var target = document.getElementById(id);
    return target && target.classList.contains('wine-guide-card') ? target : null;
  }

  function selectedProduct(target) {
    if (!target || !window.URLSearchParams) return null;
    var key = new URLSearchParams(window.location.search).get('product');
    var product = key ? products[key] : null;
    return product && product.guide === target.id ? { key: key, details: product } : null;
  }

  function removeProductPanel() {
    var existing = grid.querySelector('.wine-guide-product');
    if (existing) existing.remove();
  }

  function addProductPanel(target) {
    removeProductPanel();
    var selected = selectedProduct(target);
    if (!selected) return;

    var product = selected.details;
    var panel = document.createElement('div');
    panel.className = 'wine-guide-product';
    panel.innerHTML =
      '<img src="' + product.image + '" alt="' +
        (isFrenchGuide ? 'Bouteille ' : '') + product.name + ' ' + product.vintage.split(' · ')[0] + '">' +
      '<div class="wine-guide-product-copy">' +
        '<span>' + (isFrenchGuide && product.vintageFr ? product.vintageFr : product.vintage) + '</span>' +
        '<h3>' + product.name + '</h3>' +
        '<p>' + (isFrenchGuide ? product.originFr : product.originEn) + '</p>' +
        '<div class="wine-guide-product-buy">' +
          '<strong>' + (isFrenchGuide ? product.price + ' $' : '$' + product.price) + '</strong>' +
          '<div data-vs-product-key="' + selected.key + '"></div>' +
        '</div>' +
      '</div>';
    target.insertBefore(panel, target.firstChild);
  }

  function applyWineGuideFocus() {
    var target = selectedCard();
    document.body.classList.toggle('wine-guide-focus', Boolean(target));
    cards.forEach(function (card) {
      card.hidden = Boolean(target) && card !== target;
    });
    backButton.hidden = !target;

    if (signature) {
      signature.hidden = Boolean(target);
    }

    if (target) {
      addProductPanel(target);
      var wineName = target.querySelector('h2').textContent;
      if (heroHeading) {
        heroHeading.textContent = isFrenchGuide ? 'Comment déguster le ' + wineName : 'How to Enjoy ' + wineName;
      }
      if (heroIntro) {
        heroIntro.textContent = isFrenchGuide
          ? 'Température de service, accords et conseil de dégustation pour ce vin.'
          : 'Serving temperature, food pairings, and a simple serving idea for this wine.';
      }
      window.setTimeout(function () {
        target.scrollIntoView({ block: 'start' });
      }, 0);
    } else {
      removeProductPanel();
      if (heroHeading) heroHeading.textContent = defaultHeading;
      if (heroIntro) heroIntro.textContent = defaultIntro;
      if (signature) signature.hidden = false;
    }
  }

  window.addEventListener('hashchange', applyWineGuideFocus);
  applyWineGuideFocus();
}());
