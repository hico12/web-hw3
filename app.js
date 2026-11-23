
function average(list) {
    const ratedMovies = list.filter(m => typeof m.rating === "number");

    if (ratedMovies.length === 0) return 0;

    let sum = 0;

    for (const m of ratedMovies) {
        sum += m.rating;
    }

    return sum / ratedMovies.length;
}

console.log("평균:", average(movies));


function best(list) {
    if (list.length === 0) return null;

    let top = list[0];

    for (let i = 1; i < list.length; i++) {
        if (list[i].rating > top.rating) {
            top = list[i];
        }
    }

    return top;
}

console.log("최고:", best(movies));


function filterByRating(list, min) {
    return list.filter(m => m.rating >= min);
}


function sortByRating(list) {
    return [...list].sort((a, b) => b.rating - a.rating);
}


const board = document.querySelector(".board");
const qInput = document.querySelector("#q");
const sortSelect = document.querySelector("#sort");
const typeFilter = document.querySelector("#typeFilter");
const likeCountEl = document.querySelector("#likeCount");
const detailDialog = document.querySelector("#detail");
const detailBody = document.querySelector(".detail-body");
const closeDetailBtn = document.querySelector("#closeDetail");

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

let likedTitles = JSON.parse(localStorage.getItem("likedMovies")) || [];


function renderCards(list) {
    if (list.length === 0) {
        board.classList.add("is-empty");
    } else {
        board.classList.remove("is-empty");
    }

    board.innerHTML = list.map(m => {
        const isLiked = likedTitles.includes(m.title) ? "liked" : "";
        const hotClass = m.rating >= 8.0 ? "hot" : "";

        const rankBadge = m.type === "boxoffice"
            ? `<span class="rank">${m.rank}위</span>`
            : "";

        return `
            <article class="card" data-type="${m.type}" data-title="${m.title}">
                <img class="poster"
                    src="${IMAGE_BASE_URL}${m.poster}"
                    alt="${m.title}">

                <span class="badge ${hotClass}">${m.rating}</span>

                ${rankBadge}

                <button class="like ${isLiked}"
                    data-title="${m.title}"
                    type="button">♥</button>

                <div class="info">
                    <h3>${m.title}</h3>
                    <p class="year">${m.year}</p>
                </div>
            </article>
        `;
    }).join("");

    likeCountEl.textContent = likedTitles.length;
}


function getView() {
    const kw = qInput.value.trim().toLowerCase();

    const selectedType = document.querySelector(
        'input[name="type"]:checked'
    ).value;

    let result = movies.filter(m => {
        const matchKw =
            m.title.toLowerCase().includes(kw) ||
            m.overview.toLowerCase().includes(kw);

        const matchType =
            selectedType === "all" || m.type === selectedType;

        return matchKw && matchType;
    });

    if (sortSelect.value === "rating") {
        result = sortByRating(result);

    } else if (sortSelect.value === "year") {
        result = [...result].sort((a, b) => b.year - a.year);

    } else if (sortSelect.value === "title") {
        result = [...result].sort((a, b) =>
            a.title.localeCompare(b.title, "ko")
        );

    } else if (sortSelect.value === "audience") {
        result = [...result].sort((a, b) =>
            (b.audience ?? -1) - (a.audience ?? -1)
        );
    }

    return result;
}


function updateView() {
    renderCards(getView());
}


qInput.addEventListener("input", updateView);

sortSelect.addEventListener("change", updateView);

typeFilter.addEventListener("change", updateView);


qInput.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        qInput.value = "";
        updateView();
    }
});


board.addEventListener("click", e => {

    if (e.target.closest(".like")) {
        const title = e.target.closest(".like").dataset.title;

        if (likedTitles.includes(title)) {
            likedTitles = likedTitles.filter(t => t !== title);
        } else {
            likedTitles.push(title);
        }

        localStorage.setItem(
            "likedMovies",
            JSON.stringify(likedTitles)
        );

        updateView();
        return;
    }

    const card = e.target.closest(".card");

    if (card) {
        const movie = movies.find(
            m => m.title === card.dataset.title
        );

            if (movie) {
      detailBody.innerHTML = `
        <img src="https://tmdb.org{movie.poster}" alt="${movie.title}" style="width:100%; border-radius:10px; margin-bottom:16px;">
        <h2>${movie.title} (${movie.year})</h2>
        <p><strong>개봉일:</strong> ${movie.date} · <strong>평점:</strong> ${movie.rating}</p>
        <p>${movie.overview}</p>
      `;
      detailDialog.showModal();
    }

        }
    
});


closeDetailBtn.addEventListener("click", () => {
    detailDialog.close();
});


detailDialog.addEventListener("click", e => {
    if (e.target === detailDialog) {
        detailDialog.close();
    }
});


renderCards(movies);
