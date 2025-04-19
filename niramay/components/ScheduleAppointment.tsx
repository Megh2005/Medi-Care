/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Calendar, Check } from "lucide-react";
import { useState } from "react";

const ScheduleAppointment = ({ doctor }: { doctor: any }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSchedule = async () => {
    setShowConfirmation(true);
  };

  return (
    <div className="md:col-span-1">
      <div className="neo-brutalist-card p-6 sticky top-24">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center">
          <Calendar className="mr-2 text-primary" size={24} />
          Schedule Appointment
        </h2>

        {!showConfirmation ? (
          <>
            <button
              onClick={handleSchedule}
              className="neo-brutalist-button w-full"
            >
              Schedule Meeting
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Appointment Confirmed!</h3>
            <p className="mb-4">
              Your appointment with {doctor.name} is scheduled.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              We&apos;ve sent a confirmation to your email. You&apos;ll receive
              a reminder 24 hours before your appointment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleAppointment;
