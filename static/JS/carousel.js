new Glide('.glide', {
    type: 'carousel',
    autoplay: 4000,
    hoverpause: true,
    perView: 1
  }).mount();

  var glideCarousel = document.querySelector('.glide').glide;

  // Fonction de défilement manuel vers la gauche
  function glidePrev() {
    glideCarousel.go('<');
  }

  // Fonction de défilement manuel vers la droite
  function glideNext() {
    glideCarousel.go('>');
  }


 