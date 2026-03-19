import type { SolutionData } from '@/types';

export const solutions: SolutionData[] = [
  {
    slug: 'uep',
    title: 'Unified Education Platform (UEP)',
    shortDescription: 'Comprehensive platform for educational institutions enabling digital learning, assessments, and student success.',
    description: `The Unified Education Platform represents a complete transformation of how educational institutions operate. Rather than cobbling together separate systems for learning management, assessments, student information, and communications, UEP provides a unified ecosystem where all educational processes flow seamlessly. Designed specifically for schools, colleges, and universities, UEP addresses the complete educational lifecycle—from enrollment through learning delivery, assessment, and graduation.

UEP incorporates best practices from leading global institutions while remaining flexible enough to adapt to diverse pedagogical approaches. Whether your institution emphasizes traditional classroom instruction, online learning, blended models, or competency-based progressions, UEP accommodates these variations. The platform maintains data integrity across the entire institution, preventing information silos and enabling educators to see the complete picture of student learning and development.

Students experience consistent, intuitive interfaces for accessing courses, completing assignments, taking exams, and interacting with instructors and peers. Educators benefit from comprehensive tools for content delivery, student progress tracking, assessment administration, and learning analytics. Administrators gain visibility into institutional performance, resource utilization, and compliance metrics. The unified approach eliminates context switching and data reconciliation, allowing all stakeholders to focus on what matters—student learning success.`,
    icon: 'BookOpen',
    targetCustomers: [
      'K-12 schools and school districts',
      'Colleges and universities',
      'Vocational and technical training institutions'
    ],
    includedModules: [
      'Learning Management System (LMS)',
      'Online Testing and Secure Exam Platform',
      'Student Information System',
      'Course Creation and Content Management',
      'AI Interview and Assessment',
      'Global Question Bank',
      'Code Editor and Technical Lab',
      'Live Class Integration',
      'Community and Collaboration Tools',
      'Media Repository',
      'Gamification Engine',
      'Reports and Analytics',
      'Proctoring and Anti-Cheating',
      'Exam Lifecycle Management'
    ],
    customizationOptions: [
      'Custom branding and theming',
      'Integration with institutional systems (SIS, library, accounting)',
      'Custom workflows and approval processes',
      'Additional assessment types and question formats',
      'Custom analytics and reporting',
      'Advanced security and compliance configurations'
    ],
    implementationModel: 'UEP is typically deployed as a SaaS solution with managed hosting and updates, or as an on-premise installation for institutions requiring maximum control. Implementation follows a phased approach: initial setup and data migration, core module deployment, faculty training, student onboarding, and post-launch optimization. Most institutions achieve full operational status within 3-6 months.',
    speedAdvantage: 'UEP accelerates time-to-value through pre-configured educational workflows, extensive integration connectors, and proven implementation methodology. Institutions can launch core capabilities within weeks rather than months, with additional features activated as training and adoption progress. Pre-built question banks and course templates enable rapid content deployment.',
    isMarketingOnly: false
  },

  {
    slug: 'saas-toolkit',
    title: 'SaaS Backend Toolkit',
    shortDescription: 'Complete backend infrastructure and services framework for rapid SaaS platform development.',
    description: `Building SaaS platforms requires solving the same foundational problems repeatedly—user authentication, subscription billing, multi-tenancy, analytics, compliance. The SaaS Backend Toolkit provides these essential components pre-built and battle-tested, allowing teams to focus on unique business logic rather than infrastructure. This accelerates time-to-market while reducing development costs and ensuring solutions follow industry best practices for security and reliability.

The toolkit includes user management with SSO and multi-factor authentication, subscription and billing management with integration to payment processors, multi-tenant architecture with data isolation and per-customer configuration, audit logging and compliance frameworks for regulatory requirements, and comprehensive APIs for integrating frontend applications. Additional services handle email delivery, webhook management, analytics tracking, file management, and scheduled job execution.

By leveraging the SaaS Backend Toolkit, development teams reduce boilerplate code and focus entirely on features that differentiate your product in the market. This approach reduces development time by 40-60%, decreases infrastructure complexity, and ensures your platform maintains consistent quality, security, and operational characteristics.`,
    icon: 'Server',
    targetCustomers: [
      'SaaS startups building new platforms',
      'Enterprise companies launching internal SaaS tools',
      'Digital agencies building custom SaaS for clients'
    ],
    includedModules: [
      'User Management and Authentication',
      'Multi-Tenant Architecture',
      'Subscription and Billing Management',
      'Payment Processing Integration',
      'Role-Based Access Control',
      'Audit Logging and Compliance',
      'Email and Communications',
      'File Management and Storage',
      'Analytics and Event Tracking',
      'Webhook Management',
      'API Gateway and Rate Limiting',
      'Task Scheduling and Background Jobs',
      'Monitoring and Error Tracking',
      'Database and Cache Infrastructure'
    ],
    customizationOptions: [
      'Custom user attributes and organization structures',
      'Branded customer portal and documentation',
      'Custom workflow automation and triggers',
      'Advanced billing models and pricing tiers',
      'Industry-specific compliance configurations',
      'Custom integrations with third-party services'
    ],
    implementationModel: 'The SaaS Backend Toolkit deploys as containerized microservices on your cloud infrastructure (AWS, Google Cloud, Azure) or managed hosting. Configuration is code-based using infrastructure-as-code tools. Integration with frontend applications happens through well-documented REST and GraphQL APIs. Most teams integrate the toolkit into their development workflow within 1-2 weeks.',
    speedAdvantage: 'Development teams reduce foundation work from months to weeks. Pre-built authentication saves 2-3 weeks of security-critical development. Subscription billing reduces 4-6 weeks of financial system integration. Multi-tenant architecture eliminates architectural discussions and eliminates months of scalability engineering. Typical projects launch 6 months faster with the toolkit than building from scratch.',
    isMarketingOnly: false
  },

  {
    slug: 'ecommerce-foundation',
    title: 'E-Commerce Foundation',
    shortDescription: 'Complete e-commerce platform foundation including catalog, cart, checkout, and order management.',
    description: `E-commerce success depends on getting the fundamentals right—product catalog management, shopping experience, payments, fulfillment, and customer service. The E-Commerce Foundation provides a production-ready platform handling these essentials plus the extensibility to add customized features. Whether launching your first online store or rebuilding legacy systems, the foundation provides a reliable, scalable baseline.

The foundation includes comprehensive product catalog management with categories, variants, pricing, and inventory tracking. Shopping experience components handle product discovery through search and recommendations, shopping carts that remember across sessions, and multi-step checkout processes optimized for mobile. Payment integration connects to major gateways and supports multiple payment methods. Order management provides customers with tracking while enabling fulfillment workflows for operations teams.

Additional capabilities address the operational side of e-commerce—inventory management across locations, order fulfillment and shipping integration, refunds and returns processing, and customer service tools. Marketing features include promotions, discount codes, gift cards, and analytics tracking that feeds your optimization efforts.`,
    icon: 'ShoppingCart',
    targetCustomers: [
      'Retailers launching online channels',
      'Direct-to-consumer brands',
      'Marketplace operators'
    ],
    includedModules: [
      'Product Catalog and Inventory Management',
      'Shopping Cart and Wishlist',
      'Checkout and Payment Processing',
      'Order Management and Fulfillment',
      'Customer Accounts and Preferences',
      'Promotions and Discount Management',
      'Reviews and Ratings',
      'Search and Product Discovery',
      'Shipping and Delivery Integration',
      'Returns and Refunds',
      'Customer Service and Support',
      'Analytics and Performance Tracking',
      'Multi-Channel Selling',
      'Mobile Shopping Experience'
    ],
    customizationOptions: [
      'Custom product attributes and variants',
      'Branded storefront themes and layouts',
      'Custom shipping rules and carriers',
      'Advanced pricing and promotional rules',
      'Integration with ERP and accounting systems',
      'Custom analytics and business intelligence'
    ],
    implementationModel: 'The E-Commerce Foundation can be deployed as a SaaS platform or on your infrastructure. Data migration from existing systems is handled through APIs and bulk import tools. Storefront customization happens through theme development and configuration. Integration with backend systems occurs through real-time APIs and scheduled synchronization. Most deployments reach full operational status within 6-12 weeks.',
    speedAdvantage: 'Launching an e-commerce platform typically requires 4-6 months of development. The E-Commerce Foundation reduces this to 6-12 weeks by providing production-ready payment processing, inventory management, and fulfillment workflows. Pre-built mobile optimization ensures strong shopping experience without additional mobile development. Theme library provides professional storefronts that can be customized in weeks rather than months.',
    isMarketingOnly: false
  },

  {
    slug: 'service-marketplace-foundation',
    title: 'Service Marketplace Foundation',
    shortDescription: 'Complete platform for connecting service providers with customers and managing the marketplace ecosystem.',
    description: `Service marketplaces face unique challenges different from product e-commerce—managing diverse service providers, handling complex booking and scheduling, managing variable pricing, and ensuring quality through reviews and reputation systems. The Service Marketplace Foundation addresses these marketplace-specific needs while providing the business infrastructure required to operate a sustainable platform.

The foundation includes provider management with profiles, credentials, availability, and pricing. Customer-facing features enable discovering and comparing providers, viewing availability, booking services, and managing completed engagements. Transactional components handle payments, service delivery coordination, and dispute resolution. Reputation and review systems build trust and help both customers and providers make informed decisions.

Operational tools assist with demand management, dynamic pricing, provider performance monitoring, and compliance verification. Analytics provide insights into marketplace health, growth metrics, customer satisfaction, and revenue opportunities. The platform scales to handle thousands of concurrent transactions while maintaining reliability and performance.`,
    icon: 'Briefcase',
    targetCustomers: [
      'On-demand service platforms',
      'Professional services networks',
      'Specialized service marketplaces'
    ],
    includedModules: [
      'Provider Profile and Verification Management',
      'Service Listing and Categorization',
      'Search and Discovery with Filtering',
      'Real-Time Availability and Scheduling',
      'Booking and Request Management',
      'Payment and Escrow Management',
      'Customer Accounts and Preferences',
      'Provider Earnings and Payouts',
      'Reviews and Reputation System',
      'Messaging and Communication',
      'Service Delivery and Completion Tracking',
      'Ratings and Quality Metrics',
      'Dispute Resolution Workflow',
      'Analytics and Marketplace Insights'
    ],
    customizationOptions: [
      'Custom service types and attributes',
      'Dynamic pricing and surge pricing algorithms',
      'Service area and geographic boundaries',
      'Custom qualification and verification process',
      'Advanced booking and scheduling rules',
      'Commission structures and provider payouts'
    ],
    implementationModel: 'The Service Marketplace Foundation deploys as a full-stack platform including customer-facing app, provider app, and administrative dashboard. Implementation includes configuration of service categories, pricing models, and operational workflows. Testing focuses on end-to-end user journeys from provider signup through service delivery and payment. Launch typically occurs 4-6 months after project initiation with phased rollout to limited geography or service categories.',
    speedAdvantage: 'Building a service marketplace from scratch requires 6-9 months and addresses numerous challenges—payment processing, scheduling systems, reputation management. The foundation reduces development to 4-6 months while incorporating proven approaches from established marketplaces. Real-time matching and notification systems are pre-built, avoiding 4-6 weeks of development. Provider and customer mobile apps are provided with customizable branding rather than built from scratch.',
    isMarketingOnly: false
  },

  {
    slug: 'logistics-parcel-platform',
    title: 'Logistics & Parcel Management Platform',
    shortDescription: 'End-to-end logistics platform for managing shipments, tracking, delivery, and last-mile operations.',
    description: `Modern logistics demands real-time visibility, efficient routing, and reliable delivery. The Logistics & Parcel Management Platform provides end-to-end infrastructure for managing shipments from origin through final delivery. Whether operating a courier service, managing last-mile delivery, or coordinating logistics across multiple locations, this platform brings efficiency and transparency to complex operations.

The platform handles order ingestion from multiple sources, intelligent shipment batching and route optimization to minimize delivery costs, real-time tracking visible to all stakeholders, and delivery confirmation with proof of delivery. Mobile applications for drivers provide route guidance, delivery workflows, and communication with dispatchers. Customer-facing tools provide shipment visibility, delivery notifications, and the ability to manage special delivery instructions.

Operational tools assist with fleet management, driver assignment, performance monitoring, and cost analysis. Integration with billing systems ensures accurate invoicing. Analytics provide insights into delivery performance, cost optimization opportunities, and capacity planning. The platform scales from dozens to thousands of daily shipments across multiple service areas.`,
    icon: 'Truck',
    targetCustomers: [
      'Logistics and courier companies',
      'E-commerce fulfillment operations',
      'Last-mile delivery providers'
    ],
    includedModules: [
      'Order and Shipment Management',
      'Automated Shipment Batching',
      'Route Optimization and Planning',
      'Real-Time GPS Tracking',
      'Driver Mobile Application',
      'Delivery Confirmation and POD',
      'Customer Delivery Notifications',
      'Fleet and Vehicle Management',
      'Driver Assignment and Scheduling',
      'Performance Monitoring and Analytics',
      'Pricing and Cost Management',
      'Integration with Payment Systems',
      'Exception Handling and Returns',
      'Reporting and Business Intelligence'
    ],
    customizationOptions: [
      'Custom delivery service types and SLAs',
      'Integration with existing courier services',
      'Advanced route optimization parameters',
      'Branded customer and driver experiences',
      'Custom reporting and analytics',
      'Industry-specific compliance and documentation'
    ],
    implementationModel: 'The Logistics Platform is deployed as a complete system including central dispatch management, mobile apps for drivers and customers, and integration with existing fleet management and billing systems. Implementation includes configuration of service areas, vehicle types, and operational workflows. Testing focuses on route optimization accuracy and real-time tracking reliability. Rollout typically occurs over 2-3 phases, starting with a limited service area before expanding.',
    speedAdvantage: 'Implementing comprehensive logistics systems traditionally requires 8-12 months of development spanning web, mobile, optimization algorithms, and integration work. The platform provides these capabilities pre-built, reducing implementation to 3-6 months. Route optimization that typically takes 2-3 months to develop is provided. Mobile driver apps that require 2-3 months per platform are included. Real-time tracking infrastructure is production-ready.',
    isMarketingOnly: false
  },

  {
    slug: 'business-automation-foundations',
    title: 'Business Automation Foundations',
    shortDescription: 'Workflow automation and business process management platform for streamlining operations.',
    description: `Business automation eliminates manual work, reduces errors, and accelerates process execution. The Business Automation Foundations platform provides low-code workflow automation tools enabling non-technical team members to design and modify business processes. Whether automating simple notifications or complex multi-step approval workflows, the platform adapts to your operational needs.

The platform includes workflow designer tools that allow business users to visually create processes with conditions, approvals, and integrations. Workflow execution engine runs designed workflows reliably at scale. Integration connectors link to business systems—CRM, ERP, accounting, HR—enabling workflows that coordinate across applications. Task management routes work items to appropriate team members with visibility and escalation rules.

Automation dramatically improves operational efficiency. Processes that previously required manual intervention execute instantly. Approvals that took days now complete in hours. Data consistency improves as workflows enforce business rules consistently. Employee satisfaction increases as tedious manual work disappears.`,
    icon: 'Zap',
    targetCustomers: [
      'Operations-heavy organizations',
      'Enterprises with complex approval workflows',
      'Companies managing multiple business units'
    ],
    includedModules: [
      'Visual Workflow Designer',
      'Workflow Execution Engine',
      'Process Monitoring and Analytics',
      'Task Management and Assignment',
      'Approval and Escalation Management',
      'Conditional Logic and Rules',
      'System Integration and Connectors',
      'Document Management Integration',
      'Email and Notification Services',
      'Database Integration',
      'Data Transformation',
      'Error Handling and Retry Logic',
      'Audit Trail and Compliance',
      'Performance Monitoring'
    ],
    customizationOptions: [
      'Custom process definitions and workflows',
      'Integration with industry-specific systems',
      'Custom approval hierarchies and rules',
      'Branded notification and document templates',
      'Advanced data transformation and enrichment',
      'Custom analytics and reporting'
    ],
    implementationModel: 'The Business Automation Foundations platform is deployed as a cloud service with connections to your existing business systems. Implementation focuses on identifying high-impact processes for automation, designing workflows, and integrating with existing systems. Business process mapping workshops help identify automation opportunities. Testing focuses on process execution and system integration reliability. Most implementations see initial results within 4-8 weeks.',
    speedAdvantage: 'Custom workflow automation traditionally requires 2-4 months of development for each workflow. The platform enables business teams to design workflows directly, reducing development cycles to days or weeks. Pre-built connectors to common systems eliminate 1-2 weeks of integration work per system. Visual designers reduce the technical expertise required, enabling faster iteration and modification as processes evolve.',
    isMarketingOnly: false
  },

  {
    slug: 'workforce',
    title: 'Workforce Productivity Suite',
    shortDescription: 'Integrated tools for employee management, engagement, and performance optimization across the organization.',
    description: `Employee productivity and engagement drive organizational success. The Workforce Productivity Suite provides integrated tools that help organizations recruit, develop, and retain top talent while maximizing individual and team productivity. From recruitment through retirement, the suite supports the complete employee lifecycle with systems for hiring, onboarding, performance management, development, and engagement.

The suite includes talent acquisition tools for sourcing and evaluating candidates, onboarding workflows ensuring new employees become productive quickly, performance management supporting continuous feedback and development, learning management enabling skill development and compliance training, and engagement tools building culture and community. Managers gain visibility into team capacity, performance, and development needs, enabling informed decisions about assignments, growth opportunities, and compensation.

Analytics provide HR leaders with insights into workforce composition, retention trends, performance distribution, and return on development investments. The integrated approach ensures people decisions are data-informed rather than subjective, improving fairness and supporting business strategy.`,
    icon: 'Users',
    targetCustomers: [
      'Growing companies scaling their teams',
      'Organizations investing in talent development',
      'Enterprises modernizing HR operations'
    ],
    includedModules: [
      'Talent Acquisition and Recruiting',
      'Applicant Tracking System',
      'Candidate Evaluation and Screening',
      'Offer Management and Acceptance',
      'Employee Onboarding',
      'Performance Management',
      'Goal Setting and OKRs',
      'Continuous Feedback and One-on-Ones',
      'Learning Management System',
      'Course and Training Content',
      'Compliance Training Tracking',
      'Employee Engagement Surveys',
      'Career Development Planning',
      'Compensation and Benefits Management'
    ],
    customizationOptions: [
      'Custom hiring workflows and evaluation criteria',
      'Branded onboarding and learning experiences',
      'Custom competency frameworks and assessments',
      'Integration with payroll and benefits systems',
      'Custom survey and engagement programs',
      'Industry-specific compliance configurations'
    ],
    implementationModel: 'The Workforce Productivity Suite deploys as a complete platform supporting the full employee lifecycle. Implementation typically follows a phased approach starting with recruiting and onboarding, expanding to performance management, then adding learning and engagement modules. Change management is critical—HR teams receive training on new processes and best practices. Integration with payroll, benefits, and accounting systems ensures data consistency.',
    speedAdvantage: 'Building comprehensive workforce management systems requires investments across recruitment, performance, learning, and engagement platforms—often 12+ months of development. The integrated suite provides all capabilities, reducing implementation to 3-6 months. Pre-built onboarding workflows reduce time-to-productivity for new hires. Learning content library provides immediate access to training materials while you develop custom content.',
    isMarketingOnly: true
  },

  {
    slug: 'employee-performance-platform',
    title: 'Employee Performance Platform',
    shortDescription: 'Comprehensive performance management system for continuous evaluation, feedback, and development.',
    description: `Traditional annual performance reviews create annual anxiety and miss ongoing feedback opportunities. The Employee Performance Platform enables continuous performance management where feedback is regular, development is ongoing, and compensation reflects demonstrated performance throughout the year. The system supports different performance management philosophies—from traditional ratings to OKRs to competency frameworks.

The platform facilitates ongoing conversations between managers and employees rather than once-yearly evaluations. Regular one-on-one meetings create opportunities for feedback, coaching, and development planning. Goal-setting frameworks align individual work with organizational strategy. 360-degree feedback incorporates perspectives from peers and stakeholders, providing well-rounded performance assessment.

Performance data combined with other organizational metrics reveals patterns—which teams have highest engagement, what drives attrition, where skill gaps exist. This intelligence enables strategic workforce planning and targeted development investments. The system ensures fairness by making performance criteria transparent and consistently applied across the organization.`,
    icon: 'TrendingUp',
    targetCustomers: [
      'Organizations adopting continuous performance culture',
      'Companies with high-potential talent development focus',
      'Enterprises seeking to improve employee engagement'
    ],
    includedModules: [
      'Goals and Objectives Management',
      'One-on-One Meeting Tools',
      'Continuous Feedback and Recognition',
      '360-Degree Feedback Process',
      'Performance Evaluation and Calibration',
      'Development Planning and Tracking',
      'Competency Framework Management',
      'Career Path Planning',
      'Skills Gap Analysis',
      'Peer and Stakeholder Feedback',
      'Performance Analytics and Insights',
      'Succession Planning',
      'Compensation Planning',
      'Export and Reporting'
    ],
    customizationOptions: [
      'Custom performance rating scales and calibration',
      'Industry-specific competency frameworks',
      'Custom evaluation processes and workflows',
      'Branded manager and employee portals',
      'Advanced analytics and custom reports',
      'Integration with compensation and payroll systems'
    ],
    implementationModel: 'The Employee Performance Platform is typically deployed as a cloud service with single sign-on integration to existing HR systems. Implementation begins with defining performance management philosophy and criteria, configuring the system to match those definitions, and training managers on new processes. Change management is critical—employees and managers need to understand how continuous feedback improves outcomes. Most organizations see adoption improvement and culture shift within 6-12 months.',
    speedAdvantage: 'Implementing performance management transformation typically requires cultural change work and system implementation spanning 6-12 months. The platform provides pre-built workflows and best practices, accelerating adoption. Pre-configured goal templates and competency frameworks provide starting points while you tailor to your organization. Built-in training materials help managers transition from annual to continuous feedback.',
    isMarketingOnly: true
  },
];
