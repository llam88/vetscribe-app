import { MainNavigation } from "@/components/main-navigation"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using VetScribe, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                VetScribe is an AI-powered veterinary transcription and documentation platform designed 
                to help veterinary professionals create accurate, professional medical records efficiently.
              </p>
              <p>Our services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Audio transcription of veterinary appointments</li>
                <li>AI-generated SOAP notes and medical documentation</li>
                <li>Dental chart analysis and generation</li>
                <li>Client communication tools</li>
                <li>Practice management integrations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Professional Use</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Veterinary Professionals Only:</strong> VetScribe is intended for use by licensed 
                veterinary professionals. Users are responsible for ensuring compliance with all applicable 
                veterinary regulations and standards of care.
              </p>
              <p>
                <strong>Clinical Responsibility:</strong> All medical decisions, diagnoses, and treatments 
                remain the sole responsibility of the attending veterinarian. VetScribe provides documentation 
                assistance only and does not provide medical advice.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data and Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Your Data Ownership:</strong> You retain full ownership of all veterinary data, 
                patient records, and practice information entered into VetScribe.
              </p>
              <p>
                <strong>Data Security:</strong> We implement industry-standard security measures to protect 
                your data and comply with applicable healthcare privacy regulations.
              </p>
              <p>
                <strong>Data Portability:</strong> You can export your data at any time and request deletion 
                of your account and associated data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any unlawful purposes</li>
                <li>Share your account credentials with unauthorized users</li>
                <li>Attempt to reverse engineer or copy our technology</li>
                <li>Use the service to process non-veterinary or personal medical data</li>
                <li>Interfere with the security or functionality of the service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                We may perform maintenance, updates, or modifications that temporarily affect service availability.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                VetScribe provides documentation assistance tools. The accuracy and completeness of generated 
                content should always be reviewed by the attending veterinarian. We are not liable for any 
                clinical decisions made based on generated documentation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> legal@vetscribe.com<br/>
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
