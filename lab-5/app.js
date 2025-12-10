import { store } from './store.js';
import { initUI } from './ui.js';

document.querySelector('#addSquare').addEventListener('click', () => {
    store.addShape('square');
});

document.querySelector('#addCircle').addEventListener('click', () => {
    store.addShape('circle');
});

document.querySelector('#recolorSquares').addEventListener('click', () => {
    store.recolor('square');
});

document.querySelector('#recolorCircles').addEventListener('click', () => {
    store.recolor('circle');
});

initUI();
