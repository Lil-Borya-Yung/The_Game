document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const roleName = localStorage.getItem("role_name");
  const navLink = document.getElementById("nav-link");
  const pageTitle = document.getElementById("page-title");
  const BASE_URL = "http://localhost:8080";
  const reviewsList = document.getElementById("reviews-list");

  if (token) {
    navLink.textContent = "Профиль";
    navLink.href = "profile.html";
  } else {
    navLink.textContent = "Вход";
    navLink.href = "login.html";
  }

  if (roleName !== "Admin") {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/review/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Ошибка загрузки отзывов для модерации");
    }
    const reviews = await res.json();

    // Если нет отзывов
    if (reviews.length === 0) {
      pageTitle.textContent = "Нет отзывов для модерации";
      return; // Прекращаем выполнение
    }

    for (const review of reviews) {
      const movieRes = await fetch(`${BASE_URL}/api/movie/${review.movie_id}`);
      if (!movieRes.ok) {
        throw new Error("Ошибка загрузки данных о фильме");
      }
      const movie = await movieRes.json();

      const card = document.createElement("div");
      card.className = "review-moderation-card";

      const cardLeft = document.createElement("div");
      cardLeft.className = "card-left";

      const movieLink = document.createElement("a");
      movieLink.href = `movie.html?movie_id=${review.movie_id}`;
      movieLink.textContent = `Фильм "${movie.title}"`;

      // const userLine = document.createElement('div');
      // userLine.textContent = review.username;

      const reviewText = document.createElement("div");
      reviewText.textContent = review.username + " написал: " + review.content;

      cardLeft.appendChild(movieLink);
      // cardLeft.appendChild(userLine);
      cardLeft.appendChild(reviewText);

      const cardRating = document.createElement("div");
      cardRating.className = "card-rating";
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";
      const ratingVal = document.createElement("span");
      ratingVal.textContent = review.rating.toFixed(1);
      cardRating.appendChild(star);
      cardRating.appendChild(ratingVal);

      const cardActions = document.createElement("div");
      cardActions.className = "card-actions";

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "✖";
      rejectBtn.className = "reject-btn";
      rejectBtn.addEventListener("click", async () => {
        await updateReviewStatus(movie.id, review.id, "unapproved");
        card.remove();
      });

      const approveBtn = document.createElement("button");
      approveBtn.textContent = "✔";
      approveBtn.className = "approve-btn";
      approveBtn.addEventListener("click", async () => {
        await updateReviewStatus(movie.id, review.id, "approved");
        card.remove();
      });

      cardActions.appendChild(rejectBtn);
      cardActions.appendChild(approveBtn);

      card.appendChild(cardLeft);
      card.appendChild(cardRating);
      card.appendChild(cardActions);

      reviewsList.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    reviewsList.textContent = "Не удалось загрузить отзывы для модерации.";
  }

  async function updateReviewStatus(movieId, reviewId, status) {
    const response = await fetch(
      `${BASE_URL}/api/movie/${movieId}/review/${reviewId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      console.error(await response.text());
      alert("Ошибка при обновлении статуса отзыва");
    }
  }
});
