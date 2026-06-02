export const projects = [
  {
    id: "1",
    name: "Modern Villa",
    client: "Alice Johnson",
    clientId: "1",
    location: "Beverly Hills, CA",
    startDate: "2024-01-15",
    expectedCompletion: "2024-12-15",
    status: "In Progress",
    progress: 45,
    budget: "$850,000",
    received: "$350,000",
    pending: "$500,000",
    supervisorId: "s1",
    workerIds: ["1", "4"],
    stages: [
      { name: "Layout", status: "Completed" },
      { name: "Excavation", status: "Completed" },
      { name: "Foundation", status: "Completed" },
      { name: "Structure", status: "In Progress" },
      { name: "Brick Work", status: "Pending" },
      { name: "Plumbing", status: "Pending" },
      { name: "Electrical", status: "Pending" },
      { name: "Plaster", status: "Pending" },
      { name: "Flooring", status: "Pending" },
      { name: "Painting", status: "Pending" },
      { name: "Interior", status: "Pending" },
      { name: "Final Handover", status: "Pending" },
    ],
  },
  {
    id: "2",
    name: "City Heights Apartment",
    client: "Bob Smith",
    clientId: "2",
    location: "Downtown Seattle, WA",
    startDate: "2023-11-20",
    expectedCompletion: "2024-08-10",
    status: "In Progress",
    progress: 75,
    budget: "$1,200,000",
    received: "$900,000",
    pending: "$300,000",
    supervisorId: "s1",
    workerIds: ["2", "3"],
    stages: [
      { name: "Layout", status: "Completed" },
      { name: "Excavation", status: "Completed" },
      { name: "Foundation", status: "Completed" },
      { name: "Structure", status: "Completed" },
      { name: "Brick Work", status: "Completed" },
      { name: "Plumbing", status: "Completed" },
      { name: "Electrical", status: "Completed" },
      { name: "Plaster", status: "In Progress" },
      { name: "Flooring", status: "Pending" },
      { name: "Painting", status: "Pending" },
      { name: "Interior", status: "Pending" },
      { name: "Final Handover", status: "Pending" },
    ],
  },
  {
    id: "3",
    name: "Lakeview Residence",
    client: "Charlie Brown",
    clientId: "3",
    location: "Austin, TX",
    startDate: "2024-03-01",
    expectedCompletion: "2025-01-20",
    status: "Planned",
    progress: 10,
    budget: "$650,000",
    received: "$150,000",
    pending: "$500,000",
    supervisorId: "s2",
    workerIds: ["1"],
    stages: [
      { name: "Layout", status: "Completed" },
      { name: "Excavation", status: "In Progress" },
      { name: "Foundation", status: "Pending" },
      { name: "Structure", status: "Pending" },
      { name: "Brick Work", status: "Pending" },
      { name: "Plumbing", status: "Pending" },
      { name: "Electrical", status: "Pending" },
      { name: "Plaster", status: "Pending" },
      { name: "Flooring", status: "Pending" },
      { name: "Painting", status: "Pending" },
      { name: "Interior", status: "Pending" },
      { name: "Final Handover", status: "Pending" },
    ],
  },
];

export const tasks = [
  { id: "1", name: "Foundation Inspection", project: "Modern Villa", stage: "Foundation", officeTeam: "Ruth Designer", officeStatus: "Pending", siteTeam: "John Doe", siteStatus: "Pending", deadline: "2024-03-20" },
  { id: "2", name: "Electrical Wiring - Floor 1", project: "City Heights Apartment", stage: "Electrical", officeTeam: "Ali Hassan", officeStatus: "In Progress", siteTeam: "Mike Ross", siteStatus: "In Progress", deadline: "2024-03-18" },
  { id: "3", name: "Plastering - Exterior Wall", project: "City Heights Apartment", stage: "Plaster", officeTeam: "Sarah Lane", officeStatus: "Completed", siteTeam: "Sarah Lane", siteStatus: "Completed", deadline: "2024-03-15" },
  { id: "4", name: "Structure Beam Reinforcement", project: "Modern Villa", stage: "Structure", officeTeam: "Robert Paulson", officeStatus: "In Progress", siteTeam: "Robert Paulson", siteStatus: "In Progress", deadline: "2024-03-22" },
];

export const supervisors = [
  { id: "s1", name: "Mike Ross", type: "Client", phone: "555-2001", email: "mike@archisite.pro", experience: "8 years", assignedProjects: ["1", "2"], joinDate: "2022-03-10" },
  { id: "s2", name: "Priya Sharma", type: "Client", phone: "555-2002", email: "priya@archisite.pro", experience: "5 years", assignedProjects: ["3"], joinDate: "2023-01-15" },
  { id: "s3", name: "David Khan", type: "Client", phone: "555-2003", email: "david@archisite.pro", experience: "10 years", assignedProjects: [], joinDate: "2021-06-20" },
];

export const WORKER_SPECIALIZATIONS = [
  "Mason", "Electrician", "Plumber", "Painter", "Carpenter",
  "Steel Fixer", "Welder", "Tiler", "Plasterer", "Excavator Operator",
  "Crane Operator", "Civil Engineer", "Interior Designer", "Director",
];

export const workers = [
  { id: "1", name: "John Doe", type: "Director", team: "Office", specializations: ["Design", "Planning"], phone: "555-0123", email: "john@archisite.pro", rate: "$150/hour", assignedProjects: ["Modern Villa"], experience: "6 years", joinDate: "2023-02-01", address: "123 Main St, Beverly Hills" },
  { id: "2", name: "Ali Hassan", type: "Designer", team: "Office", specializations: ["Interior", "Electrical Plan"], phone: "555-0124", email: "ali@archisite.pro", rate: "$200/hour", assignedProjects: ["City Heights Apartment"], experience: "9 years", joinDate: "2022-08-15", address: "45 Oak Ave, Seattle" },
  { id: "3", name: "Sarah Lane", type: "Painter", team: "Site", specializations: ["Painting", "Tiling"], phone: "555-0125", email: "sarah@archisite.pro", rate: "$120/day", assignedProjects: ["City Heights Apartment"], experience: "4 years", joinDate: "2023-05-10", address: "78 Pine Rd, Seattle" },
  { id: "4", name: "Robert Paulson", type: "Plumber", team: "Site", specializations: ["Plumbing", "Steel Fixing"], phone: "555-0126", email: "robert@archisite.pro", rate: "$180/day", assignedProjects: ["Modern Villa"], experience: "7 years", joinDate: "2022-11-20", address: "90 Elm St, Beverly Hills" },
];

export const clients = [
  { id: "1", name: "Alice Johnson", phone: "555-1001", email: "alice@example.com", projects: ["Modern Villa"], paymentStatus: "Paid" },
  { id: "2", name: "Bob Smith", phone: "555-1002", email: "bob@example.com", projects: ["City Heights Apartment"], paymentStatus: "Pending" },
  { id: "3", name: "Charlie Brown", phone: "555-1003", email: "charlie@example.com", projects: ["Lakeview Residence"], paymentStatus: "Overdue" },
];

export const siteUpdates = [
  { id: "1", project: "Modern Villa", update: "Foundation completed, moving to structure.", date: "2024-03-12", timestamp: "2024-03-12 10:30 AM", user: "Mike Ross", progress: 40, photos: 4 },
  { id: "2", project: "City Heights Apartment", update: "Plastering in progress on floor 2.", date: "2024-03-13", timestamp: "2024-03-13 02:15 PM", user: "Ali Hassan", progress: 75, photos: 6 },
  { id: "3", project: "Lakeview Residence", update: "Excavation started today.", date: "2024-03-14", timestamp: "2024-03-14 09:00 AM", user: "John Doe", progress: 10, photos: 2 },
];

export const messages = [
  { id: "1", from: "Alice Johnson", text: "When can we expect the next site visit?", date: "10:30 AM", unread: true },
  { id: "2", from: "Bob Smith", text: "Please share the updated plumbing layout.", date: "Yesterday", unread: false },
];

export const calendarEvents = [
  { date: "2024-03-20", title: "Plumbing Start - Modern Villa", type: "Plumbing" },
  { date: "2024-03-25", title: "Electrical Start - City Heights", type: "Electrical" },
  { date: "2024-04-10", title: "Plaster Start - Lakeview", type: "Plaster" },
];

export const payments = [
  { id: "1", project: "Modern Villa", client: "Alice Johnson", milestone: "Foundation Payment", amount: "$50,000", status: "Paid", date: "2024-02-10" },
  { id: "2", project: "Modern Villa", client: "Alice Johnson", milestone: "Structure Payment", amount: "$75,000", status: "Pending", date: "2024-04-15" },
  { id: "3", project: "City Heights Apartment", client: "Bob Smith", milestone: "Initial Payment", amount: "$100,000", status: "Paid", date: "2023-12-01" },
];
