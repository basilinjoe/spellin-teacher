import requests
import csv

# Base URL for the API
base_url = "https://www.apeuni.com/api/v1/words/list"

# Common query parameters extracted from the curl command.
params = {
    "user_detail": "roshumep@gmail.com",
    "token": "S3hnwF-sGobC9Z58xN2KxNQQr1Rx9BPXQgnynyES",
    "acc_type": "email",
    "client": "TZLdcnzxKg",
    "api_type": "e1",
    "s": "wa",
    "locale": "en",
    "device_type": "web-1.0.0-Chrome-Chrome 133.0.0.0 on Windows 10 64-bit",
    "device_id": "3-99d379a4-d6f1-4acf-91ea-c674f069b974",
    "first_visit_time": "1731555389",
    "logged_in": "true",
    "category": "unlearned",
    "tag": "default",
    "mode": "meaning",
    "word_set_id": "10",
    "page_size": "20"
}

# List to store extracted words
all_words = []

# Loop through pages 1 to 30.
for page in range(1, 64):
    # Set the page number in parameters
    params["page"] = page
    print(f"Fetching page {page}...")
    response = requests.get(base_url, params=params)
    
    if response.status_code == 200:
        json_data = response.json()
        if json_data.get("code") == 0:
            # Extract words from the "nwords" list.
            nwords = json_data.get("data", {}).get("nwords", [])
            for word_obj in nwords:
                word = word_obj.get("word")
                if word:
                    all_words.append(word)
                else:
                    print(f"Missing 'word' key in word object: {word_obj}")
        else:
            print(f"Error on page {page}: {json_data.get('message')}")
    else:
        print(f"Failed to fetch page {page}: HTTP {response.status_code}")

# Write the words to a CSV file.
csv_filename = "words.csv"
with open(csv_filename, "w", newline="", encoding="utf-8") as csvfile:
    csvwriter = csv.writer(csvfile)
    # Write the header row
    csvwriter.writerow(["word"])
    # Write each word on a new row.
    for word in all_words:
        csvwriter.writerow([word])

print(f"Data extraction complete. {len(all_words)} words saved to {csv_filename}.")


# 9 Reading FIB Basic Vocab
# 8 Listening FIB Vocab

# 10 Reading FIB Advanced Vocab
# 5 PTE Basic Vocab
# 6 PTE Advanced Vocab