document.addEventListener("DOMContentLoaded", async () => {
  const navLink = document.getElementById("nav-link");
  const token = localStorage.getItem("token");
  const roleName = localStorage.getItem("role_name");

  if (token) {
    navLink.textContent = "Профиль";
    navLink.href = "profile.html";
  } else {
    navLink.textContent = "Вход";
    navLink.href = "login.html";
  }

  const mainNav = document.getElementById("main-nav");
  if (roleName === "Admin") {
    const moderationLink = document.createElement("a");
    moderationLink.href = "moderation.html";
    moderationLink.textContent = "Модерация отзывов";
    mainNav.insertBefore(moderationLink, mainNav.firstChild);

    const adminControls = document.getElementById("admin-controls");
    adminControls.style.display = "block";
  }

  const cardsContainer = document.getElementById("cards-container");
  const BASE_URL = "http://localhost:8080";

  try {
    const response = await fetch(`${BASE_URL}/api/movie/`);
    if (!response.ok) {
      throw new Error("Ошибка при загрузке фильмов");
    }
    const movies = await response.json();

    cardsContainer.innerHTML = "";

    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "card";

      const img = document.createElement("img");
      img.src = `${BASE_URL}${movie.logo_file_url}`;
      img.alt = movie.title;
      img.loading = "lazy";

      const info = document.createElement("div");
      info.className = "card-info";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = movie.title;

      const rating = document.createElement("div");
      rating.className = "card-rating";
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";
      const ratingValue = document.createElement("span");
      ratingValue.textContent = movie.ratereel_rating.toFixed(1); // ratereel_rating

      rating.appendChild(star);
      rating.appendChild(ratingValue);

      info.appendChild(title);
      info.appendChild(rating);

      card.appendChild(img);
      card.appendChild(info);

      card.addEventListener("click", () => {
        window.location.href = `movie.html?movie_id=${movie.id}`;
      });

      cardsContainer.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    cardsContainer.textContent = "Не удалось загрузить фильмы.";
  }

  // Логика открытия/закрытия модального окна добавления фильма
  const addMovieBtn = document.getElementById("add-movie-btn");
  const addMovieModal = document.getElementById("add-movie-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const posterPreview = document.getElementById("poster-preview");
  const logoFileInput = document.getElementById("logo-file");
  const submitMovieBtn = document.getElementById("submit-movie");
  const addMovieError = document.getElementById("add-movie-error");

  if (roleName === "Admin") {
    addMovieBtn.addEventListener("click", () => {
      addMovieModal.style.display = "flex"; // Показать модальное окно
      clearAddMovieForm();
    });
  }

  closeModalBtn.addEventListener("click", () => {
    addMovieModal.style.display = "none";
  });

  logoFileInput.addEventListener("change", () => {
    const file = logoFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        posterPreview.style.backgroundImage = `url('${e.target.result}')`;
      };
      reader.readAsDataURL(file);
    } else {
      posterPreview.style.backgroundImage = "none";
    }
  });

  submitMovieBtn.addEventListener("click", async () => {
    clearAddMovieError();
    const title = document.getElementById("movie-title").value.trim();
    const description = document
      .getElementById("movie-description")
      .value.trim();
    const imdbRatingVal = parseFloat(
      document.getElementById("imdb-rating").value,
    );
    const file = logoFileInput.files[0];

    if (
      !title ||
      !description ||
      isNaN(imdbRatingVal) ||
      imdbRatingVal < 1.0 ||
      imdbRatingVal > 5.0 ||
      !file
    ) {
      showAddMovieError(
        "Пожалуйста, заполните все поля и выберите файл. Рейтинг от 1.0 до 5.0.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("logo_file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("imdb_rating", imdbRatingVal);

    const token = localStorage.getItem("token");
    if (!token) {
      showAddMovieError("Вы не авторизованы.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/movie/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("already exist")) {
          showAddMovieError(`Такой фильм уже существует`);
        } else {
          showAddMovieError("При добавлении фильма произошла ошибка.");
        }
        return;
      }

      // Успех
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      showAddMovieError("При добавлении фильма произошла ошибка.");
    }
  });

  function showAddMovieError(msg) {
    addMovieError.style.display = "block";
    addMovieError.textContent = msg;
  }

  function clearAddMovieError() {
    addMovieError.style.display = "none";
    addMovieError.textContent = "";
  }

  function clearAddMovieForm() {
    document.getElementById("movie-title").value = "";
    document.getElementById("movie-description").value = "";
    document.getElementById("imdb-rating").value = "5.0";
    logoFileInput.value = "";
    posterPreview.style.backgroundImage = "none";
    clearAddMovieError();
  }
});
