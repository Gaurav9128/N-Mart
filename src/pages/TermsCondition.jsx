// TermsConditions.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import FooterComponent from '../components/FooterComponent';

const TermsConditions = () => {
    return (
        <div>
            <Navbar />
            <div style={{ margin: '120px' }}></div>
            <div style={{ padding: '0 75px' }}>
                <b><h2>Terms and Conditions</h2></b>
                <p><b>Welcome to N-mart. We value your privacy and are committed to protecting your personal information.
                    This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website and use our services.</b><br /><br />

                    <b>1. Acceptance of Terms</b><br />

                    By accessing or using [Your Company Name]'s website, you agree to be bound by these Terms and Conditions.<br />

                    <b>User Conduct</b>
                    You agree not to engage in any activity that disrupts or interferes with the functioning of the
                    website or its product.<br /><br />

                    <b>Intellectual Property</b><br />
                    All content and materials available on the website are protected by intellectual property laws.<br /><br />

                    <b>Limitation of Liability</b>

                    [Your Company Name] shall not be liable for any indirect, incidental, special, consequential, or
                    punitive damages arising out of your access to or use of the website.<br /><br />
                    <b>2.3 To Communicate with You</b>

                    We may use your contact information to send you updates, promotional offers, newsletters, and respond to your inquiries.<br /><br />

                    <b>Indemnification</b><br />
                    You agree to indemnify and hold [Your Company Name] harmless from any claims, losses,
                    liabilities, damages, costs, and expenses arising out of or relating to your use of the website.<br /><br />

                    <b>4. Governing Law</b><br />

                    These Terms and Conditions shall be governed by and construed in accordance with the laws of
                    [Your Jurisdiction].<br /><br />
                </p>

           </div>

            <FooterComponent />
        </div>
    );
};

export default TermsConditions;
