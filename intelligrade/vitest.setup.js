// Shared setup for every jsdom (component) test file.
import "@testing-library/jest-dom/vitest";

// jsdom ships localStorage but not the rest of what the app's screens reach for
// on mount: the theme provider reads matchMedia, the workspaces observe layout
// sizes, and react-pdf needs a canvas context. Supplying them here means no
// component test has to write its own stubs.

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

class Observer {
  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
}

window.ResizeObserver = Observer;
window.IntersectionObserver = Observer;

window.scrollTo = () => {};

// A minimal 2D context. pdf.js reads measurements and draws into it, so the
// methods it calls are no-ops that return a believable shape.
HTMLCanvasElement.prototype.getContext = function getContext() {
  return {
    canvas: this,
    fillRect: () => {},
    clearRect: () => {},
    strokeRect: () => {},
    setTransform: () => {},
    transform: () => {},
    resetTransform: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    rect: () => {},
    clip: () => {},
    stroke: () => {},
    fill: () => {},
    fillText: () => {},
    strokeText: () => {},
    drawImage: () => {},
    createImageData: (width = 0, height = 0) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    getImageData: (_x = 0, _y = 0, width = 0, height = 0) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    putImageData: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => ({}),
    measureText: () => ({ width: 0 }),
  };
};
