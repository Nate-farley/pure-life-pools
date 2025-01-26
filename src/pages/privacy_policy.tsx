import React from 'react';
import { Shield, Lock, Eye, Database, Bell, UserCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: January 26, 2025</p>
        </div>

        <div className="space-y-12">
          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Collection</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
             
All the above categories exclude text messaging originator optin data and consent; this information will not be shared with any third parties.

We will not share your opt-in to an SMS campaign with any third party for purposes unrelated to providing you with the services of that campaign. We may share your Personal Data, including your SMS opt-in or consent status, with third parties that help us provide our messaging services, including but not limited to platform providers, phone companies, and

any other vendors who assist us in the delivery of text messages.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information. This includes encryption, secure servers, and regular security assessments to prevent unauthorized access.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <Eye className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Usage</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We use your information to provide and improve our services, send updates, and maintain security. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <Database className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Storage</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored on secure servers located in ISO-certified data centers. We retain your information only for as long as necessary to provide our services and comply with legal obligations.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Updates to Policy</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the date at the top.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6">
              <UserCheck className="w-6 h-6 text-plp-blue" />
              <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information. Contact us at privacy@example.com for any privacy-related concerns or requests.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500">
          <p>For questions about our privacy policy, please contact us at privacy@example.com</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;