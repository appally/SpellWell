import requests

group_id = "1912711283740778790"
api_key = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJsaXV5b25nIiwiVXNlck5hbWUiOiJsaXV5b25nIiwiQWNjb3VudCI6IiIsIlN1YmplY3RJRCI6IjE5MTI3MTEyODM3NDQ5NzMwOTQiLCJQaG9uZSI6IjEzNTU4NjMwNDIwIiwiR3JvdXBJRCI6IjE5MTI3MTEyODM3NDA3Nzg3OTAiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiIiLCJDcmVhdGVUaW1lIjoiMjAyNS0wNy0wNSAyMjo0OTozOSIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.MN6AoGEGTf5jfktAhMhdR7nyLquua0kqBXK3Q8Ol8oO5vxT5kheBY74o3nDIf6r82T2v055z38qdto1ld10VduKiUzgwMocMYBI366LAOTZ2aJ7TzNnz0hjwu0B4CxJ09c7UmyZNtVsVid9c4SoAkt7Ux8Y-wJlnUkx85t5l0WbDgTPid9ejH4penTfZxtzXW88Jf0HUx3UYL3_0rtdK9wCvazg38N3ItAp4wC53yTCemwaIoP5RVe_NMj-WE53Tb0J8AXuEAczwzdWDeFLaygpCosNwnQgD2SB1rrEB1oRaG-IGQQHNdtF24sLVeLgQUsTw1uCZIu06D0JuTd4FBA"

url = f"https://api.minimax.chat/v1/t2a_v2?GroupId={group_id}"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
payload = {
  "model": "speech-02-turbo",
  "text": "apple",
  "timber_weights": [
    {
      "voice_id": "Boyan_new_platform",
      "weight": 100
    }
  ],
  "voice_setting": {
    "voice_id": "",
    "speed": 1,
    "pitch": 0,
    "vol": 1,
    "latex_read": False
  },
  "audio_setting": {
    "sample_rate": 32000,
    "bitrate": 128000,
    "format": "mp3"
  },
  "language_boost": "auto"
}

response = requests.post(url, headers=headers, json=payload)

print(response.status_code)
print(response.text)
