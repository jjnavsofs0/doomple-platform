import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Starting database seed...');

  // ========== CREATE USERS ==========

  const superAdminHash = await hashPassword('Doomple@2026');
  const salesUserHash = await hashPassword('Sales@2026');
  const pmUserHash = await hashPassword('PM@2026');
  const financeUserHash = await hashPassword('Finance@2026');

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'sneha@doomple.com' },
    update: {},
    create: {
      email: 'sneha@doomple.com',
      name: 'Sneha Sharma',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      phone: '+91-9876-543-210',
      isActive: true,
    },
  });
  console.log('Created super admin user:', superAdmin.email);

  // Create Sales User
  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@doomple.com' },
    update: {},
    create: {
      email: 'sales@doomple.com',
      name: 'Rajesh Kumar',
      passwordHash: salesUserHash,
      role: 'SALES',
      phone: '+91-9876-543-211',
      isActive: true,
    },
  });
  console.log('Created sales user:', salesUser.email);

  // Create Project Manager User
  const pmUser = await prisma.user.upsert({
    where: { email: 'pm@doomple.com' },
    update: {},
    create: {
      email: 'pm@doomple.com',
      name: 'Priya Desai',
      passwordHash: pmUserHash,
      role: 'PROJECT_MANAGER',
      phone: '+91-9876-543-212',
      isActive: true,
    },
  });
  console.log('Created project manager user:', pmUser.email);

  // Create Finance User
  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@doomple.com' },
    update: {},
    create: {
      email: 'finance@doomple.com',
      name: 'Vikram Patel',
      passwordHash: financeUserHash,
      role: 'FINANCE',
      phone: '+91-9876-543-213',
      isActive: true,
    },
  });
  console.log('Created finance user:', financeUser.email);

  // ========== SEED SERVICES ==========

  const services = [
    {
      slug: 'custom-software-development',
      title: 'Custom Software Development',
      shortDescription: 'Bespoke software solutions engineered for your unique business requirements.',
      icon: 'Code',
      order: 1,
    },
    {
      slug: 'ai-chatbots-agents',
      title: 'AI Chatbots & Intelligent Agents',
      shortDescription: 'Conversational AI solutions that enhance customer engagement and automate support operations.',
      icon: 'Brain',
      order: 2,
    },
    {
      slug: 'mobile-app-development',
      title: 'Mobile App Development',
      shortDescription: 'Native and cross-platform mobile applications optimized for user engagement and performance.',
      icon: 'Smartphone',
      order: 3,
    },
    {
      slug: 'erp-development',
      title: 'ERP Development & Implementation',
      shortDescription: 'Enterprise resource planning systems that unify operations across finance, supply chain, and human resources.',
      icon: 'BarChart3',
      order: 4,
    },
    {
      slug: 'ecommerce-development',
      title: 'E-Commerce Platform Development',
      shortDescription: 'Scalable online retail solutions with advanced features for selling, marketing, and operations.',
      icon: 'ShoppingCart',
      order: 5,
    },
    {
      slug: 'cms-web-platforms',
      title: 'CMS & Web Platforms',
      shortDescription: 'Content management and web platforms with intuitive interfaces for non-technical content creators.',
      icon: 'FileText',
      order: 6,
    },
    {
      slug: 'devops-cloud-infrastructure',
      title: 'DevOps & Cloud Infrastructure',
      shortDescription: 'Infrastructure automation and cloud architecture ensuring reliability, scalability, and security.',
      icon: 'Cloud',
      order: 7,
    },
    {
      slug: 'infrastructure-support',
      title: 'Infrastructure Support & Optimization',
      shortDescription: 'Ongoing infrastructure management, monitoring, and optimization for peak performance and reliability.',
      icon: 'Wrench',
      order: 8,
    },
    {
      slug: 'remote-dedicated-teams',
      title: 'Remote Dedicated Development Teams',
      shortDescription: 'Experienced development teams integrated into your organization for long-term projects.',
      icon: 'Users',
      order: 9,
    },
    {
      slug: 'digital-marketing',
      title: 'Digital Marketing',
      shortDescription: 'Comprehensive digital marketing strategies and execution to reach, engage, and convert your target audience.',
      icon: 'Megaphone',
      order: 10,
      isMarketingOnly: true,
    },
    {
      slug: 'social-media-marketing',
      title: 'Social Media Marketing',
      shortDescription: 'Strategic social media presence and engagement to build community, increase brand awareness, and drive growth.',
      icon: 'Share2',
      order: 11,
      isMarketingOnly: true,
    },
    {
      slug: 'advertisement-campaigns',
      title: 'Advertisement Campaigns',
      shortDescription: 'Targeted paid advertising across Google, social platforms, and programmatic channels.',
      icon: 'Zap',
      order: 12,
      isMarketingOnly: true,
    },
    {
      slug: 'custom-startup-sme-platforms',
      title: 'Custom Startup & SME Platforms',
      shortDescription: 'Specialized platforms for startups and small-medium enterprises to manage operations and grow.',
      icon: 'Rocket',
      order: 13,
    },
    {
      slug: 'business-productivity-solutions',
      title: 'Business Productivity Solutions',
      shortDescription: 'Tools and automation to streamline operations, reduce manual work, and improve team efficiency.',
      icon: 'Zap',
      order: 14,
      isMarketingOnly: true,
    },
    {
      slug: 'task-work-management',
      title: 'Task & Work Management Solutions',
      shortDescription: 'Work tracking, task management, and team coordination platforms for organized execution.',
      icon: 'CheckSquare',
      order: 15,
      isMarketingOnly: true,
    },
    {
      slug: 'employee-performance-tracking',
      title: 'Employee Performance Tracking',
      shortDescription: 'Systems for measuring, evaluating, and developing employee performance to drive organizational success.',
      icon: 'TrendingUp',
      order: 16,
      isMarketingOnly: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }
  console.log(`Seeded ${services.length} services`);

  // ========== SEED SOLUTIONS ==========

  const solutions = [
    {
      slug: 'uep',
      title: 'Unified Education Platform (UEP)',
      shortDescription: 'Comprehensive platform for educational institutions enabling digital learning, assessments, and student success.',
      icon: 'BookOpen',
      order: 1,
    },
    {
      slug: 'saas-backend-toolkit',
      title: 'SaaS Backend Toolkit',
      shortDescription: 'Complete backend infrastructure and services framework for rapid SaaS platform development.',
      icon: 'Server',
      order: 2,
    },
    {
      slug: 'ecommerce-foundation',
      title: 'E-Commerce Foundation',
      shortDescription: 'Complete e-commerce platform foundation including catalog, cart, checkout, and order management.',
      icon: 'ShoppingCart',
      order: 3,
    },
    {
      slug: 'service-marketplace-foundation',
      title: 'Service Marketplace Foundation',
      shortDescription: 'Complete platform for connecting service providers with customers and managing the marketplace ecosystem.',
      icon: 'Briefcase',
      order: 4,
    },
    {
      slug: 'logistics-parcel-platform',
      title: 'Logistics & Parcel Management Platform',
      shortDescription: 'End-to-end logistics platform for managing shipments, tracking, delivery, and last-mile operations.',
      icon: 'Truck',
      order: 5,
    },
    {
      slug: 'business-automation-foundations',
      title: 'Business Automation Foundations',
      shortDescription: 'Workflow automation and business process management platform for streamlining operations.',
      icon: 'Zap',
      order: 6,
    },
    {
      slug: 'workforce-productivity-suite',
      title: 'Workforce Productivity Suite',
      shortDescription: 'Integrated tools for employee management, engagement, and performance optimization across the organization.',
      icon: 'Users',
      order: 7,
      isMarketingOnly: true,
    },
    {
      slug: 'employee-performance-platform',
      title: 'Employee Performance Platform',
      shortDescription: 'Comprehensive performance management system for continuous evaluation, feedback, and development.',
      icon: 'TrendingUp',
      order: 8,
      isMarketingOnly: true,
    },
  ];

  for (const solution of solutions) {
    await prisma.solution.upsert({
      where: { slug: solution.slug },
      update: {},
      create: solution,
    });
  }
  console.log(`Seeded ${solutions.length} solutions`);

  // ========== SEED SAMPLE CLIENTS ==========

  const client1 = await prisma.client.upsert({
    where: { email: 'contact@techstartup.com' },
    update: {},
    create: {
      type: 'company',
      companyName: 'Tech Startup Inc.',
      contactName: 'Amit Verma',
      email: 'contact@techstartup.com',
      phone: '+91-9999-111-222',
      billingAddress: '123 Tech Park, Silicon Valley',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
      gstNumber: '29AABCT5055K1ZO',
      notes: 'Fast-growing fintech startup building AI-powered solutions',
      isActive: true,
    },
  });
  console.log('Created client 1:', client1.email);

  const client2 = await prisma.client.upsert({
    where: { email: 'info@ecommercebiz.com' },
    update: {},
    create: {
      type: 'company',
      companyName: 'E-Commerce Biz Ltd.',
      contactName: 'Neha Singh',
      email: 'info@ecommercebiz.com',
      phone: '+91-9999-222-333',
      billingAddress: '456 Commerce Street, Navi Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400701',
      gstNumber: '27AAKCS8888F2Z0',
      notes: 'Large e-commerce platform with multi-channel presence',
      isActive: true,
    },
  });
  console.log('Created client 2:', client2.email);

  // ========== SEED SAMPLE LEADS ==========

  const lead1 = await prisma.lead.create({
    data: {
      fullName: 'Dr. Rajesh Nair',
      companyName: 'EduTech Solutions',
      email: 'founder@edutech.com',
      phone: '+91-9111-222-333',
      location: 'Delhi',
      country: 'India',
      source: 'WEBSITE',
      category: 'UEP_INQUIRY',
      budgetRange: '50-100L',
      timeline: '3-6 months',
      requirementsSummary: 'Looking for comprehensive learning management and assessment platform',
      priority: 'HIGH',
      status: 'QUALIFIED',
      assignedToId: salesUser.id,
    },
  });
  console.log('Created lead 1:', lead1.email);

  const lead2 = await prisma.lead.create({
    data: {
      fullName: 'Priya Sharma',
      companyName: 'SaaS Co.',
      email: 'cto@saasco.com',
      phone: '+91-9222-333-444',
      location: 'Bangalore',
      country: 'India',
      source: 'REFERRAL',
      category: 'SOLUTION_INQUIRY',
      selectedSolution: 'saas-backend-toolkit',
      budgetRange: '25-50L',
      timeline: '1-3 months',
      priority: 'HIGH',
      status: 'DISCOVERY_SCHEDULED',
      assignedToId: salesUser.id,
    },
  });
  console.log('Created lead 2:', lead2.email);

  const lead3 = await prisma.lead.create({
    data: {
      fullName: 'Suresh Patel',
      companyName: 'Local Shop Network',
      email: 'owner@localshop.com',
      phone: '+91-9333-444-555',
      location: 'Gujarat',
      country: 'India',
      source: 'CAMPAIGN',
      category: 'SERVICE_INQUIRY',
      selectedService: 'ecommerce-development',
      budgetRange: '5-10L',
      timeline: '2-3 months',
      requirementsSummary: 'Need online store for retail business',
      priority: 'MEDIUM',
      status: 'CONTACTED',
      assignedToId: salesUser.id,
    },
  });
  console.log('Created lead 3:', lead3.email);

  const lead4 = await prisma.lead.create({
    data: {
      fullName: 'Vikram Singh',
      companyName: 'Swift Logistics',
      email: 'mgr@logistics.com',
      phone: '+91-9444-555-666',
      location: 'Pune',
      country: 'India',
      source: 'PARTNER',
      category: 'SOLUTION_INQUIRY',
      selectedSolution: 'logistics-parcel-platform',
      budgetRange: '100-200L',
      timeline: '6-9 months',
      priority: 'URGENT',
      status: 'PROPOSAL_SENT',
      assignedToId: salesUser.id,
    },
  });
  console.log('Created lead 4:', lead4.email);

  const lead5 = await prisma.lead.create({
    data: {
      fullName: 'Anita Gupta',
      companyName: 'Manufacturing Co.',
      email: 'admin@manufacturingco.com',
      phone: '+91-9555-666-777',
      location: 'Tamil Nadu',
      country: 'India',
      source: 'DIRECT',
      category: 'SERVICE_INQUIRY',
      selectedService: 'erp-development',
      budgetRange: '200L+',
      timeline: '9-12 months',
      requirementsSummary: 'Need comprehensive ERP for manufacturing operations',
      priority: 'HIGH',
      status: 'NEGOTIATION',
      assignedToId: pmUser.id,
    },
  });
  console.log('Created lead 5:', lead5.email);

  // ========== SEED SAMPLE PROJECTS ==========

  const project1 = await prisma.project.create({
    data: {
      name: 'EduTech - UEP Implementation',
      category: 'UEP_IMPLEMENTATION',
      description: 'Complete implementation of Unified Education Platform for EduTech Solutions',
      scope: 'Full platform deployment including LMS, testing, SIS, and analytics modules',
      startDate: new Date('2024-02-01'),
      estimatedEndDate: new Date('2024-06-30'),
      priority: 'HIGH',
      status: 'ACTIVE',
      budget: 7500000,
      billingModel: 'MILESTONE_BASED',
      clientId: client1.id,
      managerId: pmUser.id,
      leadId: lead1.id,
    },
  });
  console.log('Created project 1:', project1.name);

  const project2 = await prisma.project.create({
    data: {
      name: 'TechStartup - Custom Dashboard',
      category: 'CUSTOM_DEVELOPMENT',
      description: 'Custom analytics dashboard for fintech platform',
      scope: 'Real-time data visualization with AI-powered insights',
      startDate: new Date('2024-03-01'),
      estimatedEndDate: new Date('2024-04-30'),
      priority: 'MEDIUM',
      status: 'IN_DEVELOPMENT',
      budget: 2500000,
      billingModel: 'FIXED_PRICE',
      clientId: client1.id,
      managerId: pmUser.id,
    },
  });
  console.log('Created project 2:', project2.name);

  // Add milestones to project 1
  await prisma.projectMilestone.createMany({
    data: [
      {
        projectId: project1.id,
        title: 'System Setup and Configuration',
        description: 'Initial deployment and configuration of UEP',
        dueDate: new Date('2024-02-29'),
        status: 'COMPLETED',
        paymentAmount: 1500000,
        order: 1,
      },
      {
        projectId: project1.id,
        title: 'Data Migration and Import',
        description: 'Migrate existing student and course data',
        dueDate: new Date('2024-03-31'),
        status: 'IN_PROGRESS',
        paymentAmount: 2000000,
        order: 2,
      },
      {
        projectId: project1.id,
        title: 'Faculty and Student Training',
        description: 'Comprehensive training for all users',
        dueDate: new Date('2024-05-31'),
        status: 'PENDING',
        paymentAmount: 2000000,
        order: 3,
      },
      {
        projectId: project1.id,
        title: 'Go-Live and Support',
        description: 'Full system go-live and stabilization',
        dueDate: new Date('2024-06-30'),
        status: 'PENDING',
        paymentAmount: 2000000,
        order: 4,
      },
    ],
  });
  console.log('Created milestones for project 1');

  // ========== SEED SAMPLE INVOICES ==========

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      subtotal: 5000000,
      taxAmount: 900000,
      total: 5900000,
      paidAmount: 5900000,
      status: 'PAID',
      clientId: client1.id,
      projectId: project1.id,
      createdById: financeUser.id,
      items: {
        create: [
          {
            description: 'UEP Implementation - Phase 1: System Setup and Configuration',
            quantity: 1,
            unitPrice: 5000000,
            taxPercent: 18,
            total: 5900000,
            order: 1,
          },
        ],
      },
    },
  });
  console.log('Created invoice 1:', invoice1.invoiceNumber);

  // Add payment to invoice
  await prisma.payment.create({
    data: {
      amount: 5900000,
      method: 'Bank Transfer',
      status: 'COMPLETED',
      paidAt: new Date('2024-02-10'),
      invoiceId: invoice1.id,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-01'),
      subtotal: 2000000,
      taxAmount: 360000,
      total: 2360000,
      paidAmount: 0,
      status: 'SENT',
      clientId: client2.id,
      createdById: financeUser.id,
      items: {
        create: [
          {
            description: 'E-Commerce Platform Development - Phase 1',
            quantity: 1,
            unitPrice: 2000000,
            taxPercent: 18,
            total: 2360000,
            order: 1,
          },
        ],
      },
    },
  });
  console.log('Created invoice 2:', invoice2.invoiceNumber);

  console.log('Database seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('================');
  console.log('Super Admin: sneha@doomple.com / Doomple@2026');
  console.log('Sales User: sales@doomple.com / Sales@2026');
  console.log('PM User: pm@doomple.com / PM@2026');
  console.log('Finance User: finance@doomple.com / Finance@2026');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
