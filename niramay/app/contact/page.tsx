"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Send, CheckCircle, Loader2, Phone, MapPin } from "lucide-react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase/init"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing again
    if (formError) setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      // Input validation
      if (!formData.name || !formData.email || !formData.message || !formData.subject) {
        setFormError("Please fill out all required fields")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setFormError("Please enter a valid email address")
        return
      }

      // Show loading state
      setIsSubmitting(true)

      // Add document to Firestore
      await addDoc(collection(db, "contactSubmissions"), {
        ...formData,
        createdAt: serverTimestamp(),
      })

      // Reset form data
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })

      // Show success state
      setFormSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError("There was an error submitting your form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewMessage = () => {
    setFormSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Have questions or need assistance? We&apos;re here to help. Reach out to our team for prompt and helpful support.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="neo-brutalist-card p-8">
              {!formSubmitted ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">Send Us a Message</h2>

                  {formError && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 text-red-700 rounded">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block font-bold mb-2">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="neo-brutalist-input w-full"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block font-bold mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="neo-brutalist-input w-full"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block font-bold mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="neo-brutalist-input w-full"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block font-bold mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          className="neo-brutalist-input w-full"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        >
                          <option value="">Select a subject</option>
                          <option value="appointment">Appointment Inquiry</option>
                          <option value="billing">Billing Question</option>
                          <option value="technical">Technical Support</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block font-bold mb-2">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        className="neo-brutalist-input w-full resize-none"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className={`neo-brutalist-button flex items-center justify-center gap-2 w-full ${isSubmitting ? 'opacity-70' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Message Sent Successfully!</h2>
                  <p className="mb-8">
                    Thank you for reaching out. We&apos;ve received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={handleNewMessage}
                    className="neo-brutalist-button bg-white text-black border-2 border-black"
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="neo-brutalist-card p-8">
                <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="text-primary mr-4 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">Email Address</h3>
                      <p>info@medicare.com</p>
                      <p className="text-sm text-gray-600">We&apos;ll respond as soon as possible</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="text-primary mr-4 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">Phone Support</h3>
                      <p>+1 (800) 555-1234</p>
                      <p className="text-sm text-gray-600">Available 24/7 for urgent matters</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="text-primary mr-4 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">Office Location</h3>
                      <p>123 Healthcare Avenue</p>
                      <p>Medical District, CA 90210</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="neo-brutalist-card p-8">
                <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    {
                      question: "How can I access my medical records?",
                      answer:
                        "You can access your medical records through our patient portal. If you need assistance, please contact our support team.",
                    },
                    {
                      question: "What should I do in case of a medical emergency?",
                      answer:
                        "In a medical emergency, call 108 or rush to the nearest hospital immediately. Do not rely on online or AI services—urgent care is required."
                    },
                    {
                      question: "How do I schedule an appointment?",
                      answer:
                        "You can schedule an appointment through our website, mobile app, or by calling our appointment line at +1 (800) 555-5678."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="neo-brutalist-card p-4 bg-white border-2 border-black">
                      <h3 className="font-bold mb-2">{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}