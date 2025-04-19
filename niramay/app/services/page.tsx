import Link from "next/link"
// import Image from "next/image"
import { ArrowRight, Stethoscope, Pill, Apple, FileText } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: <Stethoscope size={48} className="text-primary" />,
      title: "Online Consultation",
      description:
        "Connect with top doctors from the comfort of your home. Get expert medical advice through secure video consultations.",
      link: "/doctor-search",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: <Pill size={48} className="text-primary" />,
      title: "Prescription Analysis",
      description:
        "Upload your prescription and get detailed information about your medications, potential side effects, and alternatives.",
      link: "/prescription",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: <Apple size={48} className="text-primary" />,
      title: "Personalized Diet Plans",
      description:
        "Receive customized nutrition advice based on your health goals, medical conditions, and personal preferences.",
      link: "/diet-coach",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: <FileText size={48} className="text-primary" />,
      title: "Health Records Management",
      description: "Securely store and access your medical records, test results, and health history all in one place.",
      link: "/chat",
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive healthcare solutions designed to meet your needs. From online consultations to personalized
            diet plans, we&apos;ve got you covered.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div key={index} className="neo-brutalist-card overflow-hidden">
                
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                  <p className="mb-6">{service.description}</p>
                  <Link href={service.link} className="neo-brutalist-button inline-flex items-center gap-2">
                    Learn More <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white border-y-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What Our Patients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                quote:
                  "The online consultation saved me so much time. The doctor was professional and thorough, and I got my prescription delivered the same day!",
              },
              {
                name: "Michael Chen",
                role: "Patient",
                quote:
                  "The diet coach feature has transformed my health. I've lost weight and my energy levels have improved dramatically. Highly recommend!",
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                quote:
                  "Being able to scan my prescription and get detailed information about my medications has been incredibly helpful. No more confusion about dosages!",
              },
            ].map((testimonial, index) => (
              <div key={index} className="neo-brutalist-card p-6">
                <div className="flex flex-col h-full">
                  <blockquote className="text-lg italic mb-6 flex-grow">{testimonial.quote}</blockquote>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience better healthcare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied patients who have transformed their healthcare experience with MediCare.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="neo-brutalist-button">
              Sign Up Now
            </Link>
            <Link href="/contact" className="neo-brutalist-button bg-black text-white">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
