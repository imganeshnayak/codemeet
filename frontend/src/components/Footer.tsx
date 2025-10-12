import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Smart Issues</h3>
            <p className="text-sm text-muted-foreground">
              Transform feedback into action with intelligent issue tracking.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary smooth-transition">Features</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Pricing</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Security</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary smooth-transition">About</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Blog</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Careers</a></li>
              <li><a href="#" className="hover:text-primary smooth-transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Smart Issues. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
