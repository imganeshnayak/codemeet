import Issue from "../models/Issue";
import { Request, Response } from "express";

export const seedIssues = async (req: Request, res: Response) => {
  try {
    const count = await Issue.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: "Issues already exist" });
    }
    const issues = [
      {
        title: "Overflowing Garbage Bins",
        description: "Public garbage bins near the park are overflowing and attracting pests.",
        category: "garbage",
        priority: "medium",
        status: "pending",
        location: { type: "Point", coordinates: [77.5946, 12.9716], address: "Central Park entrance" },
        images: [],
        reportedBy: null,
        votes: 32,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-11"),
        updatedAt: new Date("2025-10-11")
      },
      {
        title: "Pothole on Highway 101",
        description: "Large pothole on Highway 101 northbound lane causing vehicle damage.",
        category: "pothole",
        priority: "high",
        status: "pending",
        location: { type: "Point", coordinates: [77.5947, 12.9720], address: "Highway 101, Mile 15" },
        images: [],
        reportedBy: null,
        votes: 45,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-10"),
        updatedAt: new Date("2025-10-10")
      },
      {
        title: "Broken Streetlight on Oak Avenue",
        description: "Multiple streetlights are not working, making the area unsafe at night.",
        category: "streetlight",
        priority: "medium",
        status: "in-progress",
        location: { type: "Point", coordinates: [77.5950, 12.9730], address: "800 Oak Avenue" },
        images: [],
        reportedBy: null,
        votes: 15,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-10"),
        updatedAt: new Date("2025-10-10")
      },
      {
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues",
        category: "pothole",
        priority: "high",
        status: "in-progress",
        location: { type: "Point", coordinates: [77.5960, 12.9740], address: "123 Main St" },
        images: [],
        reportedBy: null,
        votes: 20,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-10"),
        updatedAt: new Date("2025-10-10")
      },
      {
        title: "Streetlight Not Working",
        description: "Streetlight has been out for 3 days",
        category: "streetlight",
        priority: "medium",
        status: "pending",
        location: { type: "Point", coordinates: [77.5970, 12.9750], address: "456 Oak Ave" },
        images: [],
        reportedBy: null,
        votes: 10,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-11"),
        updatedAt: new Date("2025-10-11")
      },
      {
        title: "Graffiti Removal Needed",
        description: "Vandalism on public building",
        category: "graffiti",
        priority: "low",
        status: "resolved",
        location: { type: "Point", coordinates: [77.5980, 12.9760], address: "789 Park Blvd" },
        images: [],
        reportedBy: null,
        votes: 5,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-09"),
        updatedAt: new Date("2025-10-09")
      },
      {
        title: "Drainage Problem on River Road",
        description: "Poor drainage causing water accumulation during rain, making road impassable.",
        category: "drainage",
        priority: "high",
        status: "pending",
        location: { type: "Point", coordinates: [77.5990, 12.9770], address: "River Road near Bridge" },
        images: [],
        reportedBy: null,
        votes: 28,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-09"),
        updatedAt: new Date("2025-10-09")
      },
      {
        title: "Graffiti on Community Center",
        description: "Vandalism on the exterior walls of the community center needs removal.",
        category: "graffiti",
        priority: "low",
        status: "resolved",
        location: { type: "Point", coordinates: [77.6000, 12.9780], address: "123 Community Drive" },
        images: [],
        reportedBy: null,
        votes: 8,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-08"),
        updatedAt: new Date("2025-10-08")
      },
      {
        title: "Damaged Sidewalk on Pine Street",
        description: "Cracked and uneven sidewalk poses tripping hazard for pedestrians.",
        category: "other",
        priority: "medium",
        status: "pending",
        location: { type: "Point", coordinates: [77.6010, 12.9790], address: "567 Pine Street" },
        images: [],
        reportedBy: null,
        votes: 12,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-08"),
        updatedAt: new Date("2025-10-08")
      },
      {
        title: "Traffic Signal Malfunction",
        description: "Traffic light stuck on red at Main and 5th intersection causing congestion.",
        category: "traffic",
        priority: "high",
        status: "in-progress",
        location: { type: "Point", coordinates: [77.6020, 12.9800], address: "Main St & 5th Ave" },
        images: [],
        reportedBy: null,
        votes: 18,
        votedBy: [],
        comments: [],
        createdAt: new Date("2025-10-11"),
        updatedAt: new Date("2025-10-11")
      }
    ];
    await Issue.insertMany(issues);
    res.json({ success: true, message: "Seeded 10 issues" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to seed issues", error: err });
  }
};
