import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart, Shield, Clock, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Your Health, <span className="text-primary">Our Priority</span>
            </h1>
            <p className="text-xl mb-8">
              Modern healthcare solutions with a personal touch. Connect with top doctors, get personalized diet plans,
              and manage your prescriptions all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/prescription" className="neo-brutalist-button flex items-center gap-2">
                Scan Prescription <ArrowRight size={20} />
              </Link>
              <Link href="/doctor-search" className="neo-brutalist-button bg-black text-white flex items-center gap-2">
                Find a Doctor <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] neo-brutalist-card p-4">
            <Image
              src="/hero.png"
              alt="Doctor with patient"
              fill
              className="object-cover p-2"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#f8f5f2]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Why Choose <span className="text-primary">MediCare</span>?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="h-10 w-10 text-primary" />,
                title: "Patient-Centered Care",
                description: "We put your needs first with personalized healthcare solutions.",
              },
              {
                icon: <Shield className="h-10 w-10 text-primary" />,
                title: "Trusted Professionals",
                description: "Connect with verified and experienced healthcare providers.",
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "24/7 Availability",
                description: "Access healthcare services anytime, anywhere.",
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Comprehensive Care",
                description: "From consultations to diet plans, we've got you covered.",
              },
            ].map((feature, index) => (
              <div key={index} className="neo-brutalist-card p-6 flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to take control of your health?</h2>
          <p className="text-xl mb-8 text-white max-w-2xl mx-auto">
            Join thousands of satisfied patients who have transformed their healthcare experience with MediCare.
          </p>
          <Link href="/register" className="neo-brutalist-button bg-white text-primary">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  )
}
