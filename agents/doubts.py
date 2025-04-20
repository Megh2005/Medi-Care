import os
from dotenv import load_dotenv
from phi.agent import Agent, RunResponse
from phi.model.groq import Groq
from phi.tools.duckduckgo import DuckDuckGo
import google.generativeai as genai
import pyttsx3
import pyaudio
import wave

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load the model
model = genai.GenerativeModel("gemini-2.0-flash")

engine = pyttsx3.init()
engine.setProperty("rate", 180)  # Speed of speech (words per minute)
engine.setProperty("volume", 1.0)  # Volume level (0.0 to 1.0)
choice = "y"

if choice == "y":
    from groq import Groq

    client = Groq()

    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    CHUNK = 1024
    RECORD_SECONDS = 7
    p = pyaudio.PyAudio()
    stream = p.open(
        format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK
    )

    engine.say(
        "Welcome To Medi Care. I am your personal AI based guide. please ask your Query regarding medicines, diseases etc...."
    )
    engine.runAndWait()
    print("Hello, please ask your Query....")
    print("Listening...")

    frames = []

    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("Finished Listening.")
    stream.stop_stream()
    stream.close()
    p.terminate()
    temp_filename = "live_audio1.mp3"

    with wave.open(temp_filename, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b"".join(frames))

    client = Groq()
    filename = os.path.dirname(__file__) + "/live_audio1.mp3"
    with open(filename, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(filename, file.read()),
            model="distil-whisper-large-v3-en",
            response_format="verbose_json",
        )
        query = transcription.text
    print("Audio: ", query)

    from phi.model.groq import Groq

    agent = Agent(
        model=Groq(id="llama3-70b-8192"),
        tools=[DuckDuckGo()],
        show_tool_calls=False,
        markdown=True,
        instructions=[
            """You are a helpful medical assistant that can answer medicine related query. If the user asks about any specific medicines
            then perform websearch to gather information about it related to what the user is asking. Also provide some
            possible adverse effects of that medicine.
            If the user is asking for any other general medical query, answer accordingly.
            Provide a well structured response to the user"""
        ],
    )
    response: RunResponse = agent.run(
        f"Answer this user query by performing web search {query}"
    )
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")
    prompt = f"narrate the following text and return the response in an essay format. use seperate para format instead of bullets and lists. give me plaintext response {response}"
    response = gemini_model.generate_content(prompt)
    response = response.text.strip()
    print(response)
    engine.say(response)
    engine.runAndWait()
else:
    pass
