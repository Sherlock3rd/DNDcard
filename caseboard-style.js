// Styles are explicit archive data. Editing a name/note never derives appearance.
function applyNodeStyle(element, style) {
  style = CASEBOARD_CORE.style(style, 'node');
  element.style.setProperty('--card-fill', style.color);
  element.style.setProperty('--card-border', style.border);
  element.style.setProperty('--card-text', style.text);
  element.dataset.shape = style.shape;
}
function applyEdgeStyle(element, style) {
  style = CASEBOARD_CORE.style(style, 'edge');
  element.style.setProperty('--thread-color', style.color);
  element.style.setProperty('--thread-width', style.width);
  element.setAttribute('stroke-dasharray', style.pattern === 'dashed' ? '12 8' : style.pattern === 'dotted' ? '1 7' : 'none');
  element.setAttribute('stroke-linecap', 'round');
}
