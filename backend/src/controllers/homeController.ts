import { Request, Response } from 'express';
import HomePage from '../models/HomePage';

// Get home page data
export const getHomePage = async (req: Request, res: Response) => {
  try {
    // For now, just return the first document (singleton)
    const data = await HomePage.findOne();
    if (!data) {
      return res.status(404).json({ success: false, message: 'Home page data not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// (Optional) Seed home page data for first time use
export const seedHomePage = async (req: Request, res: Response) => {
  try {
    const exists = await HomePage.findOne();
    if (exists) {
      return res.status(400).json({ success: false, message: 'Home page data already exists' });
    }
    const data = await HomePage.create({
      hero: {
        title: 'CivicHub: Empower Your Community',
        subtitle: 'A modern platform for reporting, tracking, and resolving civic issues together.',
        cta: 'Get Started',
      },
      features: [
        {
          icon: 'megaphone',
          title: 'Raise Your Voice',
          description: 'Report issues in your neighborhood with just a few clicks.',
        },
        {
          icon: 'activity',
          title: 'Track Progress',
          description: 'Stay updated on the status of your reports and community actions.',
        },
        {
          icon: 'users',
          title: 'Collaborate',
          description: 'Work together with officials and neighbors for real change.',
        },
      ],
      howItWorks: [
        {
          number: '01',
          title: 'Report',
          description: 'Submit issues with rich media, context, and automatic categorization.',
          icon: 'file-text',
        },
        {
          number: '02',
          title: 'Track',
          description: 'Monitor progress in real-time with visual dashboards and smart notifications.',
          icon: 'search',
        },
        {
          number: '03',
          title: 'Resolve',
          description: 'Close the loop with automated workflows and satisfaction tracking.',
          icon: 'check-circle',
        },
      ],
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
