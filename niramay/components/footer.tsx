import Link from "next/link"
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-black text-xl mb-4 flex items-center">
              <span className="text-primary">MEDI</span>CARE
            </h3>
            <p className="mb-4">
              Your trusted healthcare partner, providing modern medical solutions with a personal touch.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="p-2 border-2 border-black hover:bg-gray-100">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 border-2 border-black hover:bg-gray-100">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 border-2 border-black hover:bg-gray-100">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2 border-2 border-black hover:bg-gray-100">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 border-black pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctor-search" className="hover:text-primary">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 border-black pb-2">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="hover:text-primary">
                  Online Consultation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary">
                  Health Checkups
                </Link>
              </li>
              <li>
                <Link href="/diet-coach" className="hover:text-primary">
                  Diet Planning
                </Link>
              </li>
              <li>
                <Link href="/prescription" className="hover:text-primary">
                  Prescription Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 border-black pb-2">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 mt-1 flex-shrink-0" size={18} />
                <span>123 Medical Avenue, Healthcare City, HC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 flex-shrink-0" size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 flex-shrink-0" size={18} />
                <span>info@medicare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t-2 border-black text-center">
          <p>&copy; {new Date().getFullYear()} MediCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
