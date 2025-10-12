import mongoose from 'mongoose';

const HomePageSchema = new mongoose.Schema({
  hero: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    cta: { type: String, required: true },
  },
  features: [
    {
      icon: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
    }
  ],
  howItWorks: [
    {
      number: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
    }
  ]
});

const HomePage = mongoose.model('HomePage', HomePageSchema);
export default HomePage;
