
document.querySelectorAll('.menu-button').forEach(function(button){
  button.addEventListener('click', function(){
    const nav = button.parentElement.querySelector('.nav-links');
    nav.classList.toggle('open');
    button.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
});
