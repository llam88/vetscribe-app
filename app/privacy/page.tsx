import { MainNavigation } from "@/components/main-navigation"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()} - Force deployed</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Account Information:</strong> When you create an account, we collect your email address, 
                full name, and veterinary practice name to provide our services.
              </p>
              <p>
                <strong>Veterinary Data:</strong> We collect and process veterinary appointment data, patient information, 
                audio recordings, and generated documentation solely to provide transcription and documentation services.
              </p>
              <p>
                <strong>Usage Data:</strong> We collect information about how you use VetScribe to improve our services, 
                including feature usage and performance metrics.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide AI-powered transcription and SOAP note generation services</li>
                <li>Generate professional veterinary documentation and client communications</li>
                <li>Maintain and improve our platform functionality</li>
                <li>Provide customer support and technical assistance</li>
                <li>Send important service updates and notifications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security & HIPAA Compliance</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Veterinary Data Protection:</strong> We understand the sensitive nature of veterinary records 
                and implement enterprise-grade security measures to protect all patient and practice data.
              </p>
              <p>
                <strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard 
                encryption protocols.
              </p>
              <p>
                <strong>Access Controls:</strong> Your data is only accessible to you and your authorized team members. 
                We never share veterinary data with third parties.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Authentication:</strong> We use Supabase for secure authentication and Google/Microsoft OAuth 
                for social login options.
              </p>
              <p>
                <strong>AI Processing:</strong> We use OpenAI services for transcription and documentation generation. 
                All data is processed securely and not used for training.
              </p>
              <p>
                <strong>Email Services:</strong> When configured, we integrate with email providers (Resend, SendGrid) 
                using your own API keys for client communications.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, update, or delete your account and data at any time</li>
                <li>Export your veterinary data in standard formats</li>
                <li>Request deletion of all your data from our systems</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@vetscribe.com<br/>
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new Privacy Policy on this page and updating 
                the "Last updated" date.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
