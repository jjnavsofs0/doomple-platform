import type { ServiceData } from '@/types';

export const services: ServiceData[] = [
  {
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    shortDescription: 'Custom software development company in India — purpose-built applications for startups, MSMEs and enterprises using modern, scalable tech stacks.',
    description: `Custom software development forms the foundation of digital transformation for organizations seeking to solve complex business challenges with precision and scalability. At Doomple, we engineer enterprise-grade applications that are purpose-built for your specific workflows, integrations, and growth trajectory. Our expert developers leverage modern technology stacks and architectural patterns to deliver robust, maintainable solutions that become valuable assets to your organization.

From concept through deployment, we maintain close collaboration with your team to ensure the software aligns perfectly with your business objectives. Whether you need a customer-facing platform, internal operational system, or integrated enterprise solution, our custom development approach guarantees that every feature, performance characteristic, and security measure reflects your exact specifications and competitive requirements.

Our custom software solutions are built for longevity and scalability. We employ industry best practices for code quality, testing, and documentation, ensuring your teams can maintain and extend the software as your business evolves. With Doomple, you gain not just software, but a strategic competitive advantage tailored to your market position.`,
    icon: 'Code',
    problemsSolved: [
      'Off-the-shelf software doesn\'t match your unique workflows',
      'Legacy systems creating operational bottlenecks and technical debt',
      'Need for seamless integration across multiple business platforms',
      'Scalability challenges as your user base and data volumes grow',
      'Security and compliance requirements specific to your industry'
    ],
    idealClients: [
      'Enterprises with specialized operational requirements',
      'Companies seeking competitive differentiation through technology',
      'Organizations outgrowing standard SaaS solutions'
    ],
    deliverables: [
      'Fully functional application with comprehensive documentation',
      'Source code repository with version control and CI/CD pipelines',
      'Testing suite with 80%+ code coverage',
      'Deployment infrastructure and maintenance runbooks',
      'Knowledge transfer and team training sessions'
    ],
    engagementOptions: [
      'Dedicated development team on a monthly retainer',
      'Fixed-scope project with milestone-based payments',
      'Time-and-materials engagement with sprint-based billing'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'ai-chatbots-agents',
    title: 'AI Chatbots & Intelligent Agents',
    shortDescription: 'AI chatbot and intelligent agent development for Indian businesses — automate customer support, lead qualification and internal operations with production-grade AI.',
    description: `Artificial intelligence is transforming customer interactions and operational efficiency. Doomple develops sophisticated AI chatbots and intelligent agents that understand context, learn from conversations, and provide meaningful assistance at scale. Our solutions leverage cutting-edge NLP and machine learning models to deliver conversational experiences that feel natural while maintaining complete accuracy on business-critical information.

Our AI chatbots handle complex scenarios beyond simple keyword matching. They comprehend intent, manage multi-turn conversations, and seamlessly escalate to human agents when needed. Whether deployed on your website, mobile app, or messaging platforms, our agents work 24/7 to answer customer questions, process transactions, and gather valuable business intelligence from every interaction.

We build agents specifically tailored to your domain—whether that's customer support, lead qualification, appointment scheduling, or internal knowledge management. Each solution includes comprehensive training on your knowledge base, integration with your existing systems, and continuous refinement based on real-world usage patterns to ensure accuracy and relevance.`,
    icon: 'Brain',
    problemsSolved: [
      'Customer support teams overwhelmed with high-volume repetitive inquiries',
      'Limited availability of support outside standard business hours',
      'Difficulty qualifying and routing leads efficiently',
      'Chatbots that fail to understand customer intent or context',
      'Integration challenges between conversation platforms and business systems'
    ],
    idealClients: [
      'E-commerce and retail companies handling high support volumes',
      'SaaS platforms seeking to reduce support costs',
      'Service businesses wanting to improve lead qualification'
    ],
    deliverables: [
      'Trained AI chatbot deployed on your chosen platforms',
      'Integration with CRM, ticketing, and knowledge management systems',
      'Admin dashboard for monitoring conversations and performance metrics',
      'Conversation analytics and reporting',
      'Continuous training and model optimization'
    ],
    engagementOptions: [
      'SaaS platform fee plus training and optimization services',
      'Custom development with dedicated infrastructure',
      'Revenue-sharing model based on operational improvements'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'agentic-ai-automation',
    title: 'Agentic AI Automation',
    shortDescription: 'Agentic AI automation for Indian SMEs, startups and professional firms — build secure AI agents that execute WhatsApp, document, sales, compliance and operations workflows with human approval.',
    description: `Agentic AI moves beyond simple chatbots into systems that can plan, use tools, remember business context, and complete multi-step workflows under the right controls. Doomple builds production-minded AI agents for Indian SMEs, startups, CAs, lawyers, advertisers, SEO agencies, traders, distributors and event businesses that want measurable productivity gains without risky black-box automation.

Our approach starts with one workflow that already costs your team time: lead qualification on WhatsApp, invoice and GST reconciliation, proposal drafting, document classification, meeting follow-ups, vendor comparison, campaign reporting, content refresh monitoring, or client briefing preparation. We map the workflow, define success metrics, connect the agent to approved tools and data, and keep human review where accuracy, money, legal exposure or customer commitments matter.

Every agent is designed with operational safety in mind. We implement role-based access, retrieval from approved knowledge sources, action logs, approval checkpoints, fallback handling, performance monitoring and continuous improvement loops. The result is not an AI demo that works once, but a practical business automation layer your team can trust, measure and expand over time.`,
    icon: 'Cpu',
    problemsSolved: [
      'Repetitive follow-ups, document checks and status updates consuming senior team time',
      'Leads arriving through WhatsApp, calls and forms without consistent qualification or CRM capture',
      'Manual invoice, GST, proposal, reporting and research workflows that delay client delivery',
      'AI experiments that do not connect to real business tools or produce measurable ROI',
      'Concern about letting AI take action without audit logs, permissions and human approval',
    ],
    idealClients: [
      'SMEs and startups that want to automate one high-friction workflow first',
      'CAs, lawyers, consultants and agencies handling repetitive document or client-service work',
      'Sales, marketing and operations teams that rely on WhatsApp, spreadsheets, CRM and email',
    ],
    deliverables: [
      'Agentic AI workflow audit and automation roadmap',
      'Working AI agent connected to approved tools, data sources and communication channels',
      'Prompt, tool-use, retrieval and approval architecture',
      'Monitoring dashboard with logs, outcomes and improvement backlog',
      'Team training, handover documentation and optimisation support',
    ],
    engagementOptions: [
      'One-week agentic AI audit with prioritised use-case roadmap',
      'Two-week workflow agent pilot for one measurable business process',
      'Custom multi-step agent build with integrations, governance and ongoing optimisation',
    ],
    isMarketingOnly: false
  },

  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    shortDescription: 'Mobile app development company in India — native iOS & Android and cross-platform apps for startups, SMEs and enterprises, built for performance and scale.',
    description: `Mobile applications are no longer optional—they're essential for reaching and serving your customers where they are. Doomple develops mobile solutions for iOS and Android that deliver native-quality performance and user experience, whether built with platform-specific technologies or modern cross-platform frameworks. Our mobile development expertise spans consumer apps, enterprise mobility solutions, and platform-specific optimizations that ensure your app performs flawlessly on various devices and network conditions.

We understand that successful mobile applications balance functionality, performance, and user delight. Our development process incorporates human-centered design, comprehensive testing across real devices, and optimization for battery life, storage, and network efficiency. From conception through app store launch and ongoing updates, we guide your product through the complete mobile development lifecycle.

Our mobile solutions integrate seamlessly with your backend systems, leverage device capabilities like GPS, camera, and biometrics, and scale to millions of users. We build apps that users love to open, with engaging features, smooth animations, and reliable offline functionality where needed.`,
    icon: 'Smartphone',
    problemsSolved: [
      'Need for iOS and Android presence without doubling development costs',
      'Mobile user engagement and retention challenges',
      'Complex feature requirements across different operating systems',
      'Poor app performance affecting user experience and ratings',
      'Security vulnerabilities in user data transmission and storage'
    ],
    idealClients: [
      'Companies needing to expand beyond web into mobile channels',
      'Enterprises replacing legacy mobile solutions',
      'Startups building mobile-first products'
    ],
    deliverables: [
      'Native or cross-platform mobile application',
      'Integration with backend APIs and third-party services',
      'App store listing and submission support',
      'Comprehensive testing on multiple devices and OS versions',
      'Post-launch maintenance and feature updates'
    ],
    engagementOptions: [
      'Full application development with ongoing support retainer',
      'Modular development with incremental feature releases',
      'Team augmentation for your existing mobile development'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'erp-development',
    title: 'ERP Development & Implementation',
    shortDescription: 'Custom ERP development and implementation for SMEs and enterprises in India — unify finance, supply chain, HR and operations on a single integrated platform.',
    description: `Enterprise Resource Planning systems are the digital backbone of large organizations, integrating all critical business processes into a unified platform. Doomple develops and implements ERP solutions that streamline operations, improve data visibility, and enable informed decision-making across departments. Whether implementing established platforms or developing custom ERP solutions, we bring deep expertise in enterprise integration, data migration, and change management.

Our ERP solutions handle complex requirements across finance (accounting, budgeting, consolidation), supply chain (inventory, procurement, logistics), manufacturing (production planning, quality control), and human resources (payroll, talent management). We design systems that enforce business rules, maintain data integrity, and provide executives with real-time visibility into enterprise performance.

Implementation demands rigorous planning, careful data migration, and comprehensive training. Our methodology ensures minimal disruption to operations while establishing sustainable processes and governance frameworks that grow with your organization.`,
    icon: 'BarChart3',
    problemsSolved: [
      'Fragmented data across disconnected legacy systems',
      'Inability to track costs, inventory, and resources across the enterprise',
      'Manual, error-prone financial and operational processes',
      'Difficulty meeting compliance and audit requirements',
      'Lack of real-time visibility into business performance'
    ],
    idealClients: [
      'Manufacturing and production companies',
      'Distribution and logistics organizations',
      'Multi-location retail and commerce businesses'
    ],
    deliverables: [
      'Configured or custom-built ERP system',
      'Data migration from legacy systems',
      'Custom reporting and analytics dashboards',
      'Integration with existing third-party applications',
      'Comprehensive training and change management support'
    ],
    engagementOptions: [
      'Full implementation with dedicated project team',
      'Phased rollout by functional department',
      'Managed services with ongoing optimization'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'ecommerce-development',
    title: 'E-Commerce Platform Development',
    shortDescription: 'E-commerce platform development in India — custom online stores, B2B/B2C marketplaces and headless commerce solutions built for conversion and growth.',
    description: `Building a successful e-commerce business requires far more than a pretty storefront. Doomple develops comprehensive e-commerce platforms that integrate shopping experiences, inventory management, payment processing, and fulfillment operations into a unified system. Our solutions handle the complete customer journey—discovery, browsing, purchasing, payment, and post-purchase support—while providing merchants with powerful tools for catalog management, promotions, analytics, and growth.

We build e-commerce platforms that scale effortlessly from startup inventory to millions of SKUs and transactions. Our solutions incorporate modern best practices for search optimization, personalization, mobile commerce, and conversion optimization. Integration with payment gateways, shipping carriers, and third-party services ensures seamless operations without manual handoffs.

Every e-commerce platform we develop prioritizes security, performance, and user experience. We implement best practices for PCI compliance, fraud detection, and secure payment handling, while optimizing for fast page loads and search engine visibility that drive organic traffic and customer discovery.`,
    icon: 'ShoppingCart',
    problemsSolved: [
      'Limited product catalog or category management capabilities',
      'Poor checkout experience leading to cart abandonment',
      'Difficulty managing inventory across multiple channels',
      'Lack of personalization reducing customer lifetime value',
      'Weak integration between sales and operational systems'
    ],
    idealClients: [
      'Retailers expanding from physical stores to online channels',
      'Startups building e-commerce-first business models',
      'Brands seeking to differentiate with custom shopping experiences'
    ],
    deliverables: [
      'Fully functional e-commerce platform with admin dashboard',
      'Shopping cart and multi-step checkout process',
      'Payment gateway integration and PCI compliance',
      'Inventory management and order fulfillment systems',
      'Customer accounts and order history tracking'
    ],
    engagementOptions: [
      'Custom platform built on modern technology stack',
      'Marketplace or multi-vendor platform capabilities',
      'SaaS platform with annual subscription model'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'cms-web-platforms',
    title: 'CMS & Web Platforms',
    shortDescription: 'CMS and web platform development — custom WordPress, headless CMS and web portals built for fast content teams and seamless digital experiences.',
    description: `Content remains king in digital marketing and customer engagement. Doomple develops sophisticated content management systems and web platforms that empower your team to create, publish, and optimize content without requiring technical expertise. Whether you need a corporate website, content hub, media portal, or digital publishing platform, our solutions provide the flexibility to organize content, maintain consistent branding, and reach your audience effectively.

Our CMS solutions go beyond simple page editing. We build systems with sophisticated workflows for multi-step approvals, role-based publishing access, version control, and scheduled content releases. Advanced features like A/B testing, analytics integration, and personalization enable you to continuously optimize your digital properties for engagement and conversion.

We design content management systems that scale with your organization. As your needs grow from a single website to complex multi-site operations with thousands of assets, your CMS grows alongside you with robust infrastructure, powerful search capabilities, and reliable performance.`,
    icon: 'FileText',
    problemsSolved: [
      'Inefficient content creation and publishing workflows',
      'Inconsistent branding across multiple web properties',
      'Difficulty managing large volumes of digital assets',
      'Limited ability to personalize experiences for different audiences',
      'Poor search engine optimization and content discoverability'
    ],
    idealClients: [
      'Media and publishing organizations',
      'Enterprise companies with complex content needs',
      'Marketing teams managing multiple content channels'
    ],
    deliverables: [
      'Custom or configured CMS platform',
      'Intuitive content editor and publishing interface',
      'Asset management and digital library',
      'SEO tools and optimization features',
      'Analytics and performance tracking integration'
    ],
    engagementOptions: [
      'Licensed CMS with implementation and customization',
      'SaaS CMS with usage-based pricing',
      'Open-source CMS deployment with ongoing support'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'devops-cloud-infrastructure',
    title: 'DevOps & Cloud Infrastructure',
    shortDescription: 'DevOps and cloud infrastructure services — AWS, GCP and Azure setup, CI/CD pipelines, Kubernetes, containerisation and 24/7 infrastructure management for Indian businesses.',
    description: `Modern applications demand modern infrastructure. Doomple designs and implements cloud-native architectures that provide unlimited scalability, automatic failover, and cost optimization. Our DevOps expertise spans infrastructure-as-code, containerization, orchestration, and continuous integration/continuous deployment pipelines that transform software delivery from monthly releases to multiple deployments per day.

We architect solutions on AWS, Google Cloud, or Azure, selecting the platform that best matches your requirements, cost profile, and organizational expertise. Our infrastructure designs incorporate high availability, disaster recovery, and auto-scaling capabilities that ensure your applications perform consistently even during traffic spikes or infrastructure failures.

Our DevOps practices emphasize automation, monitoring, and continuous improvement. We implement comprehensive logging, metrics collection, and alerting that provide real-time visibility into system health. Infrastructure configurations are version-controlled, documented, and reproducible, enabling rapid deployment and easy recovery from issues.`,
    icon: 'Cloud',
    problemsSolved: [
      'Manual, error-prone infrastructure provisioning and configuration',
      'Application downtime due to infrastructure failures',
      'Inability to scale applications to handle traffic spikes',
      'Security vulnerabilities in infrastructure configuration',
      'Unpredictable cloud costs due to inefficient resource usage'
    ],
    idealClients: [
      'SaaS companies needing scalable global infrastructure',
      'Enterprises modernizing legacy on-premise systems',
      'Startups requiring rapid scaling capability'
    ],
    deliverables: [
      'Cloud infrastructure architecture and design',
      'Infrastructure-as-code (Terraform, CloudFormation)',
      'CI/CD pipeline and deployment automation',
      'Monitoring, logging, and alerting systems',
      'Security hardening and compliance configuration'
    ],
    engagementOptions: [
      'Managed DevOps services on monthly retainer',
      'Infrastructure design and implementation project',
      'Team training and knowledge transfer'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'infrastructure-support',
    title: 'Infrastructure Support & Optimization',
    shortDescription: 'Managed infrastructure support and optimisation — 24/7 monitoring, incident response, performance tuning and cost optimisation for cloud and on-premise environments.',
    description: `Infrastructure management is not a one-time project but a continuous responsibility. Doomple provides comprehensive infrastructure support services that monitor your systems, optimize performance, manage updates and patches, and respond to incidents. Our managed infrastructure approach allows your team to focus on product development while we ensure your infrastructure operates reliably and cost-effectively.

Our support includes 24/7 monitoring and incident response, proactive optimization to identify and resolve performance bottlenecks, security patching and vulnerability management, and capacity planning to ensure you have adequate resources as demand grows. We establish clear SLAs with defined response times and maintain comprehensive documentation of your infrastructure configuration and operating procedures.

Whether you operate on-premise infrastructure, cloud platforms, or hybrid environments, we provide unified management and optimization across all your systems. Our holistic approach identifies opportunities to improve reliability while reducing infrastructure costs.`,
    icon: 'Wrench',
    problemsSolved: [
      'Unexpected downtime impacting customer experience and revenue',
      'Infrastructure performance degradation affecting application responsiveness',
      'Security vulnerabilities and unpatched systems',
      'Runaway cloud costs due to inefficient resource utilization',
      'Insufficient capacity for growth leading to system overload'
    ],
    idealClients: [
      'Established companies with complex infrastructure',
      'Organizations lacking internal infrastructure expertise',
      'Businesses unable to maintain 24/7 infrastructure team'
    ],
    deliverables: [
      '24/7 monitoring and incident response',
      'Regular performance optimization reviews',
      'Security patch management and updates',
      'Capacity planning and growth forecasting',
      'Monthly performance reports and recommendations'
    ],
    engagementOptions: [
      'Monthly managed services retainer',
      'Performance-based SLA agreements',
      'Flexible on-demand support model'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'remote-dedicated-teams',
    title: 'Remote Dedicated Development Teams',
    shortDescription: 'Hire dedicated development teams from India — senior engineers, architects and PMs fully integrated into your workflows at 40–60% lower cost than equivalent Western hiring.',
    description: `Building a dedicated team with specific skills can take months or years and consume significant resources. Doomple provides remote dedicated development teams that integrate seamlessly into your organization, following your processes and communicating in your timezone. Whether you need frontend developers, backend engineers, QA specialists, or full-stack teams, we supply experienced professionals committed to your project's success.

Our dedicated teams operate as extensions of your organization, attending your standups, participating in planning sessions, and maintaining consistent communication with your leadership. We handle recruitment, onboarding, management, and benefits administration, allowing you to focus entirely on your product. Team members are deeply embedded in your codebase and business context, enabling them to move from requirements to implementation without constant supervision or documentation.

This engagement model is particularly effective for long-term projects, maintaining products in production, or accelerating development to meet aggressive timelines. You maintain full control over priorities and roadmap while leveraging our expertise in recruiting, managing, and retaining top technical talent.`,
    icon: 'Users',
    problemsSolved: [
      'Difficulty recruiting and retaining specialized technical talent',
      'Need to rapidly scale development capacity for time-sensitive projects',
      'Limited access to expertise in emerging technologies',
      'High costs and long recruitment cycles for permanent hires',
      'Inability to fill skill gaps quickly'
    ],
    idealClients: [
      'Startups needing rapid product development',
      'Enterprises managing specialized technical projects',
      'Companies with fluctuating development capacity needs'
    ],
    deliverables: [
      'Pre-vetted, experienced developers committed to your project',
      'Integration with your existing team and processes',
      'Flexible scaling up or down based on project needs',
      ' 24/5 support and regular performance reviews',
      'Full team management and payroll handling'
    ],
    engagementOptions: [
      'Fixed team size on monthly retainer',
      'Variable team composition based on project phases',
      'Flexible individual contributor augmentation'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    shortDescription: 'End-to-end digital marketing services — SEO, content marketing, PPC, email and conversion optimisation to grow your online presence and drive measurable business results.',
    description: `Digital marketing success requires integrated strategies across multiple channels, data-driven decision making, and constant optimization. Doomple develops and executes comprehensive digital marketing campaigns that align with your business objectives, reach your target audience effectively, and drive measurable results. From strategy development through campaign execution and performance analysis, we manage the complete digital marketing lifecycle.

Our digital marketing expertise spans search engine optimization, content marketing, email campaigns, and analytics. We conduct market research to understand your competitive positioning, develop personas to clarify your target audience, and craft messaging that resonates with their needs and pain points. We then execute campaigns across the channels where your audience is most active, continuously monitoring performance and optimizing for better results.

We measure everything. Every campaign is tracked from initial impression through conversion, allowing us to identify what works and allocate budget to high-performing initiatives. Regular reporting and analysis reveal insights about your audience, competitive dynamics, and market trends that inform strategy adjustments.`,
    icon: 'Megaphone',
    problemsSolved: [
      'Difficulty reaching target audience across crowded digital channels',
      'Inability to demonstrate marketing ROI and justify budget',
      'Inefficient marketing spend on low-performing channels',
      'Lack of consistent brand messaging across marketing materials',
      'Poor conversion from website visits to actual customer sales'
    ],
    idealClients: [
      'B2B technology and SaaS companies',
      'Startups with limited marketing expertise',
      'Established companies seeking growth acceleration'
    ],
    deliverables: [
      'Digital marketing strategy and quarterly roadmap',
      'Campaign planning and creative development',
      'Website optimization for search and conversion',
      'Email and social media campaign management',
      'Monthly performance reports and insights'
    ],
    engagementOptions: [
      'Monthly retainer for ongoing campaign management',
      'Project-based campaigns for specific initiatives',
      'Performance-based pricing tied to lead generation or sales'
    ],
    isMarketingOnly: true
  },

  {
    slug: 'social-media-marketing',
    title: 'Social Media Marketing',
    shortDescription: 'Social media marketing and management — strategy, content creation, community management and paid social campaigns across LinkedIn, Instagram, Facebook and X.',
    description: `Social media has become essential for brand building, customer engagement, and community development. Doomple develops social media strategies tailored to your brand voice and business objectives, then executes engaging content programs across platforms where your audience actively participates. We combine strategic planning with creative content creation and community management to build authentic connections with your customers.

Our social media approach goes beyond posting content. We develop content calendars aligned with your business calendar and audience interests, create engaging visual and written content optimized for each platform, and manage community interactions to build loyal followings. We monitor social conversations to understand audience sentiment and identify opportunities to join relevant discussions.

Social media analytics reveal insights about which content resonates with your audience, which platforms drive the most engagement, and how social conversations influence purchase decisions. We use these insights to continuously refine our approach, testing new content formats and channels to identify the most effective combination for your business.`,
    icon: 'Share2',
    problemsSolved: [
      'Lack of consistent social media presence across platforms',
      'Time constraints preventing regular content posting',
      'Difficulty creating engaging content that sparks audience interaction',
      'Inability to respond promptly to customer comments and inquiries',
      'Poor understanding of social media ROI and impact on business'
    ],
    idealClients: [
      'Consumer brands seeking direct customer engagement',
      'B2B companies building thought leadership',
      'Service-based businesses building reputation and trust'
    ],
    deliverables: [
      'Social media strategy and content calendar',
      'Regular content creation and posting',
      'Community management and engagement',
      'Social listening and sentiment analysis',
      'Monthly analytics reports and performance insights'
    ],
    engagementOptions: [
      'Monthly managed services retainer',
      'Per-post content creation and posting',
      'Flexible hours-based engagement model'
    ],
    isMarketingOnly: true
  },

  {
    slug: 'advertisement-campaigns',
    title: 'Advertisement Campaigns',
    shortDescription: 'Performance-driven paid advertising campaigns — Google Ads, Meta Ads, LinkedIn Ads and programmatic display, managed end-to-end for maximum ROAS.',
    description: `Paid advertising accelerates growth by placing your message in front of actively-interested prospects. Doomple manages end-to-end paid advertising campaigns across Google Search and Display, social media platforms, and programmatic networks. We combine audience research, compelling creative, and continuous optimization to maximize return on ad spend.

Our advertising strategy begins with understanding your customer acquisition costs, lifetime value, and profitability requirements. We then identify high-value audience segments, craft messages that resonate with their specific pain points, and test different creatives to identify top performers. As campaigns mature, we refine targeting, scale winners, and pause underperformers to maximize efficiency.

Every dollar of advertising spend is tracked and attributed to results. We maintain comprehensive reporting that shows not just clicks or impressions, but actual business outcomes—leads generated, sales closed, and profit earned. This accountability ensures our advertising efforts directly contribute to your growth.`,
    icon: 'Zap',
    problemsSolved: [
      'Lack of targeted audience for paid campaigns',
      'Low conversion rates on paid advertising traffic',
      'Inability to track advertising ROI and justify spend',
      'Ad fatigue from repetitive messaging to same audiences',
      'Inefficient budget allocation across ad platforms and campaigns'
    ],
    idealClients: [
      'E-commerce companies seeking sales growth',
      'SaaS companies with long sales cycles',
      'Local service businesses targeting geographic markets'
    ],
    deliverables: [
      'Advertising strategy and target audience definition',
      'Campaign setup and management across platforms',
      'Creative development and testing',
      'Real-time optimization and bid management',
      'Detailed conversion tracking and ROI reporting'
    ],
    engagementOptions: [
      'Monthly management retainer plus media spend',
      'Fixed percentage of advertising budget',
      'Performance-based pricing tied to lead generation'
    ],
    isMarketingOnly: true
  },

  {
    slug: 'custom-startup-sme-platforms',
    title: 'Custom Startup & SME Platforms',
    shortDescription: 'Custom software platforms for startups and SMEs in India — purpose-built tools to manage operations, automate workflows and scale without enterprise-level budgets.',
    description: `Growing startups and SMEs face unique challenges: limited budgets, critical need for early product-market fit, and rapid changes in business requirements. Doomple develops custom platforms specifically designed for startup and SME needs—combining essential functionality with cost efficiency and flexibility to accommodate evolving business models. These platforms provide the foundational infrastructure for growth without the overhead of enterprise solutions.

Our startup platforms address common needs across various industries: customer management and relationship tracking, order and project management, inventory and resource management, and financial tracking. We design these systems to be straightforward to use with minimal training, allowing lean teams to manage operations without significant IT overhead.

Startup platforms must evolve as your business grows. Our architectures are designed for scaling, with clear paths to add functionality, expand user base, and integrate additional systems as your organization expands. This prevents the costly mistakes of outgrowing platforms and needing complete replacements.`,
    icon: 'Rocket',
    problemsSolved: [
      'Need for professional business tools without enterprise price tags',
      'Manual processes consuming precious team time',
      'Inability to track customers, orders, and finances systematically',
      'Limited visibility into business performance and metrics',
      'Difficulty managing operations at scale without dedicated IT'
    ],
    idealClients: [
      'Early-stage startups building product-market fit',
      'Small business owners managing operations manually',
      'Growing SMEs outgrowing spreadsheets and simple tools'
    ],
    deliverables: [
      'Custom web platform tailored to your business model',
      'Core business operations management',
      'User-friendly interfaces for non-technical team members',
      'Integration with accounting and payment systems',
      'Mobile access for field and remote team members'
    ],
    engagementOptions: [
      'Fixed-price platform build with milestone payments',
      'SaaS platform for similar business types',
      'Phased rollout with MVP followed by enhancements'
    ],
    isMarketingOnly: false
  },

  {
    slug: 'business-productivity-solutions',
    title: 'Business Productivity Solutions',
    shortDescription: 'Business process automation and productivity software — reduce manual work, eliminate bottlenecks and give your teams tools that make them faster and more effective.',
    description: `Business productivity solutions leverage technology to eliminate manual work, standardize processes, and give teams the tools they need to work effectively. Doomple develops custom productivity solutions that address your specific operational pain points—document management systems, workflow automation, project tracking, and team collaboration tools. These solutions save time, reduce errors, and free your team to focus on high-value work.

We analyze your current workflows to identify bottlenecks and inefficiencies, then design systems that streamline operations while maintaining necessary controls and approvals. Automation handles repetitive tasks—data entry, notifications, routine approvals—allowing your team to focus on decision-making and strategic work.

Productivity gains multiply across your organization. When processes are faster and more reliable, customer response times improve, project delivery accelerates, and employee satisfaction increases. Better tools reduce the friction of getting work done.`,
    icon: 'Zap',
    problemsSolved: [
      'Manual data entry and redundant information across systems',
      'Complex approval workflows consuming time and creating bottlenecks',
      'Team members unable to find critical information quickly',
      'Repetitive tasks stealing time from strategic work',
      'Poor visibility into project and operational status'
    ],
    idealClients: [
      'Operations-heavy organizations with manual processes',
      'Growing teams needing coordination and visibility tools',
      'Companies managing complex workflows and approvals'
    ],
    deliverables: [
      'Workflow automation and document management system',
      'Custom reporting and visibility dashboards',
      'Mobile applications for field teams',
      'Integration with existing business systems',
      'Employee training and adoption support'
    ],
    engagementOptions: [
      'Custom development project with post-launch support',
      'Retainer-based optimization and enhancement',
      'Workflow consulting with implementation'
    ],
    isMarketingOnly: true
  },

  {
    slug: 'task-work-management',
    title: 'Task & Work Management Solutions',
    shortDescription: 'Custom task and work management platforms — purpose-built project tracking, team coordination and workflow management tools tailored to how your business actually works.',
    description: `Managing work at scale requires visibility, coordination, and accountability. Doomple develops task and work management solutions that bring structure to complex projects and distributed teams. Our platforms provide clear visibility into who is doing what, progress toward goals, and obstacles preventing completion. Teams can coordinate effectively, priorities remain transparent, and nothing slips through the cracks.

Work management systems we build handle traditional project management (tasks, milestones, dependencies), agile methodologies (sprints, burndowns, retrospectives), and hybrid approaches that blend structured planning with flexibility. Managers gain dashboards showing resource allocation, project health, and team capacity. Individual contributors see clear priorities and the broader context for their work.

These platforms scale from small team coordination to managing hundreds of concurrent projects. Integration with communication tools, document management, and time tracking creates a unified workspace where teams can execute complex work efficiently.`,
    icon: 'CheckSquare',
    problemsSolved: [
      'Difficulty tracking status and progress on complex projects',
      'Unclear priorities leading to misaligned effort',
      'Communication silos causing duplication and missed coordination',
      'Lack of visibility into resource utilization and capacity',
      'Projects missing deadlines due to poor planning and tracking'
    ],
    idealClients: [
      'Professional services firms managing client projects',
      'Software development teams using agile methodologies',
      'Marketing agencies coordinating multiple client campaigns'
    ],
    deliverables: [
      'Centralized work management and collaboration platform',
      'Project planning and milestone tracking',
      'Real-time progress visibility and status dashboards',
      'Integration with communication and file sharing tools',
      'Automated reporting and executive dashboards'
    ],
    engagementOptions: [
      'SaaS platform with per-user licensing',
      'Custom implementation for specific methodologies',
      'Managed services with ongoing optimization'
    ],
    isMarketingOnly: true
  },

  {
    slug: 'employee-performance-tracking',
    title: 'Employee Performance Tracking',
    shortDescription: 'Employee performance tracking and appraisal software — goal setting, continuous feedback, OKR management and performance analytics to build high-performing teams.',
    description: `Employee performance management is critical for organizational success, yet many companies rely on outdated annual review processes. Doomple develops modern performance tracking systems that enable continuous feedback, clear goal alignment, and data-driven development decisions. These platforms support different performance management philosophies—traditional ratings, objective key results (OKRs), competency frameworks—to match your organizational culture.

Our performance systems facilitate ongoing conversations between managers and employees rather than once-yearly evaluations. Employees understand how their work contributes to organizational goals, receive regular feedback on progress, and have clarity on development opportunities. Managers gain insights to identify high performers, spot flight risks early, and make informed promotion and compensation decisions.

Performance data combined with other HR metrics reveals organizational patterns—which teams have highest engagement, what drives attrition, where skills gaps exist. This intelligence enables strategic workforce planning and targeted development investments.`,
    icon: 'TrendingUp',
    problemsSolved: [
      'Outdated annual review processes disconnected from ongoing work',
      'Inability to identify and develop high-performing talent',
      'Misalignment between individual goals and organizational strategy',
      'Subjective performance evaluations lacking objective data',
      'Poor visibility into skill gaps and development needs'
    ],
    idealClients: [
      'Growing companies needing scalable people management',
      'Organizations shifting to continuous performance culture',
      'Companies with high-potential talent needing development tools'
    ],
    deliverables: [
      'Performance management platform with flexible evaluation models',
      'Goals and OKRs alignment and tracking',
      'Continuous feedback and one-on-one conversation tools',
      'Performance analytics and insights dashboards',
      'Succession planning and development recommendations'
    ],
    engagementOptions: [
      'SaaS platform with per-employee licensing',
      'Custom development for unique methodologies',
      'Change management and adoption support'
    ],
    isMarketingOnly: true
  },

  // ─── AI & DATA SERVICES ────────────────────────────────────────────────────

  {
    slug: 'data-analytics',
    title: 'Data Analytics & Business Intelligence',
    shortDescription: 'Data analytics and business intelligence services in India — custom dashboards, KPI reporting and advanced analytics to turn your data into decisions that drive growth.',
    description: `Data is your most valuable asset — but only when you can read it. Doomple designs and builds end-to-end data analytics and business intelligence solutions that help organisations move from gut-feel decisions to evidence-based strategy. We work across the full analytics stack: data ingestion, transformation, modelling, visualisation, and distribution to stakeholders.

Our BI solutions surface the metrics that matter most to each layer of your business — executive KPI dashboards, operational monitoring for team leads, and granular reports for analysts. We connect to every data source you use — databases, CRMs, ERPs, marketing platforms, financial systems — and build a unified view that eliminates manual reporting and reconciliation.

Beyond dashboards, we implement predictive analytics and statistical models that go further than hindsight. Churn prediction, demand forecasting, customer segmentation, and anomaly detection are all possible once your data foundation is clean and structured. Doomple helps you build that foundation and the intelligence layer on top of it.`,
    icon: 'BarChart2',
    problemsSolved: [
      'Decisions driven by spreadsheets, intuition, or conflicting reports',
      'Data siloed across departments with no unified view',
      'Hours wasted every week building manual reports',
      'Unable to identify which products, customers, or channels drive profit',
      'No early-warning system for performance drops or anomalies',
    ],
    idealClients: [
      'Mid-to-large businesses with data spread across multiple systems',
      'E-commerce and SaaS companies seeking customer & revenue insights',
      'Operations-heavy organisations needing real-time monitoring',
    ],
    deliverables: [
      'Unified data warehouse or lakehouse architecture',
      'Automated ETL / ELT pipelines from all source systems',
      'Executive, operational, and self-service BI dashboards',
      'KPI definitions, data dictionary, and governance documentation',
      'Scheduled reports and alerting for key metrics',
    ],
    engagementOptions: [
      'Discovery & strategy sprint followed by phased build',
      'Managed analytics retainer with ongoing dashboard evolution',
      'Team augmentation for in-house data teams',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'data-engineering',
    title: 'Data Engineering & Pipelines',
    shortDescription: 'Data engineering and pipeline services — ETL/ELT pipelines, cloud data warehouses, data lakes and real-time streaming with Spark, Kafka and modern data stack tools.',
    description: `Great analytics and AI are only possible when the underlying data is clean, timely, and trustworthy. Doomple's data engineering practice builds the plumbing that makes everything else work: scalable ingestion pipelines, transformation layers, data warehouses, and data lakes that give your teams a single source of truth.

We design pipelines that handle batch and streaming data at any volume, from thousands to billions of events per day. Our engineers use modern tools — Apache Spark, dbt, Airflow, Kafka, Flink, and cloud-native services on AWS, GCP, and Azure — to build infrastructure that is reliable, observable, and maintainable. Every pipeline we deliver includes monitoring, alerting, and automated testing so you know immediately when something breaks.

Data quality is built in from day one. We implement schema validation, anomaly detection on incoming data, lineage tracking, and documentation that helps your team understand where every metric comes from. This foundation is what enables confident analytics and production-grade machine learning.`,
    icon: 'Database',
    problemsSolved: [
      'Analytics queries running on raw, untransformed, or untrustworthy data',
      'Fragile hand-rolled scripts that break whenever source systems change',
      'No single source of truth — different teams report different numbers',
      'Long lag times between events happening and data being available for analysis',
      'No visibility into pipeline failures or data quality issues',
    ],
    idealClients: [
      'Startups and scaleups building their first data platform',
      'Enterprises modernising legacy data infrastructure',
      'AI/ML teams that need a clean, governed feature store',
    ],
    deliverables: [
      'Cloud data warehouse or lakehouse setup (Snowflake, BigQuery, Redshift, Databricks)',
      'Batch and/or real-time ingestion pipelines for all source systems',
      'dbt transformation layer with tests, documentation, and lineage',
      'Orchestration setup (Airflow / Prefect / Dagster)',
      'Data quality monitoring, alerting, and on-call runbooks',
    ],
    engagementOptions: [
      'Infrastructure build project with knowledge transfer',
      'Dedicated data engineering retainer for ongoing pipeline work',
      'Staff augmentation embedded in your existing data team',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'ai-model-training',
    title: 'AI Model Training & Fine-Tuning',
    shortDescription: 'AI model training and fine-tuning services — custom LLM fine-tuning, computer vision models and domain-specific classifiers trained on your proprietary data for production use.',
    description: `Off-the-shelf AI models are general-purpose. Your business problems are specific. Doomple trains and fine-tunes AI models that are purpose-built for your domain, terminology, and use cases — delivering accuracy and reliability that generic models cannot match.

Our AI model development practice covers the full spectrum: supervised learning classifiers and regressors, fine-tuned large language models (LLMs) on proprietary knowledge bases, computer vision models for quality inspection or document understanding, recommendation engines, and time-series forecasting models. We work with leading open-source and commercial model families — including GPT, Llama, Mistral, and Gemini — and choose the architecture that best fits your requirements, latency, and cost targets.

Every model we build is accompanied by rigorous evaluation frameworks, bias and fairness testing, interpretability tooling where required, and deployment infrastructure that integrates cleanly into your existing systems. We also design continuous learning pipelines so your model improves automatically as new labelled data becomes available.`,
    icon: 'Cpu',
    problemsSolved: [
      'Generic AI models producing inaccurate or irrelevant outputs for your domain',
      'High inference costs from using large general models for narrow tasks',
      'No way to incorporate proprietary data and institutional knowledge into AI',
      'Black-box models that cannot be explained to regulators or stakeholders',
      'Models that degrade over time as data distributions shift',
    ],
    idealClients: [
      'Enterprises with large volumes of proprietary labelled data',
      'SaaS companies building AI-powered product features',
      'Healthcare, legal, finance, and other regulated industries needing domain AI',
    ],
    deliverables: [
      'Trained or fine-tuned model with full evaluation report',
      'Labelling pipeline and data preparation tooling',
      'Model serving infrastructure (REST API / batch inference)',
      'Monitoring for data drift, accuracy degradation, and latency',
      'Retraining pipeline with CI/CD integration',
    ],
    engagementOptions: [
      'Fixed-scope model build from data through deployment',
      'Research spike followed by phased productionisation',
      'Ongoing model operations retainer',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'ai-consulting',
    title: 'AI Strategy & Consulting',
    shortDescription: 'AI strategy and consulting for Indian businesses — AI readiness assessment, high-value use-case identification, implementation roadmap and responsible AI governance advisory.',
    description: `AI presents enormous opportunity, but most organisations struggle to know where to start, which problems are genuinely solvable, and how to avoid costly mistakes. Doomple's AI consulting practice helps leadership and technical teams cut through the noise and build an AI strategy grounded in business value and practical feasibility.

Our engagements typically begin with a structured discovery process: mapping your existing data assets, identifying high-value AI use cases, assessing organisational readiness, and benchmarking what your competitors and peers are doing. From this foundation we build an AI roadmap prioritised by expected ROI and implementation complexity — giving your team a clear sequence of investments rather than a wish list.

Beyond strategy, we conduct technical architecture reviews for teams already building AI systems — identifying risks in data pipelines, model deployment patterns, security controls, and governance structures. We advise on build-vs-buy decisions, vendor selection, and responsible AI practices including bias mitigation and explainability. Our consultants have hands-on experience building production AI systems, so our advice is always grounded in what actually works.`,
    icon: 'Lightbulb',
    problemsSolved: [
      'No clear AI strategy — unclear where to invest or what problems to prioritise',
      'Internal teams evaluating vendors without the expertise to ask the right questions',
      'AI projects that deliver proofs-of-concept but fail to reach production',
      'Governance, compliance, and ethics concerns stalling AI adoption',
      'Significant investment in AI tooling with unclear return on investment',
    ],
    idealClients: [
      'C-suite and technology leaders developing an enterprise AI roadmap',
      'Product teams evaluating AI features and vendor options',
      'Organisations that have attempted AI projects and need course correction',
    ],
    deliverables: [
      'AI use-case landscape and prioritised opportunity roadmap',
      'Data readiness assessment and gap analysis',
      'Technical architecture review and recommendations report',
      'Build-vs-buy analysis and vendor shortlist',
      'Responsible AI framework and governance guidelines',
    ],
    engagementOptions: [
      'Strategy sprint (2–4 weeks) with roadmap deliverable',
      'Ongoing advisory retainer (monthly hours)',
      'Embedded consulting within your product or data team',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'ai-data-training',
    title: 'AI & Data Training Workshops',
    shortDescription: 'AI and data skills training workshops for corporate teams — hands-on programmes covering machine learning fundamentals, generative AI, data analytics and modern data engineering tools.',
    description: `The biggest barrier to AI adoption is not technology — it is people. Doomple delivers hands-on training programmes that build genuine capability inside your organisation: from executive AI literacy to deep technical workshops for engineers and data scientists.

Our training catalogue is built around practical application. Every session combines conceptual grounding with hands-on labs using real tools and real datasets. We avoid slide-heavy theory and focus on skills your team can apply immediately. Programmes are available as one-day intensive workshops, multi-week structured courses, or continuous coaching engagements customised to your team's current skill level and toolstack.

Topics span the full AI and data spectrum — from foundations of machine learning and prompt engineering for business users, through to advanced topics like LLM fine-tuning, MLOps and model deployment, data pipeline architecture, and responsible AI design. We also offer bespoke programmes built entirely around your company's use cases, data, and internal tooling so learning is directly transferable to your day-to-day work.`,
    icon: 'GraduationCap',
    problemsSolved: [
      'Teams that struggle to evaluate, adopt, or challenge AI vendor claims',
      'Engineers who can prototype AI but cannot take models to production reliably',
      'Data analysts blocked by gaps in Python, SQL, or statistical knowledge',
      'Executives who need AI literacy without a technical deep-dive',
      'Organisation-wide skill gaps slowing down an AI transformation initiative',
    ],
    idealClients: [
      'Engineering and data teams levelling up on AI/ML and modern data stacks',
      'Business teams wanting practical AI literacy and prompt engineering skills',
      'Organisations running an internal AI upskilling initiative',
    ],
    deliverables: [
      'Customised training curriculum and learning objectives',
      'Hands-on lab exercises with real datasets and tools',
      'Workshop facilitation (in-person or remote)',
      'Post-workshop reference materials and code notebooks',
      'Assessment and certification of completion where required',
    ],
    engagementOptions: [
      'Single-day or multi-day intensive workshop',
      'Multi-week structured training programme',
      'Ongoing coaching retainer for continuous skill development',
    ],
    isMarketingOnly: false,
  },

  // ─── CONSULTING SERVICES ───────────────────────────────────────────────────

  {
    slug: 'technology-consulting',
    title: 'Technology Strategy & Consulting',
    shortDescription: 'Technology strategy consulting for startups, MSMEs and enterprises in India — CTO advisory, build-vs-buy decisions, tech stack selection, team structuring and digital transformation roadmaps.',
    description: `Technology is no longer just a support function — it is a core business driver. Doomple's technology consulting practice helps organisations of every size — startups finding their footing, MSMEs scaling operations, and enterprises modernising at speed — make better technology decisions, avoid expensive mistakes, and build a clear path from where they are today to where they need to be.

Our consultants work closely with your leadership and technology teams to understand your business model, competitive landscape, and operational constraints. From this foundation we develop pragmatic technology strategies: which platforms to build, buy, or migrate; where to invest engineering capacity; how to structure your technology team; and what governance and security controls you need at your current scale.

We don't deliver dusty slide decks — every engagement ends with an actionable roadmap, prioritised by business impact and implementation feasibility. For MSMEs and startups we focus on getting maximum value from lean budgets. For enterprises, we focus on coordinating large-scale change without disrupting operations. Whatever your size, the goal is the same: technology that actively advances your business objectives.`,
    icon: 'Briefcase',
    problemsSolved: [
      'No clear technology roadmap aligned to business goals',
      'Recurring technology decisions made without strategic context',
      'Over-investment in tools and platforms that do not deliver ROI',
      'Technology team lacking direction, priorities, or governance',
      'Board and leadership lacking confidence in technology decisions',
    ],
    idealClients: [
      'Startups preparing for their next growth phase or fundraise',
      'MSMEs digitising operations for the first time',
      'Enterprises planning large-scale technology transformation',
    ],
    deliverables: [
      'Current-state technology assessment and gap analysis',
      'Strategic technology roadmap with 12–24 month horizon',
      'Build-vs-buy-vs-partner decision framework',
      'Team structure and capability recommendations',
      'Executive-ready presentation and implementation playbook',
    ],
    engagementOptions: [
      'Focused strategy sprint (2–4 weeks)',
      'Quarterly advisory retainer',
      'Embedded CTO-as-a-service for startups and MSMEs',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'software-audit',
    title: 'Software & Code Audit',
    shortDescription: 'Software and code audit services — independent expert review of your codebase, architecture, security posture and engineering practices, with a prioritised remediation roadmap.',
    description: `Software grows complex over time. Features get added, teams change, deadlines create shortcuts, and before long even experienced engineers struggle to understand what the system does and why it behaves the way it does. A Doomple software audit provides an independent, expert review of your codebase, architecture, and engineering practices — giving you a clear picture of what you have, what the risks are, and exactly what to fix.

Our audits are thorough and practical. We examine code quality and maintainability, architectural design and scalability, security vulnerabilities and dependency risks, test coverage and CI/CD practices, database design and query performance, and documentation completeness. We interview your engineering team to understand design intentions and identify gaps between what was planned and what was built.

The output is a detailed audit report with findings categorised by severity — critical issues requiring immediate attention, significant problems to address in the next quarter, and improvements to plan over the longer term. Every finding comes with a clear explanation of the risk or inefficiency and a specific recommendation for resolution. We present findings to your technical and business leadership together, ensuring everyone understands both the problems and the path forward.`,
    icon: 'SearchCode',
    problemsSolved: [
      'Unknown technical debt slowing down feature development and causing bugs',
      'Due diligence requirement before acquisition, investment, or partnership',
      'Security concerns or recent incidents requiring independent assessment',
      'Onboarding a new CTO or engineering leader who needs a baseline understanding',
      'Repeated production issues with unclear root causes',
    ],
    idealClients: [
      'Startups and scaleups preparing for investor due diligence',
      'MSMEs inheriting or acquiring software products',
      'Enterprises evaluating the health of internally built systems',
    ],
    deliverables: [
      'Detailed audit report covering code quality, architecture, security, and performance',
      'Prioritised findings list with severity ratings and remediation steps',
      'Dependency and vulnerability scan report',
      'Engineering practice assessment (CI/CD, testing, documentation)',
      'Executive summary and presentation to leadership',
    ],
    engagementOptions: [
      'One-time comprehensive audit with report delivery',
      'Phased audit across multiple systems or microservices',
      'Ongoing quarterly health check retainer',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'process-platform-audit',
    title: 'Process & Platform Audit',
    shortDescription: 'Process and platform audit services — map your business workflows against your technology platforms, identify misalignments and inefficiencies, and receive a concrete improvement roadmap.',
    description: `Many organisations use technology platforms that were selected years ago, configured by people who have since left, and are now running workflows that no longer reflect how the business actually operates. This misalignment between process and platform creates inefficiency, data integrity issues, user frustration, and missed opportunities. Doomple's Process & Platform Audit maps your current state, identifies the gaps, and delivers a concrete improvement plan.

We begin by mapping your end-to-end business processes through stakeholder interviews and workflow observation — understanding how work actually flows, not just how it was designed to flow. We then evaluate your technology platforms against these processes: are the right tools being used, are they configured correctly, are integrations reliable, and are users getting genuine value from them?

Common findings include redundant tools performing the same function, manual workarounds masking platform limitations, integration gaps causing data re-entry and errors, poorly configured automation that creates more problems than it solves, and licensing costs for features nobody uses. Our report quantifies the cost of inefficiency and presents options — platform reconfiguration, workflow redesign, consolidation onto fewer tools, or platform replacement — with cost-benefit analysis for each.`,
    icon: 'ClipboardCheck',
    problemsSolved: [
      'Business processes and technology platforms that no longer align',
      'Hidden operational costs from manual workarounds and re-work',
      'Unreliable integrations causing data inconsistencies across systems',
      'Underutilised platform licences and capability gaps',
      'Teams using different tools for the same purpose creating silos',
    ],
    idealClients: [
      'MSMEs that have grown rapidly and accumulated technology debt',
      'Enterprises going through a post-merger technology rationalisation',
      'Startups moving from scrappy tooling to scalable operations infrastructure',
    ],
    deliverables: [
      'Current-state process maps and platform inventory',
      'Gap analysis between actual workflows and platform capabilities',
      'Integration reliability and data quality assessment',
      'Findings report with cost-of-inefficiency quantification',
      'Recommended improvement roadmap with options and cost-benefit analysis',
    ],
    engagementOptions: [
      'Focused audit on a single business function (sales, finance, operations)',
      'Full-company process and platform review',
      'Ongoing optimisation retainer following initial audit',
    ],
    isMarketingOnly: false,
  },

  {
    slug: 'legacy-modernization',
    title: 'Legacy Software Audit & Modernisation',
    shortDescription: 'Legacy software modernisation services in India — systematic assessment, de-risked migration planning and phased execution to replace outdated systems without disrupting operations.',
    description: `Legacy software is one of the biggest strategic risks organisations carry. Systems built 10, 15, or 20 years ago — often in end-of-life languages, on unsupported infrastructure, with documentation that exists only in the minds of people who have long since moved on — hold businesses hostage. They are expensive to maintain, impossible to extend, and a growing security liability. Yet replacing them wholesale is risky and disruptive. Doomple helps you navigate this challenge systematically.

Our legacy modernisation process begins with a detailed audit: documenting what the system does, how it is structured, what dependencies it has, and what the risks of different modernisation approaches are. We assess options across a spectrum — from incremental refactoring and the strangler fig pattern, through re-platforming on modern infrastructure, to targeted rewrites of the most critical components. We always recommend the least risky path that delivers the required business outcomes.

We have experience with legacy systems in every major language and platform — from COBOL and Delphi to early-generation Java EE and .NET, from on-premise Oracle databases to bespoke homegrown ERPs. Our team includes engineers who specialise in reading, understanding, and systematically transforming legacy codebases without breaking the business processes that depend on them. We have helped startups untangle inherited codebases, MSMEs escape vendor lock-in, and enterprises modernise mission-critical systems without service disruption.`,
    icon: 'RefreshCw',
    problemsSolved: [
      'Mission-critical systems running on unsupported, end-of-life technology',
      'Inability to add features or integrate with modern platforms',
      'Sole dependency on a single developer who understands the legacy system',
      'Growing security vulnerabilities in ageing infrastructure and libraries',
      'Prohibitive cost of maintaining legacy systems eating into operational budget',
    ],
    idealClients: [
      'Enterprises with core systems built over a decade ago',
      'MSMEs that purchased or inherited legacy software products',
      'Startups that acquired businesses with legacy technical infrastructure',
    ],
    deliverables: [
      'Legacy system documentation and architecture mapping',
      'Risk assessment and technical debt quantification',
      'Modernisation options analysis (refactor, re-platform, rewrite)',
      'Phased migration plan with milestones and risk mitigation',
      'Execution support from audit through to modernised system delivery',
    ],
    engagementOptions: [
      'Audit-only engagement with modernisation roadmap',
      'Full audit-to-execution programme',
      'Phased modernisation with parallel running of legacy and new systems',
    ],
    isMarketingOnly: false,
  },
];
