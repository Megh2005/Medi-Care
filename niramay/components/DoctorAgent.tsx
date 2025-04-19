"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MicOff, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      await convertAndSendMp3(audioBlob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const convertAndSendMp3 = async (webmBlob: Blob) => {
    if (!ffmpeg.loaded) await ffmpeg.load();

    // Optional: Add logging and progress handlers
    ffmpeg.on("log", ({ message }) => console.log("FFmpeg log:", message));
    ffmpeg.on("progress", ({ progress }) =>
      console.log(`Progress: ${progress * 100}%`)
    );

    // Write input file
    await ffmpeg.writeFile("input.webm", await fetchFile(webmBlob));

    // Run FFmpeg conversion
    await ffmpeg.exec(["-i", "input.webm", "output.mp3"]);

    // Read output file
    const mp3Data = await ffmpeg.readFile("output.mp3");
    const mp3Blob = new Blob([mp3Data], { type: "audio/mpeg" });

    // Prepare and send form data
    const formData = new FormData();
    formData.append("audio", mp3Blob, "recording.mp3");
    console.log(mp3Blob);
    setIsThinking(true);
    /*try {
      const res = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Whisper result:", data);
      // You could update state here
    } catch (err) {
      console.error("Failed to send audio:", err);
    }
    setIsThinking(false);*/
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Bot className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-6 w-80 md:w-96 z-50"
          >
            <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {/* Header */}
              <div className="bg-blue-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-white" />
                  <h3 className="font-bold text-white">Q&A Agent</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="assistant-msg-container h-80 overflow-y-auto p-4 flex flex-col gap-3">
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 mb-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>

                    <div className="p-3 rounded-xl max-w-[80%] bg-white border-2 border-black rounded-tl-none">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: 0.4,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input + mic */}
              <div className="p-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={recording ? stopRecording : startRecording}
                    className={`rounded-full ${
                      recording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {recording ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <p className="text-sm font-light text-gray-500">
                    Use your mic to ask questions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
