import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Types
interface Doctor {
  _id: ObjectId;
  name: string;
  experience: string;
  description: string;
  specialist: string;
  degree: string;
  user_rating: number | string | { toString(): string };
  email: string;
  phone: string;
  location: string;
  languages: string[];
  specializations: string[];
  availableDays: string[];
  availableTimeSlots: string[];
}

interface DoctorMatchResult {
  id: string;
  name: string;
  experience: string;
  description: string;
  specialist: string;
  degree: string;
  rating: number;
  reasoning: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  availableDays: string[];
  availableTimeSlots: string[];
}

interface HealthDescription {
  description: string;
}

interface CustomError extends Error {
  statusCode?: number;
}

const logger = {
  info: (msg: string): void => console.log(msg),
  error: (msg: string): void => console.error(msg),
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!MONGO_URI || !GEMINI_API_KEY) {
  throw new Error(
    "Missing required environment variables: MONGO_URI or GEMINI_API_KEY"
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

let client: MongoClient;
let collection: any;

async function connectToDatabase(): Promise<void> {
  try {
    client = new MongoClient(MONGO_URI as string);
    await client.connect();
    const db = client.db("doctorfinder");
    collection = db.collection("doctors");
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
}

async function getDoctors(): Promise<Doctor[]> {
  try {
    return (await collection.find({}).toArray()) as Doctor[];
  } catch (error) {
    logger.error(`Error fetching doctors: ${error}`);
    return [];
  }
}

function formatDoctorData(doctors: Doctor[]): string {
  return doctors
    .map((doctor, i) => {
      return `Doctor ${i + 1}:
Name: ${doctor.name}
Experience: ${doctor.experience}
Specialist: ${doctor.specialist}
Description: ${doctor.description}
Degree: ${doctor.degree}
Languages: ${doctor.languages.join(", ")}
Specializations: ${doctor.specializations.join(", ")}
Rating: ${doctor.user_rating}
`;
    })
    .join("\n");
}

function generateAIPrompt(
  healthDescription: string,
  doctorsText: string
): string {
  return `
    Task: As a medical consultant, analyze the health condition description and recommend the most suitable doctor from the available options.

    Health Condition Description:
    ${healthDescription}

    Available Doctors:
    ${doctorsText}

    Please provide:
    1. The name of the most suitable doctor
    2. A brief but specific explanation (2-3 sentences) of why this doctor is the best match for this health condition
    3. Start your response with "Recommended Doctor:" followed by the name, then "Reasoning:" followed by your explanation
    Base your recommendation on:
    - Relevant specialization for the specific health condition
    - Years of experience
    - Educational background and degrees
    - Track record and rating
    - Match between doctor's specialization and patient's needs
    - Availability and location
    - Language proficiency
    - Any additional relevant factors
  `;
}

async function findBestDoctor(
  healthDescription: string
): Promise<DoctorMatchResult> {
  const doctors = await getDoctors();
  if (!doctors || doctors.length === 0) {
    const error: CustomError = new Error("No doctors found in the database.");
    error.statusCode = 404;
    throw error;
  }

  const doctorsText = formatDoctorData(doctors);
  const prompt = generateAIPrompt(healthDescription, doctorsText);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text().trim();

    if (!responseText) {
      const error: CustomError = new Error("Empty response from AI model.");
      error.statusCode = 500;
      throw error;
    }

    const recommendedDoctorName = responseText
      .split("Recommended Doctor:")[1]
      .split("Reasoning:")[0]
      .trim();
    const reasoning = responseText.split("Reasoning:")[1].trim();

    const doctorDoc = await collection.findOne({ name: recommendedDoctorName });
    if (!doctorDoc) {
      const error: CustomError = new Error(
        "Recommended doctor not found in database."
      );
      error.statusCode = 404;
      throw error;
    }

    let rating = doctorDoc.user_rating;
    if (typeof rating !== "number") {
      try {
        rating = parseFloat(rating.toString());
      } catch (e) {
        rating = 0.0;
      }
    }

    return {
      id: doctorDoc._id.toString(),
      name: doctorDoc.name,
      experience: doctorDoc.experience,
      description: doctorDoc.description,
      specialist: doctorDoc.specialist,
      degree: doctorDoc.degree,
      rating: rating,
      reasoning: reasoning,
      email: doctorDoc.email,
      phone: doctorDoc.phone,
      location: doctorDoc.location,
      languages: doctorDoc.languages,
      availableDays: doctorDoc.availableDays,
      availableTimeSlots: doctorDoc.availableTimeSlots,
    };
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = `Error processing AI response: ${error.message}`;
    }
    throw error;
  }
}

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Chole Ja Bal, Ekhane Kichu Nai 😡🤬" });
});

app.post("/match-doctor", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const { description } = req.body as HealthDescription;

      if (!description || description.trim().length < 20) {
        return res.status(400).json({
          error:
            "Please provide a more detailed health condition description (at least 20 characters).",
        });
      } else {
        console.log("\x1b[32m%s\x1b[0m", "FINDING THE MOST SUITABLE DOCTOR...");
      }

      const result = await findBestDoctor(description);
      res.json(result);
      console.log("\x1b[34m%s\x1b[0m", "GET WELL SOON");
    } catch (error) {
      next(error);
    }
  })();
});

app.get("/doctors", (_req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      console.log("\x1b[32m%s\x1b[0m", "FETCHING ALL DOCTORS...");

      const doctors = await getDoctors();

      if (!doctors || doctors.length === 0) {
        return res.status(404).json({
          error: "No doctors found in the database.",
        });
      }

      const simplifiedDoctors = doctors.map((doctor) => ({
        id: doctor._id.toString(),
        name: doctor.name,
        degree: doctor.degree,
        specialist: doctor.specialist,
        user_rating:
          typeof doctor.user_rating === "number"
            ? doctor.user_rating
            : parseFloat(doctor.user_rating.toString()) || 0.0,
        email: doctor.email,
        phone: doctor.phone,
        location: doctor.location,
        languages: doctor.languages,
        specializations: doctor.specializations,
        availableDays: doctor.availableDays,
      }));

      res.json(simplifiedDoctors);
      console.log("\x1b[34m%s\x1b[0m", "DOCTORS FETCHED SUCCESSFULLY");
    } catch (error) {
      next(error);
    }
  })();
});

app.get("/doctors/:id", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const doctorId = req.params.id;
      if (!doctorId || doctorId.trim() === "") {
        return res.status(400).json({
          error: "Invalid doctor ID provided.",
        });
      }

      console.log(
        "\x1b[32m%s\x1b[0m",
        `FETCHING DOCTOR WITH ID: ${doctorId}...`
      );

      let objectId;
      try {
        objectId = new ObjectId(doctorId);
      } catch (error) {
        return res.status(400).json({
          error: "Invalid ObjectId format.",
        });
      }

      const doctor = await collection.findOne({ _id: objectId });

      if (!doctor) {
        return res.status(404).json({
          error: "Doctor not found.",
        });
      }

      const doctorInfo = {
        id: doctor._id.toString(),
        name: doctor.name,
        experience: doctor.experience,
        description: doctor.description,
        specialist: doctor.specialist,
        degree: doctor.degree,
        user_rating:
          typeof doctor.user_rating === "number"
            ? doctor.user_rating
            : parseFloat(doctor.user_rating.toString()) || 0.0,
        email: doctor.email,
        phone: doctor.phone,
        location: doctor.location,
        languages: doctor.languages,
        specializations: doctor.specializations,
        availableDays: doctor.availableDays,
        availableTimeSlots: doctor.availableTimeSlots,
      };

      res.json(doctorInfo);
      console.log("\x1b[34m%s\x1b[0m", "DOCTOR DETAILS FETCHED SUCCESSFULLY");
    } catch (error) {
      next(error);
    }
  })();
});

app.use(
  (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    logger.error(`Error: ${err.message}`);
    res.status(statusCode).json({ error: err.message });
  }
);

async function startServer(): Promise<void> {
  await connectToDatabase();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
});
