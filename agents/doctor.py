import os
import time
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

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")
sender_email = "iammeghdeb@gmail.com"
sender_name = "Team Medi Care"
sender_passkey = os.getenv("SENDER_PASSKEY")
ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID")
CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")

postgres_tool = PostgresTools(
    host="ep-twilight-rain-a151fuf1.ap-southeast-1.aws.neon.tech",
    port=5432,
    db_name="doctors_list",
    user="doctors_list_owner",
    password="npg_aoS4ZpTFmP1C",
)
agent = Agent(
    model=Groq(id="llama3-70b-8192"),
    tools=[postgres_tool],
    show_tool_calls=False,
    markdown=True,
    instructions=[
        "You are a helpful assistant that can find doctors from a PostgreSQL database using SQL queries.",
        "The table contains doctor information, including their specialisation.",
        "When the user asks for a specific kind of doctor, search for rows where specialisation matches that type.",
        "Return a list of matching doctors with relevant information like name, specialisation, and email.",
        "Use markdown to format your answers.",
    ],
)

engine = pyttsx3.init()
engine.setProperty("rate", 180)
engine.setProperty("volume", 1.0)

choice = "y"

if choice == "y":
    from groq import Groq

    client = Groq()
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    CHUNK = 1024
    RECORD_SECONDS = 5

    p = pyaudio.PyAudio()

    stream = p.open(
        format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
    )

    print("What kind of Doctor are you looking for ?")
    engine.say("What kind of Doctor are you looking for ?")
    engine.runAndWait()
    print("Listening...")

    frames = []

    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished Listening.")

    stream.stop_stream()
    stream.close()
    p.terminate()

    temp_filename = "doctor.mp3"

    with wave.open(temp_filename, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b"".join(frames))

    client = Groq()
    filename = os.path.dirname(__file__) + "/doctor.mp3"

    with open(filename, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(filename, file.read()),
            model="distil-whisper-large-v3-en",
            response_format="verbose_json",
        )
        response = transcription.text
        print("Audio: ", response)

    model = genai.GenerativeModel("gemini-2.0-flash")
    prompt = f"Fetch the specialist (ex: Cardiologist, Neurologist) the user is looking for in the query {response}"
    response = model.generate_content(prompt)
    specialty = response.text.strip()
    engine.say(f"Alright, I will help you find a {specialty}")
    engine.runAndWait()

    from phi.model.groq import Groq

    response1: RunResponse = agent.run(
        f"""Please run a SQL query on my Postgre SQL database to get all users 
                                    from the table with specialisation {specialty}.
                                    Return just their Name, email and specialisation."""
    )
    pprint_run_response(response1, markdown=True)

    from groq import Groq

    client = Groq()
    FORMAT = pyaudio.paInt16  # Audio format
    CHANNELS = 1  # Mono audio
    RATE = 16000  # Sampling rate
    CHUNK = 1024  # Size of each audio chunk
    RECORD_SECONDS = 3  # Duration of the recording (in seconds)

    p = pyaudio.PyAudio()

    stream = p.open(
        format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
    )

    engine.say("Do you want to schedule a zoom meet with this doctor?")
    engine.runAndWait()
    print("Listening [yes / no]")

    frames = []
    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished Listening.")

    stream.stop_stream()
    stream.close()
    p.terminate()

    temp_filename = "choice.mp3"

    with wave.open(temp_filename, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b"".join(frames))

    client = Groq()
    filename = os.path.dirname(__file__) + "/choice.mp3"

    with open(filename, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(filename, file.read()),
            model="distil-whisper-large-v3-en",
            response_format="verbose_json",
        )
    response = transcription.text
    print("Audio: ", response)

    model = genai.GenerativeModel("gemini-2.0-flash")
    prompt = f"Detect whether the user is saying Yes or No {response}. Don't add any other words"
    output = model.generate_content(prompt)
    ans = output.text.strip()

    if ans == "Yes":
        prompt = f"""
        Extract the doctor's email from the following text:
        "{response1}"

        Then return the email.
        """
        response = model.generate_content(prompt)
        email_fetched = response.text.strip()

        prompt = f"""
        Extract the doctor's name from the following text:
        "{response1}"

        Then return the email.
        """
        response = model.generate_content(prompt)
        name_fetched = response.text.strip()
        receiver_email = email_fetched
        from groq import Groq

        client = Groq()
        FORMAT = pyaudio.paInt16  # Audio format
        CHANNELS = 1  # Mono audio
        RATE = 16000  # Sampling rate
        CHUNK = 1024  # Size of each audio chunk
        RECORD_SECONDS = 5  # Duration of the recording (in seconds)
        p = pyaudio.PyAudio()
        stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )
        engine.say("What is your name?")
        engine.runAndWait()
        print("What is your name?")
        print("Listening...")

        frames = []

        for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            frames.append(data)

        print("Finished listening.")
        stream.stop_stream()
        stream.close()
        p.terminate()

        temp_filename = "name.mp3"

        with wave.open(temp_filename, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(p.get_sample_size(FORMAT))
            wf.setframerate(RATE)
            wf.writeframes(b"".join(frames))

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

        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"Fetch just the Name (ex: Abraham) to the user from: {response}. Don't add any other words"
        output = model.generate_content(prompt)
        nam = output.text.strip()

        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000
        CHUNK = 1024
        RECORD_SECONDS = 5
        p = pyaudio.PyAudio()

        stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )

        engine.say(
            f"Alright {nam}, what is your favourable Date and Time? [Speak in this format: 26 March 8 AM]"
        )
        engine.runAndWait()
        print(f"Alright {nam},what is your favourable Date and Time ?")
        print("Listening...")

        frames = []
        for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            frames.append(data)

        print("Finished Listening.")
        stream.stop_stream()
        stream.close()
        p.terminate()
        temp_filename = "time.mp3"

        with wave.open(temp_filename, "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(p.get_sample_size(FORMAT))
            wf.setframerate(RATE)
            wf.writeframes(b"".join(frames))

        client = Groq()
        filename = os.path.dirname(__file__) + "/time.mp3"

        with open(filename, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(filename, file.read()),
                model="distil-whisper-large-v3-en",
                response_format="verbose_json",
            )
            response = transcription.text
            print("Audio: ", response)

        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"Fetch just the Date (ex: March 26) the user is looking for in the query {response}. Don't add any other words"
        output = model.generate_content(prompt)
        date = output.text.strip()

        prompt = f"Fetch just the Time (in this format, for ex: 8 A.M) the user is looking for in the query {response}.Don't add any other words"
        output = model.generate_content(prompt)
        time_utc = output.text.strip()

        from phi.model.groq import Groq

        class CustomZoomTool(ZoomTool):
            def __init__(
                self,
                account_id: Optional[str] = None,
                client_id: Optional[str] = None,
                client_secret: Optional[str] = None,
                name: str = "zoom_tool",
            ):
                super().__init__(
                    account_id=account_id,
                    client_id=client_id,
                    client_secret=client_secret,
                    name=name,
                )
                self.token_url = "https://zoom.us/oauth/token"
                self.access_token = None
                self.token_expires_at = 0

            def get_access_token(self) -> str:
                if self.access_token and time.time() < self.token_expires_at:
                    return str(self.access_token)

                headers = {"Content-Type": "application/x-www-form-urlencoded"}
                data = {
                    "grant_type": "account_credentials",
                    "account_id": self.account_id,
                }

                try:
                    response = requests.post(
                        self.token_url,
                        headers=headers,
                        data=data,
                        auth=(self.client_id, self.client_secret),
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

        zoom_tool = CustomZoomTool(
            account_id=ACCOUNT_ID, client_id=CLIENT_ID, client_secret=CLIENT_SECRET
        )
        email_tool = EmailTools(
            receiver_email=receiver_email,
            sender_email=sender_email,
            sender_name=sender_name,
            sender_passkey=sender_passkey,
        )

        engine.say(
            f"Okay, I am scheduling your appointment with {name_fetched} on {date} at {time_utc}"
        )
        engine.runAndWait()
        agent = Agent(
            model=Groq(id="llama3-70b-8192"),
            tools=[
                zoom_tool,
            ],
            show_tool_calls=False,
            markdown=True,
            instructions=[
                "You are an assistant that can both schedule Zoom meetings",
                "After scheduling, you provide the meeting ID and meeting URL",
            ],
        )
        response2: RunResponse = agent.run(
            f"Schedule a Zoom call with {name_fetched} on {date}, 2025, at {time_utc} UTC for 30 minutes."
        )

        prompt = f"""
        Extract the meeting ID from the following text:
        "{response2}"

        Then return the email.
        """
        response = model.generate_content(prompt)
        meet_id = response.text.strip()

        prompt = f"""
        Extract the meeting URL from the following text:
        "{response2}"

        Then return the email.
        """
        response = model.generate_content(prompt)
        meet_URL = response.text.strip()

        agent = Agent(
            model=Groq(id="llama3-70b-8192"),
            tools=[email_tool],
            show_tool_calls=False,
            markdown=True,
            instructions=[
                "You are an assistant that sends email of a fixed zoom meeting to a doctor",
                "The email should be of this format: ",
                f"""Dear Dr. {name_fetched},

Your patient {nam} has scheduled a consultation appointment with you for:

Date: {date}
Time: {time_utc} IST

Meeting Details:
- Meeting ID: {meet_id}
- Join via: {meet_URL}

Please access the video consultation using the link above at the scheduled time.

Thank you for your continued support.

Warm regards,
Medicare Team
            """,
                "Don't add any extra lines and do not remove anything",
            ],
        )

        agent.print_response(
            f"Sent an email to {name_fetched} informing him that Mr/Mrs {nam} has booked a video consultation with him/her on {date} at {time_utc} IST. The meeting link is {meet_URL} and meeting ID is {meet_id}"
        )
        engine.say(f"Your appointment has been scheduled {nam}. Here are the details:")
        engine.runAndWait()
    else:
        pass
