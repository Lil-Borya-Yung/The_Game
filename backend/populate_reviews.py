import requests
import random
import time
import os
from dotenv import load_dotenv

load_dotenv()

usernames = [
"PetrovAlexey",
"SokolovDmitry",
"KuznetsovSergey",
"IvanovAndrey",
"SmirnovNikolay",
"KiselevVladimir",
"PopovMikhail",
"MorozovArtem",
"VolkovRoman",
"NikolaevEgor",
"LebedevKonstantin",
"OrlovIlya",
"VasilievPavel",
"FedorovTimur",
"GavrilovYuri",
"ZaitsevKirill",
"SemenovOleg",
"MakarovVictor",
"AndreevMaxim",
"AlexandrovAnton",
]

reviews = {
"Очень красивая работа, но не для всех.": 4.7,
"Отличная режиссура, рекомендую попробовать.": 4.6,
"Игра не без недостатков, но стоит внимания.": 4.0,
"Не впечатлило, слишком предсказуемо.": 4.9,
"Понравились персонажи, но сюжет слишком простой.": 4.9,
"Очень атмосферная, но геймплей не цепляет.": 4.4,
"Мне понравилось, особенно концовка!": 3.8,
"Достойная игра, но не шедевр.": 4.8,
"Хорошая игра, но второй раз не пройду.": 3.4,
"Развитие главного героя впечатлило.": 4.6,
"Слишком много клише, но всё равно стоит сыграть.": 5.0,
"Отличная игра, но немного затянута.": 4.6,
"Геймплей неплохой, но сюжет слабоват.": 4.8,
"Хорошая игра, но пересматривать вряд ли захочу.": 4.3,
"Не хватило глубины в сюжете.": 4.3,
"Игра довольно хорошая, но не идеальная.": 3.1,
"Слишком затянуто, но в целом нормально.": 4.0,
"Просто отличная игра, рекомендую всем!": 4.7,
"Оставила много вопросов, но зацепила!": 4.1,
"Персонажи понравились, но сама игра не зашла.": 3.7,
"Оставляет смешанные чувства, 50/50.": 4.5,
"Рекомендую, хотя есть свои недостатки.": 4.0,
"Много диалогов, но общая задумка понравилась.": 3.1,
"Было бы лучше, если бы сократили длительность.": 4.3,
"Игра с глубоким смыслом, мне понравилось.": 3.4,
"Много затянутых моментов, но идея интересная.": 4.9,
"Тяжеловата для восприятия, но качественная.": 3.3,
"Лёгкая игра для одного прохождения.": 4.5,
"Сюжет слабоват, но визуал впечатлил.": 3.7,
"Нормальная игра, но есть куда расти.": 4.7,
"Отличная игра для вечернего времени.": 3.6,
"Красиво сделано, но безэмоционально.": 3.0,
}


base_url = "http://localhost:8080"
default_password = os.getenv("DEFAULT_USER_PASSWORD")

usernames_tokens = {}

random.seed(time.time())

# fake users authentication
for username in usernames:
    auth_json = {"username": username, "password": default_password}
    print(f"Authenticating {username}")
    auth_req = requests.post(base_url + "/api/token", json=auth_json)
    if auth_req.status_code != 202:
        print(f"\tCreating user {username}")
        requests.post(base_url + "/api/user", json=auth_json)
    auth_req = requests.post(base_url + "/api/token", json=auth_json)
    if auth_req.status_code == 202:
        print(f"User {username} authenticated")
        usernames_tokens.update({username: auth_req.json()})
    print()
print()

# getting movies
print("Getting movies list")
movies = requests.get(base_url + "/api/movie").json()
print()

# making reviews
for movie in movies:
    movie_title = movie["title"]
    movie_id = movie["id"]
    print(f"Processing movie {movie_title} : {movie_id}")
    usernames_to_leave_review = random.sample(usernames, 10)
    print(f"Users selected to leave review: {usernames_to_leave_review}")
    for username in usernames_to_leave_review:
        user_token = usernames_tokens[username]
        review_content, review_rating = random.choice(list(reviews.items()))
        print(f"Selected review {review_content} with rating {review_rating}")
        review_req = requests.post(
            base_url + f"/api/movie/{movie_id}/review",
            json={"content": review_content, "rating": review_rating},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        if review_req.status_code == 201:
            print(f"User {username} left review for movie {movie_id}")
    print()
