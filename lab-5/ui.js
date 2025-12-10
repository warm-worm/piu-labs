import { store } from './store.js';

const board = document.querySelector('#board');
const cntSquares = document.querySelector('#cntSquares');
const cntCircles = document.querySelector('#cntCircles');

export function initUI() {
    // delegacja – klik w shape usuwa go
    board.addEventListener('click', (e) => {
        const el = e.target;
        if (!el.matches('.shape')) return;

        const id = el.dataset.id;
        store.removeShape(id);
    });

    // subskrypcja stanu
    store.subscribe(render);
    render(store.shapes);
}

function render(shapes) {
    // liczniki
    cntSquares.textContent = store.getCount('square');
    cntCircles.textContent = store.getCount('circle');

    // usuwamy tylko elementy, których nie ma w stanie
    const existingIds = shapes.map((s) => s.id);

    [...board.children].forEach((ch) => {
        if (!existingIds.includes(ch.dataset.id)) ch.remove();
    });

    // tylko nowe elementy
    shapes.forEach((sh) => {
        if (!board.querySelector(`[data-id="${sh.id}"]`)) {
            const div = document.createElement('div');
            div.className = `shape ${sh.type}`;
            div.dataset.id = sh.id;
            div.style.backgroundColor = sh.color;
            board.appendChild(div);
        } else {
            // aktualizacja koloru
            const el = board.querySelector(`[data-id="${sh.id}"]`);
            el.style.backgroundColor = sh.color;
        }
    });
}
