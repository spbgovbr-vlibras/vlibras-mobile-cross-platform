from flask import Flask, json
from flask_cors import CORS
import time
import random

result = [
[{"label": "calculo renal", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "diabetes", "id": 26, "score": 0.01}],
[{"label": "diabetes", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}],
[{"label": "dor de cabeça", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}],
[{"label": "dengue", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}],
[{"label": "covid", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}],
[{"label": "dor muscular", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}],
[{"label": "dor no braço", "id": 25, "score": 97.99}, {"label": "dengue", "id": 26, "score": 1.99}, {"label": "calc renal", "id": 26, "score": 0.01}]
]

api = Flask(__name__)
CORS(api)

@api.route('/api/v1/recognition', methods=['POST'])
def get_video_result():
  time.sleep(3)
  return json.dumps(result[random.randint(0,6)])

if __name__ == '__main__':
    api.run()