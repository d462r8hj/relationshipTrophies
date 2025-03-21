let trophies = []; 

async function loadTrophies() {
    try {
        const response = await fetch('trophies.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); 
        trophies = rows
            .filter(row => row.trim()) 
            .map(row => {
                const [title, category, description, date, percent, img] = row.split(';');
                return { title, category, description, date, percent, img };
            });

        renderTrophies(trophies);
        setupSortButtons();
    } catch (error) {
        console.error('Fehler beim Laden der Trophäen:', error);
    }
}

function renderTrophies(trophiesToRender) {
    const trophyContainer = document.getElementById('trophyContainer');
    trophyContainer.innerHTML = '';

    trophiesToRender.forEach(trophy => {
        const isAchieved = trophy.date ? true : false;
        const trophyIcon = 'bi-trophy-fill';
        const percentValue = trophy.percent ? parseInt(trophy.percent) : 0;
        
        // Fortschrittsbalken erstellen - OHNE bg-success Klasse
        const progressBar = `
            <div class="progress mt-2">
                <div class="progress-bar" 
                     role="progressbar" style="width: ${percentValue}%;" 
                     aria-valuenow="${percentValue}" aria-valuemin="0" aria-valuemax="100">
                    ${percentValue}%
                </div>
            </div>
        `;
        
        // Bild Container (nur anzeigen, wenn ein Bild vorhanden ist)
        const imageElement = trophy.img && trophy.img.trim() ? 
            `<div class="trophy-image-container">
                <div class="trophy-image-square">
                    <img src="${trophy.img}" alt="${trophy.title}">
                </div>
             </div>` : '';
        
        const trophyHTML = `
            <div class="connect-card description-section ${!isAchieved ? 'not-achieved' : ''}" data-category="${trophy.category}">
                <div class="trophy-content">
                    <div class="trophy-main-content">
                        <div class="d-flex align-items-center">
                            <i class="bi ${trophyIcon} me-2"></i>
                            <h2 class="name mb-0">${trophy.title}</h2>
                        </div>
                        <div class="trophy-details">
                            <span class="badge bg-light text-dark">${trophy.category}</span>
                            <p class="description mt-3">${trophy.description}</p>
                            ${trophy.date ? `<small>Achieved: ${trophy.date}</small>` : '<small>Not achieved yet</small>'}
                            ${progressBar}
                        </div>
                    </div>
                    ${imageElement}
                </div>
            </div>
        `;
        
        trophyContainer.innerHTML += trophyHTML;
    });
}

function setupSortButtons() {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sortType = e.target.dataset.sort;
            let sortedTrophies = [...trophies];

            // Button-Text aktualisieren
            const dropdownButton = document.querySelector('.dropdown-toggle');
            dropdownButton.textContent = e.target.textContent;

            switch(sortType) {
                case 'date':
                    sortedTrophies.sort((a, b) => {
                        if (!a.date) return 1;
                        if (!b.date) return -1;
                        return new Date(b.date.split('.').reverse().join('-')) - 
                               new Date(a.date.split('.').reverse().join('-'));
                    });
                    break;
                case 'category':
                    const categoryOrder = { 'Gold': 1, 'Silver': 2, 'Bronze': 3 };
                    sortedTrophies.sort((a, b) => 
                        categoryOrder[a.category] - categoryOrder[b.category]
                    );
                    break;
                case 'achieved':
                    sortedTrophies.sort((a, b) => {
                        if (a.date && !b.date) return -1;
                        if (!a.date && b.date) return 1;
                        return 0;
                    });
                    break;
            }

            renderTrophies(sortedTrophies);
        });
    });
}

document.addEventListener('DOMContentLoaded', loadTrophies);