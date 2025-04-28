import os
import time
from click import prompt
import requests
from typing import Optional
from dotenv import load_dotenv
from phi.agent import Agent, RunResponse
from phi.utils.pprint import pprint_run_response
from phi.model.groq import Groq
from phi.tools.postgres import PostgresTools
from phi.tools.zoom import ZoomTool
from phi.tools.email import EmailTools
from phi.utils.log import logger
import google.generativeai as genai
import pyttsx3
import pyaudio
import wave
import sys

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load the model
model = os.getenv("GENAI_MODEL_NAME")
gemini_model = genai.GenerativeModel(model)

sender_email = os.getenv("SENDER_EMAIL")
sender_name = os.getenv("SENDER_NAME")
sender_passkey = os.getenv("SENDER_PASSKEY")

# Initialize the Postgres tool
postgres_tool = PostgresTools(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    db_name=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)

# Initialize the engine
engine = pyttsx3.init()

# Set properties (optional)
engine.setProperty('rate', 180)  # Speed of speech (words per minute)
engine.setProperty('volume', 1.0)  # Volume level (0.0 to 1.0)


from groq import Groq

# Initialize Groq client
client = Groq()

# Set up audio recording parameters
FORMAT = pyaudio.paInt16  # Audio format
CHANNELS = 1              # Mono audio
RATE = 16000              # Sampling rate
CHUNK = 1024              # Size of each audio chunk
RECORD_SECONDS = 5      # Duration of the recording (in seconds)

# Initialize the audio stream
p = pyaudio.PyAudio()

# Open the microphone stream
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

engine.say("Hello. What Lab Tests do you want to book ?")
engine.runAndWait()
print("Hello. What Lab Tests do you want to book ?")
print("Listening...")

frames = []

# Capture live audio data
for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    frames.append(data)

print("Finished Listening.")

# Stop and close the stream
stream.stop_stream()
stream.close()
p.terminate()

# Save the audio as a temporary file
temp_filename = "lab_audio.mp3"

with wave.open(temp_filename, 'wb') as wf:
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))

# query = input("Enter you query: ")
client = Groq()
filename = os.path.dirname(__file__) + "/lab_audio.mp3"

with open(filename, "rb") as file:
    transcription = client.audio.transcriptions.create(
    file=(filename, file.read()),
    model="distil-whisper-large-v3-en",
    # language="hi",
    response_format="verbose_json",
    )
    query = transcription.text
# print("Audio: ", query)

prompt = f"""Analyze this user query: {query} and return which lab test the user is looking for.
Currently we offer:
1) Complete Blood Count Test
2) Lipid Profile Test
3) Liver Function Test
4) Thyroid Profile Test
5) Vitamin D Test
6) Haemoglobin Test
7) Blood Test
8) Blood Sugar Test
9) Blood Pressure Test

Return exactly one test name which is most similar to what the user is looking for.
Don't add any other words or lines, just return the test name.
If the user's query has a totally different test, then return "Sorry"

"""

# prompt_new = os.getenv("prompt")
test = gemini_model.generate_content(prompt)
test = test.text.strip()
print("Audio: ", test)

if test=="Sorry":
    print("Sorry, we don't offer that service yet.")
    engine.say("Sorry, we don't offer that service yet.")
    engine.runAndWait()
    sys.exit(0)

from phi.model.groq import Groq

agent = Agent(
        model=Groq(id="llama3-70b-8192"),
        tools=[postgres_tool],
        show_tool_calls=False,
        markdown=True,
        # instructions=[
        #     """You are a helpful medical assistant that checks which lab test user is looking for, from a database. 
        #     Check for the entries where name matches the test name user is looking for, then return the price,
        #     lab name, contact and description of that test.
        #     Provide a well structured response to the user"""
        # ]
        instructions=[
        """You are a helpful and knowledgeable medical assistant. 
        When a user asks about a lab test, identify the name of the test they are looking for and search for matching entries in the "lab_tests" database table.
        The columns in the table are: "name", "labName", "price", "description" and "contact".
        For each matching entry, return the following details in a clear and user-friendly format:
        - Test price
        - Lab name
        - Contact information
        - Description of the test
        
        Ensure the response is well-structured and easy to read."""
        ]
)

# response: RunResponse = agent.run(f"""Please run a SQL query on my Postgre SQL database to get all entries 
#                                     from the table with name {test}.The table name is "lab_tests".
#                                     Return their price, lab name, contact and description.""")

response: RunResponse = agent.run(f"""
Please query my PostgreSQL database for entries in the "lab_tests" table 
where the test name matches "{test}". 
Return the following details for each matching entry:
- Price
- Lab name
- Contact
- Description

Format the results clearly for easy understanding.
""")


pprint_run_response(response, markdown=True)

prompt = f"""Fetch the lab name (ex: CityCare Labs) from the response: {response}.
Return exactly the lab name. Don't add any other words."""
lab_name = gemini_model.generate_content(prompt)
lab_name = lab_name.text.strip()

prompt = f"""Fetch the contact (ex: sayambarroychowdhury@gmail.com) from the response: {response}.
Return exactly the email id. Don't add any other words."""
email = gemini_model.generate_content(prompt)
email = email.text.strip()
# print("Email fetched: ", email)

# prompt = f"""Fetch the email (ex: sayambarroychowdhury@gmail.com) from the response: {response}.
# Return exactly the email id. Don't add any other words."""
# email = gemini_model.generate_content(prompt)
# email = email.text.strip()

prompt = f"""Analyze this text {response} and narrate the response to the user including the test price and the test description. 
            Follow this structure:

            "According to us, the [name_of_test] offered by [lab name] costs Rs. [price]. [describe the test according to the description].
            Let me know if you want to book this test"

            Sound like an assistant informing the user about the test details. Return the narration in a single paragraph.
            Don't add any extra words or lines.
"""
engine.say(f"Alright, here are the details of {test}")
engine.runAndWait()
response = gemini_model.generate_content(prompt)
response = response.text.strip()
print(response)
engine.say(response)
engine.runAndWait()

print("Do you want to book this lab test? [Yes / No]")
engine.say("Do you want to book this lab test? [Yes or No]")
engine.runAndWait()
print("Listening...")

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

frames = []

# Capture live audio data
for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    frames.append(data)

print("Finished Listening.")

# Stop and close the stream
stream.stop_stream()
stream.close()
p.terminate()

# Save the audio as a temporary file
temp_filename = "yes_or_no.mp3"

with wave.open(temp_filename, 'wb') as wf:
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))

from groq import Groq
# query = input("Enter you query: ")
client = Groq()
filename = os.path.dirname(__file__) + "/yes_or_no.mp3"

with open(filename, "rb") as file:
    transcription = client.audio.transcriptions.create(
    file=(filename, file.read()),
    model="distil-whisper-large-v3-en",
    response_format="verbose_json",
    )
    query = transcription.text

prompt = f"Detect whether the user is willing to book the test(Yes or No): {query}. Don't add any other words."
ans = gemini_model.generate_content(prompt)
ans = ans.text.strip()
print("Audio: ", ans)

if(ans=="Yes"):
    engine.say("What is your name?")
    engine.runAndWait()
    print("What is your name? [Only say the name]")
    print("Listening...")

    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    frames = []

    # Capture live audio data
    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished listening.")

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    p.terminate()

    # Save the audio as a temporary file
    temp_filename = "name.mp3"

    with wave.open(temp_filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))

    client = Groq()
    filename = os.path.dirname(__file__) + "/name.mp3"

    with open(filename, "rb") as file:
            transcription = client.audio.transcriptions.create(
            file=(filename, file.read()),
            model="distil-whisper-large-v3-en",
            response_format="verbose_json",
            )
            response = transcription.text
            print("Audio: ", response)
    
    prompt = f"Fetch just the Name (ex: Abraham) to the user from: {response}. Don't add any other words"
    output = gemini_model.generate_content(prompt)
    nam = output.text.strip()

    engine.say(f"Alright {nam},what is your favourable Date and Time ? [Follow the Format 10 May 8 A.M]")
    engine.runAndWait()
    print(f"Alright {nam},what is your favourable Date and Time ? [Follow the Format 10 May 8 A.M]")
    print("Listening...")

    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    frames = []

    # Capture live audio data
    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished Listening.")

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    p.terminate()

    # Save the audio as a temporary file
    temp_filename = "date.mp3"

    with wave.open(temp_filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))


    client = Groq()
    filename = os.path.dirname(__file__) + "/date.mp3"

    with open(filename, "rb") as file:
        transcription = client.audio.transcriptions.create(
        file=(filename, file.read()),
        model="distil-whisper-large-v3-en",
        response_format="verbose_json",
        )
        response = transcription.text
        # print("Audio: ", response)

    prompt = f"""Fetch just the Date (ex: March 26) the user is looking for in the query {response}. Don't add any other words.
            If there is no date present, return '0'."""
    output = gemini_model.generate_content(prompt)
    date = output.text.strip()
    

    if(date=='0'):
        print("Sorry, I was unable to capture the date. Try again after some time.")
        engine.say("Sorry, I was unable to capture the date. Try again after some time.")
        engine.runAndWait()
        sys.exit(0)

    print("Date Transcribed: ", date)
    prompt = f"""Fetch just the Time (in this format, for ex: 8 A.M) the user is looking for in the query {response}.Don't add any other words.
    If there is no time present, return '0'."""
    output = gemini_model.generate_content(prompt)
    time_utc = output.text.strip()

    if(time_utc=='0'):
        print("Sorry, I was unable to capture the time. Try again after some time.")
        engine.say("Sorry, I was unable to capture the time. Try again after some time.")
        engine.runAndWait()
        sys.exit(0)

    print("Time Transcribed: ", time_utc)
    from phi.model.groq import Groq

    # Custom Zoom tool class (same as before)
    class CustomZoomTool(ZoomTool):
        def __init__(
            self,
            account_id: Optional[str] = None,
            client_id: Optional[str] = None,
            client_secret: Optional[str] = None,
            name: str = "zoom_tool",
        ):
            super().__init__(account_id=account_id, client_id=client_id, client_secret=client_secret, name=name)
            self.token_url = "https://zoom.us/oauth/token"
            self.access_token = None
            self.token_expires_at = 0

        def get_access_token(self) -> str:
            if self.access_token and time.time() < self.token_expires_at:
                return str(self.access_token)

            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            data = {"grant_type": "account_credentials", "account_id": self.account_id}

            try:
                response = requests.post(
                    self.token_url, headers=headers, data=data, auth=(self.client_id, self.client_secret)
                )
                response.raise_for_status()

                token_info = response.json()
                self.access_token = token_info["access_token"]
                expires_in = token_info["expires_in"]
                self.token_expires_at = time.time() + expires_in - 60

                self._set_parent_token(str(self.access_token))
                return str(self.access_token)
            except requests.RequestException as e:
                logger.error(f"Error fetching access token: {e}")
                return ""

        def _set_parent_token(self, token: str) -> None:
            if token:
                self._ZoomTool__access_token = token


    # Initialize tools
    # zoom_tool = CustomZoomTool(account_id=ACCOUNT_ID, client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    email_tool = EmailTools(
        receiver_email=email,
        sender_email=sender_email,
        sender_name=sender_name,
        sender_passkey=sender_passkey
    )

    engine.say(f"Okay, I am scheduling your appointment with {lab_name} on {date} at {time_utc}")
    agent = Agent(
        model=Groq(id="llama3-70b-8192"),
        tools=[email_tool],
        show_tool_calls=False,
        markdown=True,
        instructions=[
            "You are an assistant that sends email of a lab test booking confirmation to a Lab",
            "The email should be of this format: ",

            f"""To {lab_name},
            Mr/Mrs {nam} has booked {test} with you on {date} at {time_utc} UTC.
            
            Regards,
            Team Tech Janta Party"""
            "Don't add any extra lines"
        ])
    
    agent.print_response(f"Send an email to The Lab: {lab_name} informing him that Mr/Mrs {nam} has booked a Lab Test for {test }with them on {date} at {time_utc} UTC.")
    print(f"Your test for {test} has been scheduled with {lab_name} on {date} at {time}. Their contact detail is: {email}. May God Bless You.")
    engine.say(f"Your test for {test} has been scheduled with {lab_name} on {date} at {time}. Their contact detail is: {email}. May God Bless You.")
    engine.runAndWait()

else :
    print("Alright, not booking test.")
    engine.say("Alright, not booking test.")
    engine.runAndWait()
    sys.exit(0)






