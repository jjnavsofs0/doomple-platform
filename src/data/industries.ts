import type { IndustryData } from '@/types';

export const industries: IndustryData[] = [
  {
    slug: 'startups',
    name: 'Startups',
    description: 'Early-stage companies building innovative products and business models with limited resources and rapid growth objectives. Startups prioritize speed to market, efficient resource use, and scalable technology foundations that support explosive growth.',
    challenges: [
      'Limited budgets requiring maximum value from each technology investment',
      'Rapid pivots and evolving business model requiring flexible systems',
      'Difficulty attracting and retaining technical talent in competitive markets',
      'Pressure to demonstrate growth and profitability to secure funding'
    ],
    howWeHelp: [
      'Cost-effective solutions providing enterprise capability without enterprise costs',
      'Flexible, modular architectures supporting rapid iteration and pivots',
      'Dedicated development teams providing technical expertise without permanent hiring',
      'Proven scaling frameworks enabling growth from startup to scale-up'
    ],
    relevantServices: [
      'custom-software-development',
      'ai-chatbots-agents',
      'mobile-app-development',
      'devops-cloud-infrastructure',
      'remote-dedicated-teams'
    ],
    relevantSolutions: [
      'saas-backend-toolkit',
      'custom-startup-sme-platforms',
      'business-automation-foundations'
    ]
  },

  {
    slug: 'smes-msmes',
    name: 'SMEs & MSMEs',
    description: 'Small and medium-sized enterprises operating with lean teams and limited IT infrastructure. These organizations seek technology solutions that provide professional capability without complex IT requirements, enabling them to compete with larger enterprises.',
    challenges: [
      'Manual processes consuming time that could be invested in growth',
      'Fragmented data across spreadsheets and disconnected systems',
      'Limited IT expertise to implement and maintain complex solutions',
      'Technology investment pressures with limited budgets for infrastructure'
    ],
    howWeHelp: [
      'User-friendly solutions requiring minimal technical support',
      'Integrated platforms consolidating multiple functions into single system',
      'Implementation services handling technical complexity on your behalf',
      'Ongoing managed services eliminating need for internal IT team'
    ],
    relevantServices: [
      'custom-software-development',
      'custom-startup-sme-platforms',
      'business-productivity-solutions',
      'digital-marketing',
      'social-media-marketing'
    ],
    relevantSolutions: [
      'custom-startup-sme-platforms',
      'business-automation-foundations',
      'ecommerce-foundation'
    ]
  },

  {
    slug: 'schools-colleges',
    name: 'Schools & Colleges',
    description: 'K-12 schools and pre-university colleges managing student learning, assessment, and institutional operations. Educational institutions require comprehensive solutions supporting diverse pedagogical approaches while maintaining data integrity and compliance.',
    challenges: [
      'Fragmented systems for learning, assessment, and student records',
      'Limited IT budgets and technical expertise in educational institutions',
      'Equity concerns ensuring all students have access to quality technology',
      'Rapidly evolving educational approaches (hybrid, online, competency-based)'
    ],
    howWeHelp: [
      'Comprehensive platforms consolidating learning, assessment, and SIS into unified system',
      'User-friendly interfaces enabling educators to use technology without extensive training',
      'Accessibility features ensuring all students can participate fully',
      'Flexible deployment models (cloud, on-premise) matching institutional preferences'
    ],
    relevantServices: [
      'custom-software-development',
      'cms-web-platforms',
      'digital-marketing'
    ],
    relevantSolutions: [
      'uep'
    ]
  },

  {
    slug: 'universities-institutes',
    name: 'Universities & Institutes',
    description: 'Higher education institutions managing complex academic, research, and administrative operations. Universities require comprehensive solutions supporting multiple schools, degree programs, research initiatives, and international student populations.',
    challenges: [
      'Complexity of multiple schools, programs, and degree types',
      'International student requirements with diverse compliance needs',
      'Research management and collaboration infrastructure',
      'Legacy system modernization while maintaining institutional continuity'
    ],
    howWeHelp: [
      'Enterprise-grade platforms supporting institutional complexity and scale',
      'International compliance and support for diverse student populations',
      'Research collaboration tools enabling innovation and knowledge sharing',
      'Phased implementation approaches minimizing disruption to operations'
    ],
    relevantServices: [
      'custom-software-development',
      'erp-development',
      'cms-web-platforms',
      'devops-cloud-infrastructure'
    ],
    relevantSolutions: [
      'uep',
      'saas-backend-toolkit'
    ]
  },

  {
    slug: 'ecommerce',
    name: 'E-Commerce',
    description: 'Online retailers and direct-to-consumer brands selling products through digital channels. E-commerce businesses require platforms supporting product discovery, transactions, fulfillment, and customer relationships at scale.',
    challenges: [
      'Converting browsers into buyers through optimized shopping experience',
      'Managing inventory across multiple channels and locations',
      'Integrating online sales with fulfillment and customer service operations',
      'Competing for customer attention in crowded digital marketplace'
    ],
    howWeHelp: [
      'Conversion-optimized platforms maximizing sales from traffic',
      'Inventory management coordinating across channels and locations',
      'Fulfillment integration connecting sales to operations seamlessly',
      'Digital marketing expertise driving targeted traffic to products'
    ],
    relevantServices: [
      'ecommerce-development',
      'ai-chatbots-agents',
      'digital-marketing',
      'advertisement-campaigns'
    ],
    relevantSolutions: [
      'ecommerce-foundation',
      'saas-backend-toolkit',
      'business-automation-foundations'
    ]
  },

  {
    slug: 'logistics',
    name: 'Logistics & Delivery',
    description: 'Logistics providers, courier services, and last-mile delivery companies managing shipment operations. These businesses require platforms coordinating fleet, drivers, and customer communication to deliver parcels efficiently.',
    challenges: [
      'Route optimization and efficient delivery planning',
      'Real-time visibility for customers and operations teams',
      'Driver management across multiple locations and shifts',
      'Integration with carriers and fulfillment partners'
    ],
    howWeHelp: [
      'Logistics platforms with advanced route optimization reducing costs',
      'Real-time tracking providing visibility to stakeholders',
      'Driver and fleet management optimizing utilization',
      'Integration with carriers enabling end-to-end visibility'
    ],
    relevantServices: [
      'custom-software-development',
      'devops-cloud-infrastructure',
      'infrastructure-support'
    ],
    relevantSolutions: [
      'logistics-parcel-platform',
      'business-automation-foundations'
    ]
  },

  {
    slug: 'food-delivery',
    name: 'Food Delivery',
    description: 'Food delivery platforms, restaurants, and ghost kitchens managing orders, operations, and delivery. Food delivery requires real-time coordination of restaurants, drivers, and customers with high reliability and fast execution.',
    challenges: [
      'Real-time order coordination across restaurant and delivery operations',
      'Driver assignment and route optimization for fast delivery',
      'Kitchen operational management and order fulfillment',
      'Customer communication and delivery tracking'
    ],
    howWeHelp: [
      'End-to-end platforms coordinating orders from placement to delivery',
      'Real-time driver assignment and route optimization',
      'Kitchen management systems optimizing order fulfillment',
      'Customer communication and tracking enabling satisfaction'
    ],
    relevantServices: [
      'custom-software-development',
      'mobile-app-development',
      'ai-chatbots-agents',
      'devops-cloud-infrastructure'
    ],
    relevantSolutions: [
      'service-marketplace-foundation',
      'logistics-parcel-platform'
    ]
  },

  {
    slug: 'service-businesses',
    name: 'Service Businesses',
    description: 'Professional service firms, agencies, and consultancies selling expertise and services. Service businesses require platforms managing client relationships, project delivery, resource allocation, and billing.',
    challenges: [
      'Complex project management with varying scopes and timelines',
      'Resource allocation and capacity management',
      'Time tracking and accurate billing to clients',
      'Client communication and satisfaction management'
    ],
    howWeHelp: [
      'Project management platforms tracking delivery and budgets',
      'Resource management optimizing team utilization',
      'Time tracking and billing automation improving accuracy',
      'Client portals enabling transparency and satisfaction'
    ],
    relevantServices: [
      'custom-software-development',
      'project-management',
      'task-work-management',
      'business-productivity-solutions'
    ],
    relevantSolutions: [
      'service-marketplace-foundation',
      'business-automation-foundations',
      'saas-backend-toolkit'
    ]
  },

  {
    slug: 'agencies',
    name: 'Agencies',
    description: 'Digital agencies, creative studios, and marketing agencies delivering projects to clients. Agencies require platforms coordinating creative work, client collaboration, project delivery, and resource management.',
    challenges: [
      'Managing multiple concurrent client projects with diverse requirements',
      'Coordinating cross-functional teams (designers, developers, strategists)',
      'Client collaboration and feedback incorporation',
      'Project profitability tracking and time allocation'
    ],
    howWeHelp: [
      'Project collaboration platforms enabling team coordination',
      'Client portals supporting feedback and approvals',
      'Time tracking ensuring accurate project profitability',
      'Resource management optimizing team capacity allocation'
    ],
    relevantServices: [
      'custom-software-development',
      'task-work-management',
      'business-productivity-solutions',
      'digital-marketing'
    ],
    relevantSolutions: [
      'business-automation-foundations',
      'saas-backend-toolkit'
    ]
  },

  {
    slug: 'operationally-complex-businesses',
    name: 'Operationally Complex Businesses',
    description: 'Manufacturing, distribution, and multi-location enterprises with complex operations across supply chain, production, and logistics. These organizations require integrated systems unifying operations, providing visibility, and enabling coordination.',
    challenges: [
      'Coordinating complex supply chains with multiple suppliers and locations',
      'Production planning and inventory management at scale',
      'Quality control and compliance across operations',
      'Real-time visibility into distributed operations'
    ],
    howWeHelp: [
      'ERP platforms unifying operations and providing visibility',
      'Supply chain management optimizing sourcing and inventory',
      'Quality management and compliance automation',
      'Real-time dashboards enabling operational visibility'
    ],
    relevantServices: [
      'custom-software-development',
      'erp-development',
      'devops-cloud-infrastructure',
      'infrastructure-support'
    ],
    relevantSolutions: [
      'business-automation-foundations',
      'saas-backend-toolkit',
      'logistics-parcel-platform'
    ]
  },
];
