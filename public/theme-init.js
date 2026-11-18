// Applies a stored light/dark choice before first paint, so a returning visitor never
// sees the wrong theme flash. Loaded from index.html as an external file (the CSP
// allows no inline scripts). Only brand v2.0 pages (src/styles/brand.css) read it.
;(function () {
  try {
    var t = localStorage.getItem('scintillart-theme')
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t)
  } catch (e) {}
})()
