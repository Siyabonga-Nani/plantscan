import urllib.request
import json

url = "https://picsum.photos/200/300.jpg"
urllib.request.urlretrieve(url, "test_image.jpg")
print("Downloaded test_image.jpg")
