//local storage
function saveBoard() {
    const columns = {};

    document.querySelectorAll('.column').forEach((col) => {
        const name = col.dataset.column;
        const cards = [...col.querySelectorAll('.card')].map((card) => ({
            id: card.dataset.id,
            text: card.querySelector('.text').innerText,
            color: card.style.background,
        }));
        columns[name] = cards;
    });

    localStorage.setItem('kanban', JSON.stringify(columns));
}

function loadBoard() {
    const data = JSON.parse(localStorage.getItem('kanban'));
    if (!data) return;

    for (const colName in data) {
        const col = document.querySelector(
            `.column[data-column="${colName}"] .cards`
        );

        data[colName].forEach((card) => {
            const newCard = createCard(card.text, card.id, col);
            newCard.style.background = card.color;
            col.appendChild(newCard);
        });
    }

    updateCounts();
}

//randomColor karty
function randomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 80%, 85%)`;
}

//createCard - nowa karta
function createCard(text = null, id = Date.now(), column = null) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = id;
    card.style.background = randomColor();

    if (!text && column) {
        text = getNextCardName(column);
    }

    card.innerHTML = `
        <div class="text" contenteditable="true">${text || 'Nowa karta'}</div>
        <div class="card-buttons">
            <button class="left">◀</button>
            <button class="right">▶</button>
            <button class="color">🎨</button>
            <button class="delete">✖</button>
        </div>
    `;

    card.querySelector('.text').addEventListener('input', saveBoard);

    card.draggable = true;

    card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
        card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        card.style.opacity = '1';
        saveBoard();
        updateCounts();
    });

    return card;
}

//dodalam niepowtarzalne nazwy, bo zazwyczaj tak jest
function getNextCardName(cardsContainer) {
    if (!cardsContainer) return 'Nowa karta';

    const names = [...cardsContainer.querySelectorAll('.card .text')].map(
        (el) => el.innerText.trim()
    );

    let num = 0;
    while (names.includes(num === 0 ? 'Nowa karta' : `Nowa karta (${num})`)) {
        num++;
    }

    return num === 0 ? 'Nowa karta' : `Nowa karta (${num})`;
}

//funkcja sprawdzajaca duplikaty przy przenoszeniu
function checkNameCollision(card, targetContainer) {
    const textEl = card.querySelector('.text');
    let currentText = textEl.innerText.trim();

    const existingNames = [...targetContainer.querySelectorAll('.card .text')]
        .filter((el) => el !== textEl)
        .map((el) => el.innerText.trim());

    while (existingNames.includes(currentText)) {
        currentText += ' (1)';
    }

    textEl.innerText = currentText;
}

//updateCounts
function updateCounts() {
    document.querySelectorAll('.column').forEach((col) => {
        const count = col.querySelectorAll('.card').length;
        col.querySelector('.count').innerText = count;
    });
}

//event listeners
document.querySelectorAll('.add-card').forEach((btn) => {
    btn.addEventListener('click', () => {
        const column = btn.closest('.column').querySelector('.cards');
        column.appendChild(createCard(null, Date.now(), column));
        updateCounts();
        saveBoard();
    });
});

document.querySelectorAll('.color-column').forEach((btn) => {
    btn.addEventListener('click', () => {
        const cards = btn.closest('.column').querySelectorAll('.card');
        cards.forEach((c) => (c.style.background = randomColor()));
        saveBoard();
    });
});

document.querySelectorAll('.sort-cards').forEach((btn) => {
    btn.addEventListener('click', () => {
        const col = btn.closest('.column').querySelector('.cards');

        if (!col) return; //! to negacja, czyli po prostu jesli nie ma kolumny, to nic nie rob

        const cards = [...col.querySelectorAll('.card')];

        cards.sort((a, b) => {
            const textA = a.querySelector('.text').innerText.trim();
            const textB = b.querySelector('.text').innerText.trim();
            //localeCompare jest wbudowana, porownuje teksty w zaleznosci od jezyka, dodalam z internetu, bo jestem uparta
            return textA.localeCompare(textB, 'pl', {
                numeric: true, //czyli 1 2 3 10, a nie 1 10 2 3
                sensitivity: 'base', //ignoruje rozmiary i akcenty
            });
        });

        cards.forEach((c) => col.appendChild(c));

        saveBoard();
    });
});

//zdarzenia kolumn
document.querySelectorAll('.column').forEach((column) => {
    column.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        const parentCol = card.closest('.column').dataset.column; //sprawdza w jakiej kolumnie jest karta

        //usuwanie
        if (e.target.classList.contains('delete')) {
            card.remove();
            updateCounts();
            saveBoard();
        }

        //jedna karta kolorowana
        if (e.target.classList.contains('color')) {
            card.style.background = randomColor();
            saveBoard();
        }

        //→
        if (e.target.classList.contains('right')) {
            const next = column.nextElementSibling;
            if (next && next.querySelector('.cards')) {
                // Definiujemy targetContainer przed użyciem!
                const targetContainer = next.querySelector('.cards');

                checkNameCollision(card, targetContainer);
                targetContainer.appendChild(card);

                updateCounts();
                saveBoard();
            }
        }

        //←
        if (e.target.classList.contains('left')) {
            const prev = column.previousElementSibling;
            if (prev && prev.querySelector('.cards')) {
                // Definiujemy targetContainer przed użyciem!
                const targetContainer = prev.querySelector('.cards');

                checkNameCollision(card, targetContainer);
                targetContainer.appendChild(card);

                updateCounts();
                saveBoard();
            }
        }
    });
});

//przeciaganie w kolumnach
document.querySelectorAll('.cards').forEach((container) => {
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;

        const after = getDragAfterElement(container, e.clientY);

        if (after == null) {
            //pusty container lub na koniec
            container.appendChild(dragging);
        } else {
            container.insertBefore(dragging, after);
        }
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (!dragging) return;

        //element musi byc w container
        if (!container.contains(dragging)) {
            container.appendChild(dragging);
        }

        checkNameCollision(dragging, container);

        dragging.classList.remove('dragging');
        dragging.style.opacity = '1';
        updateCounts();
        saveBoard();
    });
});

function getDragAfterElement(container, y) {
    //pobieranie nietrzymanych kart
    const cards = [...container.querySelectorAll('.card:not(.dragging)')];

    //szuka pierwszej karty, gdzie srodek jest pod kursorem
    return cards.find((card) => {
        const box = card.getBoundingClientRect();
        const centerY = box.top + box.height / 2; //pionowy srodek karty

        //czy kursor jest wyzej niz srodek
        return y < centerY;
    });
}

loadBoard();
