from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import google.generativeai as genai
from typing import List, Dict, Optional
import logging
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
from bson.decimal128 import Decimal128
import os
from dotenv import load_dotenv

from colorlog import ColoredFormatter

# Create color formatter with green INFO
formatter = ColoredFormatter(
    "%(log_color)s%(levelname)-8s: %(message)s",
    log_colors={
        "DEBUG": "cyan",
        "INFO": "green",
        "WARNING": "yellow",
        "ERROR": "red",
        "CRITICAL": "red,bg_white",
    },
)

# Set up handler with formatter
handler = logging.StreamHandler()
handler.setFormatter(formatter)

# Set up logger
logger = logging.getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Disable propagation to avoid double logs
logger.propagate = False

# App initialization
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")
client = MongoClient(MONGO_URI)
db = client["doctorfinder"]
collection = db["doctors"]


class HealthDescription(BaseModel):
    description: str


class DoctorMatchResult(BaseModel):
    id: str
    name: str
    experience: str
    description: str
    specialist: str
    degree: str
    rating: float
    reasoning: str
    email: str
    phone: str
    location: str
    languages: List[str]
    availableDays: List[str]
    availableTimeSlots: List[str]


def get_doctors() -> List[Dict]:
    try:
        return list(collection.find({}))
    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        return []


def format_doctor_data(doctors: List[Dict]) -> str:
    return "\n".join(
        [
            f"Doctor {i+1}:\n"
            f"Name: {doctor['name']}\n"
            f"Experience: {doctor['experience']}\n"
            f"Specialist: {doctor['specialist']}\n"
            f"Description: {doctor['description']}\n"
            f"Degree: {doctor['degree']}\n"
            f"Languages: {', '.join(doctor['languages'])}\n"
            f"Specializations: {', '.join(doctor['specializations'])}\n"
            f"Rating: {doctor['user_rating']}\n"
            for i, doctor in enumerate(doctors)
        ]
    )


def generate_ai_prompt(health_description: str, doctors_text: str) -> str:
    return f"""
    Task: As a medical consultant, analyze the health condition description and recommend the most suitable doctor from the available options.

    Health Condition Description:
    {health_description}

    Available Doctors:
    {doctors_text}

    Please provide:
    1. The name of the most suitable doctor
    2. A brief but specific explanation (2-3 sentences) of why this doctor is the best match for this health condition
    3. Start your response with \"Recommended Doctor:\" followed by the name, then \"Reasoning:\" followed by your explanation

    Base your recommendation on:
    - Relevant specialization for the specific health condition
    - Years of experience
    - Educational background and degrees
    - Track record and rating
    - Match between doctor's specialization and patient's needs
    """


def find_best_doctor(health_description: str) -> Optional[DoctorMatchResult]:
    doctors = get_doctors()
    if not doctors:
        raise HTTPException(status_code=404, detail="No doctors found in the database.")

    doctors_text = format_doctor_data(doctors)
    prompt = generate_ai_prompt(health_description, doctors_text)

    response = model.generate_content(prompt)
    if not response.text.strip():
        raise HTTPException(status_code=500, detail="Empty response from AI model.")

    try:
        response_text = response.text.strip()
        recommended_doctor_name = (
            response_text.split("Recommended Doctor:")[1].split("Reasoning:")[0].strip()
        )
        reasoning = response_text.split("Reasoning:")[1].strip()

        doctor_doc = collection.find_one({"name": recommended_doctor_name})
        if not doctor_doc:
            raise HTTPException(
                status_code=404, detail="Recommended doctor not found in database."
            )

        rating = doctor_doc["user_rating"]
        if isinstance(rating, Decimal128):
            rating = float(str(rating))
        else:
            try:
                rating = float(rating)
            except (ValueError, TypeError):
                rating = 0.0

        return DoctorMatchResult(
            id=str(doctor_doc["_id"]),
            name=doctor_doc["name"],
            experience=doctor_doc["experience"],
            description=doctor_doc["description"],
            specialist=doctor_doc["specialist"],
            degree=doctor_doc["degree"],
            rating=rating,
            reasoning=reasoning,
            email=doctor_doc["email"],
            phone=doctor_doc["phone"],
            location=doctor_doc["location"],
            languages=doctor_doc["languages"],
            availableDays=doctor_doc["availableDays"],
            availableTimeSlots=doctor_doc["availableTimeSlots"],
        )
    except Exception as e:
        logger.error(f"Error processing response: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error processing AI response: {str(e)}"
        )


@app.get("/")
def root():
    return {"message": "Welcome to the Doctor Matching API 👨‍⚕️👩‍⚕️"}


@app.post("/match-doctor", response_model=DoctorMatchResult)
def match_doctor(case: HealthDescription):
    if len(case.description.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Please provide a more detailed health condition description (at least 20 characters).",
        )
    

    logger.warning(f"Received health description: {case.description.strip()}")
    logger.warning("Finding the best doctor...")
    logger.info("Doctor matching completed.")
    return find_best_doctor(case.description)


# uvicorn app:app --reload
