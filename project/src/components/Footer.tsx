const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-12 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dd6vlwblr/image/upload/v1768977783/freepik-untitled-project-20260121064146PScQ_xovwf0.png" 
                alt="Leads Finder Logo" 
                className="h-8"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Find people already looking for what you built.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#opensource" className="text-gray-600 hover:text-primary transition-colors">
                  Open Source
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>© 2025 Leads Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
