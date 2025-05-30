"use client"; // Ensures that the component uses client-side rendering

const AboutUs = () => {
  return (
    <div className="bg-black text-white py-12 ">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-primary-500">About Us</h1>
          <p className="mt-2 text-xl text-gray-400">
            Learn more about our company and how to get in touch with us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Company Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-500">
              Our Company
            </h2>
            <p className="text-lg text-gray-300">
              Welcome to Zoland Store! We are a dedicated team focused on
              bringing you the best quality products with a personalized
              shopping experience.
            </p>
            <p className="text-lg text-gray-300">
              Our mission is to provide our customers with top-notch products
              and exceptional customer service. We operate out of Aizawl,
              Mizoram, and we take pride in offering fast and reliable delivery
              to our valued customers.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-500">
              Contact Information
            </h2>
            <p className="text-lg text-gray-300">
              You may contact us using the information below:
            </p>
            <ul className="space-y-2 text-lg text-gray-300">
              <li>
                <strong>Merchant Legal entity name:</strong> Ht Liana Hrangate
              </li>
              <li>
                <strong>Registered Address:</strong> Y 80/B Mission Vengthlang
                Aizawl, MIZORAM 796001
              </li>

              <li>
                <strong>Telephone No:</strong> +91 7085414571
              </li>
              <li>
                <strong>E-Mail ID:</strong>{" "}
                <a
                  href="mailto:zolandstore23@gmail.com"
                  className="text-primary-500"
                >
                  zolandstore23@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
